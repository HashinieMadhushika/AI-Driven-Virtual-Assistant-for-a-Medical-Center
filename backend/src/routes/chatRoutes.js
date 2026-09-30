import express from 'express';
import {
	getChatSessions,
	getChatSessionMessages,
	requestChatHistoryCode,
	saveMessages,
	verifyChatHistoryCode,
} from '../controllers/chatController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/history/request-code', requestChatHistoryCode);
router.post('/history/verify-code', verifyChatHistoryCode);
router.post('/messages', saveMessages);

// Chat conversations contain patient data - admin only
router.use(authenticateToken, authorizeRole('admin'));

// All chat sessions with their latest message
router.get('/sessions', getChatSessions);

// Messages of one chat session
router.get('/sessions/:id', getChatSessionMessages);

export default router;
