import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate the authorization URL
export const getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Forces to get refresh token
  });
};

// Exchange authorization code for tokens
export const getTokensFromCode = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Set credentials for API calls
export const setCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
};

// Create calendar event
export const createCalendarEvent = async (auth, eventDetails) => {
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: eventDetails.title,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startTime,
      timeZone: 'Asia/Colombo', // Change to your timezone
    },
    end: {
      dateTime: eventDetails.endTime,
      timeZone: 'Asia/Colombo',
    },
    attendees: eventDetails.attendees || [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });

  return response.data;
};

// List upcoming events
export const listUpcomingEvents = async (auth, maxResults = 10) => {
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items;
};

// Update calendar event
export const updateCalendarEvent = async (auth, eventId, updates) => {
  const calendar = google.calendar({ version: 'v3', auth });

  // First get the existing event
  const existingEvent = await calendar.events.get({
    calendarId: 'primary',
    eventId: eventId,
  });

  // Transform updates to Google Calendar format
  const eventUpdates = {};
  
  if (updates.title !== undefined) {
    eventUpdates.summary = updates.title;
  }
  
  if (updates.description !== undefined) {
    eventUpdates.description = updates.description;
  }
  
  if (updates.startTime !== undefined) {
    eventUpdates.start = {
      dateTime: updates.startTime,
      timeZone: 'Asia/Colombo',
    };
  }
  
  if (updates.endTime !== undefined) {
    eventUpdates.end = {
      dateTime: updates.endTime,
      timeZone: 'Asia/Colombo',
    };
  }
  
  if (updates.attendees !== undefined) {
    eventUpdates.attendees = Array.isArray(updates.attendees) 
      ? updates.attendees.map(email => typeof email === 'string' ? { email } : email)
      : [];
  }

  // Merge updates with existing event
  const updatedEvent = {
    ...existingEvent.data,
    ...eventUpdates,
  };

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId: eventId,
    resource: updatedEvent,
  });

  return response.data;
};

// Delete calendar event
export const deleteCalendarEvent = async (auth, eventId) => {
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
  });

  return { message: 'Event deleted successfully' };
};

// Check if token is expired and refresh if needed
export const refreshAccessToken = async (refreshToken) => {
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
};

export default {
  getAuthUrl,
  getTokensFromCode,
  setCredentials,
  createCalendarEvent,
  listUpcomingEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
  refreshAccessToken
};
