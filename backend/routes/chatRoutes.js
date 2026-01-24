import express from 'express';
import {
    getChatMessages,
    sendMessage,
    markAsRead,
    getUserChats,
} from '../controllers/chatController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's chats
router.get('/', protect, authorize('farmer', 'wholesaler'), getUserChats);

// Get chat messages for a negotiation
router.get(
    '/:negotiationId',
    protect,
    authorize('farmer', 'wholesaler'),
    getChatMessages
);

// Send message
router.post(
    '/:negotiationId/message',
    protect,
    authorize('farmer', 'wholesaler'),
    sendMessage
);

// Mark message as read
router.put('/:messageId/read', protect, markAsRead);

export default router;
