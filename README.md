# 🏥 MediBook - Medical Appointment Booking System

A comprehensive, production-ready medical appointment booking platform built with **Next.js**, **MongoDB**, and **TypeScript**.

> **Book appointments with healthcare professionals | Manage your medical schedule | Professional design | Mobile-first experience**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47a248?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 👥 For Patients
- 🔍 **Search & Filter Doctors** - Browse doctors by specialization
- 📅 **Book Appointments** - Interactive calendar with available time slots
- 👤 **View Doctor Profiles** - Ratings, qualifications, experience
- 📋 **Manage Appointments** - View history, update status
- 📄 **PDF Confirmations** - Download appointment confirmations
- 📱 **Mobile Friendly** - Native app experience on mobile
- 🔐 **Secure Authentication** - Password hashing, JWT tokens

### 👨‍⚕️ For Doctors
- 📝 **Professional Registration** - Multi-step registration form
- ⏰ **Schedule Management** - Set weekly availability with break times
- 📊 **Dashboard** - View upcoming appointments & statistics
- 📝 **Appointment Management** - Add notes, update status
- 👨‍💼 **Profile Management** - Edit professional information
- 🔔 **Real-time Updates** - See new bookings immediately
- 💰 **Consultation Fees** - Set and manage pricing

### 🎨 Design & Experience
- **Professional Medical Colors** - Teal, slate, and medical blue
- **Dark Mode Support** - Automatic light/dark theme
- **Responsive Design** - Works on all devices
- **Accessible UI** - WCAG compliant
- **Fast Performance** - Optimized queries and caching
- **Semantic HTML** - Proper structure and accessibility

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB Atlas account (free tier available)
- 2 minutes of setup time

### Setup (3 Steps)

1. **Get MongoDB URI**
   - Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Copy connection string

2. **Set Environment Variables**
   - In Vercel v0 Settings → Vars:
   ```env
   MONGODB_URI=your_connection_string
   JWT_SECRET=generate_random_32_chars
   ```

3. **Start Development**
   ```bash
   pnpm dev
   ```
   Visit http://localhost:3000

**Full setup guide:** See [QUICKSTART.md](./QUICKSTART.md)

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | Get running in 5 minutes |
| [SYSTEM_GUIDE.md](./SYSTEM_GUIDE.md) | Complete system documentation |
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | MongoDB configuration |
| [CODE_EXAMPLES.md](./CODE_EXAMPLES.md) | Real code patterns |
| [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) | What's been built |

## 🏗️ Architecture

```
MediBook (12 pages + 15+ API endpoints)
├── Patient Interface (7 pages)
│   ├── Home / Doctor Listing / Doctor Details
│   ├── Booking Form / Appointment Management
│   └── PDF Confirmations
├── Doctor Interface (5 pages)
│   ├── Registration / Login / Dashboard
│   ├── Availability Management
│   └── Profile Management
└── API Backend (15+ endpoints)
    ├── Authentication (Register/Login/Profile)
    ├── Doctor Management (List/Details/Availability)
    └── Appointment Management (Book/Update/PDF)
```

## 🛠️ Technology Stack

**Frontend**
- Next.js 16 (App Router)
- React 19 with Hooks
- TypeScript (100% typed)
- Tailwind CSS v4
- Shadcn/ui components
- Lucide icons

**Backend**
- Node.js API Routes
- MongoDB (NoSQL)
- JWT Authentication
- bcryptjs Password Hashing

**Database**
- MongoDB Collections (Users, Doctors, Appointments)
- Automatic Indexes
- Atomic Operations

**Security**
- Password Hashing (bcrypt)
- JWT Tokens
- HTTP-only Cookies
- Input Validation (Zod)
- Role-based Access Control

## 📁 Project Structure

```
app/
├── api/                    # 15+ API endpoints
├── (auth)/                 # Patient authentication
├── doctors/                # Doctor discovery
├── appointments/           # Appointment management
├── doctor/                 # Doctor portal
├── layout.tsx             # Root layout
├── globals.css            # Design system
└── page.tsx               # Home page

lib/
├── db.ts                  # MongoDB connection
├── models.ts              # TypeScript types
├── auth.ts                # JWT & password utils
├── validation.ts          # Zod schemas
├── colors.ts              # Color system
└── utils.ts               # 30+ helpers

components/
├── auth-context.tsx       # Authentication provider
├── header.tsx             # Navigation
└── (UI utilities)

Documentation/
├── QUICKSTART.md          # 5-min setup
├── SYSTEM_GUIDE.md        # Full documentation
├── DATABASE_SETUP.md      # MongoDB guide
├── CODE_EXAMPLES.md       # Code patterns
└── BUILD_SUMMARY.md       # Build overview
```

## 🎯 Key Pages

### Patient Pages
| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Landing page with features |
| Login | `/login` | Patient authentication |
| Register | `/register` | Account creation |
| Doctors | `/doctors` | Browse & search doctors |
| Doctor Detail | `/doctors/[id]` | View profile & book |
| Appointments | `/appointments` | Manage bookings |
| Appointment Detail | `/appointments/[id]` | View details & download PDF |

### Doctor Pages
| Page | URL | Purpose |
|------|-----|---------|
| Login | `/doctor/login` | Doctor authentication |
| Register | `/doctor/register` | Multi-step registration |
| Dashboard | `/doctor/dashboard` | Manage appointments |
| Availability | `/doctor/availability` | Set schedule |
| Profile | `/doctor/profile` | Edit information |

