import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UserPayload } from '../types/index.js';

export interface RefreshTokenPayload extends UserPayload {
  family: string;
}

export function signAccessToken(payload: UserPayload): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as any,
  });
}

export function signRefreshToken(payload: UserPayload, family: string): string {
  const tokenPayload: RefreshTokenPayload = {
    ...payload,
    family,
  };
  return jwt.sign(tokenPayload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as any,
    jwtid: crypto.randomUUID(),
  });
}

export function verifyAccessToken(token: string): UserPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as UserPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
