const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Application = require('./models/Application');
const Hearing = require('./models/Hearing');
const Notification = require('./models/Notification');
const Document = require('./models/Document');
const connectDB = require('./config/db');

dotenv.config();

const seed = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    await User.deleteMany();
    await Application.deleteMany();
    await Hearing.deleteMany();
    await Notification.deleteMany();
    await Document.deleteMany();

    const password = await bcrypt.hash('Admin@1234', 10);

    const users = await User.insertMany([
      {
        name: 'Gokul Ram S (Admin)',
        email: 'gokulrams.cs23@bitsathy.ac.in',
        password,
        role: 'Admin',
        location: 'Chennai',
        phone: '9000000001',
      },
      {
        name: 'Advocate Rajan Kumar',
        email: 'lawyer@sevenseas.com',
        password,
        role: 'Lawyer',
        specialization: 'Criminal Law',
        experienceYears: 10,
        successRate: 92,
        availability: 'High',
        location: 'Chennai',
        phone: '9000000002',
      },
      {
        name: 'Priya Nair',
        email: 'user@sevenseas.com',
        password,
        role: 'User',
        location: 'Chennai',
        phone: '9000000003',
      },
      // Extra lawyers for directory
      {
        name: 'Advocate Aisha Verma',
        email: 'aisha@sevenseas.com',
        password,
        role: 'Lawyer',
        specialization: 'Family Law',
        experienceYears: 12,
        successRate: 88,
        availability: 'Medium',
        location: 'Mumbai',
        phone: '9000000004',
      },
      {
        name: 'Advocate Siddharth Roy',
        email: 'sid@sevenseas.com',
        password,
        role: 'Lawyer',
        specialization: 'Property Law',
        experienceYears: 8,
        successRate: 80,
        availability: 'High',
        location: 'Delhi',
        phone: '9000000005',
      },
    ]);

    const user = users.find((u) => u.role === 'User');
    const lawyer = users.find((u) => u.email === 'lawyer@sevenseas.com');

    const application = await Application.create({
      applicant: user._id,
      caseTitle: 'Property Dispute — Nair vs Municipal Corp',
      caseType: 'Civil',
      description: 'Requesting legal aid for property boundary dispute with municipal corporation.',
      court: 'District Court',
      location: 'Chennai',
      urgency: 'High',
      status: 'CourtScheduled',
      assignedLawyer: lawyer._id,
      timeline: [
        { status: 'Submitted', note: 'Application submitted by user' },
        { status: 'Under Review', note: 'Admin reviewing the case' },
        { status: 'LawyerAssigned', note: 'Advocate Rajan Kumar assigned' },
        { status: 'CourtScheduled', note: 'Hearing date confirmed by admin' },
      ],
    });

    const hearing = await Hearing.create({
      application: application._id,
      hearingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      courtroom: 'Courtroom A',
      judge: 'Hon. Justice Shanmugam',
      notes: 'First hearing — both parties to present initial documents.',
    });

    application.hearing = hearing._id;
    await application.save();

    await Notification.create({
      user: user._id,
      application: application._id,
      message: 'Your hearing for "Property Dispute" is scheduled for next week in Courtroom A.',
      category: 'Hearing',
    });

    await Notification.create({
      user: lawyer._id,
      application: application._id,
      message: 'You have been assigned to case: Property Dispute — Nair vs Municipal Corp.',
      category: 'Assignment',
    });

    await Document.create({
      application: application._id,
      uploader: user._id,
      filename: 'property-documents.pdf',
      originalName: 'property-documents.pdf',
      mimeType: 'application/pdf',
      path: 'uploads/property-documents.pdf',
      size: 345678,
      category: 'Evidence',
    });

    console.log('✅ Seven Seas Justice System — Seed data created successfully');
    console.log('─────────────────────────────────────────');
    console.log('Demo Credentials (all use password: Admin@1234)');
    console.log('  Admin  → gokulrams.cs23@bitsathy.ac.in');
    console.log('  Lawyer → lawyer@sevenseas.com');
    console.log('  User   → user@sevenseas.com');
    console.log('─────────────────────────────────────────');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seed error:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
