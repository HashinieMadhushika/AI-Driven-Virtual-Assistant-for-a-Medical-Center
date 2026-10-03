import { Op } from 'sequelize';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import HandoverRequest from '../models/HandoverRequest.js';
import { transcribeHandoverAudio } from '../services/handoverVoiceService.js';

const OPEN_STATUSES = ['Pending', 'Active'];
const MEDICARE_PHONE =
  process.env.MEDICARE_PHONE?.trim() ||
  '+94 11 234 5678';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function cleanText(value, maxLength = 4000) {
  return String(value || '').trim().slice(0, maxLength);
}

function publicRequest(request) {
  if (!request) {
    return null;
  }

  return {
    id: request.id,
    sessionId: request.sessionId,
    firstName: request.firstName,
    email: request.email,
    reason: request.reason,
    status: request.status,
    requestedAt: request.requestedAt,
    acceptedAt: request.acceptedAt,
    resolvedAt: request.resolvedAt,
    phone: MEDICARE_PHONE,
  };
}

async function ensureSession({
  sessionId,
  firstName,
  email,
}) {
  const [session, created] =
    await ChatSession.findOrCreate({
      where: {
        id: sessionId,
      },
      defaults: {
        id: sessionId,
        firstName,
        email,
        source: 'floating-chat',
      },
    });

  if (!created) {
    await session.update({
      firstName,
      email,
    });
  }

  return session;
}

async function findPublicRequest({
  sessionId,
  email,
  openOnly = false,
}) {
  const where = {
    sessionId,
    email: normalizeEmail(email),
  };

  if (openOnly) {
    where.status = {
      [Op.in]: OPEN_STATUSES,
    };
  }

  return HandoverRequest.findOne({
    where,
    order: [['createdAt', 'DESC']],
  });
}

/*
 * Patient requests a human receptionist.
 * If an open request already exists, return it instead of creating duplicates.
 */
export const requestHandover = async (req, res) => {
  try {
    const {
      sessionId,
      firstName,
      email,
      reason,
    } = req.body ?? {};

    const cleanFirstName =
      cleanText(firstName, 120);

    const cleanEmail =
      normalizeEmail(email);

    const cleanReason =
      cleanText(
        reason ||
          'Patient requested human support',
        2000
      );

    if (
      !UUID_PATTERN.test(
        String(sessionId || '')
      ) ||
      !cleanFirstName ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      return res.status(400).json({
        error:
          'Valid sessionId, firstName, and email are required',
      });
    }

    await ensureSession({
      sessionId,
      firstName: cleanFirstName,
      email: cleanEmail,
    });

    const existing =
      await HandoverRequest.findOne({
        where: {
          sessionId,
          status: {
            [Op.in]: OPEN_STATUSES,
          },
        },
        order: [
          ['createdAt', 'DESC'],
        ],
      });

    if (existing) {
      return res.json({
        success: true,
        alreadyRequested: true,
        handover: publicRequest(existing),
        reply:
          existing.status === 'Active'
            ? `A Medicare receptionist has already joined this conversation. You can continue typing here. You can also call us on ${MEDICARE_PHONE}.`
            : `Your human support request is already waiting for reception. You can continue typing here, or call Medicare Medical Center on ${MEDICARE_PHONE}.`,
      });
    }

    const request =
      await HandoverRequest.create({
        sessionId,
        firstName: cleanFirstName,
        email: cleanEmail,
        reason: cleanReason,
        status: 'Pending',
        requestedAt: new Date(),
      });

    await ChatMessage.bulkCreate([
      {
        sessionId,
        role: 'user',
        content: cleanReason,
      },
      {
        sessionId,
        role: 'system',
        content:
          `Human support requested. A Medicare receptionist can join this conversation. ` +
          `For immediate assistance, call ${MEDICARE_PHONE}.`,
      },
    ]);

    return res.status(201).json({
      success: true,
      handover: publicRequest(request),
      reply:
        `I have requested a human receptionist for this conversation. ` +
        `You can continue typing here while you wait. ` +
        `For immediate assistance, call Medicare Medical Center on ${MEDICARE_PHONE}.`,
    });
  } catch (error) {
    console.error(
      'Failed to request human handover:',
      error
    );

    return res.status(500).json({
      error:
        'Could not request human support',
    });
  }
};