## 🔌 API Endpoints

### Authentication (4)
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate
- `POST /api/auth/logout` - Clear session
- `GET/PUT /api/auth/profile` - User management

### Doctors (3)
- `GET /api/doctors` - List doctors
- `GET /api/doctors/[id]` - Get details
- `POST/GET /api/doctors/availability` - Manage availability

### Appointments (5+)
- `POST/GET /api/appointments` - CRUD operations
- `GET /api/appointments/available-slots` - Get free slots
- `GET/PUT /api/appointments/[id]` - Details & updates
- `GET /api/appointments/[id]/pdf` - PDF download

## 💾 Database Schema

**Users Collection**
```javascript
{
  email, password, name, role, phone,
  createdAt, updatedAt
}
```

**Doctors Collection**
```javascript
{
  userId, specialization, qualification, experience,
  bio, location, consultationFee, rating,
  availabilitySchedule, createdAt, updatedAt
}
```

**Appointments Collection**
```javascript
{
  patientId, doctorId, appointmentDate, appointmentTime,
  status, symptoms, medicalHistory, notes,
  createdAt, updatedAt
}
```

## 🔐 Security Features

✅ Passwords hashed with bcryptjs (10 salt rounds)
✅ JWT tokens in HTTP-only cookies
✅ Input validation on all endpoints
✅ MongoDB injection prevention
✅ Role-based access control
✅ Secure environment variables
✅ CORS configuration
✅ SQL/NoSQL injection protection

## 🎨 Design System

### Colors
- **Primary**: Teal (Healthcare trust)
- **Secondary**: Medical Blue
- **Accent**: Vibrant Teal
- **Neutral**: Slate grays
- **Light & Dark**: Auto theme switching

### Typography
- **Font**: Geist (sans-serif)
- **Responsive**: Mobile-first scaling
- **Accessible**: Proper contrast ratios

### Responsive
- **Mobile**: Single column, touch-optimized
- **Tablet**: Two columns, balanced layout
- **Desktop**: Three+ columns, full features

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Click "Publish" in v0 dashboard
2. Connect MongoDB URI
3. Deploy with one click

### Or Deploy Manually
```bash
# Build
pnpm build

# Deploy (Vercel)
vercel deploy

# Or Docker
docker build -t medibook .
docker run -p 3000:3000 medibook
```

## 📊 Performance

- ⚡ Fast API responses (< 100ms)
- 🗂️ Optimized database queries with indexes
- 📦 Code splitting and lazy loading
- 🖼️ Optimized images
- 🔄 Client-side caching with SWR
- 📱 Mobile-first design

## 🧪 Testing the System

### As a Patient
1. Register at `/register`
2. Browse doctors at `/doctors`
3. Book appointment at `/doctors/[id]`
4. View appointment at `/appointments`
5. Download PDF confirmation

### As a Doctor
1. Register at `/doctor/register`
2. Setup availability at `/doctor/availability`
3. View appointments at `/doctor/dashboard`
4. Update appointment status
5. Edit profile at `/doctor/profile`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check connection string in env vars |
| No available slots | Doctor must set availability first |
| Can't book appointment | Login as patient first |
| PDF download fails | Check browser console for errors |

See [QUICKSTART.md](./QUICKSTART.md) for more troubleshooting.

## 📖 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

To extend the system:
1. Follow existing code patterns
2. Use TypeScript for type safety
3. Add proper error handling
4. Include comments for complex logic
5. Update documentation

## 📝 Code Quality

✅ TypeScript strict mode
✅ ESLint configuration
✅ Proper error handling
✅ Comprehensive comments
✅ Accessible HTML
✅ Responsive design
✅ Security best practices

## 🎓 What You'll Learn

- Full-stack Next.js development
- MongoDB database design
- JWT authentication
- React hooks and context
- TypeScript patterns
- API design patterns
- Responsive design
- Security best practices

## 📞 Support

### Documentation
- [QUICKSTART.md](./QUICKSTART.md) - Get started in 5 minutes
- [SYSTEM_GUIDE.md](./SYSTEM_GUIDE.md) - Complete documentation
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - MongoDB configuration
- [CODE_EXAMPLES.md](./CODE_EXAMPLES.md) - Code patterns

### Debugging
1. Check browser console (F12)
2. Check server logs
3. Verify environment variables
4. Test API endpoints
5. Check MongoDB data

## 🎯 Roadmap

Future enhancements:
- [ ] Patient reviews & ratings
- [ ] Video consultations
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] Advanced analytics

## 📄 License

MIT License - Feel free to use and modify

## 🙏 Acknowledgments

Built with Next.js, React, TypeScript, and MongoDB.
Designed for healthcare professionals and patients.

---

## 🚀 Get Started Now!

```bash
# 1. Set environment variables
# MONGODB_URI and JWT_SECRET in Settings → Vars

# 2. Start dev server
pnpm dev

# 3. Open browser
# http://localhost:3000

# 4. Register & test
# Patient: /register
# Doctor: /doctor/register
```

**See [QUICKSTART.md](./QUICKSTART.md) for detailed setup**

---

**MediBook** - Connecting patients with healthcare professionals 🏥

Built with ❤️ for better healthcare experiences
