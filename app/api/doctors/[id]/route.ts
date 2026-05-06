/**
 * Doctor Details API Route
 * GET /api/doctors/[id] - Get specific doctor profile with reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollections } from '@/lib/models';
import { apiSuccess, apiError } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        apiError('Invalid doctor ID'),
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const { doctors, reviews } = getCollections(db);

    // Get doctor details
    const doctor = await doctors.findOne({ _id: new ObjectId(id) });

    if (!doctor) {
      return NextResponse.json(
        apiError('Doctor not found'),
        { status: 404 }
      );
    }

    // Get doctor's reviews (limit to last 10)
    const doctorReviews = await reviews
      .find({ doctorId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Remove password from response
    const { password, ...doctorWithoutPassword } = doctor;

    return NextResponse.json(
      apiSuccess(
        {
          ...doctorWithoutPassword,
          reviews: doctorReviews,
        },
        'Doctor details retrieved'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get doctor detail error:', error);
    return NextResponse.json(
      apiError('Failed to retrieve doctor details'),
      { status: 500 }
    );
  }
}
