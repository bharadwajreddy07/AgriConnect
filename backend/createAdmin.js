import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    role: String,
    isVerified: Boolean,
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: 'superadmin@agrimart.com' });

        if (existingAdmin) {
            // Update existing user to admin
            existingAdmin.role = 'admin';
            existingAdmin.isVerified = true;
            await existingAdmin.save();
            console.log('✅ Updated existing user to admin role');
        } else {
            // Create new admin
            const hashedPassword = await bcrypt.hash('Admin@2026', 10);

            const admin = new User({
                name: 'Super Admin',
                email: 'superadmin@agrimart.com',
                password: hashedPassword,
                phone: '0000000000',
                role: 'admin',
                isVerified: true,
            });

            await admin.save();
            console.log('✅ Admin account created successfully!');
        }

        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║     🔐 ADMIN CREDENTIALS - KEEP SECURE 🔐  ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log('\n📧 Email:    superadmin@agrimart.com');
        console.log('🔑 Password: Admin@2026');
        console.log('\n🌐 Login at: http://localhost:3000/login');
        console.log('\n⚠️  IMPORTANT: Change these credentials in production!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();
