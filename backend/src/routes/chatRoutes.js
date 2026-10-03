import express from 'express';
import multer from 'multer';
import {
  getChatSessions,
  getChatSessionMessages,
  requestChatHistoryCode,
  saveMessages,
  verifyChatHistoryCode,
} from '../controllers/chatController.js';
import {
  acceptHandover,
  getAdminHandoverRequests,
  getPublicHandoverMessages,
  getPublicHandoverStatus,
  replyToHandover,
  requestHandover,
  resolveHandover,
  savePatientHandoverMessage,
  savePatientHandoverVoiceMessage,
  saveAdminHandoverVoiceReply,
} from '../controllers/handoverController.js';
import {
  authenticateToken,
  authorizeRole,
} from '../middleware/authMiddleware.js';

const router = express.Router();

const handoverAudioUpload =
  multer({
    storage:
      multer.memoryStorage(),
    limits: {
      fileSize:
        8 * 1024 * 1024,
    },
    fileFilter:
      (
        req,
        file,
        cb
      ) => {
        if (
          !String(
            file.mimetype ||
              ''
          ).startsWith(
            'audio/'
          )
        ) {
          return cb(
            new Error(
              'Only audio files are allowed'
            )
          );
        }

        cb(
          null,
          true
        );
      },
  });

/*
 * Public patient/chat routes.
 */
router.post(
  '/history/request-code',
  requestChatHistoryCode
);

router.post(
  '/history/verify-code',
  verifyChatHistoryCode
);

router.post(
  '/messages',
  saveMessages
);

/*
 * Human handover routes used by the patient-facing chatbot.
 * These intentionally appear before the admin JWT middleware.
 */
router.post(
  '/handover/request',
  requestHandover
);

router.get(
  '/handover/status/:sessionId',
  getPublicHandoverStatus
);

router.post(
  '/handover/messages',
  savePatientHandoverMessage
);

router.post(
  '/handover/voice',
  handoverAudioUpload.single(
    'audio'
  ),
  savePatientHandoverVoiceMessage
);

router.get(
  '/handover/messages/:sessionId',
  getPublicHandoverMessages
);

/*
 * Everything below contains patient chat/support data and is admin-only.
 */
router.use(
  authenticateToken,
  authorizeRole('admin')
);

/*
 * Human support queue/actions.
 */
router.get(
  '/handover/requests',
  getAdminHandoverRequests
);

router.post(
  '/handover/:id/accept',
  acceptHandover
);

router.post(
  '/handover/:id/reply',
  replyToHandover
);

router.post(
  '/handover/:id/voice-reply',
  handoverAudioUpload.single(
    'audio'
  ),
  saveAdminHandoverVoiceReply
);

router.post(
  '/handover/:id/resolve',
  resolveHandover
);

/*
 * Existing admin chat history routes.
 */
router.get(
  '/sessions',
  getChatSessions
);

router.get(
  '/sessions/:id',
  getChatSessionMessages
);

export default router;
