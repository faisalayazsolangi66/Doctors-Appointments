'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/header';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorAlert, SuccessAlert } from '@/components/error-alert';
import { useAuth } from '@/components/auth-context';

/**
 * Doctor Profile Page
 * Allows doctors to edit their profile information
 */
export default function DoctorProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    bio: '',
    location: '',
    consultationFee: '',
  });

  // Redirect if not authenticated as doctor
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      router.push('/doctor/login');
      return;
    }

    // Fetch doctor profile
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            specialization: data.specialization || '',
            qualification: data.qualification || '',
            experience: data.experience || '',
            bio: data.bio || '',
            location: data.location || '',
            consultationFee: data.consultationFee || '',
          });
        }
      } catch (err) {
        console.error('[v0] Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      // Update basic user info
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
      });

      // Update doctor-specific info
      const response = await fetch('/api/doctors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: parseInt(formData.experience) || 0,
          bio: formData.bio,
          location: formData.location,
          consultationFee: parseFloat(formData.consultationFee) || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error saving profile';
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Edit Your Profile
          </h1>
          <p className="text-muted-foreground">
            Update your professional information
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

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSaving}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className="w-full opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isSaving}
                className="w-full"
              />
            </div>
          </div>

          <hr className="my-8 border-border" />

          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Professional Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Specialization
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                disabled={isSaving}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a specialization</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Orthopedist">Orthopedist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="General Practitioner">General Practitioner</option>
                <option value="Dentist">Dentist</option>
                <option value="Ophthalmologist">Ophthalmologist</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Qualification
              </label>
              <Input
                type="text"
                name="qualification"
                placeholder="e.g., MD, MBBS, DDS"
                value={formData.qualification}
                onChange={handleInputChange}
                disabled={isSaving}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Years of Experience
              </label>
              <Input
                type="number"
                name="experience"
                placeholder="e.g., 10"
                value={formData.experience}
                onChange={handleInputChange}
                disabled={isSaving}
                className="w-full"
                min="0"
                max="60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Consultation Fee (USD)
              </label>
              <Input
                type="number"
                name="consultationFee"
                placeholder="e.g., 100"
                value={formData.consultationFee}
                onChange={handleInputChange}
                disabled={isSaving}
                className="w-full"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-2">
              Clinic Location
            </label>
            <Input
              type="text"
              name="location"
              placeholder="e.g., 123 Main St, New York, NY"
              value={formData.location}
              onChange={handleInputChange}
              disabled={isSaving}
              className="w-full"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-2">
              Professional Bio
            </label>
            <textarea
              name="bio"
              placeholder="Write a brief bio about yourself and your specialization"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={isSaving}
              rows={5}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/doctor/dashboard')}
              disabled={isSaving}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
