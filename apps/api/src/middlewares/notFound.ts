import { Request, Response } from 'express';
import { ApiErrorResponse } from '../types/index.js';

export function notFoundHandler(req: Request, res: Response<ApiErrorResponse>): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`
    }
  });
}