/*
 * Public patient status lookup.
 * Session id + booking email are required.
 */
export const getPublicHandoverStatus =
  async (req, res) => {
    try {
      const sessionId =
        String(
          req.params.sessionId ||
            ''
        );

      const email =
        normalizeEmail(
          req.query.email
        );

      if (
        !UUID_PATTERN.test(
          sessionId
        ) ||
        !email
      ) {
        return res.status(400).json({
          error:
            'Valid sessionId and email are required',
        });
      }

      const request =
        await findPublicRequest({
          sessionId,
          email,
        });

      return res.json({
        handover:
          publicRequest(request),
        phone:
          MEDICARE_PHONE,
      });
    } catch (error) {
      console.error(
        'Failed to get handover status:',
        error
      );

      return res.status(500).json({
        error:
          'Could not get human support status',
      });
    }
  };

/*
 * Save one patient message while the handover is Pending or Active.
 * No AI response is generated.
 */
export const savePatientHandoverMessage =
  async (req, res) => {
    try {
      const {
        sessionId,
        firstName,
        email,
        content,
      } = req.body ?? {};

      const cleanFirstName =
        cleanText(
          firstName,
          120
        );

      const cleanEmail =
        normalizeEmail(
          email
        );

      const cleanContent =
        cleanText(
          content,
          4000
        );

      if (
        !UUID_PATTERN.test(
          String(
            sessionId ||
              ''
          )
        ) ||
        !cleanFirstName ||
        !cleanEmail ||
        !cleanContent
      ) {
        return res.status(400).json({
          error:
            'Valid session details and message are required',
        });
      }

      const request =
        await findPublicRequest({
          sessionId,
          email: cleanEmail,
          openOnly: true,
        });

      if (!request) {
        return res.status(409).json({
          error:
            'Human support is not active for this session',
        });
      }

      await ensureSession({
        sessionId,
        firstName:
          cleanFirstName,
        email:
          cleanEmail,
      });

      const message =
        await ChatMessage.create({
          sessionId,
          role: 'user',
          content:
            cleanContent,
        });

      return res.status(201).json({
        success: true,
        message,
        handover:
          publicRequest(request),
      });
    } catch (error) {
      console.error(
        'Failed to save patient handover message:',
        error
      );

      return res.status(500).json({
        error:
          'Could not send message to reception',
      });
    }
  };

/*
 * Patient polling endpoint.
 * Returns admin/system messages so the patient UI can display human replies.
 */
export const getPublicHandoverMessages =
  async (req, res) => {
    try {
      const sessionId =
        String(
          req.params.sessionId ||
            ''
        );

      const email =
        normalizeEmail(
          req.query.email
        );

      const afterId =
        Number(
          req.query.afterId ||
            0
        );

      if (
        !UUID_PATTERN.test(
          sessionId
        ) ||
        !email
      ) {
        return res.status(400).json({
          error:
            'Valid sessionId and email are required',
        });
      }

      const request =
        await findPublicRequest({
          sessionId,
          email,
        });

      if (!request) {
        return res.json({
          handover: null,
          messages: [],
          phone:
            MEDICARE_PHONE,
        });
      }

      const messages =
        await ChatMessage.findAll({
          where: {
            sessionId,
            id: {
              [Op.gt]:
                Number.isFinite(
                  afterId
                )
                  ? afterId
                  : 0,
            },
            role: {
              [Op.in]: [
                'admin',
                'system',
              ],
            },
          },
          attributes: [
            'id',
            'role',
            'content',
            'createdAt',
          ],
          order: [
            ['id', 'ASC'],
          ],
        });

      return res.json({
        handover:
          publicRequest(request),
        messages,
        phone:
          MEDICARE_PHONE,
      });
    } catch (error) {
      console.error(
        'Failed to get patient handover messages:',
        error
      );

      return res.status(500).json({
        error:
          'Could not load reception messages',
      });
    }
  };

