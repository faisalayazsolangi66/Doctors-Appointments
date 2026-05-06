/**
 * Zod Validation Schemas
 * Defines validation rules for all API requests
 * Used at API boundaries to ensure data integrity
 */

import { z } from 'zod';

// ===================== Authentication Schemas =====================

/**
 * Patient registration validation
 */
export const patientRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().or(z.literal('')), // Optional
  role: z.literal('patient'),
  
  // Optional profile fields (can be filled later)
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
});

/**
 * Doctor registration validation
 */
export const doctorRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  role: z.literal('doctor'),

  specialization: z.string().min(2, 'Specialization is required'),
  qualifications: z.array(z.string()).min(1, 'At least one qualification is required'),
  clinicAddress: z.string().min(5, 'Clinic address is required'),
  clinicPhone: z.string().min(10, 'Clinic phone is required'),
  consultationFee: z.number().positive('Consultation fee must be positive'),

  bio: z.string().optional(),
});

/**
 * Login validation (used for both patients and doctors)
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Profile update validation
 */
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Phone must be valid').optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
});

// ===================== Appointment Schemas =====================

/**
 * Appointment booking validation
 */
export const bookAppointmentSchema = z.object({
  doctorId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid doctor ID'),
  patientId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid patient ID'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  notes: z.string().optional(),
});

/**
 * Appointment status update validation
 */
export const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid appointment ID'),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']),
  doctorNotes: z.string().optional(),
});

/**
 * Cancel appointment validation
 */
export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid appointment ID'),
  reason: z.string().optional(),
});

// ===================== Doctor Availability Schemas =====================

/**
 * Break time validation
 */
export const breakTimeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
});

/**
 * Time slot configuration validation
 */
export const timeSlotConfigSchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  breaks: z.array(breakTimeSchema).default([]),
});

/**
 * Set availability validation
 */
export const setAvailabilitySchema = z.object({
  doctorId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid doctor ID'),
  availabilitySchedule: z.array(timeSlotConfigSchema).min(1, 'At least one availability slot required'),
});

/**
 * Doctor profile update (partial)
 */
export const doctorProfileUpdateSchema = z.object({
  bio: z.string().optional(),
  specialization: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().optional(),
  consultationFee: z.number().positive().optional(),
  profileImage: z.string().url().optional(),
});

// ===================== Review Schemas =====================

/**
 * Review creation validation
 */
export const createReviewSchema = z.object({
  doctorId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid doctor ID'),
  patientId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid patient ID'),
  appointmentId: z.string().regex(/^[0-9a-f]{24}$/, 'Invalid appointment ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

// ===================== Search/Filter Schemas =====================

/**
 * Doctor search/filter validation
 */
export const searchDoctorsSchema = z.object({
  specialization: z.string().optional(),
  name: z.string().optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('10'),
});

// ===================== Export Types =====================

export type PatientRegister = z.infer<typeof patientRegisterSchema>;
export type DoctorRegister = z.infer<typeof doctorRegisterSchema>;
export type Login = z.infer<typeof loginSchema>;
export type BookAppointment = z.infer<typeof bookAppointmentSchema>;
export type UpdateAppointmentStatus = z.infer<typeof updateAppointmentStatusSchema>;
export type SetAvailability = z.infer<typeof setAvailabilitySchema>;