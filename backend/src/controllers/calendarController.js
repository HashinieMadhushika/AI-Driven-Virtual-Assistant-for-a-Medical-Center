import Doctor from '../models/Doctor.js';
import {
  getAuthUrl,
  getTokensFromCode,
  setCredentials,
  createCalendarEvent,
  listUpcomingEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
  refreshAccessToken,
} from '../services/googleCalendar.js';

function googleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI
  );
}

// Initiate Google Calendar OAuth
export const initiateGoogleAuth = async (req, res) => {
  try {
    if (!googleCalendarConfigured()) {
      return res.status(500).json({
        message: 'Google Calendar is not configured on the server. Please contact your administrator.',
      });
    }

    const authUrl = getAuthUrl();
    return res.json({ authUrl });
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    return res.status(500).json({ message: 'Error initiating Google authentication' });
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (req, res) => {
  try {
    const { code, state: doctorId } = req.query;

    if (!code || !doctorId) {
      return res.status(400).json({ message: 'Authorization code and doctor state are required' });
    }

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const tokens = await getTokensFromCode(code);

    await doctor.update({
      googleCalendarAccessToken: tokens.access_token || doctor.googleCalendarAccessToken,
      googleCalendarRefreshToken: tokens.refresh_token || doctor.googleCalendarRefreshToken,
      googleCalendarTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : doctor.googleCalendarTokenExpiry,
      googleCalendarConnected: true,
    });

    return res.redirect('http://localhost:3000/doctor/profile?calendar=connected');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    return res.redirect('http://localhost:3000/doctor/profile?calendar=error');
  }
};

// Get authorization URL with doctor ID
export const getGoogleAuthUrl = async (req, res) => {
  try {
    if (!googleCalendarConfigured()) {
      return res.status(500).json({
        message: 'Google Calendar is not configured on the server. Please contact your administrator.',
        error: 'Missing Google Calendar credentials in server configuration',
      });
    }

    const doctorId = req.user.id;
    const authUrl = getAuthUrl();
    const separator = authUrl.includes('?') ? '&' : '?';
    const urlWithState = `${authUrl}${separator}state=${encodeURIComponent(doctorId)}`;

    return res.json({ authUrl: urlWithState });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    return res.status(500).json({ message: 'Error getting authorization URL', error: error.message });
  }
};

// Disconnect Google Calendar
export const disconnectGoogleCalendar = async (req, res) => {
  try {
    const doctorId = req.user.id;

    await Doctor.update(
      {
        googleCalendarAccessToken: null,
        googleCalendarRefreshToken: null,
        googleCalendarTokenExpiry: null,
        googleCalendarConnected: false,
      },
      {
        where: { id: doctorId },
      }
    );

    return res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return res.status(500).json({ message: 'Error disconnecting Google Calendar' });
  }
};

// Reusable helper for the later appointment/calendar synchronization phase.
export const getDoctorCalendarAuth = async (doctor) => {
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  if (!doctor.googleCalendarConnected) {
    throw new Error('Google Calendar not connected');
  }

  if (!doctor.googleCalendarRefreshToken) {
    throw new Error('Google Calendar refresh token not found. Please reconnect your Google Calendar.');
  }

  let accessToken = doctor.googleCalendarAccessToken;
  let expiryDate = doctor.googleCalendarTokenExpiry
    ? new Date(doctor.googleCalendarTokenExpiry).getTime()
    : 0;

  const expired = !accessToken || !expiryDate || Date.now() >= expiryDate - 60_000;

  if (expired) {
    const newTokens = await refreshAccessToken(doctor.googleCalendarRefreshToken);

    accessToken = newTokens.access_token || accessToken;
    expiryDate = newTokens.expiry_date || expiryDate;

    await doctor.update({
      googleCalendarAccessToken: accessToken,
      googleCalendarRefreshToken: newTokens.refresh_token || doctor.googleCalendarRefreshToken,
      googleCalendarTokenExpiry: expiryDate ? new Date(expiryDate) : doctor.googleCalendarTokenExpiry,
      googleCalendarConnected: true,
    });
  }

  return setCredentials({
    access_token: accessToken,
    refresh_token: doctor.googleCalendarRefreshToken,
    expiry_date: expiryDate,
  });
};

// Create a calendar event
export const createEvent = async (req, res) => {
  try {
    if (!googleCalendarConfigured()) {
      return res.status(500).json({
        message: 'Google Calendar is not configured on the server. Please contact your administrator.',
        error: 'Missing Google Calendar credentials in server configuration',
      });
    }

    const doctorId = req.user.id;
    const { title, description, startTime, endTime, attendees } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        message: 'Missing required fields: title, startTime, and endTime are required',
        error: 'Validation error',
      });
    }

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found', error: 'Doctor not found' });
    }

    const auth = await getDoctorCalendarAuth(doctor);
    const event = await createCalendarEvent(auth, {
      title,
      description,
      startTime,
      endTime,
      attendees,
    });

    return res.json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Error creating calendar event:', error);

    let errorMessage = 'Error creating calendar event';
    let statusCode = 500;

    if (error.message.includes('Invalid email format')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('not connected') || error.message.includes('refresh token')) {
      errorMessage = 'Google Calendar is not connected. Please reconnect your Google Calendar.';
      statusCode = 400;
    } else if (error.message.includes('invalid_grant')) {
      errorMessage = 'Google Calendar authorization expired. Please reconnect your Google Calendar.';
      statusCode = 400;
    } else if (error.message.includes('Invalid value')) {
      errorMessage = 'Invalid event details. Please check your input and try again.';
      statusCode = 400;
    }

    return res.status(statusCode).json({ message: errorMessage, error: error.message });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { maxResults = 10 } = req.query;
    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const auth = await getDoctorCalendarAuth(doctor);
    const events = await listUpcomingEvents(auth, Number.parseInt(maxResults, 10) || 10);

    return res.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return res.status(500).json({ message: 'Error fetching calendar events', error: error.message });
  }
};

// Update a calendar event
export const updateEvent = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { eventId } = req.params;
    const updates = req.body;
    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const auth = await getDoctorCalendarAuth(doctor);
    const event = await updateCalendarEvent(auth, eventId, updates);

    return res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Error updating calendar event:', error);

    let errorMessage = 'Error updating calendar event';
    let statusCode = 500;

    if (error.message.includes('Invalid email format')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('not connected') || error.message.includes('refresh token')) {
      errorMessage = 'Google Calendar is not connected. Please reconnect your Google Calendar.';
      statusCode = 400;
    }

    return res.status(statusCode).json({ message: errorMessage, error: error.message });
  }
};

// Delete a calendar event
export const deleteEvent = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { eventId } = req.params;
    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const auth = await getDoctorCalendarAuth(doctor);
    await deleteCalendarEvent(auth, eventId);

    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return res.status(500).json({ message: 'Error deleting calendar event', error: error.message });
  }
};

// Get calendar connection status
export const getConnectionStatus = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.json({
      connected: doctor.googleCalendarConnected || false,
      tokenExpiry: doctor.googleCalendarTokenExpiry,
    });
  } catch (error) {
    console.error('Error getting connection status:', error);
    return res.status(500).json({ message: 'Error getting connection status' });
  }
};

export default {
  initiateGoogleAuth,
  handleOAuthCallback,
  getGoogleAuthUrl,
  disconnectGoogleCalendar,
  createEvent,
  getUpcomingEvents,
  updateEvent,
  deleteEvent,
  getConnectionStatus,
};
