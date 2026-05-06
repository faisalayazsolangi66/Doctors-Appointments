/**
 * Available Time Slots API
 * GET /api/appointments/available-slots
 * 
 * Get available time slots for a doctor on specific date(s)
 * Query params: doctorId, date (YYYY-MM-DD), or dateRange (startDate-endDate)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollections } from '@/lib/models';
import { apiSuccess, apiError } from '@/lib/auth';
import { generateTimeSlots, getNextDays, formatDateISO } from '@/lib/utils';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate required parameters
    if (!doctorId) {
      return NextResponse.json(
        apiError('doctorId is required'),
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        apiError('Invalid doctor ID'),
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const { doctors, timeSlots } = getCollections(db);

    // Get doctor
    const doctor = await doctors.findOne({
      _id: new ObjectId(doctorId),
    });

    if (!doctor) {
      return NextResponse.json(
        apiError('Doctor not found'),
        { status: 404 }
      );
    }

    // Determine dates to fetch slots for
    let datesToFetch: string[] = [];

    if (date) {
      datesToFetch = [date];
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start);

      while (current <= end) {
        datesToFetch.push(formatDateISO(current));
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Default: next 30 days
      datesToFetch = getNextDays(30);
    }

    // Fetch slots for each date
    const availableSlots: Record<string, string[]> = {};

    for (const dateStr of datesToFetch) {
      // Get booked slots for this date
      const bookedSlots = await timeSlots
        .find({
          doctorId: new ObjectId(doctorId),
          date: dateStr,
          isBooked: true,
        })
        .toArray();

      const bookedTimes = bookedSlots.map((slot) => slot.time);

      // Generate available slots
      const slots = generateTimeSlots(dateStr, doctor, bookedTimes);
      availableSlots[dateStr] = slots;
    }

    return NextResponse.json(
      apiSuccess(
        {
          doctorId,
          availableSlots,
        },
        'Available slots retrieved'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get available slots error:', error);
    return NextResponse.json(
      apiError('Failed to retrieve available slots'),
      { status: 500 }
    );
  }
}
