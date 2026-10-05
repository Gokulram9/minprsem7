const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

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

dotenv.config({ path: require('path').resolve(__dirname, '../../backend/.env') });

const applicants = [
  'Arun Kumar', 'Priya Sharma', 'Karthik Raj', 'Divya Srinivasan', 'Santhosh Kumar',
  'Meena Devi', 'Rahul Krishnan', 'Anjali Mohan', 'Naveen Raj', 'Kavya S'
];
const lawyers = [
  'Vikram Menon', 'Ananya Iyer', 'Suresh Raman', 'Meera Krishnan', 'Arjun Nair',
  'Priyanka Rao', 'Ramesh Balan', 'Kavitha Menon', 'Aditya Sharma', 'Neha Srinivas'
];
const staff = [
  'Rajesh Kumar', 'Lakshmi Devi', 'Mohan Raj', 'Geetha R', 'Prakash Kumar',
  'Anitha S', 'Vignesh K', 'Deepa M', 'Hari Prasad', 'Suresh Babu'
];
const admins = [
  'System Admin', 'Operations Admin', 'Legal Admin', 'Case Admin', 'Support Admin',
  'Platform Admin', 'Security Admin', 'Data Admin', 'Notification Admin', 'Super Admin'
];

const lawyerSpecs = ['Criminal', 'Civil', 'Family', 'Property', 'Corporate', 'Cyber', 'Labour', 'Consumer', 'Motor Accident', 'Constitutional Law'];
const courtsList = ['Supreme Court', 'High Court', 'District Court', 'Family Court', 'Civil Court'];

const appStatuses = ['Submitted', 'Under Review', 'Verification', 'LawyerAssigned', 'CourtScheduled', 'Hearing', 'Judgment', 'Completed', 'Rejected'];

const generateUsername = (name) => name.toLowerCase().replace(/\s+/g, '');

