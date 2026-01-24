import Chat from '../models/Chat.js';

// @desc    Get chat messages for a negotiation
// @route   GET /api/chats/:negotiationId
// @access  Private (Farmer or Wholesaler involved)
export const getChatMessages = async (req, res) => {
    try {
        const chat = await Chat.findOne({ negotiation: req.params.negotiationId })
            .populate('participants.farmer', 'name profileImage')
            .populate('participants.wholesaler', 'name profileImage')
            .populate('messages.sender', 'name profileImage');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check authorization
        const isFarmer =
            chat.participants.farmer._id.toString() === req.user._id.toString();
        const isWholesaler =
            chat.participants.wholesaler._id.toString() === req.user._id.toString();

        if (!isFarmer && !isWholesaler) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({
            success: true,
            data: chat,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/chats/:negotiationId/message
// @access  Private (Farmer or Wholesaler)
export const sendMessage = async (req, res) => {
    try {
        const { content } = req.body;

        let chat = await Chat.findOne({ negotiation: req.params.negotiationId });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check authorization
        const isFarmer =
            chat.participants.farmer.toString() === req.user._id.toString();
        const isWholesaler =
            chat.participants.wholesaler.toString() === req.user._id.toString();

        if (!isFarmer && !isWholesaler) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const senderRole = isFarmer ? 'farmer' : 'wholesaler';

        // Add message
        chat.messages.push({
            sender: req.user._id,
            senderRole,
            content,
            messageType: 'text',
        });

        chat.lastMessage = {
            content,
            timestamp: new Date(),
        };

        await chat.save();

        // Populate the newly added message
        chat = await Chat.findById(chat._id)
            .populate('participants.farmer', 'name profileImage')
            .populate('participants.wholesaler', 'name profileImage')
            .populate('messages.sender', 'name profileImage');

        const newMessage = chat.messages[chat.messages.length - 1];

        res.status(201).json({
            success: true,
            data: newMessage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mark message as read
// @route   PUT /api/chats/:messageId/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const chat = await Chat.findOne({ 'messages._id': req.params.messageId });

        if (!chat) {
            return res.status(404).json({ message: 'Message not found' });
        }

        const message = chat.messages.id(req.params.messageId);
        message.isRead = true;

        await chat.save();

        res.json({
            success: true,
            message: 'Message marked as read',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
export const getUserChats = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'farmer') {
            query['participants.farmer'] = req.user._id;
        } else if (req.user.role === 'wholesaler') {
            query['participants.wholesaler'] = req.user._id;
        }

        const chats = await Chat.find(query)
            .populate('participants.farmer', 'name profileImage')
            .populate('participants.wholesaler', 'name profileImage')
            .populate('negotiation', 'status currentOffer')
            .sort({ 'lastMessage.timestamp': -1 });

        res.json({
            success: true,
            count: chats.length,
            data: chats,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
