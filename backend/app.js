// src/app.js
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import sequelize from './src/config/db.js';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ msg: 'Backend is running!' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Sync DB
sequelize.sync()
  .then(() => console.log('✅ All models synced'))
  .catch(err => console.error('❌ Sync error:', err));

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
