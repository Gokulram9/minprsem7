# Backend Architecture - Legal Aid Portal

## 📋 Current Architecture Overview

This is a **full-stack Legal Aid Portal** with a modular, scalable Node.js/Express backend integrated with a Python AI recommendation service.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React/Vite)                   │
│          (Dashboards, Case Tracker, Find Lawyers)        │
└────────────────────────┬────────────────────────────────┘
                         │ REST API + WebSocket
┌────────────────────────▼────────────────────────────────┐
│              EXPRESS.JS BACKEND (Port 5000)              │
│  ┌──────────────────────────────────────────────────┐   │
│  │         API Routes (14 route modules)             │   │
│  │  ├─ Authentication & Authorization                │   │
│  │  ├─ User Management                               │   │
│  │  ├─ Case Applications                             │   │
│  │  ├─ Hearing Scheduling                            │   │
│  │  ├─ Lawyer Directory                              │   │
│  │  ├─ Recommendations & AI                          │   │
│  │  ├─ Messages & Notifications                      │   │
│  │  ├─ Document Management                           │   │
│  │  ├─ Reports & Admin Functions                     │   │
│  │  ├─ Judgment Search                               │   │
│  │  ├─ Reminders & Notifications                     │   │
│  │  └─ Chatbot                                        │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Controllers (13 modules)                        │   │
│  │  Process requests & business logic                │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Services (4 modules)                            │   │
│  │  ├─ AI Service (lawyer recommendations)           │   │
│  │  ├─ Email Service (Nodemailer)                    │   │
│  │  ├─ Payment Service (placeholder)                 │   │
│  │  └─ Reminder Service (background jobs)            │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Middleware (6 modules)                          │   │
│  │  ├─ Auth/JWT Verification                        │   │
│  │  ├─ Role-based Access Control                    │   │
│  │  ├─ File Upload (Multer)                         │   │
│  │  ├─ Error Handling                               │   │
│  │  ├─ Audit Logging                                │   │
│  │  └─ Permission Checks                            │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  MongoDB Models (14 schemas)                     │   │
│  │  ├─ User, Lawyer, Judge, Court                  │   │
│  │  ├─ Application, Hearing, Document               │   │
│  │  ├─ Message, Notification, Recommendation        │   │
│  │  ├─ AuditLog, Review, Availability               │   │
│  │  └─ Courtroom                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────┬────────────────────────────────┘
                         │ HTTP
                         │ (axios)
┌────────────────────────▼────────────────────────────────┐
│    PYTHON AI SERVICE (Flask, Port 8000)                  │
│  ├─ /recommend - Lawyer recommendations (scikit-learn)  │
│  └─ /search-judgments - Judgment search (ML model)      │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┴─────────────────┐
        │                                  │
