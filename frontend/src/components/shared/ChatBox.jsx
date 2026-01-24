import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { getRelativeTime } from '../../utils/cropData';
import io from 'socket.io-client';

const ChatBox = ({ negotiationId, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        loadMessages();

        // Initialize Socket.io connection
        socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

        // Join negotiation room
        socketRef.current.emit('join_negotiation', negotiationId);

        // Listen for new messages
        socketRef.current.on('new_message', (message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave_negotiation', negotiationId);
                socketRef.current.disconnect();
            }
        };
    }, [negotiationId]);

    const loadMessages = async () => {
        try {
            const response = await api.get(`/chats/${negotiationId}`);
            setMessages(response.data.data.messages || []);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await api.post(`/chats/${negotiationId}/message`, {
                content: newMessage.trim(),
            });

            const sentMessage = response.data.data;

            // Emit socket event for real-time delivery
            socketRef.current.emit('send_message', {
                negotiationId,
                message: sentMessage,
            });

            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            toast.error('Failed to send message');
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="chat-container">
                <div className="flex items-center justify-center" style={{ height: '100%' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="flex items-center gap-3">
                    <span>💬</span>
                    <span>Negotiation Chat</span>
                </div>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💬</div>
                        <p className="empty-state-title">No messages yet</p>
                        <p className="empty-state-description">
                            Start the conversation by sending a message below
                        </p>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isOwnMessage = message.sender?._id === currentUser._id;
                        return (
                            <div
                                key={message._id || index}
                                className={`chat-message ${isOwnMessage ? 'own-message' : ''}`}
                            >
                                <div className="chat-message-avatar">
                                    {getInitials(message.sender?.name || 'User')}
                                </div>
                                <div className="chat-message-content">
                                    <div className="chat-message-bubble">
                                        {message.content}
                                    </div>
                                    <div className="chat-message-time">
                                        {getRelativeTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-container">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                />
                <button
                    type="submit"
                    className="chat-send-button"
                    disabled={sending || !newMessage.trim()}
                >
                    {sending ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
