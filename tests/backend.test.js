const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const connectDB = require('../server/config/db');

// Import routes and express app components
const authRoutes = require('../server/routes/authRoutes');
const lawyerRoutes = require('../server/routes/lawyerRoutes');
const hearingRoutes = require('../server/routes/hearingRoutes');
const chatbotRoutes = require('../server/routes/chatbotRoutes');
const { errorHandler } = require('../server/middleware/errorMiddleware');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  
  // Setup mock user middleware for testing authenticated endpoints
  app.use((req, res, next) => {
    req.user = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Citizen',
      role: 'User',
      preferredLanguage: 'English'
    };
    next();
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/lawyers', lawyerRoutes);
  app.use('/api/hearings', hearingRoutes);
  app.use('/api/chatbot', chatbotRoutes);
  app.use(errorHandler);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Advanced Backend Testing Suites', () => {
  
  describe('Lawyer Directory API Search & Filter Tests', () => {
    it('should retrieve list of verified lawyers from database', async () => {
      const res = await request(app)
        .get('/api/lawyers')
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should query lawyers with advanced filtering parameters', async () => {
      const res = await request(app)
        .get('/api/lawyers/filter?specialization=Family%20Law&location=Chennai')
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Smart Courtroom Scheduling Conflict Checks', () => {
    it('should execute a conflict check and return zero conflicts for clean slots', async () => {
      const payload = {
        hearingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        courtroom: 'Courtroom Hall A',
        judge: 'Justice Shanmugam',
        applicationId: new mongoose.Types.ObjectId()
      };
      
      const res = await request(app)
        .post('/api/hearings/check-conflict')
        .send(payload)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.hasConflict).toBe(false);
      expect(res.body.conflicts.length).toBe(0);
    });
  });

  describe('Conversational NLP Chatbot API Tests', () => {
    it('should parse legal query text and update message context values', async () => {
      const payload = {
        message: 'I want a divorce lawyer in Chennai to arrange child custody.',
        context: {}
      };
      
      const res = await request(app)
        .post('/api/chatbot')
        .send(payload)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.context.caseType).toBe('Family Law');
      expect(res.body.context.location).toBe('Chennai');
    });
  });
});
