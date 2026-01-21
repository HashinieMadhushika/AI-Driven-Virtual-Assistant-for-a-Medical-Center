import Doctor from '../models/Doctor.js';
import {
  getAuthUrl,
  getTokensFromCode,
  setCredentials,
  createCalendarEvent,
  listUpcomingEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
  refreshAccessToken
} from '../services/googleCalendar.js';

// Initiate Google Calendar OAuth
export const initiateGoogleAuth = async (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    res.status(500).json({ message: 'Error initiating Google authentication' });
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const doctorId = req.query.state; // Pass doctor ID as state parameter

    if (!code) {
      return res.status(400).json({ message: 'Authorization code not provided' });
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Save tokens to doctor's record
    await Doctor.update({
      googleCalendarAccessToken: tokens.access_token,
      googleCalendarRefreshToken: tokens.refresh_token,
      googleCalendarTokenExpiry: new Date(tokens.expiry_date),
      googleCalendarConnected: true
    }, {
      where: { id: doctorId }
    });

    // Redirect to frontend success page
    res.redirect('http://localhost:3000/doctor/profile?calendar=connected');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.redirect('http://localhost:3000/doctor/profile?calendar=error');
  }
};

// Get authorization URL with doctor ID
export const getGoogleAuthUrl = async (req, res) => {
  try {
    const doctorId = req.user.id; // From auth middleware
    const authUrl = getAuthUrl();
    
    // Add doctor ID as state parameter
    const urlWithState = `${authUrl}&state=${doctorId}`;
    
    res.json({ authUrl: urlWithState });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ message: 'Error getting authorization URL' });
  }
};

// Disconnect Google Calendar
export const disconnectGoogleCalendar = async (req, res) => {
  try {
    const doctorId = req.user.id;

    await Doctor.update({
      googleCalendarAccessToken: null,
      googleCalendarRefreshToken: null,
      googleCalendarTokenExpiry: null,
      googleCalendarConnected: false
    }, {
      where: { id: doctorId }
    });

    res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ message: 'Error disconnecting Google Calendar' });
  }
};

// Helper function to get valid auth client
const getAuthClient = async (doctor) => {
  let tokens = {
    access_token: doctor.googleCalendarAccessToken,
    refresh_token: doctor.googleCalendarRefreshToken,
    expiry_date: new Date(doctor.googleCalendarTokenExpiry).getTime()
  };

  // Check if token is expired
  if (new Date() >= new Date(doctor.googleCalendarTokenExpiry)) {
    // Refresh the token
    const newTokens = await refreshAccessToken(doctor.googleCalendarRefreshToken);
    
    // Update database with new tokens
    await Doctor.update({
      googleCalendarAccessToken: newTokens.access_token,
      googleCalendarTokenExpiry: new Date(newTokens.expiry_date)
    }, {
      where: { id: doctor.id }
    });

    tokens = newTokens;
  }

  return setCredentials(tokens);
};

// Create a calendar event
export const createEvent = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { title, description, startTime, endTime, attendees } = req.body;

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor.googleCalendarConnected) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    const auth = await getAuthClient(doctor);

    const event = await createCalendarEvent(auth, {
      title,
      description,
      startTime,
      endTime,
      attendees
    });

    res.json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ message: 'Error creating calendar event', error: error.message });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { maxResults = 10 } = req.query;

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor.googleCalendarConnected) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    const auth = await getAuthClient(doctor);
    const events = await listUpcomingEvents(auth, parseInt(maxResults));

    res.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Error fetching calendar events', error: error.message });
  }
};

// Update a calendar event
export const updateEvent = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { eventId } = req.params;
    const updates = req.body;

    console.log('Updating event:', eventId, 'with updates:', updates);

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor.googleCalendarConnected) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    const auth = await getAuthClient(doctor);
    const event = await updateCalendarEvent(auth, eventId, updates);

    console.log('Event updated successfully:', event.id);
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error updating calendar event', error: error.message });
  }
};

// Delete a calendar event
export const deleteEvent = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { eventId } = req.params;

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor.googleCalendarConnected) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    const auth = await getAuthClient(doctor);
    await deleteCalendarEvent(auth, eventId);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ message: 'Error deleting calendar event', error: error.message });
  }
};

// Get calendar connection status
export const getConnectionStatus = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await Doctor.findByPk(doctorId);

    res.json({
      connected: doctor.googleCalendarConnected || false,
      tokenExpiry: doctor.googleCalendarTokenExpiry
    });
  } catch (error) {
    console.error('Error getting connection status:', error);
    res.status(500).json({ message: 'Error getting connection status' });
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
  getConnectionStatus
};
