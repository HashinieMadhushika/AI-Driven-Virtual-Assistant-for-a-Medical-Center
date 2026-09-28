# 🚀 Quick Start Guide - Doctor Portal with Google Calendar

## ⚡ Get Started in 10 Minutes

### Prerequisites
- Node.js installed
- PostgreSQL installed and running
- Google account

---

## 📝 Step 1: Configure Google Calendar (5 minutes)

### 1.1 Create Google Cloud Project
1. Visit: https://console.cloud.google.com/
2. Click "New Project" → Name it "Medical-Center" → Create
3. Go to "APIs & Services" → "Library"
4. Search "Google Calendar API" → Enable it

### 1.2 Set Up OAuth
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" → Fill in app name and your email → Save
3. Scopes → Add:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
4. Test users → Add your Gmail address → Save

### 1.3 Get Credentials
1. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
2. Type: "Web application"
3. Authorized redirect URIs:
   ```
   http://localhost:5000/api/calendar/oauth2callback
   ```
4. Click Create → **Copy Client ID and Client Secret**

---

## 🔧 Step 2: Update Environment Variables (1 minute)

Open `backend/.env` and update:

```env
# Database (already configured)
PG_PASSWORD=1234

# Google Calendar - REPLACE WITH YOUR CREDENTIALS
GOOGLE_CLIENT_ID=YOUR-CLIENT-ID-HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR-CLIENT-SECRET-HERE
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth2callback
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-XyZ789AbC123DeF456
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth2callback
```

---

## 🗄️ Step 3: Restart Backend (1 minute)

The database schema will auto-update with new Google Calendar fields.

```bash
# Stop backend if running (Ctrl+C)

# Start backend
cd backend
npm run dev
```

**Look for:** `✅ All models synced`

---

## ✅ Step 4: Test the Integration (3 minutes)

### 4.1 Login
1. Open: http://localhost:3000/doctor/login
2. Login with: `sarah.silva@medicare.com` / `password123`

### 4.2 Connect Google Calendar
1. Click **"Profile"** in sidebar
2. Click **"Calendar Integration"** tab
3. Click **"Connect with Google"** button
4. **Select your Google account**
5. Click **"Allow"** to grant permissions
6. You'll be redirected back to profile
7. ✅ Should show: **"Google Calendar Connected"**

### 4.3 View Events
- Your upcoming Google Calendar events will display automatically
- Click "Refresh" to reload events

---

## 🎯 What You Can Do Now

### ✅ Fully Functional Features

1. **Profile Management**
   - View and edit doctor information
   - Update phone, specialization, designation
   - Real-time database updates

2. **Password Management**
   - Change password with current password verification
   - bcrypt encryption
   - Minimum 8 characters validation

3. **Google Calendar Integration**
   - Connect/disconnect Google Calendar
   - View upcoming events
   - Auto-sync appointments (ready for implementation)

---

## 📚 Quick Reference

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/doctors/login` | POST | Doctor login |
| `/api/doctors/profile` | GET | Get profile |
| `/api/doctors/profile` | PUT | Update profile |
| `/api/doctors/change-password` | PUT | Change password |
| `/api/calendar/auth-url` | GET | Get Google OAuth URL |
| `/api/calendar/status` | GET | Check calendar status |
| `/api/calendar/disconnect` | POST | Disconnect calendar |
| `/api/calendar/events` | GET | Get upcoming events |

### Test Credentials
```
Email: sarah.silva@medicare.com
Password: password123
```

---

## 🐛 Troubleshooting

### Issue: "Redirect URI Mismatch"
**Fix:** Ensure redirect URI in Google Console is exactly:
```
http://localhost:5000/api/calendar/oauth2callback
```

### Issue: "Access Denied"
**Fix:** Add your email to "Test users" in OAuth consent screen

### Issue: "Calendar not connecting"
**Fix:** 
1. Check `.env` has correct Client ID and Secret
2. Restart backend server
3. Clear browser cache and try again

### Issue: "Events not showing"
**Fix:**
1. Make sure you have events in your Google Calendar
2. Check browser console for errors
3. Click "Refresh" button

---

## 📖 Detailed Documentation

For complete setup and architecture details, see:

- **[GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md)** - Complete Google Calendar setup guide
- **[DOCTOR_PORTAL_ARCHITECTURE.md](./DOCTOR_PORTAL_ARCHITECTURE.md)** - Full system architecture

---

## 🎉 Success Checklist

- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] OAuth credentials created
- [ ] `.env` updated with credentials
- [ ] Backend restarted successfully
- [ ] Logged in as doctor
- [ ] Google Calendar connected
- [ ] Events displaying correctly

---

## 💡 Next Steps

### Immediate Improvements
1. **Auto-sync appointments to calendar** when created
2. **Two-way sync:** Import calendar events as appointments
3. **Email notifications** via Google Calendar
4. **Availability management** using calendar blocking

### Production Deployment
1. Verify Google app (for public use)
2. Update redirect URIs to production URL
3. Enable HTTPS
4. Encrypt tokens in database
5. Add rate limiting

---

## 🆘 Need Help?

1. **Check backend logs** in terminal for error messages
2. **Check browser console** (F12) for frontend errors
3. **Review documentation** in GOOGLE_CALENDAR_SETUP.md
4. **Verify database** has new calendar fields (pgAdmin)

---

**Everything Working?** 🎊 You now have a fully functional doctor portal with Google Calendar integration!
