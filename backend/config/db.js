import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const defaultDbName = process.env.DB_NAME || 'agrimart';
    const fallbackDevUri = `mongodb://127.0.0.1:27017/${defaultDbName}`;
    const isProduction = process.env.NODE_ENV === 'production';
    let finalMongoUri = mongoUri;

    if (!finalMongoUri && !isProduction) {
      finalMongoUri = fallbackDevUri;
    }

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
