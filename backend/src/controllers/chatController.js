import { QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A chat counts as "Active" while its last message is newer than this; after that it is "Completed"
const ACTIVE_WINDOW_MINUTES = 30;

// Message roles written by the patient or the AI agent. Any other role (e.g. 'human', 'agent')
// means a staff member replied, so the chat counts as a human takeover.
const NON_HUMAN_ROLES = ['user', 'assistant', 'system'];

// Sessions with their latest message, message count, type (AI/Human) and status (Active/Completed)
const querySessions = (where = '', replacements = {}) =>
  sequelize.query(
    `SELECT s.id,
            s."firstName",
            s.email,
            s.source,
            s."createdAt",
            last.role        AS "lastRole",
            last.content     AS "lastContent",
            last."createdAt" AS "lastCreatedAt",
            stats."messageCount",
            COALESCE(stats."hasHumanReply", false) AS "hasHumanReply",
            COALESCE(last."createdAt", s."createdAt") AS "lastActivityAt",
            COALESCE(last."createdAt", s."createdAt") >= NOW() - make_interval(mins => :activeMinutes) AS "isActive"
       FROM chat_sessions s
       LEFT JOIN LATERAL (
         SELECT m.role, m.content, m."createdAt"
           FROM chat_messages m
          WHERE m."sessionId" = s.id
          ORDER BY m."createdAt" DESC, m.id DESC
          LIMIT 1
       ) last ON true
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int AS "messageCount",
                BOOL_OR(m.role NOT IN (:nonHumanRoles)) AS "hasHumanReply"
           FROM chat_messages m
          WHERE m."sessionId" = s.id
       ) stats ON true
      ${where}
      ORDER BY "lastActivityAt" DESC`,
    {
      replacements: { activeMinutes: ACTIVE_WINDOW_MINUTES, nonHumanRoles: NON_HUMAN_ROLES, ...replacements },
      type: QueryTypes.SELECT
    }
  );

const toSession = (r) => ({
  id: r.id,
  firstName: r.firstName,
  email: r.email,
  source: r.source,
  createdAt: r.createdAt,
  lastActivityAt: r.lastActivityAt,
  messageCount: r.messageCount,
  type: r.hasHumanReply ? 'Human' : 'AI',
  status: r.isActive ? 'Active' : 'Completed',
  lastMessage: r.lastCreatedAt
    ? { role: r.lastRole, content: r.lastContent, createdAt: r.lastCreatedAt }
    : null
});

export const saveMessages = async (req, res) => {
  try {
    const { sessionId, firstName, email, messages } = req.body;
    if (
      !UUID_PATTERN.test(sessionId ?? '') ||
      typeof firstName !== 'string' || !firstName.trim() ||
      typeof email !== 'string' || !email.trim() ||
      !Array.isArray(messages) || messages.length === 0 ||
      messages.some((message) =>
        !['assistant', 'user', 'system'].includes(message?.role) ||
        typeof message.content !== 'string'
      )
    ) {
      return res.status(400).json({ error: 'Valid session details and messages are required' });
    }

    await ChatSession.findOrCreate({
      where: { id: sessionId },
      defaults: {
        id: sessionId,
        firstName: firstName.trim(),
        email: email.trim().toLowerCase()
      }
    });

    await Promise.all(messages.map((message) => ChatMessage.findOrCreate({
      where: { sessionId, role: message.role, content: message.content },
      defaults: { sessionId, role: message.role, content: message.content }
    })));

    return res.status(201).json({ sessionId });
  } catch (error) {
    console.error('Failed to save chat messages:', error);
    return res.status(500).json({ error: 'Failed to save chat messages' });
  }
};

// Get all chat sessions, most recently active first
export const getChatSessions = async (req, res) => {
  try {
    const rows = await querySessions();
    res.json({ sessions: rows.map(toSession) });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ message: 'Error fetching chat sessions', error: error.message });
  }
};

// Get one chat session and all of its messages, oldest first
export const getChatSessionMessages = async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_PATTERN.test(id)) {
      return res.status(400).json({ message: 'Invalid session id' });
    }

    const [session] = await querySessions('WHERE s.id = :id', { id });
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const messages = await sequelize.query(
      `SELECT id, role, content, "createdAt"
         FROM chat_messages
        WHERE "sessionId" = :id
        ORDER BY "createdAt" ASC, id ASC`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    res.json({ session: toSession(session), messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Error fetching chat messages', error: error.message });
  }
};
