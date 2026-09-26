import express from 'express';
import { getDashboardStats, getRecentChats, getTodaysAppointments } from '../controllers/dashboardController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin dashboard routes require an admin login
router.use(authenticateToken, authorizeRole('admin'));

// Stat cards
router.get('/stats', getDashboardStats);

// "Recent Chats" list
router.get('/recent-chats', getRecentChats);

// "Today's Appointments" list
router.get('/todays-appointments', getTodaysAppointments);

export default router;
