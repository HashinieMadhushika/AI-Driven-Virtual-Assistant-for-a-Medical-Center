import { Op } from 'sequelize';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { getDoctorCalendarAuth } from './doctorCalendarAuth.js';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  listCalendarBusyPeriods,
} from './googleCalendar.js';
import {
  sendBookingConfirmation,
  sendRescheduleConfirmation,
  sendCancellationConfirmation,
} from './emailService.js';

const COLOMBO_OFFSET = '+05:30';

function normalizeAppointmentTime(value) {
  const raw = String(value || '').trim();
  const firstPart = raw.split(' - ')[0].trim();

  const twelveHour = firstPart.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2] || '00');
    const meridiem = twelveHour[3].toLowerCase();

    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  }

  const twentyFour = firstPart.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!twentyFour) return '';

  return `${String(Number(twentyFour[1])).padStart(2, '0')}:${twentyFour[2]}:${twentyFour[3] || '00'}`;
}

function parseWeeklySchedule(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function dayName(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][date.getDay()];
}

function localIso(dateString, time24) {
  return `${dateString}T${normalizeAppointmentTime(time24)}${COLOMBO_OFFSET}`;
}

function addMinutesToLocalIso(dateString, time24, minutes) {
  const start = new Date(localIso(dateString, time24));
  const end = new Date(start.getTime() + minutes * 60_000);
  return end.toISOString();
}

function getConfiguredSlotEnd(doctor, appointmentDate, appointmentTime) {
  const schedule = parseWeeklySchedule(doctor?.availableTimes);
  const slots = Array.isArray(schedule[dayName(appointmentDate)])
    ? schedule[dayName(appointmentDate)]
    : [];

  const targetStart = normalizeAppointmentTime(appointmentTime);

  for (const label of slots) {
    const parts = String(label).split(' - ');
    if (parts.length !== 2) continue;

    const slotStart = normalizeAppointmentTime(parts[0]);
    if (slotStart === targetStart) {
      const slotEnd = normalizeAppointmentTime(parts[1]);
      if (slotEnd) {
        return localIso(appointmentDate, slotEnd);
      }
    }
  }

  return addMinutesToLocalIso(appointmentDate, appointmentTime, 60);
}

function calendarEventDetails(appointment, patient, doctor) {
  const patientDisplayName =
    [patient?.firstName, patient?.lastName].filter(Boolean).join(' ') || 'Patient';

  return {
    title: `Medical appointment - ${patientDisplayName}`,
    description:
      `Appointment ID: ${appointment.id}\n` +
      `Patient: ${patientDisplayName}\n` +
      `Doctor: ${doctor?.name || ''}\n` +
      `Type: ${appointment.type || 'General Consultation'}\n` +
      `Mode: ${appointment.mode || 'In-Person'}`,
    startTime: localIso(appointment.appointmentDate, appointment.appointmentTime),
    endTime: getConfiguredSlotEnd(
      doctor,
      appointment.appointmentDate,
      appointment.appointmentTime
    ),
  };
}

async function loadAppointmentBundle(appointmentId) {
  return Appointment.findByPk(appointmentId, {
    include: [
      {
        model: Patient,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
      },
      {
        model: Doctor,
      },
    ],
  });
}

function integrationResult() {
  return {
    calendarSynced: false,
    emailSent: false,
    warnings: [],
  };
}

