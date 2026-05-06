/**
 * Appointment Detail & Update API
 * GET /api/appointments/[id] - Get appointment details
 * PUT /api/appointments/[id] - Update appointment (status, notes)
 * DELETE /api/appointments/[id] - Cancel appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollections } from '@/lib/models';
import { requireAuth, apiSuccess, apiError } from '@/lib/auth';
import { updateAppointmentStatusSchema, cancelAppointmentSchema } from '@/lib/validation';
import { ObjectId } from 'mongodb';

/**
 * GET - Get appointment details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        apiError('Invalid appointment ID'),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const { appointments, doctors, patients } = getCollections(db);

    const appointment = await appointments.findOne({
      _id: new ObjectId(id),
    });

    if (!appointment) {
      return NextResponse.json(
        apiError('Appointment not found'),
        { status: 404 }
      );
    }

    // Verify user is either the patient or doctor
    const isPatient = appointment.patientId.toString() === user.userId;
    const isDoctor = appointment.doctorId.toString() === user.userId;

    if (!isPatient && !isDoctor) {
      return NextResponse.json(
        apiError('Unauthorized to view this appointment'),
        { status: 403 }
      );
    }

    // Fetch related data
    const doctor = await doctors.findOne({ _id: appointment.doctorId });
    const patient = await patients.findOne({ _id: appointment.patientId });

    return NextResponse.json(
      apiSuccess(
        {
          ...appointment,
          doctor: doctor ? { name: doctor.name, specialization: doctor.specialization } : null,
          patient: patient ? { name: patient.name } : null,
        },
        'Appointment details retrieved'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(apiError(error.message), { status: 401 });
    }
    console.error('Get appointment error:', error);
    return NextResponse.json(
      apiError('Failed to retrieve appointment'),
      { status: 500 }
    );
  }
}

/**
 * PUT - Update appointment status (doctors only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        apiError('Invalid appointment ID'),
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = updateAppointmentStatusSchema.safeParse({
      appointmentId: id,
      ...body,
    });

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0].message),
        { status: 400 }
      );
    }

    const { status, doctorNotes } = result.data;

    const { db } = await connectToDatabase();
    const { appointments } = getCollections(db);

    const appointment = await appointments.findOne({
      _id: new ObjectId(id),
    });

    if (!appointment) {
      return NextResponse.json(
        apiError('Appointment not found'),
        { status: 404 }
      );
    }

    // Only doctor can update appointment
    if (appointment.doctorId.toString() !== user.userId) {
      return NextResponse.json(
        apiError('Only the doctor can update appointment status'),
        { status: 403 }
      );
    }

    // Update appointment
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (doctorNotes) {
      updateData.doctorNotes = doctorNotes;
    }

    const updateResult = await appointments.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return NextResponse.json(
      apiSuccess(updateResult.value, 'Appointment updated successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(apiError(error.message), { status: 401 });
    }
    console.error('Update appointment error:', error);
    return NextResponse.json(
      apiError('Failed to update appointment'),
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancel appointment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        apiError('Invalid appointment ID'),
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = cancelAppointmentSchema.safeParse({
      appointmentId: id,
      ...body,
    });

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0].message),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const { appointments, timeSlots } = getCollections(db);

    const appointment = await appointments.findOne({
      _id: new ObjectId(id),
    });

    if (!appointment) {
      return NextResponse.json(
        apiError('Appointment not found'),
        { status: 404 }
      );
    }

    // Only patient or doctor can cancel
    const isPatient = appointment.patientId.toString() === user.userId;
    const isDoctor = appointment.doctorId.toString() === user.userId;

    if (!isPatient && !isDoctor) {
      return NextResponse.json(
        apiError('Unauthorized to cancel this appointment'),
        { status: 403 }
      );
    }

    // Update appointment status to cancelled
    const updateResult = await appointments.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'cancelled',
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    // Release the time slot
    await timeSlots.findOneAndUpdate(
      {
        doctorId: appointment.doctorId,
        date: appointment.appointmentDate,
        time: appointment.timeSlot,
      },
      { $set: { isBooked: false } }
    );

    return NextResponse.json(
      apiSuccess(updateResult.value, 'Appointment cancelled successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(apiError(error.message), { status: 401 });
    }
    console.error('Cancel appointment error:', error);
    return NextResponse.json(
      apiError('Failed to cancel appointment'),
      { status: 500 }
    );
  }
}
