import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export default function configurePassport() {
    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    // Google OAuth Strategy
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_secret',
                callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // User exists, return user
                        return done(null, user);
                    }

                    // Check if user exists with same email
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // Link Google account to existing user
                        user.googleId = profile.id;
                        user.authMethod = 'google';
                        if (!user.profileImage && profile.photos && profile.photos.length > 0) {
                            user.profileImage = profile.photos[0].value;
                        }
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user
                    const newUser = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        phone: profile.emails[0].value.replace('@', '_'), // Temporary phone
                        authMethod: 'google',
                        role: 'consumer', // Default role
                        profileImage: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
                        isVerified: true, // Auto-verify Google users
                    });

                    done(null, newUser);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
}
