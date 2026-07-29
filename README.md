# Court Case Scheduling and Legal Aid Application Status Tracking Management Portal

A modern, responsive full-stack portal built for court case scheduling, legal aid tracking, and AI-based lawyer recommendations.

## Features

- Role-based dashboards for Applicants, Lawyers, Court Staff, and Admins
- JWT authentication with registration, login, forgot password, and password reset
- MongoDB data model for users, applications, hearings, documents, messages, and notifications
- AI recommendation module powered by Python and scikit-learn
- Email notifications via Nodemailer
- File upload support using Multer
- Real-time updates via Socket.io
- Tailwind CSS frontend with React, React Router, and Chart.js

## Project Structure

- `server/` - Express backend, API routes, controllers, middleware, and MongoDB models
- `client/` - React/Vite frontend with role-based pages and landing site
- `python/` - Flask AI recommendation service and dataset example

## Getting Started

1. Install backend dependencies:
   ```bash
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   cd client && npm install
   ```
3. Install Python requirements:
   ```bash
   cd python && pip install -r requirements.txt
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
5. Update `.env` with your MongoDB URI, JWT secret, SMTP credentials, and AI service URL.
6. Seed sample data (optional):
   ```bash
   npm run seed
   ```
7. Start the platform:
   ```bash
   npm run dev
   ```

The backend will run on port `5000` and the frontend will run on port `5175`.

## API Documentation & Enpoints Summary

The backend exposes a secure, modular REST API. Below are the key endpoints integrated:

### 1. Authentication
* `POST /api/auth/register` - Create user profile
* `POST /api/auth/login` - User login (Access + Refresh Token)
* `POST /api/auth/logout` - Invalidate session

### 2. Lawyers Directory
* `GET /api/lawyers` - Retrieve verified lawyer profiles
* `GET /api/lawyers/filter` - Advanced query filtering (Specialization, Location, Fees, Rating)
* `GET /api/lawyers/:id` - Fetch advocate profile details
* `POST /api/lawyers/profile` - Create or update professional details
* `POST /api/lawyers/:id/reviews` - Submit case ratings and comment reviews

### 3. Smart Courtroom Scheduling
* `POST /api/hearings` - Book a court hearing (runs courtroom/judge/lawyer conflict check)
* `POST /api/hearings/check-conflict` - Check overlap conflicts for a proposed date/time slot
* `GET /api/hearings/availability` - Fetch working slot hours

### 4. Interactive NLP Chatbot
* `POST /api/chatbot` - Dialogue parser endpoint (maps query categories, location, and fetches matching advocates)

---

## Verification & Testing

To execute the automated backend test cases for authentications, search, and scheduling conflicts, run:
```bash
npm install --save-dev jest supertest
npm test
```

---

## Deployment

1. **Client Bundling:**
   ```bash
   npm --prefix client run build
   ```
2. **Process Manager Scheduling (PM2):**
   ```bash
   pm2 start server/index.js --name legal-aid-portal
   ```
3. **Environment Setup:** Ensure all variables from `.env.example` are configured in your cloud environment container variables.

## Python AI Module

Start the Python AI service before running the backend:
```bash
cd python && python app.py
```

The backend calls the AI service to compute lawyer recommendation scores for incoming applications.
