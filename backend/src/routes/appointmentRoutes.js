import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
// All routes require authentication
router.use(authenticateToken);

// Get all appointments for the logged-in doctor
router.get('/', appointmentController.getDoctorAppointments);

// Get today's appointments
router.get('/today', appointmentController.getTodaysAppointments);

// Get appointment statistics
router.get('/stats', appointmentController.getAppointmentStats);

// Create new appointment
router.post('/', appointmentController.createAppointment);

// Update appointment
router.put('/:id', appointmentController.updateAppointment);

// Delete appointment
router.delete('/:id', appointmentController.deleteAppointment);

export default router;
