'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorAlert, SuccessAlert } from '@/components/error-alert';
import { useAuth } from '@/components/auth-context';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  Home,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

/**
 * Appointment Interface
 */
interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
    location: string;
    phone: string;
    email: string;
    consultationFee: number;
  };
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  symptoms?: string;
  medicalHistory?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Appointment Details Page
 * Shows comprehensive appointment information
 * Allows downloading PDF confirmation
 */
export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  const { user, isAuthenticated } = useAuth();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch appointment details
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchAppointment = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/appointments/${appointmentId}`);
        if (!response.ok) throw new Error('Failed to fetch appointment');
        const data = await response.json();
        setAppointment(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading appointment';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, isAuthenticated, router]);

  const handleDownloadPDF = async () => {
    if (!appointment) return;

    try {
      setIsDownloading(true);
      const response = await fetch(`/api/appointments/${appointment._id}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointment-${appointment._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download PDF';
      setError(errorMessage);
    } finally {
      setIsDownloading(false);
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

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <ErrorAlert
            title="Appointment Not Found"
            message="The appointment you&apos;re looking for doesn&apos;t exist."
            actionLabel="Back to Appointments"
            onAction={() => router.push('/appointments')}
          />
        </div>
      </div>
    );
  }

  const doctor = appointment.doctorId;
  const patient = appointment.patientId;
  const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
  const isPast = appointmentDateTime < new Date();
  const isCancelled = appointment.status === 'cancelled';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Error Alert */}
        {error && (
          <ErrorAlert
            message={error}
            onDismiss={() => setError('')}
          />
        )}

        {/* Status Banner */}
        {isCancelled && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                Appointment Cancelled
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300">
                This appointment has been cancelled.
              </p>
            </div>
          </div>
        )}

        {isPast && !isCancelled && (
          <div className="mb-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-200">
                Appointment Completed
              </h3>
              <p className="text-sm text-green-800 dark:text-green-300">
                Your appointment with the doctor is complete.
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Card */}
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <h1 className="text-3xl font-bold text-foreground mb-8">
                Appointment Confirmation
              </h1>

              {/* Doctor Section */}
              <div className="mb-8 pb-8 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Doctor Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-lg font-semibold text-foreground">Dr. {doctor.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Specialization</p>
                      <p className="text-lg font-semibold text-primary">
                        {doctor.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">{doctor.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">{doctor.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{doctor.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details Section */}
              <div className="mb-8 pb-8 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Appointment Details
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <p className="text-xs text-muted-foreground font-semibold">Date</p>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <p className="text-xs text-muted-foreground font-semibold">Time</p>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {appointment.appointmentTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Information Section */}
              <div className="mb-8 pb-8 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Patient Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium text-foreground">{patient.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{patient.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{patient.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              {(appointment.symptoms || appointment.medicalHistory) && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Medical Information
                  </h2>
                  <div className="space-y-4">
                    {appointment.symptoms && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Symptoms / Reason for Visit
                        </p>
                        <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                          {appointment.symptoms}
                        </p>
                      </div>
                    )}

                    {appointment.medicalHistory && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Medical History
                        </p>
                        <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                          {appointment.medicalHistory}
                        </p>
                      </div>
                    )}

                    {appointment.notes && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Doctor&apos;s Notes
                        </p>
                        <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fee Summary */}
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Consultation Fee:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${doctor.consultationFee}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-20 space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">Actions</h2>

              {/* Download PDF */}
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>

              {/* Back Button */}
              <Button
                onClick={() => router.push('/appointments')}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Appointments
              </Button>

              {/* Appointment Info Card */}
              <div className="bg-muted rounded-lg p-4 mt-6">
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  CONFIRMATION
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Confirmation ID: <br />
                  <span className="font-mono font-semibold text-foreground">
                    {appointment._id}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Booked on:{' '}
                  {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
