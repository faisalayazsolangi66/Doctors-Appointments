# MediBook - Database Setup & Configuration

Complete guide to setting up and configuring MongoDB for MediBook.

## 📦 MongoDB Setup

### Option 1: MongoDB Atlas (Recommended - Cloud)

#### Step 1: Create Atlas Account
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up with email or Google
3. Create an organization (give it any name)
4. Create a project

#### Step 2: Create a Cluster
1. Click "Create a Deployment"
2. Select **M0 Sandbox** (free tier, perfect for development)
3. Select cloud provider: AWS
4. Select region closest to you
5. Click "Create Deployment"
6. Wait 5-10 minutes for cluster to spin up

#### Step 3: Add Database User
1. Go to "Database Access" → "Add New Database User"
2. Authentication Method: **Password**
3. Enter username: `medibook`
4. Enter password: Generate a strong password or use a random one
5. Database User Privileges: **Atlas Admin** (for development)
6. Click "Add User"

**⚠️ Important:** Save this username and password!

#### Step 4: Network Access
1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (for development)
3. Or add your specific IP: 0.0.0.0/0
4. Click "Confirm"

#### Step 5: Get Connection String
1. Go to "Clusters" → Click "Connect"
2. Select "Drivers"
3. Choose Node.js and version 5.0+
4. Copy the connection string

**Template:**
```
mongodb+srv://medibook:PASSWORD@cluster0.xxxxx.mongodb.net/medibook?retryWrites=true&w=majority
```

**Replace:**
- `PASSWORD` with the password you created in Step 3
- `cluster0.xxxxx` with your actual cluster ID

#### Step 6: Verify Connection
Test in your terminal:
```bash
mongosh "mongodb+srv://medibook:PASSWORD@cluster0.xxxxx.mongodb.net/"
```

### Option 2: Local MongoDB (Development)

#### macOS (with Homebrew)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connection string
mongodb://localhost:27017/medibook
```

#### Windows
1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. MongoDB runs as Windows Service
4. Connection string: `mongodb://localhost:27017/medibook`

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# Start service
sudo systemctl start mongodb

# Connection string
mongodb://localhost:27017/medibook
```

## 🔧 Environment Configuration

### Set MongoDB URI

Choose based on your setup:

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://medibook:your_password@cluster0.xxxxx.mongodb.net/medibook?retryWrites=true&w=majority
```

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/medibook
```

### In Vercel v0:
1. Click Settings (top right)
2. Go to "Vars" tab
3. Add variable:
   - Key: `MONGODB_URI`
   - Value: Your connection string
4. Restart dev server

### Or create `.env.local`:
```
MONGODB_URI=your_connection_string_here
JWT_SECRET=your_random_secret_here_min_32_chars
```

## 📋 Database Schema & Initialization

### Automatic Initialization

When you first access the application:
1. `lib/db.ts` connects to MongoDB
2. Collections are automatically created with indexes
3. No manual setup needed!

### Collections Created

#### 1. users
```json
{
  "email": "UNIQUE INDEX",
  "role": "INDEX",
  "createdAt": "INDEX"
}
```

#### 2. doctors
```json
{
  "userId": "UNIQUE INDEX",
  "specialization": "INDEX",
  "createdAt": "INDEX"
}
```

#### 3. appointments
```json
{
  "patientId": "INDEX",
  "doctorId": "INDEX",
  "appointmentDate": "INDEX",
  "status": "INDEX"
}
```

## 🔍 Viewing Your Data

### MongoDB Atlas Compass (UI)
1. In Atlas, click "Collections"
2. Browse your documents visually
3. Add, edit, or delete data
4. Run queries

### MongoDB Shell (CLI)
```bash
# Connect
mongosh "mongodb+srv://medibook:PASSWORD@cluster.xxxxx.mongodb.net/"

# View databases
show dbs

# Use medibook database
use medibook

# Show collections
show collections

# View documents
db.users.find()
db.doctors.find()
db.appointments.find()

# Count documents
db.appointments.countDocuments()

# Find specific user
db.users.findOne({ email: "john@example.com" })
```

### MongoDB Compass (Desktop App)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect with your URI
3. Browse collections visually
4. Create/edit documents easily

## 🔄 Data Backup & Export

### Export Collections

Using MongoDB Atlas:
1. Click your cluster
2. Collections tab
3. Select collection
4. Click "..." → "Export"
5. Choose format (JSON, CSV)
6. Download backup

### Backup Best Practices
- **Development**: Snapshots enabled by default in Atlas
- **Production**: Enable automated backups in cluster settings
- **Regular exports**: Create periodic backups locally

## 🧹 Reset Database

### Delete All Data (Development Only)

Via MongoDB Compass:
1. Right-click collection
2. Click "Delete"
3. Confirm deletion

Via MongoDB Shell:
```bash
# Delete all documents in collection
db.users.deleteMany({})
db.doctors.deleteMany({})
db.appointments.deleteMany({})

