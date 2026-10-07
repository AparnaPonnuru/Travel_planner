import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voyageai';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('localhost')) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 1500 });
      console.log('✅ Connected to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));
    } catch {
      console.log('💡 Note: Local MongoDB not active. Running in in-memory mode (trips work immediately!).');
      console.log('   To persist to cloud DB, add your MongoDB Atlas URI to server/.env');
    }
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Atlas:', uri.replace(/\/\/.*@/, '//***@'));
  } catch (error: any) {
    console.warn(`⚠️  MongoDB Atlas connection error: ${error.message}`);
    console.log('   Running in in-memory fallback mode.');
  }
}

mongoose.connection.on('disconnected', () => {
  // Silent or info only when explicitly connected before
});

mongoose.connection.on('error', (err) => {
  // Suppress local connection refuse spam
  if (err?.message?.includes('ECONNREFUSED')) return;
  console.warn('⚠️  MongoDB notice:', err.message);
});
