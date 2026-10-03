import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

export const GOOGLE_CALENDAR_TIME_ZONE = 'Asia/Colombo';

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Generate the authorization URL
export const getAuthUrl = () => {
  const oauth2Client = createOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
};

// Exchange authorization code for tokens
export const getTokensFromCode = async (code) => {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Create an isolated OAuth client for one doctor's request.
export const setCredentials = (tokens) => {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
};

function normalizeAttendees(attendees = []) {
  if (!Array.isArray(attendees) || attendees.length === 0) {
    return [];
  }

  const normalized = attendees.map((attendee) => {
    if (typeof attendee === 'string') {
      return { email: attendee.trim() };
    }

    return {
      ...attendee,
      email: String(attendee?.email || '').trim(),
    };
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidAttendees = normalized.filter((attendee) => !emailRegex.test(attendee.email));

  if (invalidAttendees.length > 0) {
    throw new Error(
      `Invalid email format(s) in attendees: ${invalidAttendees.map((attendee) => attendee.email).join(', ')}`
    );
  }

  return normalized;
}

// Create calendar event in the connected doctor's primary calendar.
// Patient attendees are intentionally optional; this project sends normal
// appointment emails to patients instead of requiring patient Calendar OAuth.
export const createCalendarEvent = async (auth, eventDetails) => {
  const calendar = google.calendar({ version: 'v3', auth });
  const attendees = normalizeAttendees(eventDetails.attendees);

  const event = {
    summary: eventDetails.title,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startTime,
      timeZone: GOOGLE_CALENDAR_TIME_ZONE,
    },
    end: {
      dateTime: eventDetails.endTime,
      timeZone: GOOGLE_CALENDAR_TIME_ZONE,
    },
    ...(attendees.length > 0 ? { attendees } : {}),
    reminders: {
      useDefault: false,
      overrides: [
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
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items;
};

// Query busy periods from the connected doctor's primary calendar.
export const listCalendarBusyPeriods = async (auth, timeMin, timeMax) => {
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: GOOGLE_CALENDAR_TIME_ZONE,
      items: [{ id: 'primary' }],
    },
  });

  return response.data?.calendars?.primary?.busy || [];
};

// Update calendar event
export const updateCalendarEvent = async (auth, eventId, updates) => {
  const calendar = google.calendar({ version: 'v3', auth });

  const existingEvent = await calendar.events.get({
    calendarId: 'primary',
    eventId,
  });

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
      timeZone: GOOGLE_CALENDAR_TIME_ZONE,
    };
  }

  if (updates.endTime !== undefined) {
    eventUpdates.end = {
      dateTime: updates.endTime,
      timeZone: GOOGLE_CALENDAR_TIME_ZONE,
    };
  }

  if (updates.attendees !== undefined) {
    const attendees = normalizeAttendees(updates.attendees);
    eventUpdates.attendees = attendees;
  }

  const updatedEvent = {
    ...existingEvent.data,
    ...eventUpdates,
  };

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId,
    resource: updatedEvent,
  });

  return response.data;
};

// Delete calendar event
export const deleteCalendarEvent = async (auth, eventId) => {
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  } catch (error) {
    // Treat an already-missing event as deleted. This makes cancellation retries idempotent.
    if (error?.code !== 404 && error?.response?.status !== 404) {
      throw error;
    }
  }

  return { message: 'Event deleted successfully' };
};

// Check if token is expired and refresh if needed
export const refreshAccessToken = async (refreshToken) => {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
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
  listCalendarBusyPeriods,
  updateCalendarEvent,
  deleteCalendarEvent,
  refreshAccessToken,
};
