'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { LoadingSpinner, SkeletonCard } from '@/components/loading-spinner';
import { ErrorAlert } from '@/components/error-alert';
import { useAuth } from '@/components/auth-context';
import { formatDateTimeForDisplay } from '@/lib/utils';
import { Calendar, Clock, User, FileText, Download, MapPin } from 'lucide-react';

/**
 * Appointment Interface
 */
interface Appointment {
  _id: string;
  patientId: string;
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
    location: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  symptoms?: string;
  medicalHistory?: string;
  notes?: string;
  createdAt: string;
}

/**
 * Patient Appointments Page
 * Shows all appointments for the logged-in patient
 * Can view details, download PDF confirmation, cancel appointments
 */
export default function AppointmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch appointments
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch('/api/appointments');
        if (!response.ok) throw new Error('Failed to fetch appointments');

        const data = await response.json();
        setAppointments(data.appointments || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading appointments';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [isAuthenticated, user]);

  const downloadPDF = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointment-${appointmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('[v0] Error downloading PDF:', err);
      setError('Failed to download PDF');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            My Appointments
          </h1>
          <p className="text-muted-foreground">
            Manage and view all your scheduled appointments
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Error Alert */}
        {error && (
          <ErrorAlert
            message={error}
            onDismiss={() => setError('')}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* No Appointments */}
        {!isLoading && appointments.length === 0 && !error && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No appointments yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Book your first appointment with a doctor today
            </p>
            <Link href="/doctors">
              <Button className="bg-primary hover:bg-primary/90">
                Find Doctors
              </Button>
            </Link>
          </div>
        )}

        {/* Appointments List */}
        {!isLoading && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const doctor = appointment.doctorId;
              const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
              const isPast = appointmentDateTime < new Date();
              const isCancelled = appointment.status === 'cancelled';

              return (
                <div
                  key={appointment._id}
                  className={`border border-border rounded-xl p-6 transition-all hover:shadow-md ${
                    isCancelled
                      ? 'bg-muted/50 opacity-75'
                      : isPast
                      ? 'bg-card'
                      : 'bg-card border-primary/30'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Doctor Info */}
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-2">
                        DOCTOR
                      </p>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Dr. {doctor.name}
                      </h3>
                      <p className="text-sm text-primary mb-2">
                        {doctor.specialization}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {doctor.location}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-2">
                        DATE & TIME
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                          <Calendar className="w-4 h-4 text-primary" />
                          {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                          <Clock className="w-4 h-4 text-primary" />
                          {appointment.appointmentTime}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-2">
                        STATUS
                      </p>
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          isCancelled
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                            : isPast
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                        }`}
                      >
                        {isCancelled ? 'Cancelled' : isPast ? 'Completed' : 'Scheduled'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link href={`/appointments/${appointment._id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadPDF(appointment._id)}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
