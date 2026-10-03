import nodemailer from 'nodemailer';

/*
 * =========================================================
 * EMAIL CONFIGURATION
 * =========================================================
 *
 * Preferred variables:
 *
 * SMTP_HOST
 * SMTP_PORT
 * SMTP_SECURE
 * SMTP_USER
 * SMTP_PASS
 * MAIL_FROM
 *
 * Legacy fallback variables:
 *
 * EMAIL_USER
 * EMAIL_PASS
 *
 * This allows older parts of the project to keep working
 * while the new appointment notification service uses the
 * SMTP_* naming convention.
 */

function getEmailUser() {
  return (
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    ''
  ).trim();
}

function getEmailPassword() {
  return (
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    ''
  ).trim();
}

export function mailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      getEmailUser() &&
      getEmailPassword()
  );
}

/*
 * =========================================================
 * NODEMAILER TRANSPORTER
 * =========================================================
 */

function createTransporter() {
  if (!mailConfigured()) {
    throw new Error(
      'Email SMTP is not configured. Check SMTP_HOST, SMTP_PORT, SMTP_USER/EMAIL_USER, and SMTP_PASS/EMAIL_PASS.'
    );
  }

  const port = Number(
    process.env.SMTP_PORT ||
    465
  );

  const secure =
    String(
      process.env.SMTP_SECURE ??
        (port === 465)
    )
      .toLowerCase() ===
    'true';

  const user =
    getEmailUser();

  const pass =
    getEmailPassword();

  return nodemailer.createTransport({
    host:
      process.env.SMTP_HOST,

    port,

    secure,

    auth: {
      user,
      pass,
    },
  });
}

/*
 * =========================================================
 * DISPLAY HELPERS
 * =========================================================
 */

