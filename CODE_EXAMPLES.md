# MediBook - Code Examples & Patterns

Real code examples showing how to use the system.

## 🔐 Authentication Examples

### Register a Patient

```typescript
// Frontend - app/register/page.tsx
const handleRegister = async (e: React.FormEvent) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123',
      role: 'patient',
      phone: '+1234567890'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[v0] Registration failed:', error.error);
    return;
  }

  const user = await response.json();
  console.log('[v0] User registered:', user.name);
  // Redirect to home or dashboard
};
```

### Login User

```typescript
// Frontend - Using useAuth hook
import { useAuth } from '@/components/auth-context';

export function LoginForm() {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password, 'patient');
      // Redirect to appointments page
      router.push('/appointments');
    } catch (error) {
      console.error('[v0] Login failed:', error.message);
    }
  };

  return (
    // Form component
  );
}
```

### Logout User

```typescript
// Frontend - Using useAuth hook
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  router.push('/');
};
```

## 👨‍⚕️ Doctor Examples

### Register as Doctor

```typescript
// 3-step registration form
const handleRegisterDoctor = async () => {
  const doctorData = {
    name: 'Dr. Smith',
    email: 'dr.smith@clinic.com',
    password: 'SecurePass123',
    specialization: 'Cardiologist',
    qualification: 'MD',
    experience: 10,
    bio: 'Experienced cardiologist with 10 years...',
    location: 'New York, NY',
    consultationFee: 150,
  };

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...doctorData,
      role: 'doctor',
    }),
  });

  if (response.ok) {
    // Save additional doctor info
    await fetch('/api/doctors', {
      method: 'POST',
      body: JSON.stringify({
        specialization: doctorData.specialization,
        qualification: doctorData.qualification,
        experience: doctorData.experience,
        bio: doctorData.bio,
        location: doctorData.location,
        consultationFee: doctorData.consultationFee,
      }),
    });
  }
};
```

### Set Availability

```typescript
// Doctor/app/availability/page.tsx
const handleSaveAvailability = async () => {
  const schedule = [
    {
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      breaks: [
        { start: '12:00', end: '13:00' } // Lunch break
      ],
    },
    {
      day: 'Tuesday',
      startTime: '09:00',
      endTime: '17:00',
      breaks: [
        { start: '12:00', end: '13:00' }
      ],
    },
    // ... more days
  ];

  const response = await fetch('/api/doctors/availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schedule }),
  });

  if (response.ok) {
    console.log('[v0] Availability updated');
  }
};
```

## 📅 Appointment Examples

### Book Appointment

```typescript
// Patient/app/doctors/[id]/page.tsx
const handleBookAppointment = async (e: React.FormEvent) => {
  e.preventDefault();

  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctorId: doctorId,
      patientId: user.id,
      appointmentDate: '2024-01-15',
      appointmentTime: '14:30',
      symptoms: 'Chest pain and shortness of breath',
      medicalHistory: 'Hypertension, family history of heart disease',
    }),
  });

  if (response.ok) {
    const appointment = await response.json();
    console.log('[v0] Appointment booked:', appointment._id);
    // Redirect to confirmation
    router.push(`/appointments/${appointment._id}`);
  }
};
```

### Get Available Slots

```typescript
// Fetch available time slots for a date
useEffect(() => {
  const fetchSlots = async () => {
    const response = await fetch(
      `/api/appointments/available-slots?doctorId=${doctorId}&date=2024-01-15`
    );

    if (response.ok) {
      const data = await response.json();
      setAvailableSlots(data.slots); // ['09:00', '09:30', '10:00', ...]
      console.log('[v0] Available slots:', data.slots);
    }
  };

  fetchSlots();
}, [selectedDate]);
```

### List Appointments

```typescript
// Patient/app/appointments/page.tsx
useEffect(() => {
  const fetchAppointments = async () => {
    const response = await fetch('/api/appointments');

    if (response.ok) {
      const data = await response.json();
      const appointments = data.appointments;

      // Sort by date
      appointments.sort((a: any, b: any) => {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return dateB.getTime() - dateA.getTime();
      });

      setAppointments(appointments);
    }
  };

  fetchAppointments();
}, []);
```

### Update Appointment Status

