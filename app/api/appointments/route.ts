/**
 * Appointments API Route
 * GET /api/appointments - Get user's appointments (patients and doctors)
 * POST /api/appointments - Book new appointment (patients only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollections } from '@/lib/models';
import { requireAuth, apiSuccess, apiError } from '@/lib/auth';
import { bookAppointmentSchema } from '@/lib/validation';
import { ObjectId } from 'mongodb';
import { generateTimeSlots } from '@/lib/utils';

/**
 * GET - Retrieve user's appointments
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { db } = await connectToDatabase();
    const { appointments, doctors, patients } = getCollections(db);

    let query: any;

    if (user.role === 'patient') {
      query = { patientId: new ObjectId(user.userId) };
    } else {
      query = { doctorId: new ObjectId(user.userId) };
    }

    // Get appointments sorted by date
    const userAppointments = await appointments
      .find(query)
      .sort({ appointmentDate: -1 })
      .toArray();

    // Populate doctor/patient details
    const enrichedAppointments = await Promise.all(
      userAppointments.map(async (apt) => {
        if (user.role === 'patient') {
          const doctor = await doctors.findOne({
            _id: apt.doctorId,
          });
          return {
            ...apt,
            doctor: doctor ? { name: doctor.name, specialization: doctor.specialization } : null,
          };
        } else {
          const patient = await patients.findOne({
            _id: apt.patientId,
          });
          return {
            ...apt,
            patient: patient ? { name: patient.name, phone: patient.phone } : null,
          };
        }
      })
    );

    return NextResponse.json(
      apiSuccess(enrichedAppointments, 'Appointments retrieved'),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(apiError(error.message), { status: 401 });
    }
    console.error('Get appointments error:', error);
    return NextResponse.json(
      apiError('Failed to retrieve appointments'),
      { status: 500 }
    );
  }
}

/**
 * POST - Book new appointment
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Only patients can book appointments
    if (user.role !== 'patient') {
      return NextResponse.json(
        apiError('Only patients can book appointments'),
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();

    // Add patient ID from authenticated user
    const validationData = {
      ...body,
      patientId: user.userId,
    };

    const result = bookAppointmentSchema.safeParse(validationData);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0].message),
        { status: 400 }
      );
    }

    const { doctorId, appointmentDate, timeSlot, notes } = result.data;

    // Connect to database
    const { db } = await connectToDatabase();
    const { appointments, doctors, timeSlots } = getCollections(db);

    // Get doctor info
    const doctor = await doctors.findOne({
      _id: new ObjectId(doctorId),
    });

    if (!doctor) {
      return NextResponse.json(
        apiError('Doctor not found'),
        { status: 404 }
      );
    }

    // Check if time slot is available
    const existingSlot = await timeSlots.findOne({
      doctorId: new ObjectId(doctorId),
      date: appointmentDate,
      time: timeSlot,
      isBooked: true,
    });

    if (existingSlot) {
      return NextResponse.json(
        apiError('Time slot is already booked'),
        { status: 409 }
      );
    }

    // Create appointment
    const appointmentData = {
      patientId: new ObjectId(user.userId),
      doctorId: new ObjectId(doctorId),
      appointmentDate,
      timeSlot,
      status: 'scheduled' as const,
      notes,
      consultationFee: doctor.consultationFee,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const appointmentResult = await appointments.insertOne(appointmentData);

    // Mark time slot as booked
    await timeSlots.findOneAndUpdate(
      {
        doctorId: new ObjectId(doctorId),
        date: appointmentDate,
        time: timeSlot,
      },
      {
        $set: {
          isBooked: true,
          appointmentId: appointmentResult.insertedId,
        },
      },
      { upsert: true }
    );

    // Add appointment to patient and doctor lists
    await db
      .collection('patients')
      .updateOne(
        { _id: new ObjectId(user.userId) },
        { $push: { appointments: appointmentResult.insertedId } }
      );

    await db
      .collection('doctors')
      .updateOne(
        { _id: new ObjectId(doctorId) },
        { $push: { appointments: appointmentResult.insertedId } }
      );

    return NextResponse.json(
      apiSuccess(
        {
          appointmentId: appointmentResult.insertedId,
          ...appointmentData,
        },
        'Appointment booked successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(apiError(error.message), { status: 401 });
    }
    console.error('Book appointment error:', error);
    return NextResponse.json(
      apiError('Failed to book appointment'),
      { status: 500 }
    );
  }
}
