# MediBook - Medical Appointment Booking System

A comprehensive, full-stack medical appointment booking platform built with Next.js, MongoDB, and TypeScript.

## 📋 Project Overview

MediBook is a professional medical appointment booking system that connects patients with healthcare professionals. The system includes separate patient and doctor interfaces with complete appointment management, availability scheduling, and PDF confirmations.

### Key Features

- **Patient Features**
  - Browse and search for doctors by specialization
  - View detailed doctor profiles with ratings and qualifications
  - Book appointments with interactive calendar and time slot selection
  - View personal appointment history
  - Download PDF appointment confirmations
  - Manage appointment status and details

- **Doctor Features**
  - Manage weekly availability schedule with customizable break times
  - View upcoming and completed appointments
  - Add notes to patient appointments
  - Update appointment status (completed, cancelled)
  - Edit professional profile and clinic information
  - View appointment statistics and dashboard

- **System Features**
  - Secure JWT-based authentication with password hashing (bcrypt)
  - Mobile-first responsive design (native app experience)
  - Professional medical color scheme (teal, slate, blue)
  - 30-minute appointment time slots
  - PDF appointment confirmations
  - Real-time appointment management

## 🏗️ Architecture & Code Structure

```
/vercel/share/v0-project/
├── app/                              # Next.js App Router
│   ├── api/                          # API Routes
│   │   ├── auth/                    # Authentication endpoints
│   │   │   ├── register/route.ts    # Patient & Doctor registration
│   │   │   ├── login/route.ts       # Login endpoint
│   │   │   ├── logout/route.ts      # Logout endpoint
│   │   │   └── profile/route.ts     # User profile management
│   │   ├── doctors/                 # Doctor management
│   │   │   ├── route.ts             # List/create doctors
│   │   │   ├── [id]/route.ts        # Get doctor details
│   │   │   └── availability/route.ts # Manage availability
│   │   └── appointments/            # Appointment management
│   │       ├── route.ts             # Create/list appointments
│   │       ├── available-slots/route.ts # Get available time slots
│   │       └── [id]/                # Appointment details & PDF
│   │
│   ├── (auth)
│   │   ├── login/page.tsx           # Patient login
│   │   └── register/page.tsx        # Patient registration
│   │
│   ├── doctors/
│   │   ├── page.tsx                 # Doctor listing with filters
│   │   └── [id]/page.tsx            # Doctor details & booking
│   │
│   ├── appointments/
│   │   ├── page.tsx                 # Patient appointments list
│   │   └── [id]/page.tsx            # Appointment details & confirmation
│   │
│   ├── doctor/                      # Doctor portal
│   │   ├── login/page.tsx           # Doctor login
│   │   ├── register/page.tsx        # Doctor registration (3-step)
│   │   ├── dashboard/page.tsx       # Main dashboard with appointments
│   │   ├── availability/page.tsx    # Schedule management
│   │   └── profile/page.tsx         # Profile editing
│   │
│   ├── layout.tsx                   # Root layout with metadata
│   ├── globals.css                  # Global styles & color variables
│   └── page.tsx                     # Home/landing page
│
├── lib/
│   ├── db.ts                        # MongoDB connection & initialization
│   ├── models.ts                    # TypeScript interfaces & MongoDB schemas
│   ├── auth.ts                      # JWT and password hashing utilities
│   ├── validation.ts                # Zod validation schemas
│   ├── colors.ts                    # Color system constants
│   └── utils.ts                     # Helper functions (dates, times, slots)
│
├── components/
│   ├── auth-context.tsx             # React Context for authentication
│   ├── header.tsx                   # Main navigation header
│   ├── loading-spinner.tsx          # Loading indicators
│   └── error-alert.tsx              # Error/success alerts
│
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
└── next.config.mjs                  # Next.js configuration
```

## 🗄️ Database Schema

### MongoDB Collections

