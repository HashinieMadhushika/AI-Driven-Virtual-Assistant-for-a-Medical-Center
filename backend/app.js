import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables FIRST
dotenv.config();
console.log('✅ Environment loaded');

// Routes
import authRoutes from './src/routes/authRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';
import calendarRoutes from './src/routes/calendarRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import assistantRoutes from './src/routes/assistantRoutes.js';
import medicalDocumentRoutes from './src/routes/medicalDocumentRoutes.js';

// Database
import sequelize from './src/config/db.js';

// Models
import User from './src/models/User.js';
import Doctor from './src/models/Doctor.js';
import Patient from './src/models/Patient.js';
import Appointment from './src/models/Appointment.js';
import ChatSession from './src/models/ChatSession.js';
import ChatMessage from './src/models/ChatMessage.js';
import ChatAccessCode from './src/models/ChatAccessCode.js';
import HandoverRequest from './src/models/HandoverRequest.js';
import MedicalDocument from './src/models/MedicalDocument.js';


// ======================================================
// MODEL RELATIONSHIPS
// ======================================================

Doctor.hasMany(Appointment, {
  foreignKey: 'doctorId',
});

Appointment.belongsTo(Doctor, {
  foreignKey: 'doctorId',
});

Patient.hasMany(Appointment, {
  foreignKey: 'patientId',
});

Appointment.belongsTo(Patient, {
  foreignKey: 'patientId',
});

ChatSession.hasMany(ChatMessage, {
  foreignKey: 'sessionId',
  as: 'messages',
});

ChatMessage.belongsTo(ChatSession, {
  foreignKey: 'sessionId',
  as: 'session',
});

ChatSession.hasMany(HandoverRequest, {
  foreignKey: 'sessionId',
  as: 'handoverRequests',
});

HandoverRequest.belongsTo(ChatSession, {
  foreignKey: 'sessionId',
  as: 'session',
});

ChatSession.hasMany(MedicalDocument, {
  foreignKey: 'sessionId',
  as: 'medicalDocuments',
});

MedicalDocument.belongsTo(ChatSession, {
  foreignKey: 'sessionId',
  as: 'session',
});

Patient.hasMany(MedicalDocument, {
  foreignKey: 'patientId',
  as: 'medicalDocuments',
});

MedicalDocument.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient',
});


// ======================================================
// EXPRESS APP
// ======================================================

const app = express();

const PORT = process.env.PORT || 5000;


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  })
);

app.use(
  express.json({
    limit: '20mb',
  })
);


// ======================================================
// TEST ROUTE
// ======================================================

app.get('/api/test', (req, res) => {
  res.json({
    msg: 'Backend is running!',
  });
});


// ======================================================
// API ROUTES
// ======================================================

app.use('/api/auth', authRoutes);

app.use('/api/doctors', doctorRoutes);

app.use('/api/calendar', calendarRoutes);

app.use('/api/appointments', appointmentRoutes);

app.use('/api/contact', contactRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/chat', chatRoutes);

app.use(
  '/api/medical-documents',
  medicalDocumentRoutes
);

app.use(
  '/api/assistant',
  assistantRoutes
);


// ======================================================
// LOCAL DEVELOPMENT SERVER
// ======================================================

// Vercel manages the HTTP server itself.
//
// Therefore:
// Local machine -> sequelize.sync() + app.listen()
// Vercel        -> export Express app only

if (!process.env.VERCEL) {
  (async () => {
    try {
      console.log('🔧 Starting database sync...');

      await sequelize.sync();

      console.log(
        '✅ Database synced successfully'
      );

      console.log(
        '✅ All models ready'
      );

      console.log(
        '🚀 Starting Express server...'
      );

      const server = app.listen(
        PORT,
        () => {
          console.log(
            `✅ Server running on http://localhost:${PORT}`
          );

          console.log(
            '📍 Press Ctrl+C to stop the server'
          );

          console.log(
            '🤖 n8n assistant configured:',
            Boolean(
              process.env.N8N_ASSISTANT_WEBHOOK
            )
          );
        }
      );

      server.on('error', (err) => {
        console.error(
          '❌ Server error:',
          err
        );

        process.exit(1);
      });

      process.on(
        'unhandledRejection',
        (reason) => {
          console.error(
            '❌ Unhandled Rejection:',
            reason
          );
        }
      );

      process.on(
        'uncaughtException',
        (err) => {
          console.error(
            '❌ Uncaught Exception:',
            err
          );

          process.exit(1);
        }
      );

    } catch (err) {
      console.error(
        '❌ Sync error:',
        err
      );

      process.exit(1);
    }
  })();
}


// ======================================================
// VERCEL EXPORT
// ======================================================

// Vercel imports this Express application.
// Do not call app.listen() on Vercel.

export default app;