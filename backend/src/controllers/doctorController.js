import bcrypt from "bcrypt";
import User from "../models/User.js";

// helper: generate temp password
function generateTempPassword(length = 10) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

// POST /api/doctors
export const createDoctor = async (req, res) => {
  try {
    const { name, email, specialization, phone, licenseNo, roomNo } = req.body;

    if (!name || !email || !specialization) {
      return res.status(400).json({ msg: "Name, email and specialization are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const doctor = await User.create({
      name,
      email,
      password: hashed,
      role: "doctor",
      specialization: specialization || null,
      phone: phone || null,
      licenseNo: licenseNo || null,
      roomNo: roomNo || null,
      mustChangePassword: true,
    });

    // ✅ Later replace this with sending email via nodemailer
    res.status(201).json({
      msg: "Doctor created",
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        specialization: doctor.specialization,
        phone: doctor.phone,
        licenseNo: doctor.licenseNo,
        roomNo: doctor.roomNo,
      },
      tempPassword,
    });
  } catch (err) {
    console.error("createDoctor error:", err);
    res.status(500).json({ msg: "Database error", error: String(err) });
  }
};

// GET /api/doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: "doctor" },
      attributes: ["id", "name", "email", "role", "specialization", "phone", "licenseNo", "roomNo"],
      order: [["id", "DESC"]],
    });

    res.json(doctors);
  } catch (err) {
    console.error("getDoctors error:", err);
    res.status(500).json({ msg: "Database error", error: String(err) });
  }
};

// PUT /api/doctors/:id
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, specialization, phone, licenseNo, roomNo } = req.body;

    const doctor = await User.findOne({ where: { id, role: "doctor" } });
    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });

    // Unique email check if changed
    if (email && email !== doctor.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ msg: "Email already exists" });
    }

    doctor.name = name ?? doctor.name;
    doctor.email = email ?? doctor.email;
    doctor.specialization = specialization ?? doctor.specialization;
    doctor.phone = phone ?? doctor.phone;
    doctor.licenseNo = licenseNo ?? doctor.licenseNo;
    doctor.roomNo = roomNo ?? doctor.roomNo;

    await doctor.save();

    res.json({
      msg: "Doctor updated",
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        phone: doctor.phone,
        licenseNo: doctor.licenseNo,
        roomNo: doctor.roomNo,
      },
    });
  } catch (err) {
    console.error("updateDoctor error:", err);
    res.status(500).json({ msg: "Database error", error: String(err) });
  }
};

// DELETE /api/doctors/:id
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await User.findOne({ where: { id, role: "doctor" } });
    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });

    await doctor.destroy();

    res.json({ msg: "Doctor deleted" });
  } catch (err) {
    console.error("deleteDoctor error:", err);
    res.status(500).json({ msg: "Database error", error: String(err) });
  }
};