┌───────▼──────┐              ┌────────────▼──────┐
│   MongoDB    │              │   Local Files     │
│ (27017)      │              │   (Uploads)       │
│              │              │   (Judgments)     │
└──────────────┘              └───────────────────┘
```

---

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.4
- **Database**: MongoDB 7.5.0 (with Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Security**: 
  - Helmet 7.0.0 (HTTP headers)
  - bcryptjs 2.4.3 (password hashing)
  - CORS (Cross-Origin Resource Sharing)
  - Rate Limiting (express-rate-limit)
- **Real-time**: Socket.io 4.7.2
- **File Upload**: Multer 1.4.5
- **Email**: Nodemailer 6.10.1
- **HTTP Client**: Axios 1.6.6

### AI Service
- **Framework**: Python Flask
- **ML Library**: scikit-learn
- **Recommendations**: Lawyer matching algorithm
- **Search**: Judgment database search

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS
- **HTTP**: Axios
- **Charts**: Chart.js
- **Routing**: React Router

---

## 📁 Module Breakdown

### 1. **Routes** (13 modules)
Defines API endpoints and maps to controllers:
- `authRoutes.js` - Registration, login, password reset
- `userRoutes.js` - User profiles, profile completion
- `applicationRoutes.js` - Case applications
- `hearingRoutes.js` - Court hearing scheduling
- `lawyerRoutes.js` - Lawyer directory, reviews
- `recommendationRoutes.js` - AI lawyer recommendations
- `messageRoutes.js` - User messaging
- `notificationRoutes.js` - User notifications
- `documentRoutes.js` - Case documents
- `reportRoutes.js` - Case reports
- `judgmentRoutes.js` - Judgment search
- `adminRoutes.js` - Admin dashboard functions
- `chatbotRoutes.js` - NLP chatbot interactions

### 2. **Controllers** (13 modules)
Business logic layer handling requests:
- **authController**: JWT token generation, password hashing, session management
- **userController**: User CRUD, profile updates, role management
- **applicationController**: Case application lifecycle
- **hearingController**: Scheduling logic, conflict detection
- **lawyerController**: Lawyer profile, availability, ratings
- **recommendationController**: Integrates AI service
- **messageController**: P2P messaging
- **notificationController**: Alert system
- **documentController**: File uploads (Multer)
- **reportController**: Case report generation
- **judgmentController**: AI judgment search
- **chatbotController**: NLP-based lawyer matching
- **adminController**: Analytics, user management, audit logs

### 3. **Models** (14 Mongoose schemas)
Data structure definitions:
```
User (name, email, password, role, phone, location, specialization, ...)
Lawyer (extends User with experienceYears, successRate, availability)
Judge (name, court, specialization, yearsServing)
Court (name, location, courtrooms, address)
Courtroom (courtId, name, capacity, equipment)
Application (userId, caseType, description, status, documents, ...)
Hearing (applicationId, date, time, judge, courtroom, lawyerId, ...)
Document (hearingId, fileName, fileType, uploadedBy, uploadDate)
Message (senderId, recipientId, content, timestamp, read)
Notification (userId, type, message, read, createdAt)
Recommendation (userId, lawyerIds, matchScores, timestamps)
AuditLog (userId, action, resource, timestamp, changes)
Review (lawyerId, rating, comment, submittedBy, date)
Availability (lawyerId, dayOfWeek, startTime, endTime)
```

### 4. **Services** (4 modules)
Reusable business logic and integrations:
- **aiService.js**
  - `recommendLawyers()` - Calls Python AI service
  - `searchJudgments()` - Searches judgment database
  - Fallback recommendations if AI service unavailable
  
- **emailService.js**
  - Email notifications (Nodemailer)
  - Case updates, hearing reminders
  - Password reset emails
  
- **reminderService.js**
  - Background job scheduling
  - Tomorrow's hearing notifications
  - Cron-like interval checks
  
- **paymentService.js**
  - Placeholder for payment integration
  - Could integrate Stripe, PayPal

### 5. **Middleware** (6 modules)
- **authMiddleware.js** - JWT verification, token refresh
- **roleMiddleware.js** - Role-based access control (User/Lawyer/Admin)
- **permissionMiddleware.js** - Resource-level permissions
- **errorMiddleware.js** - Global error handling
- **auditMiddleware.js** - Log all changes (who, what, when)
- **uploadMiddleware.js** - Multer file validation & storage

### 6. **Configuration** (2 modules)
- **db.js** - MongoDB connection (auto-fallback to in-memory DB)
- **socket.js** - Socket.io initialization for real-time updates

### 7. **Utilities**
- **generateToken.js** - JWT token generation (access + refresh tokens)
- **validators.js** - Input validation (email, phone, date formats)

---

## 🔄 Data Flow Architecture

### Case Application Flow
```
User Registration
    ↓
Create Case Application
    ↓
AI Service → Recommend Lawyers
    ↓
Select Lawyer
    ↓
Schedule Hearing
    ↓
Generate Documents
    ↓
Court Hearing
    ↓
Judgment/Verdict
    ↓
Generate Report
```

### Real-time Communication
```
User Action (Message/Notification)
    ↓
Express Controller
    ↓
MongoDB Save
    ↓
Socket.io Broadcast
    ↓
Recipient Receives Live Update
```

### AI Recommendation Flow
```
Application Details
    ↓
Python Flask Service
    ↓
scikit-learn Algorithm
    ↓
Lawyer Scoring
    ↓
Return Top Matches
    ↓
Display in UI
```

---

## 🔒 Security Architecture

1. **Authentication**
   - JWT with access + refresh tokens
   - Password hashing (bcryptjs)
   - Secure token refresh endpoint

2. **Authorization**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - Admin-only endpoints

3. **Data Protection**
   - Helmet.js for HTTP headers
   - CORS for cross-origin requests
   - Rate limiting (120 requests/15 min)
   - Input validation

4. **Audit Trail**
   - auditMiddleware logs all changes
   - Track who did what and when
   - For compliance/legal requirements

---

## 📊 Database Design

### User Roles Hierarchy
```
Admin
  ├─ User Management
  ├─ Analytics Dashboard
  ├─ Audit Logs
  └─ System Configuration

Lawyer
  ├─ View Applications
  ├─ Schedule Hearings
  ├─ Upload Documents
  └─ Receive Messages