#### 1. **Users Collection** (Patients & Doctors)
```javascript
{
  _id: ObjectId,
  email: string,           // Unique
  password: string,        // Hashed with bcrypt
  name: string,
  role: "patient" | "doctor",
  phone?: string,
  avatar?: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Doctors Collection** (Extended Doctor Info)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // Reference to Users
  specialization: string,
  qualification: string,
  experience: number,      // Years
  bio: string,
  location: string,
  consultationFee: number,
  rating: number,          // 0-5
  totalReviews: number,
  profileImage?: string,
  availabilitySchedule: [
    {
      day: string,         // "Monday", "Tuesday", etc.
      startTime: string,   // "09:00"
      endTime: string,     // "17:00"
      breaks: [
        { start: string, end: string }
      ]
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **Appointments Collection**
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,     // Reference to Users
  doctorId: ObjectId,      // Reference to Doctors._id
  appointmentDate: string, // "2024-01-15" (ISO format)
  appointmentTime: string, // "14:30" (24-hour format)
  status: "scheduled" | "completed" | "cancelled",
  symptoms?: string,       // Patient provided
  medicalHistory?: string,
  notes?: string,          // Doctor provided
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication & Security

### Implementation Details

- **Password Hashing**: bcryptjs with salt rounds = 10
- **JWT Tokens**: Stored in HTTP-only cookies (secure by default)
- **Token Expiry**: 7 days (configurable)
- **Role-Based Access**: Patient vs Doctor separate flows
- **Input Validation**: Zod schemas on all API endpoints
- **SQL Injection Prevention**: MongoDB with parameterized queries

### Auth Flow

1. **Registration**: User creates account → Password hashed → JWT created → Cookie set
2. **Login**: Credentials validated → Password compared with hash → JWT created
3. **Protected Routes**: JWT verified in API middleware → Request processed
4. **Logout**: Cookie cleared → Session ended

## 🎨 Design System

### Color Palette

**Light Mode:**
- Primary: Teal (`oklch(0.52 0.16 204)`) - Trust, Healthcare
- Secondary: Medical Blue (`oklch(0.45 0.08 250)`)
- Accent: Vibrant Teal (`oklch(0.55 0.18 168)`)
- Background: Off-white with cool tint (`oklch(0.98 0.01 198)`)
- Foreground: Deep slate-blue (`oklch(0.22 0.04 243)`)

**Dark Mode:**
- Optimized for accessibility and reduced eye strain
- Maintains professional medical appearance
- Clear contrast ratios for WCAG compliance

### Typography

- **Heading Font**: Geist (sans-serif)
- **Body Font**: Geist (sans-serif)
- **Mono Font**: Geist Mono (for code, confirmation IDs)
- **Font Sizes**: Responsive scaling from mobile to desktop

### Responsive Design

- **Mobile First**: Base styles optimized for mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Native App Feel**: Safe area padding, full-height layouts on mobile

## 📱 API Reference

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user (patient or doctor)

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "patient",
  "phone": "+1234567890"
}
```

**Response:** `200 OK`
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient"
}
```

#### POST `/api/auth/login`
Authenticate user

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepass123",
  "role": "patient"
}
```

**Response:** `200 OK` (Sets JWT in cookie)

#### POST `/api/auth/logout`
Logout user

**Response:** `200 OK` (Clears JWT cookie)

#### GET `/api/auth/profile`
Get current user profile

