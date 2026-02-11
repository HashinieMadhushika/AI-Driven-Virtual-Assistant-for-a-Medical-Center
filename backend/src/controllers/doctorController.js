// import Doctor from '../models/Doctor.js';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

// // Admin adds a new doctor
// export const addDoctor = async (req, res) => {
//   try {
//     const { name, email, password, phone, specialization, designation, yearsOfExperience, education, certifications } = req.body;
    
//     // Check if doctor already exists
//     const existingDoctor = await Doctor.findOne({ where: { email } });
//     if (existingDoctor) {
//       return res.status(400).json({ message: 'Doctor with this email already exists' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);
    
//     const doctor = await Doctor.create({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       specialization,
//       designation,
//       yearsOfExperience,
//       education,
//       certifications
//     });
    
//     // Don't send password in response
//     // eslint-disable-next-line no-unused-vars
//     const { password: _, ...doctorData } = doctor.toJSON();
//     res.status(201).json({ message: 'Doctor added successfully', doctor: doctorData });
//   } catch (error) {
//     console.error('Add doctor error:', error);
//     res.status(500).json({ message: 'Error adding doctor', error: error.message });
//   }
// };

// // Doctor login
// export const doctorLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Find doctor by email
//     const doctor = await Doctor.findOne({ where: { email } });
//     if (!doctor) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
    
//     // Check password
//     const isPasswordValid = await bcrypt.compare(password, doctor.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
    
//     // Generate JWT token
//     const token = jwt.sign(
//       { id: doctor.id, email: doctor.email, role: 'doctor' },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );
    
//     // Don't send password in response
//     // eslint-disable-next-line no-unused-vars
//     const { password: _, ...doctorData } = doctor.toJSON();
    
//     res.json({
//       message: 'Login successful',
//       token,
//       doctor: doctorData
//     });
//   } catch (error) {
//     console.error('Doctor login error:', error);
//     res.status(500).json({ message: 'Error logging in', error: error.message });
//   }
// };// Get doctor profile (authenticated)
// export const getDoctorProfile = async (req, res) => {
//   try {
//     const doctor = await Doctor.findByPk(req.user.id, {
//       attributes: { exclude: ['password'] }
//     });
    
//     if (!doctor) {
//       return res.status(404).json({ message: 'Doctor not found' });
//     }
    
//     res.json(doctor);
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({ message: 'Error fetching profile', error: error.message });
//   }
// };

// // Update doctor profile
// export const updateDoctorProfile = async (req, res) => {
//   try {
//     const { name, phone, specialization, designation, yearsOfExperience, education, certifications } = req.body;
    
//     await Doctor.update(
//       { name, phone, specialization, designation, yearsOfExperience, education, certifications },
//       { where: { id: req.user.id } }
//     );
    
//     const updatedDoctor = await Doctor.findByPk(req.user.id, {
//       attributes: { exclude: ['password'] }
//     });
    
//     res.json({ message: 'Profile updated successfully', doctor: updatedDoctor });
//   } catch (error) {
//     console.error('Update profile error:', error);
//     res.status(500).json({ message: 'Error updating profile', error: error.message });
//   }
// };

// // Change password
// export const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
    
//     // Find doctor with password
//     const doctor = await Doctor.findByPk(req.user.id);
    
//     if (!doctor) {
//       return res.status(404).json({ message: 'Doctor not found' });
//     }
    
//     // Verify current password
//     const isPasswordValid = await bcrypt.compare(currentPassword, doctor.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Current password is incorrect' });
//     }
    
//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
    
//     // Update password
//     await Doctor.update(
//       { password: hashedPassword },
//       { where: { id: req.user.id } }
//     );
    
//     res.json({ message: 'Password updated successfully' });
//   } catch (error) {
//     console.error('Change password error:', error);
//     res.status(500).json({ message: 'Error changing password', error: error.message });
//   }
// };

// // Get all doctors (for admin)
// export const getDoctors = async (req, res) => {
//   try {
//     const doctors = await Doctor.findAll({
//       attributes: { exclude: ['password'] }
//     });
//     res.json(doctors);
//   } catch (error) {
//     console.error('Get doctors error:', error);
//     res.status(500).json({ message: 'Error fetching doctors', error: error.message });
//   }
// };

// // Update doctor (admin)
// export const updateDoctor = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Doctor.update(req.body, { where: { id } });
//     res.json({ message: 'Doctor updated successfully' });
//   } catch (error) {
//     console.error('Update doctor error:', error);
//     res.status(500).json({ message: 'Error updating doctor', error: error.message });
//   }
// };