/*
 * Admin queue - pending and active handovers by default.
 */
export const getAdminHandoverRequests =
  async (req, res) => {
    try {
      const requestedStatus =
        String(
          req.query.status ||
            ''
        ).trim();

      const where =
        requestedStatus &&
        [
          'Pending',
          'Active',
          'Resolved',
        ].includes(
          requestedStatus
        )
          ? {
              status:
                requestedStatus,
            }
          : {
              status: {
                [Op.in]:
                  OPEN_STATUSES,
              },
            };

      const requests =
        await HandoverRequest.findAll({
          where,
          include: [
            {
              model:
                ChatSession,
              as:
                'session',
              attributes: [
                'id',
                'firstName',
                'email',
                'source',
                'createdAt',
              ],
            },
          ],
          order: [
            ['requestedAt', 'ASC'],
          ],
        });

      return res.json({
        phone:
          MEDICARE_PHONE,
        requests:
          requests.map(
            (request) => ({
              ...request.toJSON(),
              phone:
                MEDICARE_PHONE,
            })
          ),
      });
    } catch (error) {
      console.error(
        'Failed to load handover queue:',
        error
      );

      return res.status(500).json({
        error:
          'Could not load human support requests',
      });
    }
  };

/*
 * Admin accepts one request.
 */
export const acceptHandover =
  async (req, res) => {
    try {
      const request =
        await HandoverRequest.findByPk(
          req.params.id
        );

      if (!request) {
        return res.status(404).json({
          error:
            'Human support request not found',
        });
      }

      if (
        request.status ===
        'Resolved'
      ) {
        return res.status(409).json({
          error:
            'This human support request is already resolved',
        });
      }

      const adminId =
        Number(
          req.user?.id
        ) || null;

      if (
        request.status ===
          'Active' &&
        request.assignedAdminId &&
        adminId &&
        request.assignedAdminId !==
          adminId
      ) {
        return res.status(409).json({
          error:
            'Another admin has already accepted this conversation',
        });
      }

      await request.update({
        status:
          'Active',
        assignedAdminId:
          request.assignedAdminId ||
          adminId,
        acceptedAt:
          request.acceptedAt ||
          new Date(),
      });

      await ChatMessage.create({
        sessionId:
          request.sessionId,
        role:
          'system',
        content:
          'A Medicare receptionist has joined the conversation.',
      });

      return res.json({
        success: true,
        handover:
          publicRequest(request),
      });
    } catch (error) {
      console.error(
        'Failed to accept handover:',
        error
      );

      return res.status(500).json({
        error:
          'Could not accept human support request',
      });
    }
  };

/*
 * Admin reply. Only the assigned admin can reply when an assignment exists.
 */
export const replyToHandover =
  async (req, res) => {
    try {
      const request =
        await HandoverRequest.findByPk(
          req.params.id
        );

      const content =
        cleanText(
          req.body?.content,
          4000
        );

      if (!request) {
        return res.status(404).json({
          error:
            'Human support request not found',
        });
      }

      if (
        request.status !==
        'Active'
      ) {
        return res.status(409).json({
          error:
            'Accept this conversation before replying',
        });
      }

      const adminId =
        Number(
          req.user?.id
        ) || null;

      if (
        request.assignedAdminId &&
        adminId &&
        request.assignedAdminId !==
          adminId
      ) {
        return res.status(403).json({
          error:
            'This conversation is assigned to another admin',
        });
      }

      if (!content) {
        return res.status(400).json({
          error:
            'Message content is required',
        });
      }

      const message =
        await ChatMessage.create({
          sessionId:
            request.sessionId,
          role:
            'admin',
          content,
        });

      return res.status(201).json({
        success: true,
        message,
      });
    } catch (error) {
      console.error(
        'Failed to send admin handover reply:',
        error
      );

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Could not send reply',
      });
    }
  };

/*
 * Admin resolves the handover. AI may answer future patient messages again.
 */
