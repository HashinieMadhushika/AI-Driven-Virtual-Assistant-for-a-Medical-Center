import dotenv from 'dotenv';
import sequelize from './src/config/db.js';
import Doctor from './src/models/Doctor.js';
import Patient from './src/models/Patient.js';
import Appointment from './src/models/Appointment.js';
import bcrypt from 'bcrypt';

dotenv.config();

// Define relationships (same as in app.js)
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

async function setupDoctorData() {
  try {
    console.log('🔧 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!\n');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced\n');

    // Check existing doctors
    const existingDoctors = await Doctor.findAll();
    console.log(`📋 Found ${existingDoctors.length} existing doctor(s)\n`);

    // Sample doctors data
    const doctorsData = [
      {
        name: 'Dr. Sarah Silva',
        email: 'sarah.silva@medicare.com',
        password: 'password123',
        phone: '+1-555-0101',
        specialization: 'Cardiology',
        designation: 'Senior Cardiologist',
        yearsOfExperience: 12,
        education: 'MD from Harvard Medical School',
        certifications: ['Board Certified Cardiologist', 'ACLS Certified']
      },
      {
        name: 'Dr. John Davis',
        email: 'john.davis@medicare.com',
        password: 'password123',
        phone: '+1-555-0102',
        specialization: 'Pediatrics',
        designation: 'Pediatric Specialist',
        yearsOfExperience: 8,
        education: 'MD from Johns Hopkins University',
        certifications: ['Board Certified Pediatrician', 'PALS Certified']
      },
      {
        name: 'Dr. Emily Chen',
        email: 'emily.chen@medicare.com',
        password: 'password123',
        phone: '+1-555-0103',
        specialization: 'Dermatology',
        designation: 'Dermatologist',
        yearsOfExperience: 10,
        education: 'MD from Stanford Medical School',
        certifications: ['Board Certified Dermatologist', 'Cosmetic Dermatology Certified']
      }
    ];

    // Add doctors if they don't exist
    console.log('👨‍⚕️ Setting up doctors...');
    for (const doctorData of doctorsData) {
      const existingDoctor = await Doctor.findOne({ where: { email: doctorData.email } });
      
      if (!existingDoctor) {
        const hashedPassword = await bcrypt.hash(doctorData.password, 10);
        await Doctor.create({
          ...doctorData,
          password: hashedPassword
        });
        console.log(`✅ Created doctor: ${doctorData.name} (${doctorData.email})`);
      } else {
        console.log(`⏭️  Doctor already exists: ${doctorData.name}`);
      }
    }

    // Add sample patients
    console.log('\n👥 Setting up sample patients...');
    const patientsData = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-1001',
        dateOfBirth: '1985-03-15',
        gender: 'Male',
        address: '123 Main St, New York, NY 10001',
        medicalHistory: 'No known allergies'
      },
      {
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'emma.johnson@email.com',
        phone: '+1-555-1002',
        dateOfBirth: '1990-07-22',
        gender: 'Female',
        address: '456 Oak Ave, Los Angeles, CA 90001',
        medicalHistory: 'Allergic to penicillin'
      },
      {
        firstName: 'Michael',
        lastName: 'Williams',
        email: 'michael.williams@email.com',
        phone: '+1-555-1003',
        dateOfBirth: '1978-11-10',
        gender: 'Male',
        address: '789 Pine Rd, Chicago, IL 60601',
        medicalHistory: 'History of hypertension'
      }
    ];

    for (const patientData of patientsData) {
      const existingPatient = await Patient.findOne({ where: { email: patientData.email } });
      
      if (!existingPatient) {
        await Patient.create(patientData);
        console.log(`✅ Created patient: ${patientData.firstName} ${patientData.lastName}`);
      } else {
        console.log(`⏭️  Patient already exists: ${patientData.firstName} ${patientData.lastName}`);
      }
    }

    // Add sample appointments
    console.log('\n📅 Setting up sample appointments...');
    const doctors = await Doctor.findAll();
    const patients = await Patient.findAll();

    if (doctors.length > 0 && patients.length > 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointmentsData = [
        {
          doctorId: doctors[0].id,
          patientId: patients[0].id,
          appointmentDate: today.toISOString().split('T')[0],
          appointmentTime: '09:00:00',
          type: 'General Consultation',
          mode: 'In-Person',
          status: 'Confirmed',
          notes: 'Regular checkup'
        },
        {
          doctorId: doctors[0].id,
          patientId: patients[1].id,
          appointmentDate: today.toISOString().split('T')[0],
          appointmentTime: '10:30:00',
          type: 'Follow-up',
          mode: 'Video Call',
          status: 'Pending',
          notes: 'Follow-up on previous consultation'
        },
        {
          doctorId: doctors[0].id,
          patientId: patients[2].id,
          appointmentDate: tomorrow.toISOString().split('T')[0],
          appointmentTime: '14:00:00',
          type: 'General Consultation',
          mode: 'In-Person',
          status: 'Confirmed',
          notes: 'Blood pressure monitoring'
        }
      ];

      for (const appointmentData of appointmentsData) {
        const existing = await Appointment.findOne({
          where: {
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
            appointmentDate: appointmentData.appointmentDate,
            appointmentTime: appointmentData.appointmentTime
          }
        });

        if (!existing) {
          await Appointment.create(appointmentData);
          console.log(`✅ Created appointment for ${appointmentData.appointmentDate} at ${appointmentData.appointmentTime}`);
        } else {
          console.log(`⏭️  Appointment already exists for ${appointmentData.appointmentDate} at ${appointmentData.appointmentTime}`);
        }
      }
    }

    console.log('\n✨ Setup complete!');
    console.log('\n📊 Database Summary:');
    console.log(`   Doctors: ${(await Doctor.count())} total`);
    console.log(`   Patients: ${(await Patient.count())} total`);
    console.log(`   Appointments: ${(await Appointment.count())} total`);
    console.log('\n🔑 Doctor Login Credentials:');
    console.log('   Email: sarah.silva@medicare.com');
    console.log('   Password: password123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupDoctorData();