export async function syncCreatedAppointment(appointmentId) {
  const result = integrationResult();
  const appointment = await loadAppointmentBundle(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  const patient = appointment.Patient || appointment.patient;
  const doctor = appointment.Doctor || appointment.doctor;

  if (doctor?.googleCalendarConnected) {
    try {
      const auth = await getDoctorCalendarAuth(doctor);
      const event = await createCalendarEvent(
        auth,
        calendarEventDetails(appointment, patient, doctor)
      );

      if (event?.id) {
        await appointment.update({
          googleCalendarEventId: event.id,
        });
        result.calendarSynced = true;
      }
    } catch (error) {
      result.warnings.push(`Doctor Google Calendar create failed: ${error.message}`);
    }
  } else {
    result.warnings.push('Doctor Google Calendar is not connected; appointment was saved without a calendar event.');
  }

  try {
    await sendBookingConfirmation({
      appointment,
      patient,
      doctor,
    });
    result.emailSent = true;
  } catch (error) {
    result.warnings.push(`Patient confirmation email failed: ${error.message}`);
  }

  return {
    appointment: await loadAppointmentBundle(appointment.id),
    ...result,
  };
}

export async function syncRescheduledAppointment(appointmentId) {
  const result = integrationResult();
  const appointment = await loadAppointmentBundle(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  const patient = appointment.Patient || appointment.patient;
  const doctor = appointment.Doctor || appointment.doctor;

  if (doctor?.googleCalendarConnected) {
    try {
      const auth = await getDoctorCalendarAuth(doctor);
      const details = calendarEventDetails(appointment, patient, doctor);

      if (appointment.googleCalendarEventId) {
        await updateCalendarEvent(
          auth,
          appointment.googleCalendarEventId,
          details
        );
      } else {
        const event = await createCalendarEvent(auth, details);
        if (event?.id) {
          await appointment.update({
            googleCalendarEventId: event.id,
          });
        }
      }

      result.calendarSynced = true;
    } catch (error) {
      result.warnings.push(`Doctor Google Calendar update failed: ${error.message}`);
    }
  } else {
    result.warnings.push('Doctor Google Calendar is not connected; database reschedule was kept.');
  }

  try {
    await sendRescheduleConfirmation({
      appointment,
      patient,
      doctor,
    });
    result.emailSent = true;
  } catch (error) {
    result.warnings.push(`Patient reschedule email failed: ${error.message}`);
  }

  return {
    appointment: await loadAppointmentBundle(appointment.id),
    ...result,
  };
}

export async function syncCancelledAppointment(appointmentId) {
  const result = integrationResult();
  const appointment = await loadAppointmentBundle(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  const patient = appointment.Patient || appointment.patient;
  const doctor = appointment.Doctor || appointment.doctor;

  if (doctor?.googleCalendarConnected && appointment.googleCalendarEventId) {
    try {
      const auth = await getDoctorCalendarAuth(doctor);
      await deleteCalendarEvent(auth, appointment.googleCalendarEventId);
      await appointment.update({
        googleCalendarEventId: null,
      });
      result.calendarSynced = true;
    } catch (error) {
      result.warnings.push(`Doctor Google Calendar delete failed: ${error.message}`);
    }
  } else if (!doctor?.googleCalendarConnected) {
    result.warnings.push('Doctor Google Calendar is not connected; database cancellation was kept.');
  }

  try {
    await sendCancellationConfirmation({
      appointment,
      patient,
      doctor,
    });
    result.emailSent = true;
  } catch (error) {
    result.warnings.push(`Patient cancellation email failed: ${error.message}`);
  }

  return {
    appointment: await loadAppointmentBundle(appointment.id),
    ...result,
  };
}

function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export async function getDoctorAvailability({
  doctorId,
  appointmentDate,
  excludeAppointmentId = null,
}) {
  const doctor = await Doctor.findByPk(doctorId);

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const weeklySchedule = parseWeeklySchedule(doctor.availableTimes);
  const key = dayName(appointmentDate);
  const configuredSlots = Array.isArray(weeklySchedule[key])
    ? weeklySchedule[key]
    : [];

  const where = {
    doctorId,
    appointmentDate,
    status: {
      [Op.notIn]: ['Cancelled'],
    },
  };

  if (excludeAppointmentId) {
    where.id = {
      [Op.ne]: excludeAppointmentId,
    };
  }

  const databaseAppointments = await Appointment.findAll({
    where,
    attributes: ['id', 'appointmentTime'],
  });

  const bookedTimes = new Set(
    databaseAppointments
      .map((appointment) => normalizeAppointmentTime(appointment.appointmentTime))
      .filter(Boolean)
  );

  let googleCalendarChecked = false;
  let calendarWarning = '';

  if (doctor.googleCalendarConnected) {
    try {
      const auth = await getDoctorCalendarAuth(doctor);
      const busyPeriods = await listCalendarBusyPeriods(
        auth,
        `${appointmentDate}T00:00:00${COLOMBO_OFFSET}`,
        `${appointmentDate}T23:59:59${COLOMBO_OFFSET}`
      );

      googleCalendarChecked = true;

      for (const label of configuredSlots) {
        const [startLabel, endLabel] = String(label).split(' - ');
        const startTime = normalizeAppointmentTime(startLabel);
        const endTime = normalizeAppointmentTime(endLabel);

        if (!startTime || !endTime) continue;

        const slotStart = new Date(localIso(appointmentDate, startTime));
        const slotEnd = new Date(localIso(appointmentDate, endTime));

        const busy = busyPeriods.some((period) => {
          const busyStart = new Date(period.start);
          const busyEnd = new Date(period.end);
          return intervalsOverlap(slotStart, slotEnd, busyStart, busyEnd);
        });

        if (busy) {
          bookedTimes.add(startTime);
        }
      }
    } catch (error) {
      calendarWarning = error.message;
    }
  }

  return {
    id: doctor.id,
    name: doctor.name,
    availableTimes: weeklySchedule,
    bookedTimes: [...bookedTimes],
    googleCalendarChecked,
    calendarWarning,
  };
}
