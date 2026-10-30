import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[ConsentIQ API]: Server running on http://127.0.0.1:${PORT}`);
    });

    const shutdown = () => {
      console.log('\n[ConsentIQ API]: Gracefully terminating server...');
      server.close(() => {
        console.log('[ConsentIQ API]: Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[ConsentIQ API]: Fatal startup error:', error);
    process.exit(1);
  }
}

bootstrap();