**Response:** `200 OK`
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "phone": "+1234567890"
}
```

#### PUT `/api/auth/profile`
Update user profile

**Request:**
```json
{
  "name": "Jane Doe",
  "phone": "+0987654321"
}
```

### Doctor Endpoints

#### GET `/api/doctors`
List doctors with filtering

**Query Params:**
- `search`: Search by name or specialization
- `specialization`: Filter by specialization

**Response:** `200 OK`
```json
{
  "doctors": [
    {
      "_id": "doctor_id",
      "name": "Dr. Smith",
      "specialization": "Cardiologist",
      "experience": 10,
      "location": "New York, NY",
      "consultationFee": 150,
      "rating": 4.8,
      "totalReviews": 45
    }
  ]
}
```

#### GET `/api/doctors/:id`
Get doctor details

**Response:** `200 OK`
```json
{
  "_id": "doctor_id",
  "name": "Dr. Smith",
  "specialization": "Cardiologist",
  "qualification": "MD",
  "experience": 10,
  "bio": "Experienced cardiologist...",
  "location": "New York, NY",
  "phone": "+1234567890",
  "email": "dr.smith@clinic.com",
  "consultationFee": 150,
  "rating": 4.8,
  "totalReviews": 45
}
```

#### POST `/api/doctors/availability`
Set doctor availability

**Request:**
```json
{
  "schedule": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "breaks": [
        { "start": "12:00", "end": "13:00" }
      ]
    }
  ]
}
```

### Appointment Endpoints

#### POST `/api/appointments`
Create appointment

**Request:**
```json
{
  "doctorId": "doctor_id",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "14:30",
  "symptoms": "Chest pain",
  "medicalHistory": "Diabetes"
}
```

**Response:** `201 Created`
```json
{
  "_id": "appointment_id",
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "14:30",
  "status": "scheduled"
}
```

#### GET `/api/appointments`
Get user's appointments

**Response:** `200 OK`
```json
{
  "appointments": [
    {
      "_id": "appointment_id",
      "doctorId": {
        "_id": "doctor_id",
        "name": "Dr. Smith"
      },
      "appointmentDate": "2024-01-15",
      "appointmentTime": "14:30",
      "status": "scheduled"
    }
  ]
}
```

#### GET `/api/appointments/available-slots`
Get available time slots for a doctor on a date

**Query Params:**
- `doctorId`: Doctor ID
- `date`: Date in YYYY-MM-DD format

**Response:** `200 OK`
```json
{
  "slots": ["09:00", "09:30", "10:00", "10:30", "14:00"]
}
```

#### GET `/api/appointments/:id`
Get appointment details

**Response:** `200 OK`
```json
{
  "_id": "appointment_id",
  "patientId": { "name": "John Doe", "email": "..." },
  "doctorId": { "name": "Dr. Smith", "email": "..." },
  "appointmentDate": "2024-01-15",
  "appointmentTime": "14:30",
  "status": "scheduled",
  "symptoms": "Chest pain",
  "medicalHistory": "Diabetes"
}
```

#### PUT `/api/appointments/:id`
Update appointment (doctor only)

**Request:**
```json
{
  "status": "completed",
  "notes": "Patient prescribed antibiotics"
}
```

#### GET `/api/appointments/:id/pdf`
Download PDF confirmation

**Response:** PDF file

## 📝 Utility Functions

### Date & Time Utilities (`lib/utils.ts`)

```typescript
// Format date as YYYY-MM-DD
formatDateISO(date: Date): string

// Format time as HH:mm
formatTime(date: Date): string

// Parse time string to minutes since midnight
timeToMinutes(time: string): number

// Convert minutes to time string
minutesToTime(minutes: number): string

// Get day of week from date
getDayOfWeek(date: Date): string

// Generate time slots for a date
generateTimeSlots(date: string, doctor: Doctor, bookedSlots: string[]): string[]

// Check if time slot is available
isTimeSlotAvailable(time: string, availability: TimeSlotConfig): boolean

// Format for display (e.g., "Monday, Jan 15, 2024")
formatDateForDisplay(dateString: string): string

// Format date and time (e.g., "Jan 15, 2024 - 2:30 PM")
formatDateTimeForDisplay(dateString: string, timeString: string): string
```

### Validation Helpers

```typescript
// Validate email format
isValidEmail(email: string): boolean

// Validate phone number
isValidPhone(phone: string): boolean

