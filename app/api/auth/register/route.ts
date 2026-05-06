/**
 * Patient & Doctor Registration API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollections, initializeCollections } from '@/lib/models';
import { hashPassword, generateToken, setAuthCookie, apiSuccess, apiError } from '@/lib/auth';
import { patientRegisterSchema, doctorRegisterSchema } from '@/lib/validation';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    if (!role || !['patient', 'doctor'].includes(role)) {
      return NextResponse.json(apiError('Invalid role'), { status: 400 });
    }

    // Validate based on role
    let validatedData;
    if (role === 'patient') {
      const result = patientRegisterSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          apiError(result.error.errors[0].message),
          { status: 400 }
        );
      }
      validatedData = result.data;
    } else {
      console.log('Validating doctor registration data:', body);
      const result = doctorRegisterSchema.safeParse(body);
      // if (!result.success) {
      //   return NextResponse.json(
      //     apiError(result.error.errors[0].message),
      //     { status: 400 }
      //   );
      // }
      validatedData = result.data;
    }

    const { db } = await connectToDatabase();
    const { users, patients, doctors } = getCollections(db);
    await initializeCollections(db);

    // Check existing user
    const existingUser = await users.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(apiError('Email already registered'), { status: 409 });
    }

    const hashedPassword = await hashPassword(body.password);
    const userId = new ObjectId();

    // Create base user
    await users.insertOne({
      _id: userId,
      email: body.email,
      password: hashedPassword,
      name: body.name,
      phone: body.phone,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create role-specific document
    if (role === 'patient') {
      // await patients.insertOne({
      //   _id: userId,
      //   email: body.email,
      //   name: body.name,
      //   phone: body.phone,
      //   role: 'patient',
      //   dateOfBirth: body.dateOfBirth || null,
      //   gender: body.gender || null,
      //   address: body.address || null,
      //   appointments: [],
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // });
    } else {
      // === DOCTOR ===
      await doctors.insertOne({
        _id: userId,
        email: body.email,
        password: hashedPassword,
        name: body.name,
        phone: body.phone,
        role: 'doctor',
        specialization: body.doctorPayload?.specialization,
        qualifications: body.doctorPayload?.qualifications,
        bio: body.doctorPayload?.bio || '',
        clinicAddress: body.doctorPayload?.clinicAddress,
        clinicPhone: body.doctorPayload?.clinicPhone,
        consultationFee: body.doctorPayload?.consultationFee,
        availabilitySchedule: [],
        appointments: [],
        averageRating: 0,
        reviewCount: 0,
        isApproved: false,           // Needs admin approval
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const token = generateToken({
      userId: userId.toString(),
      email: body.email,
      role,
    });

    const response = NextResponse.json(
      apiSuccess({
        userId: userId.toString(),
        email: body.email,
        name: body.name,
        role,
      }, 'Registration successful'),
      { status: 201 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      apiError('Registration failed. Please try again.'),
      { status: 500 }
    );
  }
}