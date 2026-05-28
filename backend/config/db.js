import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const fallbackDevUri = 'mongodb://127.0.0.1:27017/agrimart';
    const finalMongoUri =
      mongoUri || (process.env.NODE_ENV !== 'production' ? fallbackDevUri : '');

    if (!finalMongoUri) {
      throw new Error('MongoDB URI is required in production (set MONGODB_URI)');
    }

    const conn = await mongoose.connect(finalMongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
