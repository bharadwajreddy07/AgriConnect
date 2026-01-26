import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://agriconnect-n94c.onrender.com';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                autoConnect: true,
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket connected:', this.socket.id);
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
            });

            this.socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinNegotiation(negotiationId) {
        if (this.socket) {
            this.socket.emit('join_negotiation', negotiationId);
        }
    }

    leaveNegotiation(negotiationId) {
        if (this.socket) {
            this.socket.emit('leave_negotiation', negotiationId);
        }
    }

    sendMessage(negotiationId, message) {
        if (this.socket) {
            this.socket.emit('send_message', { negotiationId, message });
        }
    }

    onNewMessage(callback) {
        if (this.socket) {
            this.socket.on('new_message', callback);
        }
    }

    onOfferUpdate(callback) {
        if (this.socket) {
            this.socket.on('offer_update', callback);
        }
    }

    offNewMessage() {
        if (this.socket) {
            this.socket.off('new_message');
        }
    }

    offOfferUpdate() {
        if (this.socket) {
            this.socket.off('offer_update');
        }
    }
}

const socketService = new SocketService();
export default socketService;
