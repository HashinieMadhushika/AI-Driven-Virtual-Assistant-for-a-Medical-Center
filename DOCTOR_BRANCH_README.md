# Doctor Portal Branch - Setup Instructions

## ⚠️ Important: Environment Variables

The `.env` file contains sensitive credentials and is **NOT** included in this repository for security reasons.

### Setup Steps:

1. **Copy the example environment file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `backend/.env` with your actual credentials:**
   - Set your PostgreSQL database password
   - Generate a secure JWT secret (use a random string generator)
   - Add your Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)

3. **Never commit the .env file!**
   - The `.gitignore` file is configured to exclude `.env` files
   - Always use `.env.example` as a template for others

## What's in this branch:

### Doctor Portal Features
- ✅ Doctor login and authentication
- ✅ Dashboard with appointments and statistics  
- ✅ Appointment management
- ✅ Profile management
- ✅ Google Calendar integration
- ✅ PostgreSQL database with Sequelize ORM

### Database Structure
- Doctors table
- Patients table
- Appointments table (with relationships)
- Users table (for admin)

### Sample Data Setup
Run this command to populate the database with sample data:
```bash
cd backend
node setupDoctorData.js
```

This creates:
- 3 sample doctors
- 3 sample patients
- 3 sample appointments

### Test Database Connection
```bash
cd backend
node testDoctorPortal.js
```

## Running the Application

### Backend
```bash
cd backend
npm install
npm run dev
```
Server runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

## Login Credentials
After running `setupDoctorData.js`:
```
Email: sarah.silva@medicare.com
Password: password123
```

## Documentation
See `DOCTOR_PORTAL_SETUP.md` for complete documentation.
