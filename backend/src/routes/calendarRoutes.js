// import express from 'express';
// import {
//   getGoogleAuthUrl,
//   handleOAuthCallback,
//   disconnectGoogleCalendar,
//   createEvent,
//   getUpcomingEvents,
//   updateEvent,
//   deleteEvent,
//   getConnectionStatus
// } from '../controllers/calendarController.js';
// import { authenticateToken } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // OAuth callback route (no auth required)
// router.get('/oauth2callback', handleOAuthCallback);

// // Protected routes (require authentication)
// router.get('/auth-url', authenticateToken, getGoogleAuthUrl);
// router.get('/status', authenticateToken, getConnectionStatus);
// router.post('/disconnect', authenticateToken, disconnectGoogleCalendar);

// // Event management routes
// router.post('/events', authenticateToken, createEvent);
// router.get('/events', authenticateToken, getUpcomingEvents);
// router.put('/events/:eventId', authenticateToken, updateEvent);
// router.delete('/events/:eventId', authenticateToken, deleteEvent);

// export default router;

import express from 'express';
import {
  getGoogleAuthUrl,
  handleOAuthCallback,
  disconnectGoogleCalendar,
  createEvent,
  getUpcomingEvents,
  updateEvent,
  deleteEvent,
  getConnectionStatus
} from '../controllers/calendarController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// OAuth callback route (no auth required)
router.get('/oauth2callback', handleOAuthCallback);

// Protected routes (require authentication)
router.get('/auth-url', authenticateToken, authorizeRole('doctor'), getGoogleAuthUrl);
router.get('/status', authenticateToken, authorizeRole('doctor'), getConnectionStatus);
router.post('/disconnect', authenticateToken, authorizeRole('doctor'), disconnectGoogleCalendar);

// Event management routes
router.post('/events', authenticateToken, authorizeRole('doctor'), createEvent);
router.get('/events', authenticateToken, authorizeRole('doctor'), getUpcomingEvents);
router.put('/events/:eventId', authenticateToken, authorizeRole('doctor'), updateEvent);
router.delete('/events/:eventId', authenticateToken, authorizeRole('doctor'), deleteEvent);

export default router;
