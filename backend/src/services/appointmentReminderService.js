import { Op } from 'sequelize';

import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

import {
  sendAppointmentReminder,
} from './emailService.js';

const ONE_HOUR_MS =
  60 * 60 * 1000;

const TWENTY_FOUR_HOURS_MS =
  24 * ONE_HOUR_MS;

/*
 * Sri Lanka timezone.
 *
 * Appointment date/time values in this project represent
 * medical-center local time.
 */
const COLOMBO_OFFSET =
  '+05:30';

function normalizeStartTime(value) {
  if (!value) {
    return null;
  }

  const input =
    String(value)
      .trim();

  /*
   * Handles:
   *
   * 09:00
   * 09:00:00
   */
  const databaseTime =
    input.match(
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
    );

  if (databaseTime) {
    const hour =
      String(
        Number(databaseTime[1])
      ).padStart(
        2,
        '0'
      );

    const minute =
      databaseTime[2];

    return `${hour}:${minute}:00`;
  }

  /*
   * Handles:
   *
   * 9:00 AM
   * 9:00 AM - 10:00 AM
   */
  const twelveHour =
    input.match(
      /(\d{1,2}):(\d{2})\s*(AM|PM)/i
    );

  if (
    twelveHour
  ) {
    let hour =
      Number(
        twelveHour[1]
      );

    const minute =
      twelveHour[2];

    const period =
      twelveHour[3]
        .toUpperCase();

    if (
      period ===
        'AM' &&
      hour === 12
    ) {
      hour = 0;
    }

    if (
      period ===
        'PM' &&
      hour !== 12
    ) {
      hour += 12;
    }

    return `${String(
      hour
    ).padStart(
      2,
      '0'
    )}:${minute}:00`;
  }

  return null;
}

function getAppointmentStart(
  appointment
) {
  const date =
    appointment
      .appointmentDate;

  const time =
    normalizeStartTime(
      appointment
        .appointmentTime
    );

  if (
    !date ||
    !time
  ) {
    return null;
  }

  const dateTime =
    new Date(
      `${date}T${time}${COLOMBO_OFFSET}`
    );

  if (
    Number.isNaN(
      dateTime.getTime()
    )
  ) {
    return null;
  }

  return dateTime;
}

async function send24HourReminder({
  appointment,
  patient,
  doctor,
}) {
  await sendAppointmentReminder({
    appointment,
    patient,
    doctor,
    reminderType: '24h',
  });

  await appointment.update({
    reminder24hSentAt:
      new Date(),
  });
}

async function sendOneHourReminder({
  appointment,
  patient,
  doctor,
}) {
  await sendAppointmentReminder({
    appointment,
    patient,
    doctor,
    reminderType: '1h',
  });

  await appointment.update({
    reminder1hSentAt:
      new Date(),
  });
}

export async function processDueAppointmentReminders() {
  const now =
    new Date();

  const appointments =
    await Appointment.findAll({
      where: {
        status: {
          [Op.in]: [
            'Pending',
            'Confirmed',
          ],
        },
      },

      include: [
        {
          model:
            Patient,
        },
        {
          model:
            Doctor,
        },
      ],

      order: [
        [
          'appointmentDate',
          'ASC',
        ],
        [
          'appointmentTime',
          'ASC',
        ],
      ],
    });

  const results = {
    checked:
      appointments.length,

    reminders24hSent:
      0,

    reminders1hSent:
      0,

    skipped:
      0,

    failed:
      0,

    details: [],
  };

  for (
    const appointment
    of appointments
  ) {
    try {
      const start =
        getAppointmentStart(
          appointment
        );

      if (!start) {
        results.skipped +=
          1;

        results.details.push({
          appointmentId:
            appointment.id,

          status:
            'skipped',

          reason:
            'Invalid appointment date/time',
        });

        continue;
      }

      const millisecondsUntilAppointment =
        start.getTime() -
        now.getTime();

      /*
       * Appointment has already started/passed.
       */
      if (
        millisecondsUntilAppointment <=
        0
      ) {
        results.skipped +=
          1;

        continue;
      }

      const patient =
        appointment.Patient ??
        appointment.patient;

      const doctor =
        appointment.Doctor ??
        appointment.doctor;

      if (
        !patient?.email
      ) {
        results.skipped +=
          1;

        results.details.push({
          appointmentId:
            appointment.id,

          status:
            'skipped',

          reason:
            'Patient email missing',
        });

        continue;
      }

      /*
       * ONE-HOUR REMINDER
       *
       * This is checked first.
       *
       * If the appointment is <= 1 hour away, we do not
       * send the older 24-hour reminder.
       */
      if (
        millisecondsUntilAppointment <=
          ONE_HOUR_MS &&
        !appointment
          .reminder1hSentAt
      ) {
        await sendOneHourReminder({
          appointment,
          patient,
          doctor,
        });

        results.reminders1hSent +=
          1;

        results.details.push({
          appointmentId:
            appointment.id,

          status:
            'sent',

          reminder:
            '1h',
        });

        continue;
      }

      /*
       * 24-HOUR REMINDER
       *
       * Any appointment inside the next 24 hours but more
       * than one hour away is eligible once.
       *
       * reminder24hSentAt prevents duplicates.
       */
      if (
        millisecondsUntilAppointment <=
          TWENTY_FOUR_HOURS_MS &&
        millisecondsUntilAppointment >
          ONE_HOUR_MS &&
        !appointment
          .reminder24hSentAt
      ) {
        await send24HourReminder({
          appointment,
          patient,
          doctor,
        });

        results.reminders24hSent +=
          1;

        results.details.push({
          appointmentId:
            appointment.id,

          status:
            'sent',

          reminder:
            '24h',
        });

        continue;
      }

      results.skipped +=
        1;
    } catch (error) {
      results.failed +=
        1;

      results.details.push({
        appointmentId:
          appointment.id,

        status:
          'failed',

        error:
          error instanceof Error
            ? error.message
            : 'Unknown reminder error',
      });

      console.error(
        `[Appointment Reminder] Failed for appointment ${appointment.id}`,
        error
      );
    }
  }

  return results;
}