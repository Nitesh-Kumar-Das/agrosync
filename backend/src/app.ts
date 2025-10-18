import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './middleware/logger';
import authRoutes from './routes/authRoutes';
import cropRoutes from './routes/cropRoutes';
import diseaseRoutes from './routes/diseaseRoutes';
import fertilizerRoutes from './routes/fertilizerRoutes';
import yieldRoutes from './routes/yieldRoutes';
import mlService from './services/mlService';
dotenv.config();
const app: Application = express();
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created upload directory: ${uploadDir}`);
}
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
    });
  },
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.PYTHON_API_URL || "http://127.0.0.1:8000"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});
app.get('/health', async (_req: Request, res: Response) => {
  const mlServiceHealthy = await mlService.healthCheck();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      mlService: mlServiceHealthy ? 'healthy' : 'unhealthy',
    },
  });
});
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'AgroAI Assistant API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      crop: '/api/crop',
      disease: '/api/disease',
      fertilizer: '/api/fertilizer',
      yield: '/api/yield',
      health: '/health',
    },
  });
});
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/crop', apiLimiter, cropRoutes);
app.use('/api/disease', apiLimiter, diseaseRoutes);
app.use('/api/fertilizer', apiLimiter, fertilizerRoutes);
app.use('/api/yield', apiLimiter, yieldRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
