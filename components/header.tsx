'use client';

import Link from 'next/link';
import { useAuth } from './auth-context';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Header Component
 * Main navigation header with logo, menu, and user account options
 * Mobile responsive with hamburger menu
 */
export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              M
            </div>
            <span className="hidden sm:inline">MediBook</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors text-sm">
              Home
            </Link>
            <Link href="/doctors" className="text-foreground hover:text-primary transition-colors text-sm">
              Find Doctors
            </Link>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  href={user.role === 'doctor' ? '/doctor/dashboard' : '/appointments'}
                  className="text-foreground hover:text-primary transition-colors text-sm"
                >
                  {user.role === 'doctor' ? 'Dashboard' : 'My Appointments'}
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <nav className="flex flex-col gap-3 mt-4">
              <Link
                href="/"
                className="text-foreground hover:text-primary transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/doctors"
                className="text-foreground hover:text-primary transition-colors px-4 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Doctors
              </Link>

              {isAuthenticated && user ? (
                <>
                  <Link
                    href={user.role === 'doctor' ? '/doctor/dashboard' : '/appointments'}
                    className="text-foreground hover:text-primary transition-colors px-4 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user.role === 'doctor' ? 'Dashboard' : 'My Appointments'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-foreground hover:text-primary transition-colors px-4 py-2 text-left flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4 pt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
