import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { Op } from 'sequelize';

// Get all appointments for a doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { date, status } = req.query;

    let whereClause = { doctorId };

    if (date) {
      whereClause.appointmentDate = date;
    }

    if (status) {
      whereClause.status = status;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Get today's appointments for a doctor
export const getTodaysAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const appointments = await Appointment.findAll({
      where: {
        doctorId,
        appointmentDate: today
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ],
      order: [['appointmentTime', 'ASC']]
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({ message: 'Error fetching today\'s appointments', error: error.message });
  }
};

// Get appointment statistics for a doctor
export const getAppointmentStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const todaysAppointments = await Appointment.count({
      where: { doctorId, appointmentDate: today }
    });

    const totalPatients = await Appointment.count({
      where: { doctorId },
      distinct: true,
      col: 'patientId'
    });

    const pendingReviews = await Appointment.count({
      where: { 
        doctorId, 
        status: 'Pending'
      }
    });

    res.json({
      todaysAppointments,
      totalPatients,
      pendingReviews
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId, appointmentDate, appointmentTime, type, mode, notes } = req.body;

    // Validate required fields
    if (!patientId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Patient, date, and time are required' });
    }

    // Check if patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      patientId,
      appointmentDate,
      appointmentTime,
      type: type || 'General Consultation',
      mode: mode || 'In-Person',
      status: 'Pending',
      notes
    });

    // Fetch the created appointment with patient details
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    res.status(201).json({ 
      message: 'Appointment created successfully', 
      appointment: createdAppointment 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;
    const { appointmentDate, appointmentTime, type, mode, status, notes, cancellationReason } = req.body;

    const appointment = await Appointment.findOne({
      where: { id, doctorId }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update appointment
    await appointment.update({
      appointmentDate: appointmentDate || appointment.appointmentDate,
      appointmentTime: appointmentTime || appointment.appointmentTime,
      type: type || appointment.type,
      mode: mode || appointment.mode,
      status: status || appointment.status,
      notes: notes !== undefined ? notes : appointment.notes,
      cancellationReason: cancellationReason !== undefined ? cancellationReason : appointment.cancellationReason
    });

    // Fetch updated appointment with patient details
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    res.json({ 
      message: 'Appointment updated successfully', 
      appointment: updatedAppointment 
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const appointment = await Appointment.findOne({
      where: { id, doctorId }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await appointment.destroy();

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
};
