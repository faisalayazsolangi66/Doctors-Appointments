'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/error-alert';
import { Header } from '@/components/header';

/**
 * Doctor Registration Page
 * Allows healthcare professionals to register as doctors
 * Collects professional information, qualifications, and contact details
 */
export default function DoctorRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    bio: '',
    location: '',
    consultationFee: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    setError('');

    // Validate step 1
    if (step === 1) {
      // if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      //   setError('Please fill in all required fields');
      //   return;
      // }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // if (!formData.specialization || !formData.qualification || !formData.experience) {
      //   setError('Please fill in all required fields');
      //   return;
      // }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic validation for Step 3 fields
      // if (!formData.clinicAddress || !formData.clinicPhone || 
      //     !formData.consultationFee || !formData.bio || !formData.specialization) {
      //   throw new Error('Please fill in all required fields');
      // }

      // Convert qualifications string to array
      // const qualificationsArray = formData.qualifications
      //   .split(',')
      //   .map((q: string) => q.trim())
      //   .filter((q: string) => q.length > 0);

      // if (qualificationsArray.length === 0) {
      //   throw new Error('Please enter at least one qualification (e.g., MBBS, FCPS)');
      // }

      const doctorPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'doctor' as const,

        // Doctor specific fields
        specialization: formData.specialization,
        qualifications: ["MBBS"],
        clinicAddress: "test",
        clinicPhone: "1234567890",
        consultationFee: parseFloat(formData.consultationFee),
        bio: formData.bio || '',
      };

      // Single registration call with all data
      await register(
        formData.name,
        formData.email,
        formData.password,
        'doctor',
        formData.phone,
        doctorPayload   // Pass full payload as last parameter
      );

      router.push('/doctor/dashboard');
    } catch (err: any) {
      const errorMessage = err?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-2xl">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Doctor Registration
            </h1>
            <p className="text-muted-foreground">
              Join our platform to manage your practice and reach more patients
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-5">
            {/* Error Alert */}
            {error && (
              <ErrorAlert
                message={error}
                onDismiss={() => setError('')}
              />
            )}

            {/* Step 1: Account Information */}
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Create Your Account
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Dr. John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="doctor@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password *
                  </label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password *
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 mt-6"
                >
                  Next Step
                </Button>
              </>
            )}

            {/* Step 2: Professional Information */}
            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Professional Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Specialization *
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    disabled={isLoading}
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
                    Qualification *
                  </label>
                  <Input
                    type="text"
                    name="qualification"
                    placeholder="e.g., MD, MBBS, DDS"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Years of Experience *
                  </label>
                  <Input
                    type="number"
                    name="experience"
                    placeholder="e.g., 10"
                    value={formData.experience}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full"
                    min="0"
                    max="60"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Next Step
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Clinic Information */}
            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Clinic Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Professional Bio *
                  </label>
                  <textarea
                    name="bio"
                    placeholder="Write a brief bio about yourself and your specialization"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Clinic Location *
                  </label>
                  <Input
                    type="text"
                    name="location"
                    placeholder="e.g., 123 Main St, New York, NY"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Consultation Fee (USD) *
                  </label>
                  <Input
                    type="number"
                    name="consultationFee"
                    placeholder="e.g., 100"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? 'Creating Account...' : 'Complete Registration'}
                  </Button>
                </div>
              </>
            )}

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/doctor/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
