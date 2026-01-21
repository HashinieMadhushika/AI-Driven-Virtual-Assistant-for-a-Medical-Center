# Doctor Portal - Setup Complete ✅

## Database Connectivity
- **Database**: PostgreSQL via pgAdmin
- **Connection**: Successfully established
- **ORM**: Sequelize
- **Sync Mode**: `{ alter: true }` - Preserves data while updating schema

## Database Tables

### 1. Doctors Table
- **Model**: `backend/src/models/Doctor.js`
- **Fields**: 
  - id, name, email, password (hashed)
  - phone, specialization, designation
  - yearsOfExperience, education, certifications
  - googleCalendarAccessToken, googleCalendarRefreshToken, googleCalendarTokenExpiry
  - role (default: 'doctor')
- **Sample Data**: 3 doctors created

### 2. Patients Table  
- **Model**: `backend/src/models/Patient.js`
- **Fields**:
  - id, firstName, lastName, email, phone
  - dateOfBirth, gender, address, medicalHistory
- **Sample Data**: 3 patients created

### 3. Appointments Table
- **Model**: `backend/src/models/Appointment.js`
- **Fields**:
  - id, doctorId, patientId
  - appointmentDate, appointmentTime
  - type, mode, status, notes
- **Relationships**:
  - Belongs to Doctor (via doctorId)
  - Belongs to Patient (via patientId)
- **Sample Data**: 3 appointments created

## Backend Routes

### Doctor Routes (`/api/doctors`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/login` | No | Doctor login |
| GET | `/profile` | Yes (Doctor) | Get doctor profile |
| PUT | `/profile` | Yes (Doctor) | Update doctor profile |
| PUT | `/change-password` | Yes (Doctor) | Change password |
| POST | `/` | No | Add new doctor (Admin) |
| GET | `/` | No | Get all doctors |
| PUT | `/:id` | No | Update doctor (Admin) |
| DELETE | `/:id` | No | Delete doctor (Admin) |

### Appointment Routes (`/api/appointments`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | Yes (Doctor) | Get all doctor's appointments |
| GET | `/today` | Yes (Doctor) | Get today's appointments |
| GET | `/stats` | Yes (Doctor) | Get appointment statistics |
| POST | `/` | Yes (Doctor) | Create new appointment |
| PUT | `/:id` | Yes (Doctor) | Update appointment |
| DELETE | `/:id` | Yes (Doctor) | Delete appointment |

### Calendar Routes (`/api/calendar`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/auth` | Yes (Doctor) | Get Google Calendar auth URL |
| GET | `/oauth2callback` | No | OAuth callback |
| GET | `/events` | Yes (Doctor) | Get calendar events |
| POST | `/disconnect` | Yes (Doctor) | Disconnect calendar |

## Frontend Pages

### Doctor Portal Pages (in `frontend/app/doctor/`)
1. **Login** - `/doctor/login`
   - File: `login/page.tsx`
   - Calls: `POST /api/doctors/login`

2. **Dashboard** - `/doctor/dashboard`
   - File: `dashboard/page.tsx`
   - Features:
     - Today's schedule
     - Appointment statistics
     - Google Calendar integration
     - Recent activity
   - Calls:
     - `GET /api/appointments/today`
     - `GET /api/appointments/stats`
     - `GET /api/calendar/events`

3. **Appointments** - `/doctor/appointments`
   - File: `appointments/page.tsx`
   - Features:
     - View all appointments
     - Filter by status
     - Update appointment status
     - Delete appointments
   - Calls:
     - `GET /api/appointments`
     - `PUT /api/appointments/:id`
     - `DELETE /api/appointments/:id`

4. **Profile** - `/doctor/profile`
   - File: `profile/page.tsx`
   - Features:
     - View/edit profile
     - Change password
     - Connect Google Calendar
   - Calls:
     - `GET /api/doctors/profile`
     - `PUT /api/doctors/profile`
     - `GET /api/calendar/auth`

## Authentication

### JWT Token System
- **Secret**: Stored in `.env` as `JWT_SECRET`
- **Expiration**: 7 days
- **Storage**: localStorage in frontend
- **Middleware**: `backend/src/middleware/authMiddleware.js`
  - `authenticateToken`: Verifies JWT token
  - `authorizeRole`: Checks user role (doctor/admin)

