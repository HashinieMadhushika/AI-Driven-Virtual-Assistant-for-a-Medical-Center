# 📅 Google Calendar Integration - Complete Setup Guide

## Overview
This guide will help you integrate Google Calendar with the doctor portal, allowing doctors to sync their appointments with their Google Calendar accounts.

---

## 🎯 Step-by-Step Integration Process

### **Step 1: Google Cloud Console Setup** (15 minutes)

#### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Medical-Center-Calendar`
4. Click **"Create"**

#### 1.2 Enable Google Calendar API
1. In the left menu, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Calendar API"**
3. Click on it, then click **"Enable"**

#### 1.3 Configure OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type (or Internal if using Google Workspace)
3. Fill in required fields:
   - **App name:** Medical Center Calendar Integration
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Click **"Save and Continue"**
5. **Scopes:** Click **"Add or Remove Scopes"**
   - Search and add: `https://www.googleapis.com/auth/calendar`
   - Search and add: `https://www.googleapis.com/auth/calendar.events`
6. Click **"Save and Continue"**
7. **Test users:** Add your Gmail address (for testing)
8. Click **"Save and Continue"**

#### 1.4 Create OAuth 2.0 Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Name: `Medical Center Doctor Portal`
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/calendar/oauth2callback
   ```
7. Click **"Create"**
8. **IMPORTANT:** Copy the **Client ID** and **Client Secret** - you'll need these!

---

### **Step 2: Update Environment Variables** (2 minutes)

1. Open `backend/.env` file
2. Replace the placeholder values with your actual credentials:

```env
# Google Calendar OAuth
GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth2callback
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-Ab1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth2callback
```

---

### **Step 3: Database Migration** (Automatic)

The database schema has been updated to include Google Calendar fields:
- `googleCalendarAccessToken`
- `googleCalendarRefreshToken`
- `googleCalendarTokenExpiry`
- `googleCalendarConnected`

**These fields will be automatically added** when you restart the backend server (Sequelize auto-sync).

---

### **Step 4: Restart Backend Server** (1 minute)

1. Stop the backend server if running (Ctrl+C)
2. Start it again:
```bash
cd backend
npm run dev
```

3. Verify the new routes are registered - you should see in the console:
   - `✅ All models synced`
   - Server running on http://localhost:5000

---

### **Step 5: Test the Integration** (5 minutes)

#### 5.1 Login as Doctor
1. Go to http://localhost:3000/doctor/login
2. Login with: `sarah.silva@medicare.com` / `password123`

#### 5.2 Connect Google Calendar
1. Click on **"Profile"** in the sidebar
2. Click the **"Calendar Integration"** tab
3. Click **"Connect with Google"** button
4. You'll be redirected to Google OAuth consent screen
5. Select your Google account
6. Click **"Allow"** to grant calendar access
7. You'll be redirected back to the profile page
8. You should see: **"Google Calendar Connected"** status

#### 5.3 View Synced Events
- Once connected, the page will automatically fetch your upcoming Google Calendar events
- Events will be displayed in a list with dates and times

---

## 🔧 API Endpoints Reference

### Calendar Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/calendar/auth-url` | Get Google OAuth URL | ✅ Yes |
| GET | `/api/calendar/oauth2callback` | Handle OAuth callback | ❌ No |
| GET | `/api/calendar/status` | Check connection status | ✅ Yes |
| POST | `/api/calendar/disconnect` | Disconnect Google Calendar | ✅ Yes |
| POST | `/api/calendar/events` | Create calendar event | ✅ Yes |
| GET | `/api/calendar/events` | Get upcoming events | ✅ Yes |
| PUT | `/api/calendar/events/:eventId` | Update event | ✅ Yes |
| DELETE | `/api/calendar/events/:eventId` | Delete event | ✅ Yes |

---

## 📝 How to Use Calendar Features

