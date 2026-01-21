import express from 'express';
import {
  addDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  doctorLogin,
  getDoctorProfile,
  updateDoctorProfile,
  changePassword
} from '../controllers/doctorController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', doctorLogin);

// Protected doctor routes
router.get('/profile', authenticateToken, authorizeRole('doctor'), getDoctorProfile);
router.put('/profile', authenticateToken, authorizeRole('doctor'), updateDoctorProfile);
router.put('/change-password', authenticateToken, authorizeRole('doctor'), changePassword);

// Admin routes (for managing doctors)
router.post('/', addDoctor); // Admin adds doctor
router.get('/', getDoctors); // Admin gets all doctors
router.put('/:id', updateDoctor); // Admin updates doctor
router.delete('/:id', deleteDoctor); // Admin deletes doctor

export default router;