# Or drop entire database
db.dropDatabase()
```

⚠️ **Warning:** This cannot be undone!

## 📊 Database Indexes

### Automatically Created Indexes

```javascript
// users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ createdAt: 1 })

// doctors collection
db.doctors.createIndex({ userId: 1 }, { unique: true })
db.doctors.createIndex({ specialization: 1 })
db.doctors.createIndex({ createdAt: 1 })

// appointments collection
db.appointments.createIndex({ patientId: 1 })
db.appointments.createIndex({ doctorId: 1 })
db.appointments.createIndex({ appointmentDate: 1 })
db.appointments.createIndex({ status: 1 })
```

### Index Benefits
- Fast queries by email, specialization, dates
- Prevents duplicate emails
- Enables efficient filtering

## 🐛 Troubleshooting

### Connection Issues

**Error: "connect ECONNREFUSED"**
- Local MongoDB not running
- Solution: `brew services start mongodb-community` (macOS)

**Error: "authentication failed"**
- Wrong username/password
- Solution: Check MongoDB Atlas user credentials

**Error: "IP not whitelisted"**
- Your IP not in network access list
- Solution: Add your IP or use 0.0.0.0/0 (development only)

**Error: "Connection string malformed"**
- Missing password or special characters
- Solution: URL-encode password: `user%40email:pa%24sw0rd@`

### Data Issues

**"Cannot create index duplicate key"**
- Trying to add unique index on field with duplicates
- Solution: Clean data or drop and recreate collection

**"Document too large"**
- MongoDB max document size is 16MB
- Solution: Use smaller notes/descriptions

**"Query timeout"**
- Large collection query without index
- Solution: Add index or filter results

## 📈 Monitoring & Performance

### In MongoDB Atlas

1. **Monitoring tab** - View metrics
   - Operations per second
   - Database connections
   - CPU/memory usage

2. **Activity tab** - View recent operations
   - Find slow queries
   - See what's being accessed

3. **Alerts** - Set up notifications
   - High CPU usage
   - Connection threshold
   - Replication issues

### Query Performance Tips

```javascript
// Good - Uses index
db.appointments.find({ doctorId: ObjectId("..."), status: "scheduled" })

// Bad - No index on arbitrary field
db.appointments.find({ notes: { $regex: "pain" } })

// Good - Pagination
db.appointments.find().limit(20).skip(0)

// Good - Only needed fields
db.appointments.find({ doctorId: "..." }, { symptoms: 1, appointmentDate: 1 })
```

## 🔐 Security Best Practices

### Production Configuration

1. **Strong Passwords**
   ```
   Min 16 characters: aB#9xZ$pLm@nVwQ2
   Mix: uppercase, lowercase, numbers, special chars
   ```

2. **Limited Access**
   - Create separate users for different apps
   - Use database user (not admin) in production
   - Whitelist only your server IPs

3. **Encryption**
   - Enable **Encryption at Rest** in Atlas
   - Use TLS for connections (default)
   - SCRAM-SHA-256 authentication (default)

4. **Monitoring**
   - Enable database audit logs
   - Review access logs regularly
   - Set up alerts for suspicious activity

## 📝 Sample Queries

### User Management
```javascript
// Find all doctors
db.doctors.find({})

// Find cardiologists
db.doctors.find({ specialization: "Cardiologist" })

// Find patients
db.users.find({ role: "patient" })

// Count total users
db.users.countDocuments()
```

### Appointment Management
```javascript
// Find doctor's upcoming appointments
db.appointments.find({
  doctorId: ObjectId("..."),
  appointmentDate: { $gte: "2024-01-15" },
  status: "scheduled"
})

// Find patient's completed appointments
db.appointments.find({
  patientId: ObjectId("..."),
  status: "completed"
})

// Count appointments by status
db.appointments.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

### Aggregation Examples
```javascript
// Appointments per doctor
db.appointments.aggregate([
  { $group: { _id: "$doctorId", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
])

// Busiest days
db.appointments.aggregate([
  { $group: { _id: "$appointmentDate", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## 🆘 Getting Help

### MongoDB Resources
- [Official Documentation](https://docs.mongodb.com/)
- [MongoDB University](https://learn.mongodb.com/) - Free courses
- [Community Forum](https://community.mongodb.com/)

### Common Issues

**Check these first:**
1. Connection string correct?
2. Database user created with password?
3. IP whitelist includes your IP?
4. Database name in connection string?
5. Network connectivity working?

### Debug Connection

```javascript
// In your app logs, add debugging
console.log('[v0] Connecting to MongoDB:', process.env.MONGODB_URI?.slice(0, 30) + '...')

// Then check application startup logs
```

---

**Database Setup Complete!** Your MediBook app is ready to persist data.

For app setup, see `QUICKSTART.md`
For full documentation, see `SYSTEM_GUIDE.md`
