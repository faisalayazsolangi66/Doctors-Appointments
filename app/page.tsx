import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Calendar, Users, Clock, Shield } from 'lucide-react';

/**
 * Home Page Component
 * Landing page showing key features and call-to-action
 * Responsive design for mobile and desktop
 */
export default function Home() {
  const features = [
    {
      icon: Users,
      title: 'Expert Doctors',
      description: 'Connect with certified and experienced healthcare professionals',
    },
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Book appointments at your convenient time with simple scheduling',
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Efficient appointment management and timely consultations',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical information is protected with advanced security',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="px-4 py-12 sm:py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Book Your <span className="text-primary">Medical Consultation</span> Today
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with trusted healthcare professionals, schedule appointments at your convenience, and manage your health journey all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/doctors">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                Find Doctors
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12">
            Why Choose MediBook?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:py-24 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Book Your First Appointment?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Browse through our network of doctors and find the perfect match for your medical needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/doctors">
              <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                Browse Doctors
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Doctors Section */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Are You a Healthcare Professional?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our platform to manage your appointments, reach more patients, and grow your practice.
          </p>

          <Link href="/doctor/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Register as Doctor
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 MediBook. All rights reserved. Secure medical appointment booking.</p>
        </div>
      </footer>
    </div>
  );
}
