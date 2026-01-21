import dotenv from 'dotenv';
import sequelize from './src/config/db.js';
import Doctor from './src/models/Doctor.js';
import Patient from './src/models/Patient.js';
import Appointment from './src/models/Appointment.js';

dotenv.config();

// Define relationships (same as in app.js)
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

async function testDoctorPortal() {
  try {
    console.log('\n🔍 Testing Doctor Portal Database Connectivity\n');
    console.log('='.repeat(60));
    
    // Test 1: Database Connection
    console.log('\n1️⃣  Testing Database Connection...');
    await sequelize.authenticate();
    console.log('   ✅ Database connection successful');
    
    // Test 2: Check Doctors
    console.log('\n2️⃣  Checking Doctors Table...');
    const doctors = await Doctor.findAll({
      attributes: ['id', 'name', 'email', 'specialization', 'yearsOfExperience']
    });
    console.log(`   ✅ Found ${doctors.length} doctor(s):`);
    doctors.forEach(doc => {
      console.log(`      - ${doc.name} (${doc.specialization}) - ${doc.email}`);
    });
    
    // Test 3: Check Patients
    console.log('\n3️⃣  Checking Patients Table...');
    const patients = await Patient.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
    });
    console.log(`   ✅ Found ${patients.length} patient(s):`);
    patients.forEach(pat => {
      console.log(`      - ${pat.firstName} ${pat.lastName} - ${pat.email}`);
    });
    
    // Test 4: Check Appointments with Relationships
    console.log('\n4️⃣  Checking Appointments with Relationships...');
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Doctor,
          attributes: ['id', 'name', 'specialization']
        },
        {
          model: Patient,
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });
    console.log(`   ✅ Found ${appointments.length} appointment(s):`);
    appointments.forEach(apt => {
      const patientName = apt.Patient ? `${apt.Patient.firstName} ${apt.Patient.lastName}` : 'Unknown';
      const doctorName = apt.Doctor ? apt.Doctor.name : 'Unknown';
      console.log(`      - ${apt.appointmentDate} at ${apt.appointmentTime}`);
      console.log(`        Patient: ${patientName}`);
      console.log(`        Doctor: ${doctorName}`);
      console.log(`        Status: ${apt.status}, Mode: ${apt.mode}`);
    });
    
    // Test 5: Test Today's Appointments Query
    console.log('\n5️⃣  Testing Today\'s Appointments Query...');
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = await Appointment.findAll({
      where: { appointmentDate: today },
      include: [
        {
          model: Patient,
          attributes: ['firstName', 'lastName', 'phone']
        }
      ]
    });
    console.log(`   ✅ Found ${todayAppointments.length} appointment(s) for today (${today})`);
    
    // Test 6: Test Appointment Stats
    console.log('\n6️⃣  Testing Appointment Statistics...');
    if (doctors.length > 0) {
      const firstDoctor = doctors[0];
      const todaysCount = await Appointment.count({
        where: { 
          doctorId: firstDoctor.id,
          appointmentDate: today 
        }
      });
      
      const totalPatients = await Appointment.count({
        where: { doctorId: firstDoctor.id },
        distinct: true,
        col: 'patientId'
      });
      
      const pendingCount = await Appointment.count({
        where: { 
          doctorId: firstDoctor.id,
          status: 'Pending'
        }
      });
      
      console.log(`   ✅ Stats for ${firstDoctor.name}:`);
      console.log(`      - Today's appointments: ${todaysCount}`);
      console.log(`      - Total unique patients: ${totalPatients}`);
      console.log(`      - Pending appointments: ${pendingCount}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ All tests passed successfully!');
    console.log('='.repeat(60));
    
    console.log('\n📋 Doctor Portal Endpoints Ready:');
    console.log('   - POST /api/doctors/login');
    console.log('   - GET  /api/doctors/profile');
    console.log('   - PUT  /api/doctors/profile');
    console.log('   - GET  /api/appointments');
    console.log('   - GET  /api/appointments/today');
    console.log('   - GET  /api/appointments/stats');
    console.log('   - PUT  /api/appointments/:id');
    console.log('   - DELETE /api/appointments/:id');
    
    console.log('\n🔑 Test Login:');
    console.log('   Email: sarah.silva@medicare.com');
    console.log('   Password: password123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

testDoctorPortal();
