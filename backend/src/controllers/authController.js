// src/controllers/authController.js
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456'

export const registerAdmin = async (req, res) => {
  return res.status(403).json({ msg: 'Admin registration is disabled' })
}

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body

  try {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ msg: 'Invalid admin credentials' })
    }

    let admin = await User.findOne({ where: { email: ADMIN_EMAIL } })
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)

    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: 'admin',
      })
    } else {
      const passwordMatches = await bcrypt.compare(ADMIN_PASSWORD, admin.password)
      if (admin.role !== 'admin' || !passwordMatches) {
        await admin.update({ password: passwordHash, role: 'admin' })
      }
    }

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