// // Delete doctor (admin)
// export const deleteDoctor = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Doctor.destroy({ where: { id } });
//     res.json({ message: 'Doctor deleted successfully' });
//   } catch (error) {
//     console.error('Delete doctor error:', error);
//     res.status(500).json({ message: 'Error deleting doctor', error: error.message });
//   }
// };
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";
import crypto from "crypto";
import DoctorInvite from "../models/DoctorInvite.js";
import sendEmail from "../utils/sendEmail.js";

// Admin adds a new doctor
export const addDoctor = async (req, res) => {
  try {
    const { name, email, phone, specialization, designation, yearsOfExperience, education, certifications } = req.body;

    if (!name || !email || !specialization) {
      return res.status(400).json({ message: "name, email, specialization are required" });
    }

    const existingDoctor = await Doctor.findOne({ where: { email } });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor with this email already exists" });
    }

    // ✅ create doctor without password (invite flow)
    const doctor = await Doctor.create({
      name,
      email,
      phone,
      specialization,
      designation,
      yearsOfExperience,
      education,
      certifications,
      password: null,
    });

    // ✅ create invite token (store hash in DB, send raw token via email)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await DoctorInvite.create({
      doctorId: doctor.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      usedAt: null,
    });

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const inviteLink = `${baseUrl}/doctor/accept-invite?token=${rawToken}`;


    await sendEmail(
      email,
      "Doctor Account Invitation",
      `Hello Dr. ${name},

You have been added to the Medical Center system.

Please click the link below to set your password (valid for 24 hours):
${inviteLink}

After setting your password, you can login as Doctor.

Thank you.`
    );

    const { password: _pw, ...doctorData } = doctor.toJSON();
    return res.status(201).json({ message: "Doctor invited successfully", doctor: doctorData });
  } catch (error) {
    console.error("Add doctor error:", error);
    return res.status(500).json({ message: "Error inviting doctor", error: error.message });
  }
};


// Doctor profile (authenticated doctor)
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json(doctor);
  } catch (error) {
    console.error("Get profile error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

// Update doctor profile (authenticated doctor)
export const updateDoctorProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      specialization,
      designation,
      yearsOfExperience,
      education,
      certifications,
    } = req.body;

    await Doctor.update(
      { name, phone, specialization, designation, yearsOfExperience, education, certifications },
      { where: { id: req.user.id } }
    );

    const updatedDoctor = await Doctor.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    return res.json({ message: "Profile updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Update profile error:", error);
    return res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

// Change doctor password (authenticated doctor)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword are required" });
    }

    const doctor = await Doctor.findByPk(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const ok = await bcrypt.compare(currentPassword, doctor.password);
    if (!ok) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await Doctor.update({ password: hashed }, { where: { id: req.user.id } });

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res
      .status(500)
      .json({ message: "Error changing password", error: error.message });
  }
};

// Get all doctors (admin)
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: { exclude: ["password"] },
    });
    return res.json(doctors);
  } catch (error) {
    console.error("Get doctors error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching doctors", error: error.message });
  }
};

// Update doctor by id (admin)
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    await Doctor.update(req.body, { where: { id } });

    const updatedDoctor = await Doctor.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    return res.json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Update doctor error:", error);
    return res
      .status(500)
      .json({ message: "Error updating doctor", error: error.message });
  }
};

// Delete doctor (admin)
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await Doctor.destroy({ where: { id } });
    return res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    return res
      .status(500)
      .json({ message: "Error deleting doctor", error: error.message });
  }
};
export const acceptDoctorInvite = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "token and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const invite = await DoctorInvite.findOne({ where: { tokenHash } });
    if (!invite) return res.status(400).json({ message: "Invalid invite token" });
    if (invite.usedAt) return res.status(400).json({ message: "Invite already used" });
    if (new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Invite expired" });
    }

    const doctor = await Doctor.findByPk(invite.doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const hashed = await bcrypt.hash(password, 10);
    await doctor.update({ password: hashed });

    await invite.update({ usedAt: new Date() });

    return res.json({ message: "Password set successfully. You can now login." });
  } catch (error) {
    console.error("Accept invite error:", error);
    return res.status(500).json({ message: "Error accepting invite", error: error.message });
  }
};
export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const doctor = await Doctor.findOne({ where: { email } })
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // ✅ important: doctor must accept invite first
    if (!doctor.password) {
      return res.status(403).json({
        message: 'Please set your password using the invite email first.',
      })
    }

    const ok = await bcrypt.compare(password, doctor.password)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, role: 'doctor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { password: _pw, ...doctorData } = doctor.toJSON()

    return res.json({
      message: 'Login successful',
      token,
      doctor: doctorData,
    })
  } catch (error) {
    console.error('Doctor login error:', error)
    return res.status(500).json({ message: 'Error logging in', error: error.message })
  }
}
