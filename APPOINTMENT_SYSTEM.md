# Appointment Management System

This system allows patients to book appointments with doctors, and doctors can manage their appointments through the dashboard.

## Features

### For Doctors:
- **Dashboard**: View today's appointment statistics and schedule
- **Appointments Page**: 
  - View all appointments with patient details
  - Filter by status (Pending, Confirmed, Cancelled, Completed)
  - Search patients by name
  - Confirm/Cancel pending appointments
  - Mark confirmed appointments as completed
  - Delete appointments

### Backend API Endpoints

All endpoints require Bearer token authentication.

#### Appointment Endpoints (`/api/appointments`)

1. **GET /** - Get all appointments for logged-in doctor
   - Query params: `?status=Pending&date=2026-01-21`
   - Returns: List of appointments with patient details

2. **GET /today** - Get today's appointments
   - Returns: List of today's appointments

3. **GET /stats** - Get appointment statistics
   - Returns: `{ todaysAppointments, totalPatients, pendingReviews }`

4. **POST /** - Create new appointment
   - Body: `{ patientId, appointmentDate, appointmentTime, type, mode, notes }`
   - Returns: Created appointment with patient details

5. **PUT /:id** - Update appointment
   - Body: `{ appointmentDate?, appointmentTime?, type?, mode?, status?, notes?, cancellationReason? }`
   - Returns: Updated appointment

6. **DELETE /:id** - Delete appointment
   - Returns: Success message

## Database Models

### Patient Model
```javascript
{
  id: Integer (Primary Key),
  firstName: String (Required),
  lastName: String (Required),
  email: String (Required, Unique),
  phone: String (Required),
  dateOfBirth: Date,
  gender: Enum ('Male', 'Female', 'Other'),
  address: Text,
  medicalHistory: Text,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Appointment Model
```javascript
{
  id: Integer (Primary Key),
  doctorId: Integer (Foreign Key -> doctors.id),
  patientId: Integer (Foreign Key -> patients.id),
  appointmentDate: Date (Required),
  appointmentTime: Time (Required),
  type: String (Default: 'General Consultation'),
  mode: Enum ('In-Person', 'Video Call', 'Phone Call'),
  status: Enum ('Pending', 'Confirmed', 'Cancelled', 'Completed'),
  notes: Text,
  cancellationReason: Text,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Setup Instructions

### 1. Backend Setup
The backend models and routes are already configured. The server will automatically create the necessary database tables when started.

### 2. Add Sample Data
Run the sample data script to populate the database with test patients and appointments:

```bash
cd backend
node addSampleData.js
```

This will create:
- 5 sample patients
- 5 sample appointments for Dr. Sarah Silva

### 3. Frontend Usage
The dashboard and appointments pages are already updated to fetch real data from the API.

## Data Flow

1. **Patient books appointment** (Future feature):
   - Patient selects doctor, date, time, and type
   - Creates appointment with status 'Pending'

2. **Doctor views appointments**:
   - Dashboard shows today's schedule
   - Appointments page shows all appointments with filters

3. **Doctor manages appointments**:
   - Confirm pending appointments
   - Cancel appointments with reason
   - Mark confirmed appointments as completed
   - Delete appointments if needed

## Status Workflow

```
Pending → Confirmed → Completed
   ↓
Cancelled
```

- **Pending**: New appointment waiting for doctor confirmation
- **Confirmed**: Doctor has confirmed the appointment
- **Cancelled**: Appointment cancelled by doctor or patient
- **Completed**: Appointment has been completed

## Next Steps

### Future Enhancements:
1. **Patient Portal**: Allow patients to book appointments online
2. **Email Notifications**: Send confirmation/reminder emails
3. **SMS Reminders**: Send SMS reminders before appointments
4. **Video Call Integration**: Integrate video calling for virtual appointments
5. **Prescription Management**: Link prescriptions to appointments
6. **Medical Records**: Attach medical records and test results
7. **Calendar Sync**: Sync appointments with Google Calendar
8. **Recurring Appointments**: Support for recurring appointment schedules
9. **Waiting List**: Manage waiting list for fully booked slots
10. **Analytics**: Dashboard analytics for appointment trends

## API Testing

You can test the API endpoints using curl or Postman:

```bash
# Get all appointments
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/appointments

# Get today's appointments
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/appointments/today

# Get statistics
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/appointments/stats

# Create appointment
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
-d '{"patientId":1,"appointmentDate":"2026-01-22","appointmentTime":"10:00:00","type":"Checkup","mode":"In-Person"}' \
http://localhost:5000/api/appointments

# Update appointment status
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
-d '{"status":"Confirmed"}' \
http://localhost:5000/api/appointments/1

# Delete appointment
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/appointments/1
```

## Troubleshooting

### Appointments not showing:
1. Make sure backend server is running
2. Check if you're logged in (token exists in localStorage)
3. Verify database has appointments for the logged-in doctor
4. Check browser console for API errors

### Sample data script fails:
1. Ensure database is running
2. Verify doctor account exists (sarah.silva@medicare.com)
3. Check database connection settings in `.env`

### Status update not working:
1. Verify you're the owner of the appointment (doctorId matches)
2. Check valid status transitions
3. Ensure token is valid
