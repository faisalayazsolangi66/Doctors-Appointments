'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { LoadingSpinner, SkeletonCard } from '@/components/loading-spinner';
import { ErrorAlert, SuccessAlert } from '@/components/error-alert';
import { useAuth } from '@/components/auth-context';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Settings,
  FileText,
} from 'lucide-react';

/**
 * Appointment for Doctor
 */
interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
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
 * Doctor Dashboard
 * Shows upcoming appointments, statistics, and allows managing availability
 */
export default function DoctorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Redirect to login if not authenticated as doctor
  useEffect(() => {
    console.log('[v0] Auth loading:', authLoading, 'Authenticated:', isAuthenticated, 'User:', user);
    if (!authLoading && (!isAuthenticated || user?.role !== 'doctor')) {
      // router.push('/doctor/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch appointments
  useEffect(() => {
    // if (!isAuthenticated || user?.role !== 'doctor') return;

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

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      setError('');
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: appointmentNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to update appointment');

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === appointmentId
            ? { ...apt, status: newStatus as any, notes: appointmentNotes }
            : apt
        )
      );

      setSuccessMessage('Appointment updated successfully');
      setSelectedAppointment(null);
      setAppointmentNotes('');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating appointment';
      setError(errorMessage);
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

  // Calculate statistics
  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
    return aptDate > new Date() && apt.status === 'scheduled';
  });

  const completedAppointments = appointments.filter((apt) => apt.status === 'completed');
  const totalAppointments = appointments.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Welcome back, Dr. {user?.name}
              </h1>
              <p className="text-muted-foreground">
                Manage your appointments and clinic schedule
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Link href="/doctor/availability">
              <Button className="bg-primary hover:bg-primary/90">
                <Settings className="w-4 h-4 mr-2" />
                Manage Availability
              </Button>
            </Link>
            <Link href="/doctor/profile">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Alerts */}
        {error && (
          <ErrorAlert
            message={error}
            onDismiss={() => setError('')}
          />
        )}
        {successMessage && (
          <SuccessAlert
            message={successMessage}
            onDismiss={() => setSuccessMessage('')}
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-semibold mb-1">
                  TOTAL APPOINTMENTS
                </p>
                <p className="text-3xl font-bold text-foreground">{totalAppointments}</p>
              </div>
              <Calendar className="w-10 h-10 text-primary opacity-20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-semibold mb-1">
                  UPCOMING
                </p>
                <p className="text-3xl font-bold text-primary">{upcomingAppointments.length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-primary opacity-20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-semibold mb-1">
                  COMPLETED
                </p>
                <p className="text-3xl font-bold text-green-600">{completedAppointments.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Appointments</h2>

          {isLoading && (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && appointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No appointments yet
              </h3>
              <p className="text-muted-foreground">
                Your appointments will appear here once patients book with you
              </p>
            </div>
          )}

          {!isLoading && appointments.length > 0 && (
            <div className="space-y-4">
              {appointments
                .sort((a, b) => {
                  const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
                  const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((appointment) => {
                  const patient = appointment.patientId;
                  const appointmentDateTime = new Date(
                    `${appointment.appointmentDate}T${appointment.appointmentTime}`
                  );
                  const isPast = appointmentDateTime < new Date();
                  const isCancelled = appointment.status === 'cancelled';
                  const isCompleted = appointment.status === 'completed';
                  const isSelected = selectedAppointment === appointment._id;

                  return (
                    <div
                      key={appointment._id}
                      className={`border border-border rounded-lg p-4 transition-all ${
                        isSelected
                          ? 'bg-primary/5 border-primary'
                          : isCancelled
                          ? 'bg-muted/50'
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Patient Info */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-foreground">
                              {patient.name}
                            </h3>
                            <span
                              className={`text-xs font-medium px-3 py-1 rounded-full ${
                                isCancelled
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                                  : isCompleted
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                                  : isPast
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                              }`}
                            >
                              {isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : isPast ? 'Pending Review' : 'Upcoming'}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(appointment.appointmentDate).toLocaleDateString('en-US')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {appointment.appointmentTime}
                            </div>
                          </div>

                          {appointment.symptoms && (
                            <div className="mt-2 text-sm">
                              <p className="text-xs text-muted-foreground font-semibold mb-1">
                                SYMPTOMS
                              </p>
                              <p className="text-foreground">{appointment.symptoms}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        {!isCancelled && (
                          <Button
                            onClick={() =>
                              setSelectedAppointment(
                                isSelected ? null : appointment._id
                              )
                            }
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                          >
                            {isSelected ? 'Close' : 'Manage'}
                          </Button>
                        )}
                      </div>

                      {/* Expand/Collapse Section */}
                      {isSelected && !isCancelled && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          {/* Patient Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold mb-1">
                                EMAIL
                              </p>
                              <p className="text-foreground">{patient.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold mb-1">
                                PHONE
                              </p>
                              <p className="text-foreground">{patient.phone}</p>
                            </div>
                          </div>

                          {/* Medical History */}
                          {appointment.medicalHistory && (
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold mb-1">
                                MEDICAL HISTORY
                              </p>
                              <p className="text-foreground text-sm">
                                {appointment.medicalHistory}
                              </p>
                            </div>
                          )}

                          {/* Notes Field */}
                          {!isCompleted && !isPast && (
                            <div>
                              <label className="text-xs text-muted-foreground font-semibold mb-2 block">
                                ADD NOTES (for completed appointment)
                              </label>
                              <textarea
                                value={appointmentNotes}
                                onChange={(e) => setAppointmentNotes(e.target.value)}
                                placeholder="Add any notes or prescriptions here..."
                                rows={3}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              />
                            </div>
                          )}

                          {/* Status Update Buttons */}
                          {!isCancelled && (
                            <div className="flex gap-2">
                              {!isCompleted && (
                                <Button
                                  onClick={() =>
                                    handleUpdateStatus(appointment._id, 'completed')
                                  }
                                  size="sm"
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Completed
                                </Button>
                              )}

                              <Button
                                onClick={() =>
                                  handleUpdateStatus(appointment._id, 'cancelled')
                                }
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                              >
                                Cancel Appointment
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