export const resolveHandover =
  async (req, res) => {
    try {
      const request =
        await HandoverRequest.findByPk(
          req.params.id
        );

      if (!request) {
        return res.status(404).json({
          error:
            'Human support request not found',
        });
      }

      if (
        request.status !==
        'Resolved'
      ) {
        await request.update({
          status:
            'Resolved',
          resolvedAt:
            new Date(),
        });

        await ChatMessage.create({
          sessionId:
            request.sessionId,
          role:
            'system',
          content:
            'The human support conversation has ended. You can continue using the Medicare AI Assistant.',
        });
      }

      return res.json({
        success: true,
        handover:
          publicRequest(request),
      });
    } catch (error) {
      console.error(
        'Failed to resolve handover:',
        error
      );

      return res.status(500).json({
        error:
          'Could not resolve human support request',
      });
    }
  };


/*
 * Patient voice message while human handover is Pending or Active.
 * Audio is transcribed and stored as a patient message.
 * No Gemini/n8n AI reply is generated.
 */
export const savePatientHandoverVoiceMessage =
  async (req, res) => {
    try {
      const {
        sessionId,
        firstName,
        email,
      } = req.body ?? {};

      const cleanFirstName =
        cleanText(
          firstName,
          120
        );

      const cleanEmail =
        normalizeEmail(
          email
        );

      if (
        !UUID_PATTERN.test(
          String(
            sessionId ||
              ''
          )
        ) ||
        !cleanFirstName ||
        !cleanEmail
      ) {
        return res.status(400).json({
          error:
            'Valid session details are required',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error:
            'Audio recording is required',
        });
      }

      const request =
        await findPublicRequest({
          sessionId,
          email:
            cleanEmail,
          openOnly:
            true,
        });

      if (!request) {
        return res.status(409).json({
          error:
            'Human support is not active for this session',
        });
      }

      await ensureSession({
        sessionId,
        firstName:
          cleanFirstName,
        email:
          cleanEmail,
      });

      const transcript =
        await transcribeHandoverAudio({
          buffer:
            req.file.buffer,
          mimeType:
            req.file.mimetype,
          fileName:
            req.file.originalname ||
            'patient-handover.webm',
        });

      const message =
        await ChatMessage.create({
          sessionId,
          role:
            'user',
          content:
            transcript,
        });

      return res.status(201).json({
        success:
          true,
        transcript,
        message,
        handover:
          publicRequest(
            request
          ),
      });
    } catch (error) {
      console.error(
        'Failed to process patient handover voice message:',
        error
      );

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Could not process voice message',
      });
    }
  };

/*
 * Admin voice reply.
 * The recording is transcribed and immediately stored as role=admin.
 */
export const saveAdminHandoverVoiceReply =
  async (req, res) => {
    try {
      const request =
        await HandoverRequest.findByPk(
          req.params.id
        );

      if (!request) {
        return res.status(404).json({
          error:
            'Human support request not found',
        });
      }

      if (
        request.status !==
        'Active'
      ) {
        return res.status(409).json({
          error:
            'Accept this conversation before replying',
        });
      }

      const adminId =
        Number(
          req.user?.id
        ) || null;

      if (
        request.assignedAdminId &&
        adminId &&
        request.assignedAdminId !==
          adminId
      ) {
        return res.status(403).json({
          error:
            'This conversation is assigned to another admin',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error:
            'Audio recording is required',
        });
      }

      const transcript =
        await transcribeHandoverAudio({
          buffer:
            req.file.buffer,
          mimeType:
            req.file.mimetype,
          fileName:
            req.file.originalname ||
            'admin-handover.webm',
        });

      const message =
        await ChatMessage.create({
          sessionId:
            request.sessionId,
          role:
            'admin',
          content:
            transcript,
        });

      return res.status(201).json({
        success:
          true,
        transcript,
        message,
      });
    } catch (error) {
      console.error(
        'Failed to process admin handover voice reply:',
        error
      );

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Could not process voice reply',
      });
    }
  };
