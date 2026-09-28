# 🏥 Doctor Portal - Complete Integration Architecture

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Backend Integration](#backend-integration)
3. [Frontend Integration](#frontend-integration)
4. [Database Schema](#database-schema)
5. [Authentication Flow](#authentication-flow)
6. [Google Calendar Integration](#google-calendar-integration)
7. [Appointment Management](#appointment-management)
8. [Testing Guide](#testing-guide)

---

## 🏗️ System Architecture

### Technology Stack
```
Frontend:  Next.js 16 + React 19 + TailwindCSS 4
Backend:   Node.js + Express + ES Modules
Database:  PostgreSQL + Sequelize ORM
Auth:      JWT (JSON Web Tokens) + bcrypt
Calendar:  Google Calendar API + OAuth 2.0
```

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Doctor Login │  │ Dashboard    │  │ Profile      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Appointments │  │ Password Tab │  │ Calendar Tab │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Routes  │  │Doctor Routes │  │Calendar Routes│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Ctrl    │  │Doctor Ctrl   │  │Calendar Ctrl │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Doctor Model │  │ Auth MW      │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (medical_center)            │
├─────────────────────────────────────────────────────────────┤
│  Doctors Table:                                              │
│  - id, name, email, password (hashed)                       │
│  - phone, specialization, designation                        │
│  - yearsOfExperience, education, certifications             │
│  - googleCalendarAccessToken, googleCalendarRefreshToken    │
│  - googleCalendarTokenExpiry, googleCalendarConnected       │
│  - role, createdAt, updatedAt                               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Google Calendar API                        │
│  - OAuth 2.0 Authentication                                  │
│  - Event CRUD Operations                                     │
│  - Calendar Sync                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend Integration

### File Structure
```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js     # Admin authentication
│   │   ├── doctorController.js   # Doctor CRUD, auth, password
│   │   └── calendarController.js # Google Calendar operations
│   ├── models/
│   │   ├── User.js              # Admin model
│   │   └── Doctor.js            # Doctor model (updated)
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js        # Admin routes
│   │   ├── doctorRoutes.js      # Doctor routes
│   │   └── calendarRoutes.js    # Calendar routes (NEW)
│   └── services/
│       └── googleCalendar.js    # Calendar service (NEW)
├── app.js                        # Express app (updated)
├── .env                          # Environment variables
└── package.json
```

### Key Backend Components

#### 1. Doctor Model (`backend/src/models/Doctor.js`)
```javascript
// New fields added for Google Calendar:
googleCalendarAccessToken: DataTypes.TEXT
googleCalendarRefreshToken: DataTypes.TEXT
googleCalendarTokenExpiry: DataTypes.DATE
googleCalendarConnected: DataTypes.BOOLEAN (default: false)
```

#### 2. Calendar Controller (`backend/src/controllers/calendarController.js`)
- **getGoogleAuthUrl:** Generate OAuth URL with doctor ID
- **handleOAuthCallback:** Exchange code for tokens, save to DB
- **disconnectGoogleCalendar:** Remove tokens, set connected=false
- **createEvent:** Create Google Calendar event
- **getUpcomingEvents:** Fetch upcoming events from Google
- **updateEvent:** Update existing event
- **deleteEvent:** Delete event
- **getConnectionStatus:** Check if calendar is connected

#### 3. Calendar Service (`backend/src/services/googleCalendar.js`)
```javascript
Functions:
- getAuthUrl()              // Generate OAuth URL
- getTokensFromCode(code)   // Exchange authorization code
- setCredentials(tokens)    // Configure OAuth client
- createCalendarEvent()     // Create event
- listUpcomingEvents()      // Get events
- updateCalendarEvent()     // Update event
- deleteCalendarEvent()     // Delete event
- refreshAccessToken()      // Refresh expired token
```

#### 4. Calendar Routes (`backend/src/routes/calendarRoutes.js`)
```javascript
GET    /api/calendar/auth-url           → getGoogleAuthUrl
GET    /api/calendar/oauth2callback     → handleOAuthCallback
GET    /api/calendar/status              → getConnectionStatus
POST   /api/calendar/disconnect          → disconnectGoogleCalendar
POST   /api/calendar/events              → createEvent
GET    /api/calendar/events              → getUpcomingEvents
PUT    /api/calendar/events/:eventId     → updateEvent
DELETE /api/calendar/events/:eventId     → deleteEvent
```

---

## 💻 Frontend Integration

### File Structure
```
frontend/
├── app/
│   ├── doctor/
│   │   ├── layout.tsx           # Doctor layout with sidebar
│   │   ├── login/
│   │   │   └── page.tsx         # Doctor login page
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Doctor dashboard
│   │   ├── profile/
│   │   │   └── page.tsx         # Profile with tabs (UPDATED)
│   │   └── appointments/
│   │       └── page.tsx         # Appointments page
│   └── ...
```

### Profile Page Components

#### State Management
```typescript
// Core states
const [doctor, setDoctor] = useState<any>(null)
const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'calendar'>('profile')
const [isEditing, setIsEditing] = useState(false)

// Calendar states (NEW)
const [calendarConnected, setCalendarConnected] = useState(false)
const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
const [loadingEvents, setLoadingEvents] = useState(false)

// Form states
const [formData, setFormData] = useState({...})
const [passwordData, setPasswordData] = useState({...})
```

#### Key Functions

1. **checkCalendarStatus()**
   - Fetches connection status from backend
   - Sets `calendarConnected` state
   - Calls `fetchUpcomingEvents()` if connected

2. **handleConnectGoogleCalendar()**
   - Fetches OAuth URL from backend
   - Redirects to Google OAuth consent screen

3. **handleDisconnectGoogleCalendar()**
   - Sends disconnect request to backend
   - Clears calendar state

4. **fetchUpcomingEvents()**
   - Fetches upcoming events from Google Calendar
   - Updates `upcomingEvents` state

5. **handleSave()**
   - Updates doctor profile via PUT /api/doctors/profile
   - Refreshes local storage

6. **handlePasswordChange()**
   - Validates password requirements
   - Sends to PUT /api/doctors/change-password

---

## 🗄️ Database Schema

### Doctors Table
```sql
CREATE TABLE "Doctors" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(255),
  "specialization" VARCHAR(255) NOT NULL,
  "designation" VARCHAR(255),
  "yearsOfExperience" INTEGER,
  "education" TEXT,
  "certifications" JSON DEFAULT '[]',
  "availableTimes" JSON,
  "googleCalendarAccessToken" TEXT,           -- NEW
  "googleCalendarRefreshToken" TEXT,          -- NEW
  "googleCalendarTokenExpiry" TIMESTAMP,      -- NEW
  "googleCalendarConnected" BOOLEAN DEFAULT false,  -- NEW
  "role" VARCHAR(255) DEFAULT 'doctor',
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);
```

### Sample Data
```sql
INSERT INTO "Doctors" (name, email, password, phone, specialization, designation, yearsOfExperience, education, role) 
VALUES (
  'Dr. Sarah Silva',
  'sarah.silva@medicare.com',
  '$2b$10$hashedPasswordHere',  -- hashed with bcrypt
  '+1234567890',
  'Cardiology',
  'Senior Consultant',
  15,
  'MBBS, MD (Cardiology)',
  'doctor'
);
```

---

## 🔐 Authentication Flow

### Login Flow
```
1. User enters email + password
   ↓
2. Frontend sends POST /api/doctors/login
   ↓
3. Backend:
   - Finds doctor by email
   - Compares password with bcrypt
   - Generates JWT token (7-day expiry)
   - Returns token + doctor data (without password)
   ↓
4. Frontend:
   - Stores token in localStorage
   - Stores user data in localStorage
   - Redirects to /doctor/dashboard
   ↓
5. Protected Routes:
   - Frontend sends Authorization: Bearer <token>
   - Backend verifies JWT in authMiddleware
   - Extracts doctor ID from token
   - Allows access if valid
```

### JWT Token Structure
```javascript
{
  id: 2,                    // Doctor ID
  email: 'sarah.silva@medicare.com',
  role: 'doctor',
  iat: 1737379200,         // Issued at
  exp: 1737984000          // Expires at (7 days)
}
```

---

## 📅 Google Calendar Integration

### OAuth 2.0 Flow
```
1. Doctor clicks "Connect with Google"
   ↓
2. Frontend calls GET /api/calendar/auth-url
   ↓
3. Backend generates Google OAuth URL with:
   - Client ID
   - Redirect URI
   - Scopes (calendar, calendar.events)
   - State (doctor ID)
   ↓
4. Frontend redirects to Google OAuth URL
   ↓
5. Google shows consent screen
   ↓
6. Doctor grants permission
   ↓
7. Google redirects to: /api/calendar/oauth2callback?code=XXX&state=2
   ↓
8. Backend:
   - Exchanges code for tokens (access + refresh)
   - Saves tokens to database
   - Sets googleCalendarConnected = true
   ↓
9. Backend redirects to: /doctor/profile?calendar=connected
   ↓
10. Frontend:
    - Shows success message
    - Fetches and displays upcoming events
```

### Token Refresh Flow
```
1. Doctor makes calendar request
   ↓
2. Backend checks token expiry
   ↓
3. If expired:
   - Uses refresh token to get new access token
   - Updates database with new token
   - Continues with request
   ↓
4. If refresh token invalid:
   - Returns error
   - Frontend prompts to reconnect
```

---

## 📝 Appointment Management (Future Enhancement)

### Creating Appointment + Calendar Event
```javascript
// When admin creates appointment:
async function createAppointment(appointmentData) {
  // 1. Save appointment to database
  const appointment = await Appointment.create({
    doctorId: appointmentData.doctorId,
    patientName: appointmentData.patientName,
    startTime: appointmentData.startTime,
    endTime: appointmentData.endTime,
    type: appointmentData.type
  });

  // 2. Check if doctor has calendar connected
  const doctor = await Doctor.findByPk(appointmentData.doctorId);
  
  if (doctor.googleCalendarConnected) {
    // 3. Create Google Calendar event
    const auth = await getAuthClient(doctor);
    const event = await createCalendarEvent(auth, {
      title: `Appointment: ${appointmentData.patientName}`,
      description: `Type: ${appointmentData.type}`,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      attendees: [{ email: appointmentData.patientEmail }]
    });

    // 4. Save Google event ID to appointment
    await appointment.update({
      googleEventId: event.id
    });
  }

  return appointment;
}
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### Profile Tab
- [ ] Profile data loads from localStorage
- [ ] Click "Edit Profile" enables editing
- [ ] Can update name, phone, specialization, etc.
- [ ] Click "Save Changes" updates database
- [ ] Success message appears
- [ ] Data persists on page reload

#### Password Tab
- [ ] All three password fields work
- [ ] Shows error if current password is wrong
- [ ] Shows error if passwords don't match
- [ ] Shows error if password < 8 characters
- [ ] Success message on password change
- [ ] Fields clear after success

#### Calendar Tab - Not Connected
- [ ] Shows "Connect with Google" button
- [ ] Click button redirects to Google OAuth
- [ ] After consent, redirects back to profile
- [ ] Shows "Connected" status

#### Calendar Tab - Connected
- [ ] Shows "Google Calendar Connected" banner
- [ ] Shows "Disconnect" button
- [ ] Loads upcoming events
- [ ] "Refresh" button fetches latest events
- [ ] Events display with correct dates/times
- [ ] Disconnect button works

### API Testing with Postman/Thunder Client

#### 1. Test Doctor Login
```http
POST http://localhost:5000/api/doctors/login
Content-Type: application/json

{
  "email": "sarah.silva@medicare.com",
  "password": "password123"
}
```

Expected Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "doctor": {
    "id": 2,
    "name": "Dr. Sarah Silva",
    "email": "sarah.silva@medicare.com",
    "specialization": "Cardiology",
    "googleCalendarConnected": false
  }
}
```

#### 2. Test Get Profile
```http
GET http://localhost:5000/api/doctors/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 3. Test Update Profile
```http
PUT http://localhost:5000/api/doctors/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "phone": "+1234567890",
  "designation": "Senior Cardiologist",
  "yearsOfExperience": 16
}
```

#### 4. Test Change Password
```http
PUT http://localhost:5000/api/doctors/change-password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

#### 5. Test Calendar Status
```http
GET http://localhost:5000/api/calendar/status
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 6. Test Get Auth URL
```http
GET http://localhost:5000/api/calendar/auth-url
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🚀 Deployment Checklist

### Before Production

#### Environment Variables
- [ ] Update `GOOGLE_CLIENT_ID` with production credentials
- [ ] Update `GOOGLE_CLIENT_SECRET`
- [ ] Update `GOOGLE_REDIRECT_URI` to production URL
- [ ] Update `JWT_SECRET` to strong random string
- [ ] Update database credentials

#### Google Cloud Console
- [ ] Add production redirect URI
- [ ] Verify OAuth app
- [ ] Enable production API quota

#### Security
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Encrypt tokens in database
- [ ] Add CSRF protection
- [ ] Implement secure session management
- [ ] Add API request logging

#### Database
- [ ] Run migrations
- [ ] Create indexes on frequently queried fields
- [ ] Set up database backups
- [ ] Configure connection pooling

---

## 📊 Data Flow Summary

### Profile Update
```
Frontend Form → handleSave() → PUT /api/doctors/profile
→ authMiddleware (verify JWT) → updateDoctorProfile()
→ Sequelize update → Database → Response
→ Update localStorage → Re-render UI
```

### Password Change
```
Frontend Form → handlePasswordChange() → PUT /api/doctors/change-password
→ authMiddleware → changePassword()
→ Verify current password (bcrypt.compare)
→ Hash new password (bcrypt.hash)
→ Update database → Response
```

### Google Calendar Connect
```
Click Connect → handleConnectGoogleCalendar()
→ GET /api/calendar/auth-url → Generate OAuth URL
→ Redirect to Google → User grants permission
→ Google callback → handleOAuthCallback()
→ Exchange code for tokens → Save to database
→ Redirect to /doctor/profile?calendar=connected
→ checkCalendarStatus() → fetchUpcomingEvents()
→ Display events in UI
```

---

## 🎓 Best Practices Implemented

1. **Security:**
   - JWT authentication with 7-day expiry
   - bcrypt password hashing (10 rounds)
   - OAuth 2.0 for calendar access
   - Authorization middleware on all protected routes

2. **Data Management:**
   - Sequelize ORM for database operations
   - JSON type for arrays (certifications)
   - Timestamps for all records
   - Soft deletes (can be implemented)

3. **Error Handling:**
   - Try-catch blocks in all async functions
   - Meaningful error messages
   - HTTP status codes (200, 400, 401, 500)
   - Console logging for debugging

4. **User Experience:**
   - Loading states for async operations
   - Success/error alerts
   - Responsive design with TailwindCSS
   - Tab-based organization
   - Auto-refresh calendar on connect

5. **Code Organization:**
   - MVC architecture
   - Separate routes, controllers, models
   - Service layer for external APIs
   - Environment variable configuration

---

## 📚 Additional Documentation

- See [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md) for Google Calendar setup
- Backend API runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000
- Database: PostgreSQL on localhost:5432

---

**Questions or Issues?** Check the troubleshooting section in GOOGLE_CALENDAR_SETUP.md or review error logs in the browser console and backend terminal.
