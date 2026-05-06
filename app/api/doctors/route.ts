/**
 * Doctors List API Route
 * GET /api/doctors - List and search doctors
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollections } from '@/lib/models';
import { searchDoctorsSchema } from '@/lib/validation';
import { apiSuccess, apiError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get('specialization');
    const name = searchParams.get('name');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query filter
    const filter: any = { };

    if (specialization) {
      // Case-insensitive search
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const { doctors } = getCollections(db);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch doctors with pagination
    const doctorsList = await doctors
      .find(filter)
      .sort({ averageRating: -1 }) // Sort by rating
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalCount = await doctors.countDocuments(filter);

    // Remove sensitive data from response
    const sanitizedDoctors = doctorsList.map((doctor: any) => {
      const { password, ...docWithoutPassword } = doctor;
      return docWithoutPassword;
    });

    return NextResponse.json(
      apiSuccess(
        {
          doctors: sanitizedDoctors,
          pagination: {
            page,
            limit,
            total: totalCount,
            pages: Math.ceil(totalCount / limit),
          },
        },
        'Doctors retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get doctors error:', error);
    return NextResponse.json(
      apiError('Failed to retrieve doctors'),
      { status: 500 }
    );
  }
}
