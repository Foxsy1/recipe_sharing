import { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import express from 'express';
import { logger } from '../middleware/logger.middleware';

/**
 * Configure security middleware for the application
 */
export function configureSecurityMiddleware(app: Application): void {
  // Security headers
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use(limiter);
}

/**
 * Configure body parsing and static file middleware
 */
export function configureParsingMiddleware(app: Application): void {
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static files
  app.use('/uploads', express.static('uploads'));
}

/**
 * Configure logging middleware
 */
export function configureLoggingMiddleware(app: Application): void {
  app.use(logger);
}

/**
 * Initialize all middleware in the correct order
 */
export function initializeMiddleware(app: Application): void {
  configureSecurityMiddleware(app);
  configureParsingMiddleware(app);
  configureLoggingMiddleware(app);
}