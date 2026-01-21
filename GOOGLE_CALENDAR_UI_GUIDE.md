# Google Calendar UI Integration Guide

## Overview
The Google Calendar integration now displays your actual Google Calendar events in two locations:

### 1. Doctor Dashboard (`/doctor/dashboard`)
- **Location**: Right sidebar, replacing the static calendar
- **Features**:
  - Full monthly calendar view with navigation (previous/next month)
  - Dots on dates that have events
  - Today's date highlighted in cyan
  - Shows today's events below the calendar
  - If calendar not connected, shows a prompt to connect

### 2. Profile Calendar Tab (`/doctor/profile` → Calendar Integration)
- **Location**: Profile page, Calendar Integration tab
- **Features**:
  - **Left panel**: Full monthly calendar view
    - Month navigation (previous/next buttons)
    - Events marked with dots on calendar dates
    - Today highlighted
    - Hover over dates to see event titles
  
  - **Right panel**: Upcoming Events List
    - Scrollable list of upcoming events
    - Event title, description, date, and time
    - Refresh button to reload events
    - Clean card design with hover effects

## How It Works

### When Calendar is Connected:
1. Dashboard automatically fetches and displays your Google Calendar events
2. Events appear as dots on the calendar
3. Today's events show below the calendar (up to 2 events)
4. Profile page shows full calendar + detailed upcoming events list

### When Calendar is Not Connected:
1. Dashboard shows a message to connect calendar
2. Provides a link to Profile → Calendar Integration
3. Profile page shows the "Connect with Google" button

## Features Implemented

### Dashboard Calendar
- ✅ Real Google Calendar events displayed
- ✅ Month navigation
- ✅ Event indicators (dots) on dates
- ✅ Today highlighted
- ✅ Today's events preview
- ✅ Connection status check

### Profile Calendar
- ✅ Full monthly calendar view
- ✅ Month navigation
- ✅ Event indicators on calendar
- ✅ Detailed upcoming events list (scrollable)
- ✅ Event details: title, description, date, time
- ✅ Refresh button for events
- ✅ Connection/disconnection functionality

## API Endpoints Used

- `GET /api/calendar/status` - Check if calendar is connected
- `GET /api/calendar/events` - Fetch upcoming events
- `GET /api/calendar/auth-url` - Get Google OAuth URL
- `POST /api/calendar/disconnect` - Disconnect calendar

## Visual Design

### Dashboard Calendar
- Google Calendar icon with cyan accent
- Clean grid layout (7 columns for days)
- Today: Cyan background with white text
- Events: Small cyan dots below date number
- Today's events: Cyan background cards

### Profile Calendar  
- Two-column layout (responsive)
- Calendar on left, events list on right
- Consistent cyan color scheme
- Hover effects on clickable elements
- Scrollable events list (max-height: 400px)

## User Flow

1. **Initial State**: Calendar not connected
   - Dashboard shows prompt
   - Profile shows "Connect with Google" button

2. **Connection**: User clicks connect
   - Redirects to Google OAuth
   - Returns to profile with success message
   - Calendar data automatically loads

3. **Active State**: Calendar connected
   - Dashboard displays current month + events
   - Profile shows full calendar + upcoming events
   - Users can navigate months
   - Events sync automatically

4. **Disconnection**: User can disconnect anytime
   - Clears OAuth tokens
   - Returns to initial state

## Next Steps (Optional Enhancements)

1. **Create Events**: Add functionality to create calendar events from the app
2. **Edit Events**: Allow editing existing events
3. **Delete Events**: Enable event deletion
4. **Event Details Modal**: Click on calendar date to see all events for that day
5. **Sync Appointments**: Auto-create Google Calendar events when appointments are booked
6. **Reminders**: Configure event reminders
7. **Multiple Calendars**: Support for multiple Google calendars
8. **Color Coding**: Different colors for different event types

## Testing

To test the integration:
1. Login as a doctor
2. Go to Profile → Calendar Integration
3. Click "Connect with Google"
4. Authorize the application
5. View calendar in Dashboard and Profile
6. Navigate between months
7. Add events in Google Calendar to see them appear in the app

## Troubleshooting

**Calendar not showing events?**
- Check if calendar is connected (Status should show "Connected")
- Click "Refresh" button in upcoming events
- Check browser console for errors

**OAuth errors?**
- Ensure you're added as a test user in Google Cloud Console
- Verify OAuth credentials in `.env` file
- Check redirect URI matches exactly

**Events not syncing?**
- Events are fetched when page loads
- Click refresh to manually sync
- Check token hasn't expired

## Files Modified

1. `frontend/app/doctor/dashboard/page.tsx`
   - Added calendar state management
   - Added calendar helper functions
   - Replaced static calendar with Google Calendar

2. `frontend/app/doctor/profile/page.tsx`
   - Enhanced calendar tab layout
   - Added full calendar view alongside events list
   - Added calendar helper functions

## Database Schema
The doctor model includes these Google Calendar fields:
- `googleCalendarAccessToken` (TEXT)
- `googleCalendarRefreshToken` (TEXT)
- `googleCalendarTokenExpiry` (DATE)
- `googleCalendarConnected` (BOOLEAN)

All set! Your Google Calendar is now fully integrated into the Medical Center system! 🎉
