import { QueryTypes } from 'sequelize';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import sequelize from '../config/db.js';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import ChatAccessCode from '../models/ChatAccessCode.js';
import sendEmail from '../utils/sendEmail.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A chat counts as "Active" while its last message is newer than this; after that it is "Completed"
const ACTIVE_WINDOW_MINUTES = 30;

// Message roles written by the patient or the AI agent. Any other role (e.g. 'human', 'agent')
// means a staff member replied, so the chat counts as a human takeover.
const NON_HUMAN_ROLES = ['user', 'assistant', 'system'];
const CHAT_CODE_TTL_MINUTES = 10;
const CHAT_CODE_RESEND_SECONDS = 60;
const CHAT_CODE_MAX_ATTEMPTS = 5;

const normalizeIdentity = ({ firstName, email }) => ({
  firstName: firstName.trim().replace(/\s+/g, ' ').toLowerCase(),
  email: email.trim().toLowerCase(),
});

const hashAccessCode = (email, code) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return createHmac('sha256', process.env.JWT_SECRET)
    .update(`${email}:${code}`)
    .digest('hex');
};

const invalidVerification = (res) =>
  res.status(400).json({ error: 'The verification code is invalid or expired.' });

export const requestChatHistoryCode = async (req, res) => {
  try {
    const { firstName, email } = req.body ?? {};
    if (
      typeof firstName !== 'string' || !firstName.trim() || firstName.trim().length > 120 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({ error: 'Enter a valid name and email address.' });
    }

    const identity = normalizeIdentity({ firstName, email });
    const now = new Date();
    const existingCode = await ChatAccessCode.findOne({ where: { email: identity.email } });
    if (
      existingCode &&
      now.getTime() - new Date(existingCode.requestedAt).getTime() < CHAT_CODE_RESEND_SECONDS * 1000
    ) {
      return res.status(429).json({ error: 'Please wait before requesting another code.' });
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const codeData = {
      email: identity.email,
      firstName: identity.firstName,
      codeHash: hashAccessCode(identity.email, code),
      attempts: 0,
      expiresAt: new Date(now.getTime() + CHAT_CODE_TTL_MINUTES * 60 * 1000),
      requestedAt: now,
    };

    if (existingCode) {
      await existingCode.update(codeData);
    } else {
      await ChatAccessCode.create(codeData);
    }

    try {
      await sendEmail(
        identity.email,
        'Verify access to your chat history',
        `Your verification code is ${code}. It expires in ${CHAT_CODE_TTL_MINUTES} minutes. If you did not request this, you can ignore this email.`
      );
    } catch (error) {
      await ChatAccessCode.destroy({ where: { email: identity.email } });
      console.error('Failed to send chat history verification code:', error);
      return res.status(503).json({ error: 'We could not send a verification code. Please try again later.' });
    }

    return res.status(202).json({ message: 'Check your email for a verification code.' });
  } catch (error) {
    console.error('Failed to request chat history verification:', error);
    return res.status(500).json({ error: 'Could not start chat history verification.' });
  }
};

export const verifyChatHistoryCode = async (req, res) => {
  try {
    const { firstName, email, code } = req.body ?? {};
    if (
      typeof firstName !== 'string' || !firstName.trim() ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof code !== 'string' || !/^\d{6}$/.test(code)
    ) {
      return invalidVerification(res);
    }

    const identity = normalizeIdentity({ firstName, email });
    const savedCode = await ChatAccessCode.findOne({ where: { email: identity.email } });
    if (!savedCode || new Date(savedCode.expiresAt).getTime() <= Date.now()) {
      if (savedCode) await savedCode.destroy();
      return invalidVerification(res);
    }

    const expectedHash = Buffer.from(savedCode.codeHash, 'hex');
    const actualHash = Buffer.from(hashAccessCode(identity.email, code), 'hex');
    const identityMatches = savedCode.firstName === identity.firstName;
    const codeMatches = expectedHash.length === actualHash.length && timingSafeEqual(expectedHash, actualHash);
    if (!identityMatches || !codeMatches) {
      const attempts = savedCode.attempts + 1;
      if (attempts >= CHAT_CODE_MAX_ATTEMPTS) {
        await savedCode.destroy();
      } else {
        await savedCode.update({ attempts });
      }
      return invalidVerification(res);
    }

    await savedCode.destroy();

    const [session] = await sequelize.query(
      `SELECT id
         FROM chat_sessions
        WHERE lower(btrim(email)) = :email
        ORDER BY "createdAt" DESC
        LIMIT 1`,
      { replacements: { email: identity.email }, type: QueryTypes.SELECT }
    );

    if (!session) {
      return res.json({ history: null });
    }

    const messages = await sequelize.query(
      `SELECT role, content
         FROM chat_messages
        WHERE "sessionId" = :sessionId
          AND role IN ('assistant', 'user')
        ORDER BY "createdAt" ASC, id ASC`,
      { replacements: { sessionId: session.id }, type: QueryTypes.SELECT }
    );

    return res.json({ history: { sessionId: session.id, messages } });
  } catch (error) {
    console.error('Failed to verify chat history access:', error);
    return res.status(500).json({ error: 'Could not verify chat history access.' });
  }
};

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