User (Applicant)
  ├─ Submit Application
  ├─ View Status
  ├─ Message Lawyer
  └─ Upload Documents
```

### Key Relationships
```
Application (1) ←→ (many) Hearing
Application (1) ←→ (many) Document
Hearing (1) ← (many) Judge
Hearing (1) ← (many) Lawyer
Hearing (1) ← (1) Courtroom
User (1) ←→ (many) Message
User (1) ←→ (many) Notification
Lawyer (1) ←→ (many) Review
Lawyer (1) ←→ (many) Availability
Application (1) ←→ (many) Recommendation
```

---

## ✅ Current Features & Capabilities

1. ✅ Role-based dashboards (User, Lawyer, Admin)
2. ✅ JWT authentication with password reset
3. ✅ Case application lifecycle management
4. ✅ AI-powered lawyer recommendations
5. ✅ Court hearing scheduling with conflict detection
6. ✅ Document upload and management
7. ✅ Real-time messaging (Socket.io)
8. ✅ Email notifications
9. ✅ Judgment search via AI
10. ✅ Hearing reminders (background jobs)
11. ✅ Audit logging
12. ✅ Admin analytics dashboard

---

## 🚀 What Can Be Improved/Added

### **High Priority - Essential Features**

#### 1. **Database Performance Optimization**
```javascript
// Add Indexes to frequently queried fields
- User.js: Add index on email, role
- Application.js: Add index on userId, status, createdAt
- Hearing.js: Add index on date, applicationId, lawyerId
- Message.js: Add index on senderId, recipientId, createdAt
- Notification.js: Add index on userId, read, createdAt
```
**Impact**: 10-50x faster queries for large datasets

#### 2. **Pagination & Filtering**
```javascript
// Current: Returns all records
// Improved: Paginate results (limit, skip, sort)

GET /api/applications?page=1&limit=10&status=pending&sort=-createdAt
GET /api/lawyers?specialization=Family&location=Mumbai&page=1
GET /api/hearings?date=2025-01-15&status=scheduled
```
**Impact**: Better UI performance, reduced memory usage

#### 3. **Caching Layer (Redis)**
```javascript
// Add Redis for:
- Session management
- Lawyer recommendations cache
- User auth token cache
- Query result caching

npm install redis ioredis
```
**Impact**: 100x faster response for repeated queries

#### 4. **API Response Standardization**
```javascript
// Current: Inconsistent response format
// Improved: Standard response wrapper

// Current
res.json({ user: userData })

// Improved (Standard across all endpoints)
res.json({
  success: true,
  data: userData,
  message: "User fetched successfully",
  timestamp: new Date()
})
```

#### 5. **Input Validation Enhancement**
```javascript
// Add Joi or Zod for schema validation
npm install joi

// Usage
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('User', 'Lawyer', 'Admin')
})

const { error, value } = schema.validate(req.body)
```

#### 6. **Error Handling Improvements**
```javascript
// Current: Generic error messages
// Improved: Specific error codes

throw new AppError('User not found', 404)
throw new AppError('Unauthorized access', 401)
throw new AppError('Invalid input', 400)
throw new AppError('Database connection failed', 503)
```

#### 7. **Logging System**
```javascript
// Add Winston logger
npm install winston

// Structured logging instead of console.log()
logger.info('User login', { userId, timestamp })
logger.error('Database error', { error, query })
logger.warn('Rate limit exceeded', { ip, endpoint })
```

---

### **Medium Priority - Performance & Scalability**

#### 8. **Background Job Queue (Bull/BullMQ)**
```javascript
npm install bull

// Current: Simple setInterval (not reliable)
// Improved: Job queue for:
- Email sending
- Hearing reminders
- Report generation
- Notification dispatch
```

#### 9. **Microservices Architecture**
```
├─ Auth Service (handles JWT, login, registration)
├─ User Service (user profiles, management)
├─ Case Service (applications, documents)
├─ Hearing Service (scheduling, conflict detection)
├─ Notification Service (emails, messages, alerts)
├─ AI Service (lawyer recommendations, judgment search)
└─ Payment Service (future payments)

Benefits:
- Independent scaling
- Technology flexibility
- Fault isolation
- Team parallel work
```

#### 10. **API Rate Limiting per User**
```javascript
// Current: 120 requests/15 min global
// Improved: Per-user rate limiting

const userLimiter = rateLimit({
  keyGenerator: (req) => req.user.id,
  max: 1000, // per user per day
})
```

#### 11. **File Storage Enhancement**
```javascript
// Current: Local filesystem (/uploads)
// Improved: AWS S3 / Google Cloud Storage

