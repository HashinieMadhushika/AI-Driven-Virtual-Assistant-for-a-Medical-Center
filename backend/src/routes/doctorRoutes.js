import express from 'express';
import multer from 'multer';
import {
  addDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  doctorLogin,
  getDoctorProfile,
  updateDoctorProfile,
  changePassword,
  uploadDoctorImage,
  deleteDoctorImage
} from '../controllers/doctorcontroller.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';
import { acceptDoctorInvite } from '../controllers/doctorcontroller.js';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

const router = express.Router();

// Public routes
router.post('/login', doctorLogin);
router.post('/accept-invite', acceptDoctorInvite);

// Protected doctor routes
router.get('/profile', authenticateToken, authorizeRole('doctor'), getDoctorProfile);
router.put('/profile', authenticateToken, authorizeRole('doctor'), updateDoctorProfile);
router.put('/change-password', authenticateToken, authorizeRole('doctor'), changePassword);

// Admin routes (for managing doctors)
router.post('/', addDoctor); // Admin adds doctor
router.get('/', getDoctors); // Admin gets all doctors
router.put('/:id', updateDoctor); // Admin updates doctor
router.delete('/:id', deleteDoctor); // Admin deletes doctor

// Image upload/delete routes
router.post('/:id/image', upload.single('image'), uploadDoctorImage); // Admin uploads doctor image
router.delete('/:id/image', deleteDoctorImage); // Admin deletes doctor image

export default router;