### Login Flow
1. User submits email/password
2. Backend validates credentials
3. Password verified using bcrypt
4. JWT token generated with doctor ID and role
5. Token and doctor data sent to frontend
6. Frontend stores token in localStorage
7. Token included in Authorization header for protected routes

## Sample Data

### Doctor Credentials
```
Email: sarah.silva@medicare.com
Password: password123

Email: john.davis@medicare.com
Password: password123

Email: emily.chen@medicare.com
Password: password123
```

### Current Data in Database
- **Doctors**: 3 total
- **Patients**: 3 total
- **Appointments**: 3 total (including today's appointments)

## Utility Scripts

### setupDoctorData.js
**Purpose**: Initialize database with sample doctors, patients, and appointments
**Usage**: `node setupDoctorData.js`
**Features**:
- Creates 3 doctors
- Creates 3 patients
- Creates sample appointments
- Checks for existing data (won't duplicate)
- Shows database summary

### testDoctorPortal.js
**Purpose**: Test all doctor portal database functionality
**Usage**: `node testDoctorPortal.js`
**Tests**:
1. Database connection
2. Doctors table
3. Patients table
4. Appointments with relationships
5. Today's appointments query
6. Appointment statistics

## Files Structure

### Backend
```
backend/
├── src/
│   ├── app.js                     # Main application file
│   ├── config/
│   │   └── db.js                  # Database configuration
│   ├── models/
│   │   ├── Doctor.js              # Doctor model
│   │   ├── Patient.js             # Patient model
│   │   ├── Appointment.js         # Appointment model
│   │   └── User.js                # Admin user model
│   ├── controllers/
│   │   ├── doctorController.js    # Doctor CRUD operations
│   │   ├── appointmentController.js # Appointment operations
│   │   └── calendarController.js  # Google Calendar integration
│   ├── routes/
│   │   ├── doctorRoutes.js        # Doctor endpoints
│   │   ├── appointmentRoutes.js   # Appointment endpoints
│   │   └── calendarRoutes.js      # Calendar endpoints
│   └── middleware/
│       └── authMiddleware.js      # JWT authentication
├── setupDoctorData.js             # Data initialization script
├── testDoctorPortal.js            # Testing script
├── package.json                   # Dependencies
└── .env                           # Environment variables
```

### Frontend
```
frontend/app/doctor/
├── layout.tsx                     # Doctor portal layout
├── login/
│   └── page.tsx                   # Login page
├── dashboard/
│   └── page.tsx                   # Dashboard
├── appointments/
│   └── page.tsx                   # Appointments management
└── profile/
    └── page.tsx                   # Doctor profile
```

## Environment Variables (.env)
```
PORT=5000
PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=1234
PG_DATABASE=medical_center
PG_PORT=5432
JWT_SECRET=supersecretkey
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth2callback
```

## Running the Application

### Backend
```bash
cd backend
npm run dev
```
Server will start on http://localhost:5000

### Frontend
```bash
cd frontend
npm run dev
```
Frontend will start on http://localhost:3000

## Removed Files (Cleaned Up)
The following unnecessary/duplicate files were removed:
- `addDoctor.js` - Replaced by setupDoctorData.js
- `addSampleData.js` - Replaced by setupDoctorData.js
- `checkDoctor.js` - Functionality in testDoctorPortal.js
- `checkUsers.js` - Functionality in setupDoctorData.js
- `create-tables.js` - Handled by Sequelize sync
- `error.log` - Not needed

## Next Steps

1. **Login**: Use credentials above to log into doctor portal
2. **Test Features**:
   - View dashboard with today's appointments
   - Check appointments page
   - Update profile
   - Connect Google Calendar
3. **Add More Data**: Run `setupDoctorData.js` again to add more test data
4. **Monitor Database**: Use pgAdmin to view/manage data directly

## Troubleshooting

### Server won't start
- Check if port 5000 is available
- Verify PostgreSQL is running
- Check .env file has correct database credentials

### Authentication errors
- Clear localStorage in browser
- Verify JWT_SECRET is set in .env
- Check token in Authorization header

### Database errors
- Ensure PostgreSQL service is running
- Verify database "medical_center" exists
- Run `node testDoctorPortal.js` to check connectivity

---

**Status**: ✅ All systems operational
**Last Updated**: January 21, 2026
