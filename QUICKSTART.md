# MediBook - Quick Start Guide

Get your medical appointment booking system running in minutes!

## 🚀 Quick Setup (5 minutes)

### Step 1: Get MongoDB Connection String

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you don't have one)
3. Click "Connect" → Select "Drivers"
4. Copy your connection string: `mongodb+srv://username:password@cluster.mongodb.net/medibook?retryWrites=true&w=majority`

### Step 2: Generate JWT Secret

Create a strong random string for JWT signing. One way:

```bash
# If you have openssl
openssl rand -base64 32

# Or use any random string generator (min 32 characters)
# Example: aBc123XyZ!@#$%^&*()_+-=[]{}|;:,.<>?
```

### Step 3: Set Environment Variables

In the Vercel v0 dashboard:
1. Click Settings (top right) → Vars
2. Add these variables:
   - `MONGODB_URI`: Your connection string from Step 1
   - `JWT_SECRET`: Your random string from Step 2

### Step 4: Start the App

The development server will automatically start. If not:

```bash
pnpm dev
```

Visit http://localhost:3000

## 📝 Test the System

### As a Patient

1. **Register** (http://localhost:3000/register)
   - Name: John Patient
   - Email: john@example.com
   - Password: Test123!
   - Phone: +1234567890

2. **Browse Doctors** (http://localhost:3000/doctors)
   - Search by name or specialization
   - Click "Book Now" on a doctor

3. **Book Appointment**
   - Select a date (tomorrow or later)
   - Select a time (doctor's availability is 09:00-17:00 with 12:00-13:00 lunch break)
   - Add symptoms
   - Confirm booking

4. **View Appointment**
   - Go to "My Appointments"
   - Click on an appointment
   - Download PDF confirmation

### As a Doctor

1. **Register** (http://localhost:3000/doctor/register)
   - Step 1: Name, Email, Password
   - Step 2: Specialization, Qualification, Experience
   - Step 3: Bio, Location, Consultation Fee

2. **Setup Availability** (http://localhost:3000/doctor/availability)
   - Set your working hours (e.g., 09:00-17:00)
   - Add breaks (e.g., 12:00-13:00 for lunch)
   - Save

3. **View Dashboard** (http://localhost:3000/doctor/dashboard)
   - See upcoming appointments
   - Click "Manage" to add notes or mark as completed
   - Check statistics

4. **Edit Profile** (http://localhost:3000/doctor/profile)
   - Update professional information
   - Change consultation fee
   - Update clinic location

## 🌐 Key Pages

**Patient Pages:**
- `/` - Home/Landing page
- `/login` - Patient login
- `/register` - Patient registration
- `/doctors` - Browse doctors
- `/doctors/[id]` - Doctor details & booking
- `/appointments` - My appointments list
- `/appointments/[id]` - Appointment details & PDF

**Doctor Pages:**
- `/doctor/login` - Doctor login
- `/doctor/register` - Doctor registration
- `/doctor/dashboard` - Appointment management
- `/doctor/availability` - Schedule management
- `/doctor/profile` - Profile editing

**API Endpoints:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/doctors` - List doctors
- `GET /api/doctors/[id]` - Doctor details
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - My appointments
- `GET /api/appointments/available-slots` - Available times
- `PUT /api/appointments/[id]` - Update appointment

## 🎨 Design Features

- **Medical Color Scheme**: Professional teal & slate blues
- **Mobile Responsive**: Looks great on phones and tablets
- **Native App Feel**: Full-screen layouts optimized for mobile
- **Dark Mode**: Automatic light/dark theme support
- **Accessible**: WCAG compliant with semantic HTML

## 📊 Default Availability

Doctors automatically get this schedule on registration:
- **Days**: Monday - Sunday
- **Working Hours**: 09:00 - 17:00
- **Break**: 12:00 - 13:00 (lunch)
- **Slot Duration**: 30 minutes

Customize in `/doctor/availability`

## 🔑 Important Notes

### Data Persistence
- All data is saved to MongoDB
- No data is lost between sessions
- Collections auto-create on first use

### Authentication
- Passwords are hashed with bcrypt (secure)
- Sessions use JWT tokens in HTTP-only cookies
- Token expires in 7 days
- Separate doctor/patient authentication flows

### PDF Confirmations
- Generated server-side from appointment data
- Includes appointment details, doctor info, patient info
- Download option available on appointment page

### Appointment Booking
- Only available time slots shown to patients
- Based on doctor's availability + bookings
- 30-minute slots by default
- Patients see only future dates

### Time Zones
- All times stored in 24-hour format (HH:mm)
- Dates in YYYY-MM-DD ISO format
- Frontend shows local time to user

## 🐛 Troubleshooting

### "MONGODB_URI is not set"
- Go to Settings → Vars
- Add `MONGODB_URI` environment variable
- Restart dev server

### "Cannot connect to MongoDB"
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas (allow all: 0.0.0.0/0)
- Ensure password doesn't contain special characters (or URL-encode them)

### "No doctors appear in list"
- Register as doctor first
- Set availability in doctor panel
- Go back to `/doctors` page

### "No time slots show for doctor"
- Doctor must have set availability
- Date must be in future
- Time slots must not conflict with breaks

### "Can't download PDF"
- Ensure appointment is booked (status: scheduled)
- Check browser console for errors
- Try in different browser

## 📱 Mobile Experience

The app is designed mobile-first:
- Tap hamburger menu for navigation
- Cards optimized for touch
- Full-screen layouts
- Responsive typography
- Native app-like experience

Test on mobile:
1. Open in Safari/Chrome on phone
2. Or use browser DevTools (F12) → Device Toolbar

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT tokens in HTTP-only cookies
- ✅ Input validation with Zod
- ✅ Role-based access control
- ✅ MongoDB parameterized queries
- ✅ Secure environment variables
- ✅ No sensitive data in responses

## 🎯 Next Steps

1. **Customize**
   - Change colors in `app/globals.css`
   - Update site title in `app/layout.tsx`
   - Modify specializations in forms

2. **Add Features**
   - Reviews/ratings system
   - Prescription management
   - SMS notifications
   - Payment integration

3. **Deploy**
   - Click "Publish" in v0 dashboard
   - Or deploy to Vercel with "Deploy to Vercel" button

4. **Scale**
   - Add more specializations
   - Implement appointment reminders
   - Add video consultation
   - Create admin panel

## 💡 Pro Tips

1. **Test Booking Flow**
   - Register 2 patients
   - Register doctor with availability
   - Both patients book same doctor
   - View appointments in both dashboards

2. **Check Conflicts**
   - Try booking overlapping time slots
   - System prevents double-booking
   - Breaks prevent booking during lunch

3. **PDF Downloads**
   - Test on appointment confirmation page
   - Also available from appointments list
   - Contains full appointment details

4. **Mobile Testing**
   - Try all pages on phone
   - Test form inputs
   - Check button sizes
   - Verify navigation works

## 📞 Common Actions

### Patient: Book Appointment
1. Login as patient
2. Go to `/doctors`
3. Find doctor by search/filter
4. Click "Book Now"
5. Select date and time
6. Add symptoms (optional)
7. Confirm booking
8. Download PDF confirmation

### Doctor: Setup Schedule
1. Login as doctor
2. Go to `/doctor/availability`
3. Set working hours for each day
4. Add break times
5. Save availability
6. Patients now see available slots

### Doctor: Manage Appointment
1. Go to `/doctor/dashboard`
2. Find appointment in list
3. Click "Manage"
4. Add notes or mark as completed
5. Appointment status updates

### Patient: View History
1. Go to `/appointments`
2. See all your appointments
3. Click on appointment for details
4. Download PDF confirmation

---

**Ready to go?** Start at http://localhost:3000/

Need help? Check `SYSTEM_GUIDE.md` for detailed documentation.

Happy booking! 🏥
