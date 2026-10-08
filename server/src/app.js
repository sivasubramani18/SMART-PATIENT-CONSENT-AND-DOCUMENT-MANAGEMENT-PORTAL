import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import documentRoutes from './routes/documents.js';
import patientRoutes from './routes/patients.js';
import consentRoutes from './routes/consents.js';
import auditRoutes from './routes/auditLogs.js';
import notificationRoutes from './routes/notifications.js';
import emergencyRoutes from './routes/emergency.js';
import securityRoutes from './routes/security.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS setup
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'ConsentIQ Medical Consent & Document Management Portal API',
    status: 'HEALTHY',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/security', securityRoutes);

// Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
