import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Import database connection
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import sampleRoutes from './routes/sampleRoutes.js';
import negotiationRoutes from './routes/negotiationRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import marketplaceRoutes from './routes/marketplaceRoutes.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files (uploaded images/videos)
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/marketplace', marketplaceRoutes);
import User from './models/User.js';
app.get('/api/seed', async (req, res) => {
    try {
        const farmer = await User.findOne({ email: 'farmer@test.com' });
        if (!farmer) {
            await User.create({
                name: 'Ramesh Farmer',
                email: 'farmer@test.com',
                password: 'password123',
                phone: '9876543210',
                role: 'farmer',
                address: { street: '123 Village', village: 'Guntur', district: 'Guntur', state: 'AP', pincode: '522001' },
                region: 'South India'
            });
        }
        const consumer = await User.findOne({ email: 'consumer@test.com' });
        if (!consumer) {
            await User.create({
                name: 'Test Consumer',
                email: 'consumer@test.com',
                password: 'password123',
                phone: '9000000000',
                role: 'consumer'
            });
        }
        res.json({ message: 'Database Seeded Successfully! You can now login with password123' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to AgriMart API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            crops: '/api/crops',
            samples: '/api/samples',
            negotiations: '/api/negotiations',
            orders: '/api/orders',
            chats: '/api/chats',
            admin: '/api/admin',
        },
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // Join negotiation room
    socket.on('join_negotiation', (negotiationId) => {
        socket.join(`negotiation_${negotiationId}`);
        console.log(`User joined negotiation room: ${negotiationId}`);
    });

    // Handle new message
    socket.on('send_message', (data) => {
        const { negotiationId, message } = data;
        // Broadcast to all users in the negotiation room
        io.to(`negotiation_${negotiationId}`).emit('new_message', message);
    });

    // Handle new offer
    socket.on('new_offer', (data) => {
        const { negotiationId, offer } = data;
        io.to(`negotiation_${negotiationId}`).emit('offer_update', offer);
    });

    // Handle order status update
    socket.on('order_status_update', (data) => {
        const { orderId, status } = data;
        io.to(`order_${orderId}`).emit('status_changed', status);
    });

    // Leave negotiation room
    socket.on('leave_negotiation', (negotiationId) => {
        socket.leave(`negotiation_${negotiationId}`);
        console.log(`User left negotiation room: ${negotiationId}`);
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║   🌾 AgriMart Backend Server Running 🌾   ║
║                                           ║
║   Port: ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   Database: MongoDB                       ║
║   Socket.io: Enabled                      ║
║                                           ║
╚═══════════════════════════════════════════╝
  `);
});

export default app;
