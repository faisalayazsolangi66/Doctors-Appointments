/**
 * User Profile API Route
 * GET /api/auth/profile - Get current user profile
 * PUT /api/auth/profile - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollections } from '@/lib/models';
import { getCurrentUser, requireAuth, apiSuccess, apiError } from '@/lib/auth';
import { profileUpdateSchema } from '@/lib/validation';
import { ObjectId } from 'mongodb';

/**
 * GET - Retrieve current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        apiError('Unauthorized'),
        { status: 401 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const { patients, doctors } = getCollections(db);

    // Get role-specific profile
    let profile;
    if (user.role === 'patient') {
      profile = await patients.findOne({ _id: new ObjectId(user.userId) });
    } else {
      profile = await doctors.findOne({ _id: new ObjectId(user.userId) });
    }

    if (!profile) {
      return NextResponse.json(
        apiError('Profile not found'),
        { status: 404 }
      );
    }

    // Remove sensitive data before returning
    const { password, ...profileWithoutPassword } = profile;

    return NextResponse.json(
      apiSuccess(profileWithoutPassword, 'Profile retrieved'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      apiError('Failed to retrieve profile'),
      { status: 500 }
    );
  }
}

/**
 * PUT - Update user profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await requireAuth();

    // Validate request body
    const body = await request.json();
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0].message),
        { status: 400 }
      );
    }

    const updateData = result.data;

    // Connect to database
    const { db } = await connectToDatabase();
    const { patients, doctors } = getCollections(db);

    // Update profile
    const collection = user.role === 'patient' ? patients : doctors;
    const updateResult = await collection.findOneAndUpdate(
      { _id: new ObjectId(user.userId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!updateResult.value) {
      return NextResponse.json(
        apiError('Profile not found'),
        { status: 404 }
      );
    }

    // Remove sensitive data
    const { password, ...profileWithoutPassword } = updateResult.value;

    return NextResponse.json(
      apiSuccess(profileWithoutPassword, 'Profile updated successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      apiError('Failed to update profile'),
      { status: 500 }
    );
  }
}