const seedDemo = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    console.log('🧹 Purging database for fresh demo data...');
    
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

    const passDemo = await bcrypt.hash('Demo@123', 10);
    const passAdmin = await bcrypt.hash('Admin@123', 10);

    // 1. Create Admins
    console.log('👤 Seeding Admins...');
    const adminDocs = await Promise.all(admins.map(async (name) => {
      return await User.create({
        name,
        email: `${generateUsername(name)}@example.com`,
        password: passAdmin,
        role: 'Admin',
        phone: '99900000' + Math.floor(Math.random() * 99),
        location: 'Delhi',
      });
    }));

    // 2. Create Court Staff
    console.log('👤 Seeding Court Staff...');
    const staffDocs = await Promise.all(staff.map(async (name) => {
      return await User.create({
        name: `${name} (Court Staff)`,
        email: `${generateUsername(name)}@example.com`,
        password: passDemo,
        role: 'User',
        phone: '98800000' + Math.floor(Math.random() * 99),
        location: 'Mumbai',
      });
    }));

    // 3. Create Applicants
    console.log('👤 Seeding Applicants...');
    const applicantDocs = await Promise.all(applicants.map(async (name) => {
      return await User.create({
        name,
        email: `${generateUsername(name)}@example.com`,
        password: passDemo,
        role: 'User',
        phone: '97700000' + Math.floor(Math.random() * 99),
        location: 'Chennai',
      });
    }));

    // 4. Create Lawyers
    console.log('⚖️ Seeding Lawyers...');
    const lawyerUsers = await Promise.all(lawyers.map(async (name) => {
      return await User.create({
        name: `Adv. ${name}`,
        email: `${generateUsername(name)}@example.com`,
        password: passDemo,
        role: 'Lawyer',
        phone: '96600000' + Math.floor(Math.random() * 99),
        location: 'Bangalore',
      });
    }));

    const lawyerProfiles = await Promise.all(lawyerUsers.map(async (user, i) => {
      return await Lawyer.create({
        userId: user._id,
        fullName: user.name,
        barRegistrationNumber: `BC/IND/2026/${i+100}`,
        specializations: [lawyerSpecs[i % lawyerSpecs.length], 'General Practice'],
        practiceAreas: [lawyerSpecs[i % lawyerSpecs.length]],
        experience: 5 + (i * 3) % 25,
        languages: ['English', 'Hindi', 'Tamil'],
        courts: courtsList,
        location: 'Bangalore',
        consultationFee: 500 + i * 200,
        caseFilingFee: 5000 + i * 1000,
        courtRepresentationFee: 2000 + i * 500,
        hourlyFee: 1000 + i * 200,
        successRate: 75 + i % 20,
        totalCases: 50 + i * 10,
        completedCases: 40 + i * 8,
        activeCases: 10 + i * 2,
        rating: 4 + (i % 10) / 10,
        reviewCount: 10 + i * 5,
        availabilityStatus: i % 5 === 0 ? 'Busy' : 'Available',
        verificationStatus: 'Verified',
        bio: `Expert in ${lawyerSpecs[i % lawyerSpecs.length]} law with over ${5 + (i * 3) % 25} years of experience.`
      });
    }));

    // 5. Courts, Courtrooms, Judges
    console.log('🏛️ Seeding Courts...');
    const courtDocs = await Promise.all(courtsList.map(async (cName) => {
      const c = await Court.create({ name: cName, location: 'India' });
      await Courtroom.create({ courtId: c._id, name: 'Room 1', capacity: 50 });
      await Judge.create({ name: 'Hon. Judge ' + cName.split(' ')[0], courtId: c._id, specialization: 'General' });
      return c;
    }));

    // 6. Applications / Cases (20)
    console.log('📋 Seeding Applications...');
    const appDocs = [];
    for (let i = 0; i < 20; i++) {
      const applicant = applicantDocs[i % applicantDocs.length];
      const lawyer = lawyerProfiles[i % lawyerProfiles.length];
      const status = appStatuses[i % appStatuses.length];
      const caseType = lawyerSpecs[i % lawyerSpecs.length];

      const app = await Application.create({
        applicant: applicant._id,
        caseTitle: `${caseType} Matter for ${applicant.name}`,
        caseType: caseType,
        description: `This is a ${caseType} legal matter requiring immediate attention and legal aid.`,
        court: courtsList[i % courtsList.length],
        location: applicant.location,
        status: status,
        urgency: i % 2 === 0 ? 'High' : 'Medium',
        assignedLawyer: ['LawyerAssigned', 'CourtScheduled', 'Hearing', 'Judgment', 'Completed'].includes(status) ? lawyer.userId : undefined,
        verificationStatus: ['Submitted', 'Under Review'].includes(status) ? 'Pending' : 'Verified',
        timeline: [
          { status: 'Submitted', note: 'Application submitted successfully.' },
          { status: 'Verification', note: 'Documents are under verification.' }
        ]
      });
      appDocs.push(app);

      // 7. Hearings (20+)
      if (['CourtScheduled', 'Hearing', 'Judgment', 'Completed'].includes(status)) {
        const hearing = await Hearing.create({
          application: app._id,
          hearingDate: new Date(Date.now() + (i - 10) * 24 * 60 * 60 * 1000), // Mix of past and future
          courtroom: 'Room 1',
          judge: 'Hon. Judge ' + courtsList[i % courtsList.length].split(' ')[0],
          status: i % 3 === 0 ? 'Completed' : (i % 3 === 1 ? 'Scheduled' : 'Postponed'),
          notes: 'Regular hearing.'
        });
        app.hearing = hearing._id;
        await app.save();
      }

      // 8. Documents
      await Document.create({
        application: app._id,
        uploader: applicant._id,
        filename: `doc_${i}.pdf`,
        originalName: 'ID_Proof.pdf',
        mimeType: 'application/pdf',
        path: '/uploads/dummy.pdf',
        size: 1024,
        category: 'ID Proof'
      });
    }

    // 9. Notifications
    console.log('🔔 Seeding Notifications...');
    await Notification.create({
      user: adminDocs[0]._id,
      message: 'Demo data seeded successfully.',
      category: 'System',
      read: false
    });
    await Notification.create({
      user: applicantDocs[0]._id,
      message: 'Your application has been received.',
      category: 'Update',
      read: true
    });

    console.log('✅ Demo data seeded successfully!');
    console.log(`Applicants: ${applicantDocs.length}`);
    console.log(`Lawyers: ${lawyerUsers.length}`);
    console.log(`Court Staff: ${staffDocs.length}`);
    console.log(`Admins: ${adminDocs.length}`);
    console.log(`Total Users: 40`);
    console.log(`Applications: ${appDocs.length}`);
    console.log(`Hearings: ${await Hearing.countDocuments()}`);

    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seedDemo();
