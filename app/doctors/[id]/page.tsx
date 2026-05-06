'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/header';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorAlert, SuccessAlert } from '@/components/error-alert';
import { useAuth } from '@/components/auth-context';
import { formatDateForDisplay, formatDateTimeForDisplay } from '@/lib/utils';
import { Star, MapPin, Clock, BookOpen, GraduationCap, Phone, Mail } from 'lucide-react';

/**
 * Doctor Interface
 */
interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  experience: number;
  bio: string;
  rating: number;
  totalReviews: number;
  location: string;
  phone: string;
  consultationFee: number;
  profileImage?: string;
}

/**
 * Doctor Detail and Booking Page
 * Shows doctor details and allows patients to book appointments
 * Displays available time slots
 */
export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Booking form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/doctors/${doctorId}`);
        if (!response.ok) throw new Error('Failed to fetch doctor details');
        const data = await response.json();
        console.log('[v0] Doctor fetched00000:', data.data);
        setDoctor(data.data || null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading doctor';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (!selectedDate || !doctor) return;

    const fetchSlots = async () => {
      try {
        const response = await fetch(
          `/api/appointments/available-slots?doctorId=${doctorId}&date=${selectedDate}`
        );
        if (!response.ok) throw new Error('Failed to fetch available slots');
        const data = await response.json();
        setAvailableSlots(data.slots || []);
        setSelectedTime(''); // Reset selected time
      } catch (err) {
        console.error('[v0] Error fetching slots:', err);
      }
    };

    fetchSlots();
  }, [selectedDate, doctorId, doctor]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Check authentication
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Validate inputs
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    setIsBooking(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          patientId: user.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          symptoms,
          medicalHistory,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to book appointment');
      }

      const appointment = await response.json();
      setSuccessMessage('Appointment booked successfully! Redirecting to confirmation...');

      // Redirect to appointment details after a short delay
      setTimeout(() => {
        router.push(`/appointments/${appointment._id}`);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error booking appointment';
      setError(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <ErrorAlert
            title="Doctor Not Found"
            message="The doctor you&apos;re looking for doesn&apos;t exist or has been removed."
            actionLabel="Back to Doctors"
            onAction={() => router.push('/doctors')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
        {successMessage && (
          <SuccessAlert message={successMessage} onDismiss={() => setSuccessMessage('')} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Left Column - Doctor Details */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
              {/* Doctor Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Dr. {doctor.name}
                </h1>
                <p className="text-xl text-primary font-medium mb-4">
                  {doctor.specialization}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(doctor.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {doctor.rating} ({doctor.totalReviews} reviews)
                  </span>
                </div>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <p className="text-xs text-muted-foreground">Qualification</p>
                  </div>
                  <p className="font-semibold text-foreground">{doctor.qualification}</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <p className="text-xs text-muted-foreground">Experience</p>
                  </div>
                  <p className="font-semibold text-foreground">{doctor.experience} years</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <p className="text-xs text-muted-foreground">Location</p>
                  </div>
                  <p className="font-semibold text-foreground">{doctor.location}</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <p className="text-xs text-muted-foreground">Consultation</p>
                  </div>
                  <p className="font-semibold text-foreground">${doctor.consultationFee}</p>
                </div>
              </div>

              {/* About Section */}
              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-semibold text-foreground mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
              </div>

              {/* Contact Section */}
              <div className="border-t border-border pt-6 mt-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Contact</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <a href={`mailto:${doctor.email}`} className="text-primary hover:underline">
                      {doctor.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <a href={`tel:${doctor.phone}`} className="text-primary hover:underline">
                      {doctor.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-foreground mb-6">Book Appointment</h2>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Date *
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled={isBooking}
                    className="w-full"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Time *
                    </label>
                    {availableSlots.length === 0 ? (
                      <div className="p-3 bg-muted rounded-lg text-center text-sm text-muted-foreground">
                        No available slots for this date
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            disabled={isBooking}
                            className={`p-2 rounded-lg border transition-colors text-sm font-medium ${
                              selectedTime === time
                                ? 'bg-primary text-white border-primary'
                                : 'border-border hover:border-primary'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Symptoms/Reason for Visit
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    disabled={isBooking}
                    placeholder="Describe your symptoms..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Medical History */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Medical History (Optional)
                  </label>
                  <textarea
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    disabled={isBooking}
                    placeholder="Any relevant medical history..."
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-primary/10 rounded-lg p-4 my-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Consultation Fee:</span>
                    <span className="text-lg font-bold text-primary">${doctor.consultationFee}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isBooking || !selectedDate || !selectedTime}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isBooking ? 'Booking...' : 'Confirm Booking'}
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground text-center">
                    You&apos;ll be redirected to login to complete your booking
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
