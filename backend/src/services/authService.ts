import bcrypt from 'bcrypt';
import { supabase } from '../config/database.js';
import { User, AuthTokens, UserRole } from '../types/index.js';
import { generateTokens, verifyRefreshToken, hashToken, revokeRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { cacheService } from '../config/redis.js';

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60;

export class AuthService {
  async register(
    email: string,
    password: string,
    full_name: string,
    role: string
  ): Promise<{ user: Partial<User>; tokens: AuthTokens }> {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name,
        role
      })
      .select('id, email, role, full_name, is_verified, created_at')
      .single();

    if (error || !user) {
      throw new AppError(500, 'Failed to create user');
    }

    const tokens = await generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole
    });

    return { user, tokens };
  }

  async login(
    email: string,
    password: string,
    ipAddress?: string,
    deviceInfo?: string
  ): Promise<{ user: Partial<User>; tokens: AuthTokens }> {
    const lockoutKey = `lockout:${email}`;
    const isLockedOut = await cacheService.get<boolean>(lockoutKey);

    if (isLockedOut) {
      throw new AppError(429, 'Account temporarily locked. Please try again later');
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error || !user) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (user.is_suspended) {
      throw new AppError(403, 'Account suspended');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      const failedAttempts = user.failed_login_attempts + 1;

      await supabase
        .from('users')
        .update({ failed_login_attempts: failedAttempts })
        .eq('id', user.id);

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        await cacheService.set(lockoutKey, true, LOCKOUT_DURATION);
        throw new AppError(429, 'Too many failed attempts. Account locked for 15 minutes');
      }

      throw new AppError(401, 'Invalid credentials');
    }

    await supabase
      .from('users')
      .update({
        failed_login_attempts: 0,
        last_login_at: new Date().toISOString()
      })
      .eq('id', user.id);

    const tokens = await generateTokens(
      {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole
      },
      deviceInfo,
      ipAddress
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const tokenHash = hashToken(refreshToken);

      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('token_hash', tokenHash)
        .eq('user_id', payload.userId)
        .maybeSingle();

      if (!session) {
        throw new AppError(401, 'Invalid refresh token');
      }

      if (new Date(session.expires_at) < new Date()) {
        await supabase.from('sessions').delete().eq('id', session.id);
        throw new AppError(401, 'Refresh token expired');
      }

      await supabase.from('sessions').delete().eq('id', session.id);

      const newTokens = await generateTokens(
        payload,
        session.device_info,
        session.ip_address
      );

      return newTokens;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new AppError(401, 'Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await revokeRefreshToken(refreshToken);
  }

  async getUserSessions(userId: string) {
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, device_info, ip_address, created_at, expires_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return sessions || [];
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);
  }
}

export const authService = new AuthService();
