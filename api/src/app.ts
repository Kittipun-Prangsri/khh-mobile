import express, { Express, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { requireAuth, AuthenticatedRequest } from './middleware/auth.js';

const app: Express = express();

// Security middlewares
app.use(helmet());
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // In development mode, allow all origins
      if (!origin || config.nodeEnv === 'development' || origin === config.corsOrigin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

// Logging
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.'
    }
  }
});
app.use(limiter);

import hosxpRoutes from './routes/hosxpRoutes.js';

// 1. Health check endpoint (public)
app.get('/api/v1/health', (_, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

// 2. HOSxP Integration Routes
app.use('/api/v1/hosxp', hosxpRoutes);

// 3. Auth me endpoint (protected)
app.get('/api/v1/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
      profile: req.profile
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.nodeEnv === 'production' ? 'An unexpected error occurred' : err.message
    }
  });
});

export default app;
