import { Request, Response, NextFunction } from 'express';
import logger from './logger';
export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  logger.error(`Error: ${message}`, {
    statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.url} not found`,
  });
};
