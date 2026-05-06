'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/header';
import { LoadingSpinner, SkeletonCard } from '@/components/loading-spinner';
import { ErrorAlert } from '@/components/error-alert';
import { Star, MapPin, Clock, Users } from 'lucide-react';

/**
 * Doctor Interface for listing
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
 * Doctors Listing Page
 * Shows all available doctors with search and filtering
 * Click on a doctor to view details and book appointment
 */
export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  console.log('[v0] DoctorsPage mounted',doctors);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        setError('');

        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (specializationFilter) params.append('specialization', specializationFilter);

        const response = await fetch(`/api/doctors?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch doctors');

        const data = await response.json();
        console.log('[v0] Doctors fetched:', data.data.doctors);
        setDoctors(data.data.doctors || []);

        // Extract unique specializations
        const specs = Array.from(new Set(data.doctors?.map((d: Doctor) => d.specialization) || []));
        setSpecializations(specs as string[]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading doctors';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(fetchDoctors, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, specializationFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Find Your Doctor
          </h1>
          <p className="text-muted-foreground">
            Browse through our network of qualified healthcare professionals
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-20 space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Doctor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Specialization Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Specialization
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSpecializationFilter('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      specializationFilter === ''
                        ? 'bg-primary text-white'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    All Specializations
                  </button>
                  {specializations.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setSpecializationFilter(spec)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        specializationFilter === spec
                          ? 'bg-primary text-white'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Doctors Grid */}
          <div className="lg:col-span-3">
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
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && doctors.length === 0 && !error && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No doctors found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters
                </p>
              </div>
            )}

            {/* Doctors Grid */}
            {!isLoading && doctors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Doctor Card Content */}
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            Dr. {doctor.name}
                          </h3>
                          <p className="text-sm text-primary font-medium">
                            {doctor.specialization}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(doctor.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          {doctor.totalReviews} reviews
                        </span>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {doctor.bio}
                      </p>

                      {/* Details */}
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{doctor.experience} years experience</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{doctor.location}</span>
                        </div>
                      </div>

                      {/* Fee and Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Consultation Fee</p>
                          <p className="text-lg font-semibold text-primary">
                            ${doctor.consultationFee}
                          </p>
                        </div>
                        <Link href={`/doctors/${doctor._id}`}>
                          <Button className="bg-primary hover:bg-primary/90">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