npm install aws-sdk

// Benefits:
- Scalable storage
- CDN delivery
- Automatic backups
- Version control
```

#### 12. **Search Functionality**
```javascript
// Current: Basic MongoDB queries
// Improved: Elasticsearch for advanced search

npm install @elastic/elasticsearch

// Benefits:
- Full-text search
- Typo tolerance
- Faceted search
- Search analytics
```

---

### **Lower Priority - Advanced Features**

#### 13. **Analytics & Reporting**
```javascript
// New endpoints:
GET /api/admin/analytics/dashboard
GET /api/admin/analytics/cases-by-status
GET /api/admin/analytics/lawyer-performance
GET /api/admin/analytics/case-resolution-time

// Use: Aggregation pipeline for MongoDB
Application.aggregate([
  { $match: { status: 'resolved' } },
  { $group: { _id: '$lawyerId', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

#### 14. **Webhook System**
```javascript
// Notify external systems of case updates
POST /api/webhooks/register
POST /api/webhooks/events

Events:
- case.created
- hearing.scheduled
- case.resolved
- document.uploaded
```

#### 15. **Multi-language Support (i18n)**
```javascript
npm install i18next i18next-http-backend

// Support multiple languages:
- English
- Hindi
- Local regional languages
```

#### 16. **Two-Factor Authentication (2FA)**
```javascript
npm install speakeasy qrcode

// Add TOTP-based 2FA for sensitive operations
- Login 2FA
- Admin actions 2FA
```

#### 17. **Advanced Conflict Detection**
```javascript
// Current: Basic date/time check
// Improved: Consider:
- Judge availability
- Lawyer travel time
- Courtroom setup time
- Hearing preparation time
- Break times
```

#### 18. **Payment Integration**
```javascript
npm install stripe

// Implement:
- Lawyer consultation fees
- Document verification fees
- Expedited processing fees

POST /api/payments/create-session
POST /api/payments/webhook
GET /api/payments/history
```

#### 19. **Document Management Enhancements**
```javascript
// Add:
- Document versioning
- Digital signatures
- OCR for document processing
- PDF generation
- Document expiry tracking

npm install pdf-lib jsdom tesseract.js
```

#### 20. **API Versioning**
```javascript
// Current: /api/users
// Improved: /api/v1/users, /api/v2/users

// Allows backward compatibility
// Easier to deprecate old endpoints
```

---

## 🔧 Implementation Priority Matrix

| Feature | Priority | Effort | Impact | Timeline |
|---------|----------|--------|--------|----------|
| Database Indexing | Critical | 2h | High | Week 1 |
| Pagination | Critical | 3h | High | Week 1 |
| Input Validation (Joi) | Critical | 4h | High | Week 1 |
| Redis Caching | High | 1d | High | Week 2 |
| Logging (Winston) | High | 4h | Medium | Week 2 |
| Response Standardization | High | 1d | Medium | Week 2 |
| Background Jobs (Bull) | High | 1-2d | High | Week 3 |
| AWS S3 Integration | Medium | 1-2d | High | Week 3 |
| Elasticsearch | Medium | 2-3d | Medium | Week 4 |
| Microservices Split | Medium | 3-5d | High | Later |
| Analytics Dashboard | Medium | 2-3d | Medium | Week 4 |
| Payment Integration | Low | 3-4d | Medium | Later |
| 2FA | Low | 1-2d | Low | Later |

---

## 📝 Quick Start - First Improvements

### Step 1: Add Database Indexes (30 min)
```javascript
// In models/User.js
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// In models/Application.js
applicationSchema.index({ userId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });
```

### Step 2: Add Input Validation (1 hour)
```bash
npm install joi
```

### Step 3: Implement Pagination (1-2 hours)
```javascript
// Reusable pagination middleware
const paginate = (req, res, next) => {
  req.page = Math.max(1, parseInt(req.query.page) || 1);
  req.limit = Math.min(100, parseInt(req.query.limit) || 10);
  req.skip = (req.page - 1) * req.limit;
  next();
};

app.use(paginate);
```

### Step 4: Add Logging (2 hours)
```bash
npm install winston
```

---

## 🎯 Conclusion

This is a **solid, modular backend** with good separation of concerns. The main improvements needed are:

1. **Performance**: Add caching, indexing, pagination
2. **Reliability**: Better error handling, logging, input validation
3. **Scalability**: Background jobs, microservices (later)
4. **Features**: Advanced search, analytics, webhooks

Start with the **High Priority** items for immediate impact! 🚀
