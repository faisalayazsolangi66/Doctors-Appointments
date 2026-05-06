/**
 * Logout API Route
 * POST /api/auth/logout
 * 
 * Clears authentication cookie and logs out user
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      apiSuccess(null, 'Logout successful'),
      { status: 200 }
    );

    // Clear auth cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // This will delete the cookie
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
