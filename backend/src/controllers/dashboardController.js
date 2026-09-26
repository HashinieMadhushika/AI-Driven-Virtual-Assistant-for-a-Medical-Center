import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

// "Today" in the server's local time, e.g. 2026-09-26
const getTodayKey = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Get the counts shown on the admin dashboard stat cards
export const getDashboardStats = async (req, res) => {
  try {
    const today = getTodayKey();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      [chatRow],
      totalAppointmentsToday,
      patientsServedToday,
      doctorsAvailableToday
    ] = await Promise.all([
      // chat_sessions / chat_messages are written by the n8n chat agent (no Sequelize model)
      sequelize.query(
        'SELECT COUNT(DISTINCT "sessionId")::int AS count FROM chat_messages WHERE "createdAt" >= :startOfToday',
        { replacements: { startOfToday }, type: QueryTypes.SELECT }
      ),
      Appointment.count({ where: { appointmentDate: today } }),
      Appointment.count({
        where: { appointmentDate: today, status: 'Completed' },
        distinct: true,
        col: 'patientId'
      }),
      Doctor.count()
    ]);

    res.json({
      activeAIConversationsToday: chatRow?.count ?? 0,
      totalAppointmentsToday,
      patientsServedToday,
      doctorsAvailableToday
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// Latest chat sessions from the n8n chat agent, most recently active first
export const getRecentChats = async (req, res) => {
  try {
    const chats = await sequelize.query(
      `SELECT s.id,
              s."firstName",
              s.source,
              COALESCE(MAX(m."createdAt"), s."createdAt") AS "lastActivityAt",
              COUNT(m.id)::int AS "messageCount"
         FROM chat_sessions s
         LEFT JOIN chat_messages m ON m."sessionId" = s.id
        GROUP BY s.id
        ORDER BY "lastActivityAt" DESC
        LIMIT 5`,
      { type: QueryTypes.SELECT }
    );

    res.json(chats);
  } catch (error) {
    console.error('Error fetching recent chats:', error);
    res.status(500).json({ message: 'Error fetching recent chats', error: error.message });
  }
};

// Today's appointments with patient and doctor names, earliest first
export const getTodaysAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { appointmentDate: getTodayKey() },
      include: [
        { model: Patient, attributes: ['firstName', 'lastName'] },
        { model: Doctor, attributes: ['name'] }
      ],
      order: [['appointmentTime', 'ASC']]
    });

    res.json(
      appointments.map((a) => ({
        id: a.id,
        patientName: a.Patient ? `${a.Patient.firstName} ${a.Patient.lastName}`.trim() : 'Unknown patient',
        doctorName: a.Doctor?.name ?? 'Unknown doctor',
        appointmentTime: a.appointmentTime,
        status: a.status
      }))
    );
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ message: "Error fetching today's appointments", error: error.message });
  }
};
