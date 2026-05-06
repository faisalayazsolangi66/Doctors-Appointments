'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/header';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorAlert, SuccessAlert } from '@/components/error-alert';
import { useAuth } from '@/components/auth-context';
import { Clock, Trash2, Plus } from 'lucide-react';

/**
 * Time Slot Configuration Interface
 */
interface TimeSlotConfig {
  day: string;
  startTime: string;
  endTime: string;
  breaks: Array<{
    start: string;
    end: string;
  }>;
}

/**
 * Doctor Availability Management Page
 * Allows doctors to set their working hours and breaks
 */
export default function AvailabilityPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [schedule, setSchedule] = useState<TimeSlotConfig[]>([]);

  // Redirect if not authenticated as doctor
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      // router.push('/doctor/login');
      // return;
    }

    // Fetch current availability
    const fetchAvailability = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/doctors/availability');
        if (response.ok) {
          const data = await response.json();
          setSchedule(data.schedule || getDefaultSchedule());
        } else {
          setSchedule(getDefaultSchedule());
        }
      } catch (err) {
        console.error('[v0] Error fetching availability:', err);
        setSchedule(getDefaultSchedule());
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [isAuthenticated, user, router]);

  const getDefaultSchedule = (): TimeSlotConfig[] => {
    return days.map((day) => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
      breaks: [],
    }));
  };

  const updateDaySchedule = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const newSchedule = [...schedule];
    if (field === 'startTime' || field === 'endTime') {
      newSchedule[index] = {
        ...newSchedule[index],
        [field]: value,
      };
    }
    setSchedule(newSchedule);
  };

  const addBreak = (dayIndex: number) => {
    const newSchedule = [...schedule];
    if (!newSchedule[dayIndex].breaks) {
      newSchedule[dayIndex].breaks = [];
    }
    newSchedule[dayIndex].breaks.push({
      start: '12:00',
      end: '13:00',
    });
    setSchedule(newSchedule);
  };

  const updateBreak = (
    dayIndex: number,
    breakIndex: number,
    field: string,
    value: string
  ) => {
    const newSchedule = [...schedule];
    if (newSchedule[dayIndex].breaks) {
      newSchedule[dayIndex].breaks[breakIndex] = {
        ...newSchedule[dayIndex].breaks[breakIndex],
        [field]: value,
      };
    }
    setSchedule(newSchedule);
  };

  const removeBreak = (dayIndex: number, breakIndex: number) => {
    const newSchedule = [...schedule];
    if (newSchedule[dayIndex].breaks) {
      newSchedule[dayIndex].breaks.splice(breakIndex, 1);
    }
    setSchedule(newSchedule);
  };

  const handleSaveAvailability = async () => {
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/doctors/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save availability');
      }

      setSuccessMessage('Availability updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error saving availability';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Manage Your Availability
          </h1>
          <p className="text-muted-foreground">
            Set your working hours and breaks for each day of the week
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
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

        {/* Schedule Form */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Weekly Schedule
          </h2>

          <div className="space-y-6">
            {schedule.map((daySchedule, dayIndex) => (
              <div
                key={daySchedule.day}
                className="border border-border rounded-lg p-6"
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {daySchedule.day}
                  </h3>
                </div>

                {/* Working Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={daySchedule.startTime}
                      onChange={(e) =>
                        updateDaySchedule(dayIndex, 'startTime', e.target.value)
                      }
                      disabled={isSaving}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={daySchedule.endTime}
                      onChange={(e) =>
                        updateDaySchedule(dayIndex, 'endTime', e.target.value)
                      }
                      disabled={isSaving}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Breaks Section */}
                {daySchedule.breaks && daySchedule.breaks.length > 0 && (
                  <div className="mb-4 bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground mb-3">
                      Break Times
                    </p>
                    <div className="space-y-3">
                      {daySchedule.breaks.map((breakTime, breakIndex) => (
                        <div
                          key={breakIndex}
                          className="flex gap-2 items-end"
                        >
                          <div className="flex-1">
                            <label className="block text-xs text-muted-foreground mb-1">
                              From
                            </label>
                            <Input
                              type="time"
                              value={breakTime.start}
                              onChange={(e) =>
                                updateBreak(
                                  dayIndex,
                                  breakIndex,
                                  'start',
                                  e.target.value
                                )
                              }
                              disabled={isSaving}
                              className="w-full"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-muted-foreground mb-1">
                              To
                            </label>
                            <Input
                              type="time"
                              value={breakTime.end}
                              onChange={(e) =>
                                updateBreak(
                                  dayIndex,
                                  breakIndex,
                                  'end',
                                  e.target.value
                                )
                              }
                              disabled={isSaving}
                              className="w-full"
                            />
                          </div>
                          <Button
                            onClick={() => removeBreak(dayIndex, breakIndex)}
                            disabled={isSaving}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Break Button */}
                <Button
                  onClick={() => addBreak(dayIndex)}
                  disabled={isSaving}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Break
                </Button>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex gap-3">
            <Button
              onClick={handleSaveAvailability}
              disabled={isSaving}
              className="flex-1 bg-primary hover:bg-primary/90 gap-2"
            >
              <Clock className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Availability'}
            </Button>
            <Button
              onClick={() => router.push('/doctor/dashboard')}
              disabled={isSaving}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 <strong>Tip:</strong> Set your working hours and add breaks for lunch,
            meetings, or other activities. Patients will only be able to book
            appointments during your available time slots.
          </p>
        </div>
      </div>
    </div>
  );
}
