/**
 * Login API Route
 * POST /api/auth/login
 * 
 * Authenticates users (both patient and doctor)
 * Returns JWT token for authenticated requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollections } from '@/lib/models';
import { comparePasswords, generateToken, apiSuccess, apiError } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0].message),
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Connect to database
    const { db } = await connectToDatabase();
    const { users } = getCollections(db);

    // Find user by email
    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json(
        apiError('Invalid email or password'),
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        apiError('Invalid email or password'),
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Create response with user data
    const response = NextResponse.json(
      apiSuccess(
        {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
        'Login successful'
      ),
      { status: 200 }
    );

    // Set auth cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      apiError('Login failed. Please try again.'),
      { status: 500 }
    );
  }
}
