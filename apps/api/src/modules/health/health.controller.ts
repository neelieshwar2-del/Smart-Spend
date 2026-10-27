import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../../prisma/client.js';
import { config } from '../../config/index.js';
import { ApiResponse } from '../../types/index.js';

export async function getHealth(_req: Request, res: Response<ApiResponse<any>>): Promise<void> {
  const dbHealth = await checkDatabaseHealth();

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'smartspend-backend',
      version: '1.0.0',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        provider: 'postgresql',
        connected: dbHealth.connected,
        ...(dbHealth.message ? { message: dbHealth.message } : {})
      }
    }
  });
}