```typescript
// Doctor/app/doctor/dashboard/page.tsx
const handleCompleteAppointment = async (appointmentId: string) => {
  const response = await fetch(`/api/appointments/${appointmentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'completed',
      notes: 'Patient showed improvement. Continue medications.',
    }),
  });

  if (response.ok) {
    console.log('[v0] Appointment marked as completed');
    // Update local state
    setAppointments((prev) =>
      prev.map((apt) =>
        apt._id === appointmentId
          ? { ...apt, status: 'completed' }
          : apt
      )
    );
  }
};
```

### Download PDF Confirmation

```typescript
// Patient/app/appointments/[id]/page.tsx
const handleDownloadPDF = async (appointmentId: string) => {
  try {
    const response = await fetch(`/api/appointments/${appointmentId}/pdf`);
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `appointment-${appointmentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      console.log('[v0] PDF downloaded successfully');
    }
  } catch (error) {
    console.error('[v0] Error downloading PDF:', error);
  }
};
```

## 🔍 Doctor Search & Filtering

### Search Doctors

```typescript
// Patient/app/doctors/page.tsx
const [searchQuery, setSearchQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(async () => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.append('search', searchQuery);
    }

    const response = await fetch(`/api/doctors?${params.toString()}`);
    const data = await response.json();
    setDoctors(data.doctors);
    console.log('[v0] Search results:', data.doctors.length);
  }, 300); // Debounce search

  return () => clearTimeout(timer);
}, [searchQuery]);
```

### Filter by Specialization

```typescript
// Patient/app/doctors/page.tsx
const [specialization, setSpecialization] = useState('');

useEffect(() => {
  const params = new URLSearchParams();
  if (specialization) {
    params.append('specialization', specialization);
  }

  const fetchDoctors = async () => {
    const response = await fetch(`/api/doctors?${params.toString()}`);
    const data = await response.json();
    setDoctors(data.doctors);
    console.log('[v0] Filtered by:', specialization);
  };

  fetchDoctors();
}, [specialization]);
```

## 🎨 Using the Design System

### Color System

```typescript
// Using medical color scheme
export function DoctorCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-primary font-bold">Dr. Smith</h3>
      <p className="text-muted-foreground">Cardiologist</p>
      
      <button className="bg-primary text-white hover:bg-primary/90">
        Book Now
      </button>
    </div>
  );
}
```

### Responsive Design

```typescript
// Mobile-first responsive layout
export function AppointmentGrid() {
  return (
    // 1 column on mobile, 2 on tablet, 3 on desktop
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((apt) => (
        <AppointmentCard key={apt._id} appointment={apt} />
      ))}
    </div>
  );
}
```

## 🔧 Utility Function Usage

### Date/Time Utilities

```typescript
import {
  formatDateISO,
  formatTime,
  getDayOfWeek,
  generateTimeSlots,
  formatDateForDisplay,
  formatDateTimeForDisplay,
} from '@/lib/utils';

// Format date for display
const displayDate = formatDateForDisplay('2024-01-15');
// Output: "Monday, Jan 15, 2024"

// Get day of week
const dayName = getDayOfWeek(new Date('2024-01-15'));
// Output: "Monday"

// Generate 30-minute slots between 9 AM - 5 PM
const slots = generateTimeSlots('2024-01-15', doctor, []);
// Output: ["09:00", "09:30", "10:00", ...]

// Format datetime for display
const formatted = formatDateTimeForDisplay('2024-01-15', '14:30');
// Output: "Jan 15, 2024 - 2:30 PM"
```

### Validation Utilities

```typescript
import {
  isValidEmail,
  isValidPhone,
  isValidObjectId,
} from '@/lib/utils';

// Validate email
if (!isValidEmail('user@example.com')) {
  setError('Invalid email format');
}

// Validate phone
if (!isValidPhone('+1234567890')) {
  setError('Invalid phone format');
}

// Validate MongoDB ID
if (!isValidObjectId(userId)) {
  setError('Invalid user ID');
}
```

## 📊 Common Patterns

### Loading State

```typescript
// Show loading spinner
{isLoading && <LoadingSpinner />}

// Show skeleton loaders
{isLoading && (
  <div className="grid gap-4">
    {[...Array(6)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)}

// Show content when loaded
{!isLoading && doctors.length > 0 && (
  // Render doctors
)}
```

### Error Handling

```typescript
// Show error alert
{error && (
  <ErrorAlert
    message={error}
    onDismiss={() => setError('')}
  />
)}

// Show success alert
{successMessage && (
  <SuccessAlert
    message={successMessage}
    onDismiss={() => setSuccessMessage('')}
  />
)}
```

### Form Validation

```typescript
// Using Zod for validation
import { z } from 'zod';

const appointmentSchema = z.object({
  doctorId: z.string().min(24, 'Invalid doctor'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/),
  symptoms: z.string().min(10, 'Describe symptoms'),
});

try {
  const validated = appointmentSchema.parse(formData);
  // Proceed with booking
} catch (error) {
  console.log('[v0] Validation error:', error.errors);
}
```

## 🚀 Advanced Patterns

### React Context for Auth

```typescript
// Using authentication context
import { useAuth } from '@/components/auth-context';

export function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Fetching with Caching

```typescript
// Use SWR for data fetching and caching
import useSWR from 'swr';

export function DoctorsList() {
  const { data: doctors, isLoading, error } = useSWR(
    '/api/doctors',
    fetch
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message="Failed to load doctors" />;

  return (
    // Render doctors
  );
}
```

### Protected Routes

```typescript
// Redirect unauthorized users
export function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push('/');
    }
  }, [isAuthenticated, user, requiredRole]);

  return isAuthenticated && (!requiredRole || user?.role === requiredRole)
    ? children
    : null;
}
```

---

These examples show the actual patterns and code used throughout MediBook.

For more details, see `SYSTEM_GUIDE.md`
