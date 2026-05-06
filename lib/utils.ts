import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Doctor, TimeSlotConfig } from './models'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ===================== Date & Time Utilities =====================

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time as HH:mm
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse time string (HH:mm) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:mm)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Add minutes to a time string
 */
export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const minutes = timeToMinutes(time) + minutesToAdd;
  return minutesToTime(minutes);
}

/**
 * Get day of week from date (Monday, Tuesday, etc.)
 */
export function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Check if a given date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const givenDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return givenDate < today;
}

/**
 * Get next N days from today
 */
export function getNextDays(n: number): string[] {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(formatDateISO(date));
  }
  return dates;
}

/**
 * Format date for display (e.g., "Monday, Jan 15, 2024")
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format date and time for display (e.g., "Jan 15, 2024 - 2:30 PM")
 */
export function formatDateTimeForDisplay(dateString: string, timeString: string): string {
  const date = new Date(dateString + 'T' + timeString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleDateString('en-US', options);
}

// ===================== Time Slot Management =====================

/**
 * Generate available time slots for a specific date and doctor
 * Based on doctor's availability schedule
 * 30-minute intervals by default
 */
export function generateTimeSlots(
  date: string,
  doctor: Doctor,
  bookedSlots: string[] = [],
  slotDuration: number = 30
): string[] {
  const dayOfWeek = getDayOfWeek(new Date(date + 'T00:00:00'));

  // Find availability for this day of week
  const availability = doctor.availabilitySchedule.find((slot) => slot.day === dayOfWeek);
  if (!availability) {
    return []; // Doctor not available on this day
  }

  const slots: string[] = [];
  let currentTime = availability.startTime;
  const endTime = availability.endTime;

  while (timeToMinutes(currentTime) < timeToMinutes(endTime)) {
    // Check if this slot is within any break times
    const isInBreak = availability.breaks.some((breakTime) => {
      const slotMinutes = timeToMinutes(currentTime);
      const breakStart = timeToMinutes(breakTime.start);
      const breakEnd = timeToMinutes(breakTime.end);
      return slotMinutes >= breakStart && slotMinutes < breakEnd;
    });

    // Only add slot if not in break and not already booked
    if (!isInBreak && !bookedSlots.includes(currentTime)) {
      slots.push(currentTime);
    }

    // Move to next slot
    currentTime = addMinutesToTime(currentTime, slotDuration);
  }

  return slots;
}

/**
 * Check if a time slot is available
 */
export function isTimeSlotAvailable(
  time: string,
  availability: TimeSlotConfig,
  bookedSlots: string[] = []
): boolean {
  // Check if time is within working hours
  if (timeToMinutes(time) < timeToMinutes(availability.startTime) ||
      timeToMinutes(time) >= timeToMinutes(availability.endTime)) {
    return false;
  }

  // Check if time is in break period
  const isInBreak = availability.breaks.some((breakTime) => {
    const slotMinutes = timeToMinutes(time);
    const breakStart = timeToMinutes(breakTime.start);
    const breakEnd = timeToMinutes(breakTime.end);
    return slotMinutes >= breakStart && slotMinutes < breakEnd;
  });

  if (isInBreak) return false;

  // Check if slot is already booked
  return !bookedSlots.includes(time);
}

// ===================== Validation Helpers =====================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  // Allow numbers, spaces, dashes, parentheses
  const phoneRegex = /^[\d\s\-().+]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-f]{24}$/.test(id);
}

// ===================== String Utilities =====================

/**
 * Truncate string to max length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// ===================== Array Utilities =====================

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}
