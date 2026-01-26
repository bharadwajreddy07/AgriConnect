import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'farmer@test.com';
        const newPassword = 'password123';

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found! Creating new...');
            // Create if missing
            const newUser = await User.create({
                name: 'Ramesh Farmer',
                email: email,
                password: newPassword,
                phone: '9876543210',
                role: 'farmer',
                address: {
                    street: '123 Village Road',
                    village: 'Guntur',
                    district: 'Guntur',
                    state: 'AP',
                    pincode: '522001'
                },
                region: 'South India'
            });
            console.log('User created with password:', newPassword);
        } else {
            user.password = newPassword;
            // Ensure required fields are present
            if (!user.region) user.region = 'South India';
            if (!user.address || typeof user.address !== 'object') {
                user.address = {
                    street: '123 Village Road',
                    village: 'Guntur',
                    district: 'Guntur',
                    state: 'AP',
                    pincode: '522001'
                };
            }
            await user.save();
            console.log(`Password for ${email} has been reset to: ${newPassword}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
};

resetPassword();
