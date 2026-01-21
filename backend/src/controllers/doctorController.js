import Doctor from '../models/Doctor.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Admin adds a new doctor
export const addDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, designation, yearsOfExperience, education, certifications } = req.body;
    
    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ where: { email } });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      phone,
      specialization,
      designation,
      yearsOfExperience,
      education,
      certifications
    });
    
    // Don't send password in response
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...doctorData } = doctor.toJSON();
    res.status(201).json({ message: 'Doctor added successfully', doctor: doctorData });
  } catch (error) {
    console.error('Add doctor error:', error);
    res.status(500).json({ message: 'Error adding doctor', error: error.message });
  }
};

// Doctor login
export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find doctor by email
    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, role: 'doctor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Don't send password in response
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...doctorData } = doctor.toJSON();
    
    res.json({
      message: 'Login successful',
      token,
      doctor: doctorData
    });
  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get doctor profile (authenticated)
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const { name, phone, specialization, designation, yearsOfExperience, education, certifications } = req.body;
    
    await Doctor.update(
      { name, phone, specialization, designation, yearsOfExperience, education, certifications },
      { where: { id: req.user.id } }
    );
    
    const updatedDoctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({ message: 'Profile updated successfully', doctor: updatedDoctor });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find doctor with password
    const doctor = await Doctor.findByPk(req.user.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await Doctor.update(
      { password: hashedPassword },
      { where: { id: req.user.id } }
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

// Get all doctors (for admin)
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

// Update doctor (admin)
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await Doctor.update(req.body, { where: { id } });
    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ message: 'Error updating doctor', error: error.message });
  }
};

// Delete doctor (admin)
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await Doctor.destroy({ where: { id } });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: 'Error deleting doctor', error: error.message });
  }
};
