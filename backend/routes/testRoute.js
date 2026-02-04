// Test endpoint to verify wholesale orders route is working
import express from 'express';

const router = express.Router();

// Simple test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'Wholesale orders route is working!' });
});

export default router;
