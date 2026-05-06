/**
 * Authentication Utilities
 * Handles JWT token creation/verification, password hashing, and auth helpers
 */

import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRY = '30d'; // Token expires in 30 days

// ===================== Password Hashing =====================

/**
 * Hash a password using bcrypt
 * Used during user registration
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

/**
 * Compare a plain password with hashed password
 * Used during login authentication
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcryptjs.compare(plainPassword, hashedPassword);
}

// ===================== JWT Token Management =====================

/**
 * JWT payload interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'patient' | 'doctor';
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token
 * Called after successful login
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Verify JWT token
 * Used in protected API routes and middleware
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decode JWT token without verification
 * Useful for extracting payload before verification
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// ===================== Cookie Management =====================

/**
 * Set auth token in HTTP-only cookie
 * Used after successful login
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
    sameSite: 'lax', // CSRF protection
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    path: '/',
  });
}

/**
 * Get auth token from cookies
 * Used in API routes and middleware
 */
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
}

/**
 * Clear auth cookie
 * Used on logout
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

// ===================== Auth Middleware =====================

/**
 * Get current authenticated user from request
 * Used in API routes
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = verifyToken(token);
  return payload;
}

/**
 * Verify user is authenticated
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<JWTPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Please log in');
  }
  return user;
}

/**
 * Verify user has specific role
 * Throws error if role doesn't match
 */
export async function requireRole(requiredRole: 'patient' | 'doctor'): Promise<JWTPayload> {
  const user = await requireAuth();
  if (user.role !== requiredRole) {
    throw new Error(`Unauthorized: This action requires ${requiredRole} role`);
  }
  return user;
}

/**
 * Helper to format API errors as JSON
 */
export function apiError(message: string, status: number = 400) {
  return {
    error: true,
    message,
    status,
  };
}

/**
 * Helper to format API success response
 */
export function apiSuccess(data: any, message?: string) {
  return {
    success: true,
    message,
    data,
  };
}
