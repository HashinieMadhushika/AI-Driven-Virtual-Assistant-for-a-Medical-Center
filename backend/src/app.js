// src/app.js
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import sequelize from './config/db.js';
// Import models to ensure they're registered
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';
import cors from 'cors';

// Define model relationships
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

dotenv.config();
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
// Contact routes
app.use('/api/contact', contactRoutes);

// Sync DB and start server
(async () => {
  try {
    console.log('🔧 Starting database sync...');
    // Sync database - alter mode preserves existing data
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database synced successfully');
    console.log('✅ All models ready');
    console.log('🚀 Starting Express server...');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log('📍 Press Ctrl+C to stop the server');
    });

    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    });

    // Add process-level error handlers
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err);
      process.exit(1);
    });

  } catch (err) {
    console.error('❌ Sync error:', err);
    process.exit(1);
  }
})();