function patientName(
  patient
) {
  return (
    [
      patient?.firstName,
      patient?.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    'Patient'
  );
}

function doctorName(
  doctor
) {
  return (
    doctor?.name ||
    'your doctor'
  );
}

function commonDetails(
  appointment,
  patient,
  doctor
) {
  return {
    appointmentId:
      appointment?.id,

    patientName:
      patientName(
        patient
      ),

    doctorName:
      doctorName(
        doctor
      ),

    date:
      appointment?.appointmentDate ||
      '',

    time:
      appointment?.appointmentTime ||
      '',

    type:
      appointment?.type ||
      'General Consultation',

    mode:
      appointment?.mode ||
      'In-Person',

    status:
      appointment?.status ||
      '',
  };
}

/*
 * =========================================================
 * SHARED EMAIL SENDER
 * =========================================================
 */

async function sendMail({
  to,
  subject,
  text,
  html,
}) {
  const recipient =
    String(
      to ||
      ''
    ).trim();

  if (!recipient) {
    throw new Error(
      'Patient email is missing'
    );
  }

  const transporter =
    createTransporter();

  const emailUser =
    getEmailUser();

  const from =
    process.env.MAIL_FROM ||
    `Medicare AI Center <${emailUser}>`;

  const result =
    await transporter.sendMail({
      from,
      to:
        recipient,
      subject,
      text,
      html,
    });

  return result;
}

/*
 * =========================================================
 * BOOKING CONFIRMATION EMAIL
 * =========================================================
 */

export async function sendBookingConfirmation({
  appointment,
  patient,
  doctor,
}) {
  const d =
    commonDetails(
      appointment,
      patient,
      doctor
    );

  return sendMail({
    to:
      patient?.email,

    subject:
      `Appointment confirmed - #${d.appointmentId}`,

    text:
      `Hello ${d.patientName},\n\n` +
      `Your appointment has been confirmed.\n\n` +
      `Appointment ID: ${d.appointmentId}\n` +
      `Doctor: ${d.doctorName}\n` +
      `Date: ${d.date}\n` +
      `Time: ${d.time}\n` +
      `Type: ${d.type}\n` +
      `Mode: ${d.mode}\n` +
      `Status: ${d.status || 'Confirmed'}\n\n` +
      `If you need to reschedule or cancel your appointment, please use the Medicare AI Assistant and provide your appointment number.\n\n` +
      `Regards,\n` +
      `Medicare AI Center`,

    html:
      `<p>Hello ${d.patientName},</p>` +

      `<p>Your appointment has been <strong>confirmed</strong>.</p>` +

      `<p>` +
      `<strong>Appointment ID:</strong> ${d.appointmentId}<br>` +
      `<strong>Doctor:</strong> ${d.doctorName}<br>` +
      `<strong>Date:</strong> ${d.date}<br>` +
      `<strong>Time:</strong> ${d.time}<br>` +
      `<strong>Type:</strong> ${d.type}<br>` +
      `<strong>Mode:</strong> ${d.mode}<br>` +
      `<strong>Status:</strong> ${d.status || 'Confirmed'}` +
      `</p>` +

      `<p>` +
      `If you need to reschedule or cancel your appointment, ` +
      `please use the Medicare AI Assistant and provide your appointment number.` +
      `</p>` +

      `<p>` +
      `Regards,<br>` +
      `Medicare AI Center` +
      `</p>`,
  });
}

/*
 * =========================================================
 * RESCHEDULE CONFIRMATION EMAIL
 * =========================================================
 */

export async function sendRescheduleConfirmation({
  appointment,
  patient,
  doctor,
}) {
  const d =
    commonDetails(
      appointment,
      patient,
      doctor
    );

  return sendMail({
    to:
      patient?.email,

    subject:
      `Appointment rescheduled - #${d.appointmentId}`,

    text:
      `Hello ${d.patientName},\n\n` +
      `Your appointment has been rescheduled successfully.\n\n` +
      `Appointment ID: ${d.appointmentId}\n` +
      `Doctor: ${d.doctorName}\n` +
      `New date: ${d.date}\n` +
      `New time: ${d.time}\n` +
      `Type: ${d.type}\n` +
      `Mode: ${d.mode}\n\n` +
      `Please attend according to the updated appointment date and time.\n\n` +
      `Regards,\n` +
      `Medicare AI Center`,

    html:
      `<p>Hello ${d.patientName},</p>` +

      `<p>` +
      `Your appointment has been <strong>rescheduled successfully</strong>.` +
      `</p>` +

      `<p>` +
      `<strong>Appointment ID:</strong> ${d.appointmentId}<br>` +
      `<strong>Doctor:</strong> ${d.doctorName}<br>` +
      `<strong>New date:</strong> ${d.date}<br>` +
      `<strong>New time:</strong> ${d.time}<br>` +
      `<strong>Type:</strong> ${d.type}<br>` +
      `<strong>Mode:</strong> ${d.mode}` +
      `</p>` +

      `<p>` +
      `Please attend according to the updated appointment date and time.` +
      `</p>` +

      `<p>` +
      `Regards,<br>` +
      `Medicare AI Center` +
      `</p>`,
  });
}

/*
 * =========================================================
 * CANCELLATION CONFIRMATION EMAIL
 * =========================================================
 */

export async function sendCancellationConfirmation({
  appointment,
  patient,
  doctor,
}) {
  const d =
    commonDetails(
      appointment,
      patient,
      doctor
    );

  return sendMail({
    to:
      patient?.email,

    subject:
      `Appointment cancelled - #${d.appointmentId}`,

    text:
      `Hello ${d.patientName},\n\n` +
      `Your appointment has been cancelled successfully.\n\n` +
      `Appointment ID: ${d.appointmentId}\n` +
      `Doctor: ${d.doctorName}\n` +
      `Date: ${d.date}\n` +
      `Time: ${d.time}\n\n` +
      `If you need another appointment, you can make a new booking through the Medicare AI Assistant.\n\n` +
      `Regards,\n` +
      `Medicare AI Center`,

    html:
      `<p>Hello ${d.patientName},</p>` +

      `<p>` +
      `Your appointment has been <strong>cancelled successfully</strong>.` +
      `</p>` +

      `<p>` +
      `<strong>Appointment ID:</strong> ${d.appointmentId}<br>` +
      `<strong>Doctor:</strong> ${d.doctorName}<br>` +
      `<strong>Date:</strong> ${d.date}<br>` +
      `<strong>Time:</strong> ${d.time}` +
      `</p>` +

      `<p>` +
      `If you need another appointment, you can make a new booking through the Medicare AI Assistant.` +
      `</p>` +

      `<p>` +
      `Regards,<br>` +
      `Medicare AI Center` +
      `</p>`,
  });
}

/*
 * =========================================================
 * APPOINTMENT REMINDER EMAIL
 * =========================================================
 */

export async function sendAppointmentReminder({
  appointment,
  patient,
  doctor,
  reminderType,
}) {
  const d = commonDetails(
    appointment,
    patient,
    doctor
  );

  const isOneHour =
    reminderType === '1h';

  const timingMessage =
    isOneHour
      ? 'Your appointment is coming up very soon.'
      : 'This is a reminder about your upcoming appointment.';

  return sendMail({
    to:
      patient?.email,

    subject:
      `Appointment reminder - #${d.appointmentId}`,

    text:
      `Hello ${d.patientName},\n\n` +
      `${timingMessage}\n\n` +
      `Appointment ID: ${d.appointmentId}\n` +
      `Doctor: ${d.doctorName}\n` +
      `Date: ${d.date}\n` +
      `Time: ${d.time}\n` +
      `Type: ${d.type}\n` +
      `Mode: ${d.mode}\n\n` +
      `If you are unable to attend, please reschedule or cancel your appointment through the Medicare AI Assistant.\n\n` +
      `Regards,\n` +
      `Medicare AI Center`,

    html:
      `<p>Hello ${d.patientName},</p>` +

      `<p>${timingMessage}</p>` +

      `<p>` +
      `<strong>Appointment ID:</strong> ${d.appointmentId}<br>` +
      `<strong>Doctor:</strong> ${d.doctorName}<br>` +
      `<strong>Date:</strong> ${d.date}<br>` +
      `<strong>Time:</strong> ${d.time}<br>` +
      `<strong>Type:</strong> ${d.type}<br>` +
      `<strong>Mode:</strong> ${d.mode}` +
      `</p>` +

      `<p>` +
      `If you are unable to attend, please reschedule or cancel your appointment through the Medicare AI Assistant.` +
      `</p>` +

      `<p>` +
      `Regards,<br>` +
      `Medicare AI Center` +
      `</p>`,
  });
}
