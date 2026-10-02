import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { Op } from 'sequelize';

const ACTIVE_STATUSES = ['Pending', 'Confirmed'];

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeAppointmentTime(value) {
  const raw = String(value || '').trim();

  if (!raw) {
    return '';
  }

  const firstPart = raw.split(' - ')[0].trim();
  const twelveHourMatch = firstPart.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2] || '00');
    const meridiem = twelveHourMatch[3].toLowerCase();

    if (hour < 1 || hour > 12 || minutes < 0 || minutes > 59) {
      return '';
    }

    if (meridiem === 'pm' && hour !== 12) {
      hour += 12;
    }

    if (meridiem === 'am' && hour === 12) {
      hour = 0;
    }

    return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  const twentyFourHourMatch = firstPart.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);
    const seconds = Number(twentyFourHourMatch[3] || '00');

    if (
      hour < 0 ||
      hour > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return '';
    }

    return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return '';
}

function isValidIsoDate(value) {
  const text = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }

  const date = new Date(`${text}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

function isFutureOrTodayAppointment(dateValue, timeValue) {
  if (!isValidIsoDate(dateValue)) {
    return false;
  }

  const normalizedTime = normalizeAppointmentTime(timeValue);
  if (!normalizedTime) {
    return false;
  }

  const candidate = new Date(`${dateValue}T${normalizedTime}`);
  return candidate.getTime() > Date.now();
}

async function findAppointmentForPatient({ appointmentId, email, includeDoctor = true }) {
  const normalizedEmail = normalizeEmail(email);

  if (!appointmentId || !normalizedEmail) {
    return null;
  }

  return Appointment.findOne({
    where: { id: appointmentId },
    include: [
      {
        model: Patient,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        where: {
          email: {
            [Op.iLike]: normalizedEmail,
          },
        },
      },
      ...(includeDoctor
        ? [
            {
              model: Doctor,
              attributes: ['id', 'name', 'specialization'],
            },
          ]
        : []),
    ],
  });
}

async function hasSchedulingConflict({ doctorId, appointmentDate, appointmentTime, excludeAppointmentId }) {
  const where = {
    doctorId,
    appointmentDate,
    appointmentTime,
    status: {
      [Op.notIn]: ['Cancelled'],
    },
  };

  if (excludeAppointmentId) {
    where.id = {
      [Op.ne]: excludeAppointmentId,
    };
  }

  const existing = await Appointment.findOne({ where });
  return Boolean(existing);
}

// Get all appointments for a doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { date, status } = req.query;

    const whereClause = { doctorId };

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
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
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
        appointmentDate: today,
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
      order: [['appointmentTime', 'ASC']],
    });

    res.json({ appointments });
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ message: "Error fetching today's appointments", error: error.message });
  }
};

// Get appointment statistics for a doctor
export const getAppointmentStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const todaysAppointments = await Appointment.count({
      where: { doctorId, appointmentDate: today },
    });

    const totalPatients = await Appointment.count({
      where: { doctorId },
      distinct: true,
      col: 'patientId',
    });

    const pendingReviews = await Appointment.count({
      where: {
        doctorId,
        status: 'Pending',
      },
    });

    res.json({
      todaysAppointments,
      totalPatients,
      pendingReviews,
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

    if (!patientId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Patient, date, and time are required' });
    }

    const normalizedTime = normalizeAppointmentTime(appointmentTime);
    if (!isValidIsoDate(appointmentDate) || !normalizedTime) {
      return res.status(400).json({ message: 'A valid appointment date and time are required' });
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (
      await hasSchedulingConflict({
        doctorId,
        appointmentDate,
        appointmentTime: normalizedTime,
      })
    ) {
      return res.status(409).json({ message: 'That doctor already has an appointment at the selected date and time' });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      appointmentDate,
      appointmentTime: normalizedTime,
      type: type || 'General Consultation',
      mode: mode || 'In-Person',
      status: 'Pending',
      notes,
    });

    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: createdAppointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

// Create a new appointment (admin)
export const createAppointmentByAdmin = async (req, res) => {
  try {
    const {
      doctorId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      appointmentDate,
      appointmentTime,
      notes,
    } = req.body;

    if (!doctorId || !firstName || !lastName || !email || !phone || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: 'Doctor, patient first name, last name, email, phone, date, and time are required',
      });
    }

    const normalizedTime = normalizeAppointmentTime(appointmentTime);
    if (!isValidIsoDate(appointmentDate) || !normalizedTime) {
      return res.status(400).json({ message: 'A valid appointment date and time are required' });
    }

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (
      await hasSchedulingConflict({
        doctorId: doctor.id,
        appointmentDate,
        appointmentTime: normalizedTime,
      })
    ) {
      return res.status(409).json({ message: 'That doctor already has an appointment at the selected date and time' });
    }

    const [patient] = await Patient.findOrCreate({
      where: { email: normalizeEmail(email) },
      defaults: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth || null,
      },
    });

    const appointment = await Appointment.create({
      doctorId: doctor.id,
      patientId: patient.id,
      appointmentDate,
      appointmentTime: normalizedTime,
      type: 'General Consultation',
      mode: 'In-Person',
      status: 'Pending',
      notes,
    });

    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: Doctor,
          attributes: ['id', 'name', 'specialization'],
        },
      ],
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: createdAppointment,
    });
  } catch (error) {
    console.error('Error creating appointment (admin):', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map((e) => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

// Update appointment (authenticated doctor)
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;
    const { appointmentDate, appointmentTime, type, mode, status, notes, cancellationReason } = req.body;

    const appointment = await Appointment.findOne({
      where: { id, doctorId },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const nextDate = appointmentDate || appointment.appointmentDate;
    const nextTime = appointmentTime
      ? normalizeAppointmentTime(appointmentTime)
      : normalizeAppointmentTime(appointment.appointmentTime);

    if (!isValidIsoDate(nextDate) || !nextTime) {
      return res.status(400).json({ message: 'A valid appointment date and time are required' });
    }

    if (
      (appointmentDate || appointmentTime) &&
      (await hasSchedulingConflict({
        doctorId,
        appointmentDate: nextDate,
        appointmentTime: nextTime,
        excludeAppointmentId: appointment.id,
      }))
    ) {
      return res.status(409).json({ message: 'That doctor already has an appointment at the selected date and time' });
    }

    await appointment.update({
      appointmentDate: nextDate,
      appointmentTime: nextTime,
      type: type || appointment.type,
      mode: mode || appointment.mode,
      status: status || appointment.status,
      notes: notes !== undefined ? notes : appointment.notes,
      cancellationReason:
        cancellationReason !== undefined ? cancellationReason : appointment.cancellationReason,
    });

    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
    });

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// Delete appointment (authenticated doctor)
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const appointment = await Appointment.findOne({
      where: { id, doctorId },
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

/*
 * Public assistant-safe lookup.
 * Requires BOTH the appointment reference and the patient email.
 * This avoids exposing a patient's full appointment list by email alone.
 */
export const lookupPublicAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const email = req.query.email;

    if (!appointmentId || !email) {
      return res.status(400).json({ message: 'Appointment number and patient email are required' });
    }

    const appointment = await findAppointmentForPatient({ appointmentId, email });

    if (!appointment) {
      return res.status(404).json({
        message: 'No appointment was found for that appointment number and email',
      });
    }

    return res.json({ appointment });
  } catch (error) {
    console.error('Error looking up public appointment:', error);
    return res.status(500).json({ message: 'Error looking up appointment', error: error.message });
  }
};

/*
 * Public cancellation for the patient-facing assistant.
 * The appointment is soft-cancelled rather than deleted so history is preserved.
 */
export const cancelPublicAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { email, reason = 'Cancelled by patient through virtual assistant' } = req.body ?? {};

    if (!appointmentId || !email) {
      return res.status(400).json({ message: 'Appointment number and patient email are required' });
    }

    const appointment = await findAppointmentForPatient({ appointmentId, email });

    if (!appointment) {
      return res.status(404).json({
        message: 'No appointment was found for that appointment number and email',
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(200).json({
        message: 'This appointment is already cancelled',
        appointment,
        alreadyCancelled: true,
      });
    }

    if (appointment.status === 'Completed') {
      return res.status(409).json({ message: 'A completed appointment cannot be cancelled' });
    }

    await appointment.update({
      status: 'Cancelled',
      cancellationReason: String(reason || '').trim() || 'Cancelled by patient through virtual assistant',
    });

    const updatedAppointment = await findAppointmentForPatient({ appointmentId, email });

    return res.json({
      message: 'Appointment cancelled successfully',
      appointment: updatedAppointment,
      cancelled: true,
    });
  } catch (error) {
    console.error('Error cancelling public appointment:', error);
    return res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
};

/*
 * Public reschedule for the patient-facing assistant.
 * Requires appointment number + patient email and rejects DB conflicts.
 */
export const reschedulePublicAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { email, appointmentDate, appointmentTime } = req.body ?? {};

    if (!appointmentId || !email || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: 'Appointment number, patient email, new date, and new time are required',
      });
    }

    if (!isValidIsoDate(appointmentDate)) {
      return res.status(400).json({ message: 'appointmentDate must use YYYY-MM-DD format' });
    }

    const normalizedTime = normalizeAppointmentTime(appointmentTime);
    if (!normalizedTime) {
      return res.status(400).json({ message: 'appointmentTime is invalid' });
    }

    if (!isFutureOrTodayAppointment(appointmentDate, normalizedTime)) {
      return res.status(400).json({ message: 'The new appointment date and time must be in the future' });
    }

    const appointment = await findAppointmentForPatient({ appointmentId, email });

    if (!appointment) {
      return res.status(404).json({
        message: 'No appointment was found for that appointment number and email',
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(409).json({ message: 'A cancelled appointment cannot be rescheduled' });
    }

    if (appointment.status === 'Completed') {
      return res.status(409).json({ message: 'A completed appointment cannot be rescheduled' });
    }

    const conflict = await hasSchedulingConflict({
      doctorId: appointment.doctorId,
      appointmentDate,
      appointmentTime: normalizedTime,
      excludeAppointmentId: appointment.id,
    });

    if (conflict) {
      return res.status(409).json({
        message: 'That doctor and time are already booked. Please choose another time.',
        conflict: true,
      });
    }

    await appointment.update({
      appointmentDate,
      appointmentTime: normalizedTime,
      status: ACTIVE_STATUSES.includes(appointment.status) ? appointment.status : 'Confirmed',
      cancellationReason: null,
    });

    const updatedAppointment = await findAppointmentForPatient({ appointmentId, email });

    return res.json({
      message: 'Appointment rescheduled successfully',
      appointment: updatedAppointment,
      rescheduled: true,
    });
  } catch (error) {
    console.error('Error rescheduling public appointment:', error);
    return res.status(500).json({ message: 'Error rescheduling appointment', error: error.message });
  }
};
