// Run this file: node add-doctor-to-db.js
import bcrypt from 'bcrypt';
import Doctor from './backend/src/models/Doctor.js';
import sequelize from './backend/src/config/db.js';

try {
  // Connect to database
  await sequelize.authenticate();
  console.log('✅ Connected to database');

  // Hash the password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create doctor
  const doctor = await Doctor.create({
    name: 'Sarah Silva',
    email: 'sarah.silva@medicare.com',
    password: hashedPassword,
    phone: '+1 (555) 123-4567',
    specialization: 'Cardiology',
    designation: 'Senior Cardiologist',
    yearsOfExperience: 15,
    education: 'MD - Harvard Medical School\nResidency - Johns Hopkins Hospital',
    certifications: ['Board Certified in Cardiology', 'Advanced Cardiac Life Support (ACLS)']
  });

  console.log('✅ Doctor created successfully!');
  console.log('ID:', doctor.id);
  console.log('Email:', doctor.email);
  console.log('\nLogin credentials:');
  console.log('  Email: sarah.silva@medicare.com');
  console.log('  Password: password123');

  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.name === 'SequelizeUniqueConstraintError') {
    console.log('Doctor with this email already exists!');
  }
  process.exit(1);
}
