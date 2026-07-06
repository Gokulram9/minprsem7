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

## Deployment

- Build the client:
  ```bash
  cd client && npm run build
  ```
- Configure `CLIENT_URL`, `MONGO_URI`, `JWT_SECRET`, and SMTP values in production environment.
- Use a process manager like PM2 for the Express server:
  ```bash
  pm2 start server/index.js --name legal-aid-portal
  ```
- Docker and cloud deployment can be added by packaging the server and client separately.

## Python AI Module

Start the Python AI service before running the backend:
```bash
cd python && python app.py
```

The backend calls the AI service to compute lawyer recommendation scores for incoming applications.
