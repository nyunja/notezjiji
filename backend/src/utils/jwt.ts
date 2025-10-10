import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthTokens, JWTPayload } from '../types/index.js';
import { supabase } from '../config/database.js';

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets not configured');
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export const generateTokens = async (
  payload: JWTPayload,
  deviceInfo?: string,
  ipAddress?: string
): Promise<AuthTokens> => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRY
  });

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await supabase.from('sessions').insert({
    user_id: payload.userId,
    token_hash: tokenHash,
    device_info: deviceInfo,
    ip_address: ipAddress,
    expires_at: expiresAt.toISOString()
  });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  const tokenHash = hashToken(token);
  await supabase.from('sessions').delete().eq('token_hash', tokenHash);
};
