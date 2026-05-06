/**
 * MongoDB Model Definitions and Helper Functions
 * Defines types and collection references for all entities
 * Provides helper functions for database operations
 */

import { ObjectId, Db, Collection } from 'mongodb';

// ===================== Type Definitions =====================

/**
 * User base type - shared between patients and doctors
 */
export interface User {
  _id?: ObjectId;
  email: string;
  password: string; // hashed
  name: string;
  phone: string;
  role: 'patient' | 'doctor';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Patient profile extending User
 */
export interface Patient extends User {
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  appointments: ObjectId[]; // Array of appointment IDs
}

/**
 * Time slot availability for doctor's weekly schedule
 */
export interface TimeSlotConfig {
  day: string; // 'Monday', 'Tuesday', etc.
  startTime: string; // 'HH:mm' format, e.g., '09:00'
  endTime: string; // 'HH:mm' format, e.g., '17:00'
  breaks: Array<{ start: string; end: string }>; // Break times during the day
}

/**
 * Doctor profile extending User
 */
export interface Doctor extends User {
  specialization: string; // e.g., 'Cardiologist', 'Dentist'
  qualifications: string[]; // Array of qualifications
  bio: string;
  profileImage?: string; // URL to doctor's image
  clinicAddress: string;
  clinicPhone: string;
  consultationFee: number; // Fee in currency units
  availabilitySchedule: TimeSlotConfig[]; // Weekly availability pattern
  appointments: ObjectId[]; // Array of appointment IDs
  averageRating: number; // Average of all reviews
  reviewCount: number; // Total number of reviews
  isApproved?: boolean; // Admin approval status
}

/**
 * Individual time slot for appointment booking
 */
export interface TimeSlot {
  _id?: ObjectId;
  doctorId: ObjectId;
  date: string; // 'YYYY-MM-DD' format
  time: string; // 'HH:mm' format (30-min intervals)
  isBooked: boolean;
  appointmentId?: ObjectId; // Reference if booked
  createdAt: Date;
}

/**
 * Appointment record
 */
export interface Appointment {
  _id?: ObjectId;
  patientId: ObjectId;
  doctorId: ObjectId;
  appointmentDate: string; // 'YYYY-MM-DD'
  timeSlot: string; // 'HH:mm' format
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string; // Patient notes/symptoms
  doctorNotes?: string; // Doctor's notes from appointment
  consultationFee: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Review/Rating for doctor
 */
export interface Review {
  _id?: ObjectId;
  doctorId: ObjectId;
  patientId: ObjectId;
  appointmentId: ObjectId;
  rating: number; // 1-5 scale
  comment: string;
  createdAt: Date;
}

/**
 * Appointment confirmation data for PDF generation
 */
export interface AppointmentConfirmation {
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  specialization: string;
  clinicAddress: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationFee: number;
  notes?: string;
}

// ===================== Collection Helper Functions =====================

/**
 * Initialize collections with proper indexes
 * Call this once on application startup
 */
export async function initializeCollections(db: Db) {
  try {
    // Users collection indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Created indexes for users collection');

    // Doctors collection indexes
    const doctorsCollection = db.collection('doctors');
    await doctorsCollection.createIndex({ specialization: 1 });
    await doctorsCollection.createIndex({ averageRating: -1 });
    console.log('✓ Created indexes for doctors collection');

    // TimeSlots collection indexes
    const timeSlotsCollection = db.collection('timeSlots');
    await timeSlotsCollection.createIndex({ doctorId: 1, date: 1 });
    await timeSlotsCollection.createIndex({ isBooked: 1 });
    console.log('✓ Created indexes for timeSlots collection');

    // Appointments collection indexes
    const appointmentsCollection = db.collection('appointments');
    await appointmentsCollection.createIndex({ patientId: 1 });
    await appointmentsCollection.createIndex({ doctorId: 1 });
    await appointmentsCollection.createIndex({ status: 1 });
    await appointmentsCollection.createIndex({ appointmentDate: 1 });
    console.log('✓ Created indexes for appointments collection');

    // Reviews collection indexes
    const reviewsCollection = db.collection('reviews');
    await reviewsCollection.createIndex({ doctorId: 1 });
    await reviewsCollection.createIndex({ patientId: 1 });
    console.log('✓ Created indexes for reviews collection');
  } catch (error: any) {
    // Index already exists - this is fine
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
}

/**
 * Get all collections with proper typing
 */
export function getCollections(db: Db) {
  return {
    users: db.collection<User>('users'),
    patients: db.collection<Patient>('patients'),
    doctors: db.collection<Doctor>('doctors'),
    timeSlots: db.collection<TimeSlot>('timeSlots'),
    appointments: db.collection<Appointment>('appointments'),
    reviews: db.collection<Review>('reviews'),
  };
}

/**
 * Helper: Get user with their role-specific profile
 */
export async function getUserWithProfile(
  db: Db,
  userId: ObjectId,
  role: 'patient' | 'doctor'
) {
  const collection = role === 'patient' ? 'patients' : 'doctors';
  return db.collection(collection).findOne({ _id: userId });
}
