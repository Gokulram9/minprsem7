const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Lawyer = require('./models/Lawyer');
const Application = require('./models/Application');
const Hearing = require('./models/Hearing');
const Notification = require('./models/Notification');
const Document = require('./models/Document');
const Review = require('./models/Review');
const Court = require('./models/Court');
const Courtroom = require('./models/Courtroom');
const Judge = require('./models/Judge');
const AuditLog = require('./models/AuditLog');

dotenv.config();

const seed = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('🧹 Purging database collections...');
    await User.deleteMany();
    await Lawyer.deleteMany();
    await Application.deleteMany();
    await Hearing.deleteMany();
    await Notification.deleteMany();
    await Document.deleteMany();
    await Review.deleteMany();
    await Court.deleteMany();
    await Courtroom.deleteMany();
    await Judge.deleteMany();
    await AuditLog.deleteMany();

    const passwordHash = await bcrypt.hash('Admin@1234', 10);

    // 1. Create Admins and Court Staff
    console.log('👤 Seeding core user accounts...');
    const adminUser = await User.create({
      name: 'Gokul Ram S (Admin)',
      email: 'gokulrams.cs23@bitsathy.ac.in',
      password: passwordHash,
      role: 'Admin',
      location: 'Chennai',
      phone: '9000000001',
    });

    const staffUser = await User.create({
      name: 'Registrar Perera (Court Staff)',
      email: 'staff@sevenseas.com',
      password: passwordHash,
      role: 'User', // mapped as CourtStaff via custom check or staff email
      location: 'Chennai',
      phone: '9000000006',
    });

    // 2. Create 10 Applicants (Users)
    const applicantNames = [
      'Priya Nair', 'Arjun Das', 'Meera Singh', 'Ravi Kumar', 'Sanjay Dutt',
      'Sunita Sharma', 'Kiran Patel', 'Anil Deshmukh', 'Jyoti Rao', 'Deepak Gupta'
    ];
    const applicantUsers = [];
    for (let i = 0; i < applicantNames.length; i++) {
      const u = await User.create({
        name: applicantNames[i],
        email: `applicant${i+1}@sevenseas.com`,
        password: passwordHash,
        role: 'User',
        location: i % 2 === 0 ? 'Chennai' : 'Mumbai',
        phone: `91000000${i}`,
      });
      applicantUsers.push(u);
    }

    // 3. Create 20 Lawyers & Lawyer Profiles
    console.log('⚖️ Seeding 20 lawyer directories...');
    const lawyerNames = [
      'Rajan Kumar', 'Aisha Verma', 'Siddharth Roy', 'Nidhi Sharma', 'Vikram Seth',
      'Kavita Rao', 'Amit Shah', 'Sneha Joshi', 'Deepak Johar', 'Priya Sen',
      'Arun Mehta', 'Meenakshi Iyer', 'Rajesh Patel', 'Divya Nair', 'Suresh Goel',
      'Anjali Deshmukh', 'Vijay Patil', 'Neha Gupta', 'Sanjay Mishra', 'Rohan Malhotra'
    ];

    const specs = [
      'Criminal Law', 'Family Law', 'Property Law', 'Civil Law', 'Labor & Employment Law'
    ];
    const locations = ['Chennai', 'Mumbai', 'Delhi', 'Colombo', 'Galle', 'Kandy'];
    const lawyerRecords = [];

    for (let i = 0; i < lawyerNames.length; i++) {
      const userL = await User.create({
        name: `Advocate ${lawyerNames[i]}`,
        email: `lawyer${i+1}@sevenseas.com`,
        password: passwordHash,
        role: 'Lawyer',
        location: locations[i % locations.length],
        phone: `92000000${i}`,
      });

      const lawyerProfile = await Lawyer.create({
        userId: userL._id,
        fullName: userL.name,
        barRegistrationNumber: `BC/IND/990${i+10}`,
        specializations: [specs[i % specs.length], 'General Litigation'],
        practiceAreas: [specs[i % specs.length], 'Trial Advocacy', 'Mediation'],
        experience: 5 + (i * 2) % 20,
        education: 'NLSIU Bangalore, LLB',
        languages: ['English', i % 2 === 0 ? 'Hindi' : 'Tamil'],
        courts: [i % 2 === 0 ? 'District Court' : 'High Court'],
        location: userL.location,
        consultationFee: 100 + (i * 50) % 500,
        caseFilingFee: 500 + (i * 100) % 2000,
        courtRepresentationFee: 1000 + (i * 200) % 4000,
        hourlyFee: 50 + (i * 25) % 300,
        successRate: 70 + (i * 2) % 28,
        totalCases: 20 + i * 5,
        completedCases: 15 + i * 4,
        activeCases: i % 5 + 1,
        availabilityStatus: i % 4 === 0 ? 'Busy' : 'Available',
        verificationStatus: i === 19 ? 'Pending' : 'Verified',
        bio: `Experienced advocate specializing in ${specs[i % specs.length]}. Committed to delivering rapid and indigent-friendly legal representation.`
      });

      lawyerRecords.push(lawyerProfile);
    }

    // 4. Create 10 Courts, Courtrooms, and Judges
    console.log('🏛️ Seeding courts and scheduling structures...');
    const courtNames = [
      'Supreme Court of India', 'Madras High Court', 'Bombay High Court',
      'Delhi High Court', 'Chennai District Court', 'Mumbai Civil Court',
      'Colombo District Court', 'Galle Magistrate Court', 'Kandy High Court',
      'Negombo District Court'
    ];

    const courts = [];
    for (let i = 0; i < courtNames.length; i++) {
      const c = await Court.create({
        name: courtNames[i],
        location: i < 6 ? 'India' : 'Sri Lanka'
      });
      courts.push(c);

      // Create Courtroom
      await Courtroom.create({
        courtId: c._id,
        name: 'Courtroom A',
        capacity: 100
      });
      await Courtroom.create({
        courtId: c._id,
        name: 'Courtroom B',
        capacity: 40
      });

      // Create Judge
      await Judge.create({
        name: `Justice ${lawyerNames[i % lawyerNames.length]}`,
        courtId: c._id,
        specialization: specs[i % specs.length]
      });
    }

    // 5. Create 10 Legal Aid Applications
    console.log('📋 Seeding 10 legal aid applications...');
    const appStatuses = [
      'Submitted', 'Under Review', 'Verification', 'LawyerAssigned',
      'CourtScheduled', 'Hearing', 'Completed', 'Rejected', 'Submitted', 'Under Review'
    ];

    const seededApps = [];
    for (let i = 0; i < 10; i++) {
      const applicant = applicantUsers[i % applicantUsers.length];
      const lawyer = lawyerRecords[i % lawyerRecords.length];
      
      const app = await Application.create({
        applicant: applicant._id,
        caseTitle: `${specs[i % specs.length]} Dispute for ${applicant.name}`,
        caseType: specs[i % specs.length],
        description: `This application seeks indigent legal aid subsidy for an ongoing conflict involving ${specs[i % specs.length]}. Need immediate defense council representation.`,
        court: courts[i % courts.length].name,
        location: applicant.location,
        urgency: i % 3 === 0 ? 'High' : (i % 3 === 1 ? 'Medium' : 'Low'),
        status: appStatuses[i],
        assignedLawyer: i >= 3 ? lawyer.userId : undefined,
        occupation: i % 2 === 0 ? 'Clerk' : 'Mechanic',
        monthlyIncome: 15000 + i * 5000,
        verificationStatus: i >= 3 ? 'Verified' : (i === 7 ? 'Rejected' : 'Pending'),
        timeline: [
          { status: 'Submitted', note: 'Initial legal aid request received.' },
          { status: 'Under Review', note: 'Document auditing initiated.' }
        ]
      });
      seededApps.push(app);
    }

    // 6. Create Hearings
    console.log('📅 Seeding hearing bookings...');
    const scheduledApp = seededApps.find(a => a.status === 'CourtScheduled');
    if (scheduledApp) {
      const hearing = await Hearing.create({
        application: scheduledApp._id,
        hearingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        courtroom: 'Courtroom A',
        judge: 'Hon. Justice Aisha Verma',
        notes: 'First argument panel hearing — both parties to attend.'
      });
      scheduledApp.hearing = hearing._id;
      await scheduledApp.save();
    }

    // 7. Create Reviews
    console.log('⭐ Seeding advocate reviews...');
    const completedApp = seededApps.find(a => a.status === 'Completed');
    if (completedApp && completedApp.assignedLawyer) {
      const lawyerProfile = await Lawyer.findOne({ userId: completedApp.assignedLawyer });
      if (lawyerProfile) {
        await Review.create({
          applicantId: completedApp.applicant,
          lawyerId: lawyerProfile._id,
          caseId: completedApp._id,
          rating: 5,
          comment: 'Outstanding trial advocacy. Extremely professional counsel.'
        });
        
        lawyerProfile.rating = 5.0;
        lawyerProfile.reviewCount = 1;
        await lawyerProfile.save();
      }
    }

    // 8. Create Notifications
    console.log('🔔 Seeding initial notifications...');
    await Notification.create({
      user: adminUser._id,
      message: 'System database successfully seeded with all mock portfolios.',
      category: 'System'
    });

    console.log('✅ Seven Seas Justice System — Complex Seed data seeded successfully!');
    console.log('─────────────────────────────────────────');
    console.log('Credentials (all use password: Admin@1234)');
    console.log(`  Admin        → ${adminUser.email}`);
    console.log(`  Applicant #1 → ${applicantUsers[0].email}`);
    console.log(`  Lawyer #1    → lawyer1@sevenseas.com`);
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
