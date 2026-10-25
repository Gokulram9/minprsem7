const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

jest.mock('../server/middleware/authMiddleware', () => ({
  protect: (req, res, next) => next()
}));

const Message = require('../server/models/Message');
const User = require('../server/models/User');
const Notification = require('../server/models/Notification');
const messageRoutes = require('../server/routes/messageRoutes');
const { errorHandler } = require('../server/middleware/errorMiddleware');

let mongoServer;
let app;
let applicantUser;
let lawyerUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);

  // Seed applicant and lawyer users
  applicantUser = await User.create({
    name: 'Applicant Priya',
    email: 'priya@test.com',
    password: 'password123',
    role: 'User'
  });

  lawyerUser = await User.create({
    name: 'Advocate Rajan',
    email: 'rajan@law.com',
    password: 'password123',
    role: 'Lawyer'
  });

  app = express();
  app.use(express.json());

  // Attach applicant user context
  app.use((req, res, next) => {
    req.user = applicantUser;
    next();
  });

  app.use('/api/messages', messageRoutes);
  app.use(errorHandler);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Real-Time User to Lawyer Direct Messaging Suite', () => {
  beforeEach(async () => {
    await Message.deleteMany();
    await Notification.deleteMany();
  });

  it('POST /api/messages - sends direct message to advocate and creates notification', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({
        receiver: lawyerUser._id.toString(),
        text: 'Hello Advocate Rajan, please review my boundary survey document.'
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBe('Hello Advocate Rajan, please review my boundary survey document.');

    // Check notification creation for lawyer
    const notif = await Notification.findOne({ user: lawyerUser._id });
    expect(notif).toBeDefined();
    expect(notif.message).toContain('Applicant Priya');
  });

  it('GET /api/messages?withUser=<id> - retrieves bilateral conversation history', async () => {
    // Create initial message from applicant to lawyer
    await Message.create({
      sender: applicantUser._id,
      receiver: lawyerUser._id,
      text: 'Question about upcoming hearing'
    });

    // Create reply from lawyer to applicant
    await Message.create({
      sender: lawyerUser._id,
      receiver: applicantUser._id,
      text: 'Hearing is scheduled for tomorrow at 10 AM.'
    });

    const res = await request(app)
      .get(`/api/messages?withUser=${lawyerUser._id}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('GET /api/messages/conversations - lists active contact threads', async () => {
    await Message.create({
      sender: lawyerUser._id,
      receiver: applicantUser._id,
      text: 'Please bring original deed.'
    });

    const res = await request(app)
      .get('/api/messages/conversations')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].contact.name).toBe('Advocate Rajan');
  });
});
