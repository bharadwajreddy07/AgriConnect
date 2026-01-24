import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
    {
        negotiation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Negotiation',
            required: true,
        },
        participants: {
            farmer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            wholesaler: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        },
        messages: [
            {
                sender: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                senderRole: {
                    type: String,
                    enum: ['farmer', 'wholesaler'],
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                    maxlength: 1000,
                },
                messageType: {
                    type: String,
                    enum: ['text', 'offer', 'system'],
                    default: 'text',
                },
                isRead: {
                    type: Boolean,
                    default: false,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        lastMessage: {
            content: String,
            timestamp: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
chatSchema.index({ negotiation: 1 });
chatSchema.index({ 'participants.farmer': 1 });
chatSchema.index({ 'participants.wholesaler': 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
