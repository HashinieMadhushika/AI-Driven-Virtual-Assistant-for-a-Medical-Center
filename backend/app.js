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
import contactRoutes from './src/routes/contactRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import sequelize from './src/config/db.js';
// Import models to ensure they're registered
import User from './src/models/User.js';
import Doctor from './src/models/Doctor.js';
import Patient from './src/models/Patient.js';
import Appointment from './src/models/Appointment.js';
import ChatSession from './src/models/ChatSession.js';
import ChatMessage from './src/models/ChatMessage.js';
import ChatAccessCode from './src/models/ChatAccessCode.js';

// Define model relationships
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });
ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId', as: 'messages' });
ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId', as: 'session' });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS (Next.js on localhost:3000)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ msg: "Backend is running!" });
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
// Admin dashboard routes
app.use('/api/dashboard', dashboardRoutes);
// Chat conversation routes (n8n chat agent data)
app.use('/api/chat', chatRoutes);

// Sync DB and start server
(async () => {
  try {
    console.log('🔧 Starting database sync...');
    // Create missing tables without attempting unsafe automatic column casts.
    // Schema changes are handled through migrations.
    await sequelize.sync();
    
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
