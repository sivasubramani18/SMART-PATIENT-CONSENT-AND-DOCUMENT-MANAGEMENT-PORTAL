import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/consentiq';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: host=${conn.connection.host} db=${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
}