### Creating an Event
```javascript
const response = await fetch('http://localhost:5000/api/calendar/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Patient Appointment',
    description: 'Checkup with John Doe',
    startTime: '2026-01-25T10:00:00+05:30',
    endTime: '2026-01-25T10:30:00+05:30',
    attendees: [
      { email: 'patient@example.com' }
    ]
  })
});
```

### Getting Upcoming Events
```javascript
const response = await fetch('http://localhost:5000/api/calendar/events?maxResults=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log(data.events); // Array of events
```

---

## 🔐 Security Features

### OAuth 2.0 Flow
1. **Authorization Request:** User clicks "Connect with Google"
2. **User Consent:** Google shows permission screen
3. **Authorization Code:** Google returns code to callback URL
4. **Token Exchange:** Backend exchanges code for access & refresh tokens
5. **Secure Storage:** Tokens are encrypted and stored in PostgreSQL
6. **Auto Refresh:** System automatically refreshes expired tokens

### Token Management
- **Access Token:** Valid for 1 hour, refreshed automatically
- **Refresh Token:** Never expires unless revoked by user
- **Encryption:** Tokens stored in database (consider encrypting in production)
- **Disconnect:** User can revoke access anytime

---

## 🚀 Next Steps for Production

### 1. **Verify Your App** (Required for public use)
- Go to Google Cloud Console → OAuth consent screen
- Click **"Publish App"**
- Submit for verification (Google review process)

### 2. **Update Redirect URIs**
```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/calendar/oauth2callback
```

### 3. **Enable HTTPS**
- Google Calendar API requires HTTPS in production
- Use SSL certificates (Let's Encrypt)

### 4. **Encrypt Tokens in Database**
```javascript
// Install crypto library
npm install crypto-js

// Encrypt before saving
import CryptoJS from 'crypto-js';
const encrypted = CryptoJS.AES.encrypt(token, process.env.ENCRYPTION_KEY).toString();
```

### 5. **Add Error Logging**
```javascript
// Install logging library
npm install winston

// Log OAuth errors
logger.error('OAuth error:', { error, userId: doctor.id });
```

---

## 🐛 Troubleshooting

### Issue: "Redirect URI Mismatch"
**Solution:** Ensure the redirect URI in Google Console exactly matches:
```
http://localhost:5000/api/calendar/oauth2callback
```

### Issue: "Access Denied" or "App Not Verified"
**Solution:** 
1. Add your email to test users in OAuth consent screen
2. For production, submit app for verification

### Issue: "Token Expired"
**Solution:** The system auto-refreshes tokens. If issues persist:
1. Disconnect and reconnect Google Calendar
2. Check `googleCalendarRefreshToken` is not null in database

### Issue: "Calendar Events Not Showing"
**Solution:**
1. Check doctor is connected: `googleCalendarConnected = true`
2. Verify token expiry date is future
3. Check browser console for errors
4. Verify backend logs for API errors

---

## 📚 Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google API Node.js Client](https://github.com/googleapis/google-api-nodejs-client)

---

## ✅ Integration Checklist

- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID and Secret added to `.env`
- [ ] Backend server restarted
- [ ] Database fields auto-created
- [ ] Frontend profile page updated
- [ ] Test user added to OAuth consent screen
- [ ] Successfully connected Google Calendar
- [ ] Events are syncing correctly

---

## 🎉 Success Indicators

When everything is working correctly:

1. ✅ Backend logs show: `✅ All models synced`
2. ✅ Profile page Calendar tab shows connection button
3. ✅ Clicking "Connect" redirects to Google OAuth
4. ✅ After authorization, returns to profile with "Connected" status
5. ✅ Upcoming events load and display
6. ✅ Database shows `googleCalendarConnected = true`

---

## 💡 Future Enhancements

- [ ] Sync appointments to calendar automatically
- [ ] Two-way sync (calendar → appointments)
- [ ] Email reminders via Calendar
- [ ] Calendar availability blocking
- [ ] Multiple calendar support
- [ ] Recurring appointment support
- [ ] Calendar event color coding
- [ ] Push notifications for events

---

**Need Help?** Check the troubleshooting section or review the API error messages in the browser console.
