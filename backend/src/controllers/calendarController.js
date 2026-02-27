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
    // Check if Google Calendar credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      return res.status(500).json({ 
        message: 'Google Calendar is not configured on the server. Please contact your administrator.',
        error: 'Missing Google Calendar credentials in server configuration'
      });
    }

    const doctorId = req.user.id; // From auth middleware
    const authUrl = getAuthUrl();
    
    // Add doctor ID as state parameter
    const urlWithState = `${authUrl}&state=${doctorId}`;
    
    res.json({ authUrl: urlWithState });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ message: 'Error getting authorization URL', error: error.message });
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
  try {
    console.log('Getting auth client for doctor:', doctor.id);
    console.log('Calendar connected:', doctor.googleCalendarConnected);
    console.log('Has access token:', !!doctor.googleCalendarAccessToken);
    console.log('Has refresh token:', !!doctor.googleCalendarRefreshToken);
    console.log('Token expiry:', doctor.googleCalendarTokenExpiry);

    if (!doctor.googleCalendarAccessToken || !doctor.googleCalendarRefreshToken) {
      throw new Error('Google Calendar tokens not found. Please reconnect your Google Calendar.');
    }

    let tokens = {
      access_token: doctor.googleCalendarAccessToken,
      refresh_token: doctor.googleCalendarRefreshToken,
      expiry_date: new Date(doctor.googleCalendarTokenExpiry).getTime()
    };

    console.log('Current token expiry date:', new Date(doctor.googleCalendarTokenExpiry));
    console.log('Current time:', new Date());
    console.log('Token expired:', new Date() >= new Date(doctor.googleCalendarTokenExpiry));

    // Check if token is expired
    if (new Date() >= new Date(doctor.googleCalendarTokenExpiry)) {
      console.log('Token expired, refreshing...');
      // Refresh the token
      const newTokens = await refreshAccessToken(doctor.googleCalendarRefreshToken);
      
      console.log('New tokens received, updating database...');
      // Update database with new tokens
      await Doctor.update({
        googleCalendarAccessToken: newTokens.access_token,
        googleCalendarTokenExpiry: new Date(newTokens.expiry_date)
      }, {
        where: { id: doctor.id }
      });

      tokens = newTokens;
      console.log('Tokens refreshed successfully');
    } else {
      console.log('Token still valid, using existing token');
    }

    return setCredentials(tokens);
  } catch (error) {
    console.error('Error in getAuthClient:', error);
    throw error;
  }
};

// Create a calendar event
export const createEvent = async (req, res) => {
  try {
    // Check if Google Calendar credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      return res.status(500).json({ 
        message: 'Google Calendar is not configured on the server. Please contact your administrator.',
        error: 'Missing Google Calendar credentials in server configuration'
      });
    }

    const doctorId = req.user.id;
    const { title, description, startTime, endTime, attendees } = req.body;

    console.log('Creating calendar event for doctor:', doctorId);
    console.log('Request body:', req.body);

    // Validation
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, startTime, and endTime are required',
        error: 'Validation error'
      });
    }

    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found', error: 'Doctor not found' });
    }

    if (!doctor.googleCalendarConnected) {
      return res.status(400).json({ 
        message: 'Google Calendar not connected. Please connect your Google Calendar first.',
        error: 'Calendar not connected' 
      });
    }

    console.log('Doctor found, calendar connected. Getting auth client...');
    const auth = await getAuthClient(doctor);

    console.log('Creating event in Google Calendar...');
    const event = await createCalendarEvent(auth, {
      title,
      description,
      startTime,
      endTime,
      attendees
    });

    console.log('Event created successfully:', event.id);
    res.json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Error creating calendar event';
    let statusCode = 500;
    
    if (error.message.includes('Invalid email format')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('tokens not found')) {
      errorMessage = 'Google Calendar session expired. Please reconnect your Google Calendar.';
    } else if (error.message.includes('invalid_grant')) {
      errorMessage = 'Google Calendar authorization expired. Please reconnect your Google Calendar.';
    } else if (error.message.includes('Invalid value')) {
      errorMessage = 'Invalid event details. Please check your input and try again.';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ message: errorMessage, error: error.message });
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
    
    let errorMessage = 'Error updating calendar event';
    let statusCode = 500;
    
    if (error.message.includes('Invalid email format')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('tokens not found')) {
      errorMessage = 'Google Calendar session expired. Please reconnect your Google Calendar.';
    }
    
    res.status(statusCode).json({ message: errorMessage, error: error.message });
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