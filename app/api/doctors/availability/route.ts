/**
 * Doctor Availability Management API
 * GET /api/doctors/availability - Get doctor's availability schedule
 * POST /api/doctors/availability - Set/update doctor's availability
 * 
 * Only accessible by authenticated doctors
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollections } from '@/lib/models';
import { requireRole, apiSuccess, apiError } from '@/lib/auth';
import { setAvailabilitySchema } from '@/lib/validation';
import { ObjectId } from 'mongodb';

/**
 * GET - Retrieve doctor's availability schedule
 */
export async function GET(request: NextRequest) {
  try {
    // Verify doctor is authenticated
    const user = await requireRole('doctor');

    // Connect to database
    const { db } = await connectToDatabase();
    const { doctors } = getCollections(db);

    // Get doctor's availability
    const doctor = await doctors.findOne({
      _id: new ObjectId(user.userId),
    });

    if (!doctor) {
      return NextResponse.json(
        apiError('Doctor profile not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      apiSuccess(
        {
          availabilitySchedule: doctor.availabilitySchedule || [],
        },
        'Availability retrieved'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(apiError(error.message), { status: 401 });
    }
    console.error('Get availability error:', error);
    return NextResponse.json(
      apiError('Failed to retrieve availability'),
      { status: 500 }
    );
  }
}

/**
 * POST - Set/update doctor's availability schedule
 */
export async function POST(request: NextRequest) {
  try {
    // Verify doctor is authenticated
    const user = await requireRole('doctor');

    // Validate request body
    const body = await request.json();

    // Create validation data with doctor ID from authenticated user
    const validationData = {
      doctorId: user.userId,
      ...body,
    };

    const result = setAvailabilitySchema.safeParse(validationData);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0].message),
        { status: 400 }
      );
    }

    const { availabilitySchedule } = result.data;

    // Connect to database
    const { db } = await connectToDatabase();
    const { doctors } = getCollections(db);

    // Update doctor's availability
    const updateResult = await doctors.findOneAndUpdate(
      { _id: new ObjectId(user.userId) },
      {
        $set: {
          availabilitySchedule,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!updateResult.value) {
      return NextResponse.json(
        apiError('Doctor profile not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      apiSuccess(
        {
          availabilitySchedule: updateResult.value.availabilitySchedule,
        },
        'Availability updated successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(apiError(error.message), { status: 401 });
    }
    console.error('Set availability error:', error);
    return NextResponse.json(
      apiError('Failed to update availability'),
      { status: 500 }
    );
  }
}
