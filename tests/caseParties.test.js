const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

// Models & Routes
const Application = require('../server/models/Application');
const CaseParty = require('../server/models/CaseParty');
const Lawyer = require('../server/models/Lawyer');
const casePartyRoutes = require('../server/routes/casePartyRoutes');
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

  // Attach mock user
  app.use((req, res, next) => {
    req.user = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Applicant User',
      role: 'Applicant'
    };
    next();
  });

  app.use('/api/cases', casePartyRoutes);
  app.use(errorHandler);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Case Parties & Opponent Visibility Module Test Suite', () => {
  let sampleCaseId;
  let lawyerAId;

  beforeEach(async () => {
    await Application.deleteMany();
    await CaseParty.deleteMany();
    await Lawyer.deleteMany();

    lawyerAId = new mongoose.Types.ObjectId();
    await Lawyer.create({
      _id: lawyerAId,
      userId: lawyerAId,
      fullName: 'Adv. Test Counsel',
      barRegistrationNumber: 'BC/TEST/101',
      location: 'Colombo',
      specializations: ['Criminal Law']
    });

    const appDoc = await Application.create({
      applicant: new mongoose.Types.ObjectId(),
      caseTitle: 'Land Ownership Dispute',
      caseType: 'Property Law',
      description: 'Property boundary dispute claim.',
      court: 'Colombo District Court',
      opponentName: 'Suresh Kumar'
    });
    sampleCaseId = appDoc._id.toString();

    // Create your side party
    await CaseParty.create({
      partyId: 'PRT-9001',
      caseId: sampleCaseId,
      fullName: 'Applicant Priya',
      partyType: 'APPLICANT',
      side: 'YOUR_SIDE',
      phone: '0771234567',
      email: 'priya@test.com',
      address: '12 Main St'
    });

    // Create opposing side party
    await CaseParty.create({
      partyId: 'PRT-9002',
      caseId: sampleCaseId,
      fullName: 'Opponent Suresh',
      partyType: 'OPPONENT',
      side: 'OPPOSING_SIDE',
      phone: '0779998888',
      email: 'suresh@opponent.com',
      address: '99 Secret Rd',
      lawyerId: lawyerAId
    });
  });

  it('GET /api/cases/:caseId/representation - returns structured yourSide and opposingSide payload', async () => {
    const res = await request(app)
      .get(`/api/cases/${sampleCaseId}/representation`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.yourSide).toBeDefined();
    expect(res.body.data.opposingSide).toBeDefined();
    expect(res.body.data.opposingSide.parties[0].fullName).toBe('Opponent Suresh');
  });

  it('Field Privacy - opposing party private fields (phone, email, address) are restricted for applicant role', async () => {
    const res = await request(app)
      .get(`/api/cases/${sampleCaseId}/parties/opposing-side`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const opponentData = res.body.data[0];
    expect(opponentData.phone).toContain('RESTRICTED');
    expect(opponentData.email).toContain('RESTRICTED');
    expect(opponentData.address).toContain('RESTRICTED');
  });

  it('Conflict of Interest Detection - prevents assigning lawyer representing opponent to applicant side', async () => {
    // Create new party on YOUR_SIDE
    const newParty = await CaseParty.create({
      partyId: 'PRT-9003',
      caseId: sampleCaseId,
      fullName: 'Co-Applicant Meera',
      partyType: 'APPLICANT',
      side: 'YOUR_SIDE'
    });

    // Attempt to assign lawyerAId (who represents opponent PRT-9002) to YOUR_SIDE
    const res = await request(app)
      .post(`/api/cases/${sampleCaseId}/parties/${newParty._id}/assign-lawyer`)
      .send({ lawyerId: lawyerAId.toString() })
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.hasConflict).toBe(true);
    expect(res.body.message).toContain('Conflict of Interest');
  });
});
