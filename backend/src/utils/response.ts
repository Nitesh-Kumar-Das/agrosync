import { Response } from 'express';
import { ApiResponse } from '../types/common';
export class ResponseUtil {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    return res.status(statusCode).json(response);
  }
  static error(res: Response, error: string, statusCode: number = 500): Response {
    const response: ApiResponse = {
      success: false,
      error,
    };
    return res.status(statusCode).json(response);
  }
  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message, 201);
  }
  static badRequest(res: Response, error: string): Response {
    return this.error(res, error, 400);
  }
  static notFound(res: Response, error: string = 'Resource not found'): Response {
    return this.error(res, error, 404);
  }
  static unauthorized(res: Response, error: string = 'Unauthorized'): Response {
    return this.error(res, error, 401);
  }
  static serverError(res: Response, error: string = 'Internal server error'): Response {
    return this.error(res, error, 500);
  }
}
