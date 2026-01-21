// src/app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables FIRST
dotenv.config();
console.log('✅ Environment loaded');

import authRoutes from './src/routes/authRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';
import calendarRoutes from './src/routes/calendarRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';
import sequelize from './src/config/db.js';
// Import models to ensure they're registered
import User from './src/models/User.js';
import Doctor from './src/models/Doctor.js';
import Patient from './src/models/Patient.js';
import Appointment from './src/models/Appointment.js';
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ msg: 'Backend is running!' });
});

// Auth routes
app.use('/api/auth', authRoutes);
// Doctor routes
app.use('/api/doctors', doctorRoutes);
// Calendar routes
app.use('/api/calendar', calendarRoutes);
// Appointment routes
app.use('/api/appointments', appointmentRoutes);

// Sync DB and start server
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ PostgreSQL connected via Sequelize');
    console.log('✅ Database synced successfully');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
    
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });
    
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

 
