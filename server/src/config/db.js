import mongoose from 'mongoose';
import dns from 'dns';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/consentiq';
    
    // On Windows and certain ISP routers, SRV record lookups for mongodb+srv can fail (querySrv ECONNREFUSED).
    // Using public resolvers (Google / Cloudflare) guarantees reliable connection to MongoDB Atlas.
    if (mongoUri.startsWith('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
      } catch (dnsErr) {
        console.warn('[DNS Warning]: Could not set custom DNS servers:', dnsErr.message);
      }
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: host=${conn.connection.host} db=${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
}

