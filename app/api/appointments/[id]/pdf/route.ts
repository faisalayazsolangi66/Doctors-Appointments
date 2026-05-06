/**
 * Appointment PDF Confirmation API
 * GET /api/appointments/[id]/pdf
 * 
 * Generates and returns PDF confirmation for appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollections } from '@/lib/models';
import { requireAuth, apiError } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { formatDateForDisplay, formatCurrency } from '@/lib/utils';
import jsPDF from 'jspdf';

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

    // Get appointment
    const appointment = await appointments.findOne({
      _id: new ObjectId(id),
    });

    if (!appointment) {
      return NextResponse.json(
        apiError('Appointment not found'),
        { status: 404 }
      );
    }

    // Verify user is patient or doctor
    const isPatient = appointment.patientId.toString() === user.userId;
    const isDoctor = appointment.doctorId.toString() === user.userId;

    if (!isPatient && !isDoctor) {
      return NextResponse.json(
        apiError('Unauthorized'),
        { status: 403 }
      );
    }

    // Get doctor and patient info
    const doctor = await doctors.findOne({ _id: appointment.doctorId });
    const patient = await patients.findOne({ _id: appointment.patientId });

    if (!doctor || !patient) {
      return NextResponse.json(
        apiError('Doctor or patient not found'),
        { status: 404 }
      );
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set colors
    const primaryColor = [8, 145, 178]; // Teal
    const textDark = [17, 24, 39]; // Dark gray

    // Add header
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, 210, 40, 'F');

    // Add title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text('Appointment Confirmation', 105, 20, { align: 'center' });

    // Reset text color
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);

    // Add appointment ID
    pdf.setFontSize(10);
    pdf.text(`Confirmation ID: ${appointment._id}`, 20, 50);

    // Section: Patient Information
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Patient Information', 20, 65);

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    pdf.text(`Name: ${patient.name || 'N/A'}`, 20, 75);
    pdf.text(`Email: ${patient.email || 'N/A'}`, 20, 82);
    pdf.text(`Phone: ${patient.phone || 'N/A'}`, 20, 89);

    // Section: Doctor Information
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text('Doctor Information', 20, 105);

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    pdf.text(`Name: ${doctor.name || 'N/A'}`, 20, 115);
    pdf.text(`Specialization: ${doctor.specialization || 'N/A'}`, 20, 122);
    pdf.text(`Clinic: ${doctor.clinicAddress || 'N/A'}`, 20, 129);
    pdf.text(`Phone: ${doctor.clinicPhone || 'N/A'}`, 20, 136);

    // Section: Appointment Details
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text('Appointment Details', 20, 152);

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    const appointmentDateTime = `${formatDateForDisplay(appointment.appointmentDate)} at ${appointment.timeSlot}`;
    pdf.text(`Date & Time: ${appointmentDateTime}`, 20, 162);
    pdf.text(`Status: ${appointment.status.toUpperCase()}`, 20, 169);
    pdf.text(`Consultation Fee: ${formatCurrency(appointment.consultationFee)}`, 20, 176);

    if (appointment.notes) {
      pdf.text(`Notes: ${appointment.notes}`, 20, 183);
    }

    // Section: Important Information
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text('Important Information', 20, 200);

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(9);
    const importantText = [
      'Please arrive 10-15 minutes before your appointment',
      'Bring a valid ID and insurance card if applicable',
      'If you need to cancel, please do so at least 24 hours before',
      'For emergencies, call the clinic directly',
    ];

    let yPosition = 210;
    importantText.forEach((text) => {
      pdf.text(`• ${text}`, 25, yPosition);
      yPosition += 6;
    });

    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Thank you for choosing our clinic', 105, 270, { align: 'center' });
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 276, { align: 'center' });

    // Return PDF as file
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="appointment-confirmation-${appointment._id}.pdf"`,
      },
    });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(apiError(error.message), { status: 401 });
    }
    console.error('Generate PDF error:', error);
    return NextResponse.json(
      apiError('Failed to generate PDF'),
      { status: 500 }
    );
  }
}