// Validate MongoDB ObjectId
isValidObjectId(id: string): boolean
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB Atlas account
- Environment variables configured

### Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/medibook

# JWT Configuration
JWT_SECRET=your_secure_random_string_min_32_chars_here

# Optional: API configuration
NODE_ENV=development
```

### Installation

1. **Clone/Access Project**
   ```bash
   cd /vercel/share/v0-project
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set Environment Variables**
   - Add `MONGODB_URI` and `JWT_SECRET` via project settings
   - Or create `.env.local` file with variables

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

5. **Access Application**
   - Open http://localhost:3000 in browser
   - System will automatically initialize MongoDB collections on first request

### Database Initialization

Collections are automatically created with proper indexes on first API call. No manual setup required.

## 📖 User Flows

### Patient Flow

1. **Landing Page** → Browse features and doctor highlights
2. **Register/Login** → Create account or sign in
3. **Find Doctors** → Search and filter by specialization
4. **Doctor Details** → View profile, ratings, availability
5. **Book Appointment** → Select date, time, add symptoms
6. **Confirmation** → View details, download PDF
7. **Manage Appointments** → View history, update status

### Doctor Flow

1. **Landing Page** → Overview and registration CTA
2. **Doctor Register** → 3-step multi-part registration
3. **Doctor Login** → Authenticate with email/password
4. **Setup Availability** → Configure weekly schedule and breaks
5. **Dashboard** → View upcoming appointments
6. **Manage Appointments** → Mark completed, add notes
7. **Edit Profile** → Update professional information

## 🔧 Development Guidelines

### Code Organization

- **Components**: Reusable UI components in `components/`
- **API Routes**: RESTful endpoints organized by domain
- **Utilities**: Helper functions in `lib/` with clear documentation
- **Styling**: Tailwind CSS with design tokens in CSS variables
- **Types**: TypeScript interfaces in `lib/models.ts`

### Best Practices

1. **Always validate inputs**: Use Zod schemas on API routes
2. **Error handling**: Provide meaningful error messages
3. **Loading states**: Show spinners during async operations
4. **Mobile first**: Test on mobile devices
5. **Accessibility**: Use semantic HTML, proper ARIA labels
6. **Comments**: Add comments explaining complex logic

### Adding New Features

1. **Create API endpoint**: Add route in `app/api/`
2. **Add validation**: Create Zod schema in `lib/validation.ts`
3. **Create UI page**: Add component in appropriate directory
4. **Add utilities**: Helper functions in `lib/utils.ts`
5. **Update types**: Add interfaces to `lib/models.ts`
6. **Test**: Use browser dev tools and preview

## 🐛 Debugging

### View Console Logs

```typescript
// Use [v0] prefix for v0-specific logs
console.log('[v0] User data received:', userData);
console.log('[v0] API call starting:', params);
console.log('[v0] Error occurred:', error.message);
```

### Check Network Requests

1. Open Browser DevTools → Network tab
2. Perform action to see API requests
3. Check request/response payloads
4. Verify status codes (200, 201, 400, 401, etc.)

### MongoDB Queries

Monitor in MongoDB Atlas:
- Collections → View data
- Monitoring → Check query performance
- Logs → Review operation history

## 📦 Dependencies

**Core**
- `next`: App framework
- `react`: UI library
- `typescript`: Type safety

**Database**
- `mongodb`: Database driver
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT tokens

**Validation**
- `zod`: Schema validation

**PDF Generation**
- `jspdf`: PDF creation
- `html2pdf.js`: HTML to PDF conversion

**UI**
- `tailwindcss`: Styling
- `lucide-react`: Icons

## 📄 License

Built with care for healthcare professionals.

## 🤝 Support

For issues or questions:
1. Check API responses for error messages
2. Review console logs for debugging info
3. Verify environment variables are set
4. Check MongoDB Atlas connection string
5. Ensure all fields are properly validated

---

**MediBook** - Connecting patients with healthcare professionals since 2024
