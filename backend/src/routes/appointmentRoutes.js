import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import {
  authenticateToken,
  authorizeRole,
} from '../middleware/authMiddleware.js';

const router = express.Router();

/*
 * =========================================================
 * PUBLIC PATIENT / ASSISTANT ROUTES
 * =========================================================
 *
 * These routes intentionally sit BEFORE:
 *
 * router.use(authenticateToken)
 *
 * They are used by the patient-facing n8n/chat assistant.
 *
 * IMPORTANT:
 * /public/availability MUST appear before /public/:id
 * because otherwise Express could treat:
 *
 * "availability"
 *
 * as an appointment ID.
 */

/*
 * Get doctor availability.
 *
 * Combines:
 * - doctor's configured availableTimes
 * - existing DB appointments
 * - doctor's Google Calendar busy periods
 *
 * Example:
 *
 * GET /api/appointments/public/availability
 *   ?doctorId=7
 *   &date=2026-10-16
 *
 * For rescheduling:
 *
 * GET /api/appointments/public/availability
 *   ?doctorId=7
 *   &date=2026-10-19
 *   &excludeAppointmentId=12
 */
router.get(
  '/public/availability',
  appointmentController.getPublicAvailability
);

/*
 * Synchronize a newly-created appointment.
 *
 * The n8n booking workflow currently creates the appointment
 * using its guarded Postgres INSERT.
 *
 * After that INSERT succeeds, n8n calls this endpoint so the
 * backend can:
 *
 * 1. create the doctor's Google Calendar event
 * 2. save googleCalendarEventId
 * 3. send the patient confirmation email
 *
 * Requires:
 * - appointment ID in the URL
 * - patient's booking email in the request body
 *
 * Example body:
 *
 * {
 *   "email": "patient@example.com"
 * }
 */
router.post(
  '/public/:id/sync-created',
  appointmentController.syncPublicCreatedAppointment
);

/*
 * Look up one appointment using:
 *
 * appointment reference + patient email
 *
 * Example:
 *
 * GET /api/appointments/public/12?email=patient@example.com
 */
router.get(
  '/public/:id',
  appointmentController.lookupPublicAppointment
);

/*
 * Cancel an appointment.
 *
 * The updated controller:
 *
 * 1. marks the DB appointment Cancelled
 * 2. removes the doctor's Google Calendar event
 * 3. sends the patient cancellation email
 */
router.post(
  '/public/:id/cancel',
  appointmentController.cancelPublicAppointment
);

/*
 * Reschedule an appointment.
 *
 * The updated controller:
 *
 * 1. validates DB conflicts
 * 2. updates the appointment date/time
 * 3. updates the doctor's Google Calendar event
 * 4. sends the patient reschedule email
 */
router.post(
  '/public/:id/reschedule',
  appointmentController.reschedulePublicAppointment
);

/*
 * =========================================================
 * AUTHENTICATED ROUTES
 * =========================================================
 */

router.use(authenticateToken);

/*
 * Get all appointments for the currently logged-in doctor.
 */
router.get(
  '/',
  appointmentController.getDoctorAppointments
);

/*
 * Get today's appointments for the logged-in doctor.
 */
router.get(
  '/today',
  appointmentController.getTodaysAppointments
);

/*
 * Get appointment statistics for the logged-in doctor.
 */
router.get(
  '/stats',
  appointmentController.getAppointmentStats
);

/*
 * Create a new appointment from the authenticated doctor flow.
 *
 * The updated controller also:
 *
 * - creates the doctor's Google Calendar event
 * - stores googleCalendarEventId
 * - sends a patient confirmation email
 */
router.post(
  '/',
  appointmentController.createAppointment
);

/*
 * Create a new appointment for any doctor.
 *
 * Admin only.
 *
 * The updated controller also performs
 * Google Calendar + patient email synchronization.
 */
router.post(
  '/admin',
  authorizeRole('admin'),
  appointmentController.createAppointmentByAdmin
);

/*
 * Update appointment.
 *
 * For doctor-authenticated changes:
 *
 * - date/time change -> update Google Calendar event
 * - status changed to Cancelled -> delete Calendar event
 */
router.put(
  '/:id',
  appointmentController.updateAppointment
);

/*
 * Delete appointment.
 *
 * The updated controller removes the doctor's
 * Google Calendar event before deleting the DB record.
 */
router.delete(
  '/:id',
  appointmentController.deleteAppointment
);

export default router;