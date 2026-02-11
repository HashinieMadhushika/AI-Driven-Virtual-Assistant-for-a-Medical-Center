// src/controllers/authController.js
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'name, email, password are required' })
    }

    const existing = await User.findOne({ where: { email } })
    if (existing) return res.status(400).json({ msg: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'admin',
    })

    // ✅ NEVER return password
    const { password: _pw, ...safeUser } = user.toJSON()

    return res.status(201).json({
      msg: 'Admin registered successfully',
      user: safeUser,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: 'Database error' })
  }
}

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body

  try {
    const admin = await User.findOne({ where: { email } })
    if (!admin) return res.status(404).json({ msg: 'User not found' })

    // ✅ ensure only admins can login here
    if (admin.role !== 'admin') {
      return res.status(403).json({ msg: 'Not an admin account' })
    }

    const match = await bcrypt.compare(password, admin.password)
    if (!match) return res.status(400).json({ msg: 'Wrong password' })

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    const { password: _pw, ...safeUser } = admin.toJSON()

    return res.json({ token, user: safeUser })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: 'Database error' })
  }
}
