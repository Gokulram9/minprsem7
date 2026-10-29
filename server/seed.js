const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
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
const CaseParty = require('./models/CaseParty');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

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
    await CaseParty.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();

    const passwordHash = await bcrypt.hash('Admin@1234', 10);

    // 1. Create Admins and Court Staff
    const SEED_USER_IDS = {
      admin1: new mongoose.Types.ObjectId('65a000000000000000000001'),
      adminTest: new mongoose.Types.ObjectId('65a000000000000000000002'),
      staff1: new mongoose.Types.ObjectId('65a000000000000000000003'),
      staffTest: new mongoose.Types.ObjectId('65a000000000000000000004'),
      judge1: new mongoose.Types.ObjectId('65a000000000000000000005'),
      judge2: new mongoose.Types.ObjectId('65a000000000000000000006'),
      applicantTest: new mongoose.Types.ObjectId('65a000000000000000000007'),
      applicantUser1: new mongoose.Types.ObjectId('65a000000000000000000008'),
      lawyerTest: new mongoose.Types.ObjectId('65a000000000000000000009'),
    };

    console.log('👤 Seeding core user accounts for Theni District Court...');
    const adminUser = await User.create({
      _id: SEED_USER_IDS.admin1,
      name: 'Gokul Ram S (Admin)',
      email: 'gokulrams.cs23@bitsathy.ac.in',
      password: passwordHash,
      role: 'Admin',
      location: 'Theni, Tamil Nadu',
      district: 'Theni',
      state: 'Tamil Nadu',
      address: 'Combined Court Complex Road, Theni, Tamil Nadu - 625531',
      phone: '9000000001',
      isVerified: true
    });

    const adminTestUser = await User.create({
      _id: SEED_USER_IDS.adminTest,
      name: 'System Admin Officer',
      email: 'admin@test.com',
      password: passwordHash,
      role: 'Admin',
      location: 'Theni, Tamil Nadu',
      district: 'Theni',
      state: 'Tamil Nadu',
      address: 'Combined Court Complex Road, Theni, Tamil Nadu - 625531',
      phone: '9000000002',
      isVerified: true
    });

    const staffUser = await User.create({
      _id: SEED_USER_IDS.staff1,
      name: 'Registrar M. Selvam (Court Staff)',
      email: 'staff@sevenseas.com',
      password: passwordHash,
      role: 'CourtStaff',
      location: 'Theni, Tamil Nadu',
      district: 'Theni',
      state: 'Tamil Nadu',
      address: 'District Court Administration Wing, Theni, Tamil Nadu - 625531',
      phone: '9000000006',
      isVerified: true
    });

    const staffTestUser = await User.create({
      _id: SEED_USER_IDS.staffTest,
      name: 'Court Registrar Office',
      email: 'staff@test.com',
      password: passwordHash,
      role: 'CourtStaff',
      location: 'Theni, Tamil Nadu',
      district: 'Theni',
      state: 'Tamil Nadu',
      address: 'District Court Administration Wing, Theni, Tamil Nadu - 625531',
      phone: '9000000007',
      isVerified: true
    });

    // Primary Judge - Theni District Court
    const judgeUser1 = await User.create({
      _id: SEED_USER_IDS.judge1,
      name: 'Hon. Justice S. Shanmugam',
      email: 'judge@sevenseas.com',
      password: passwordHash,
      role: 'Judge',
      location: 'Theni, Tamil Nadu',
      district: 'Theni',
      state: 'Tamil Nadu',
      phone: '9000000008',
      specialization: 'Principal District & Sessions Court, Theni'
    });

    const judgeProfile1 = await Judge.create({
      userId: judgeUser1._id,
      name: judgeUser1.name,
      courtName: 'District Court, Theni',
      courtroom: 'Courtroom 1 (Principal District Court)',
      designation: 'Principal District Judge',
      registrationNumber: 'JDG-TN-8821',
      specialization: 'Civil, Criminal & Sessions Litigation',
      jurisdiction: 'Theni District Jurisdiction',
      yearsServing: 16,
      status: 'Active',
      contactEmail: judgeUser1.email,
      phone: judgeUser1.phone
    });

    // Secondary Judge - For reassignment testing
    const judgeUser2 = await User.create({
      _id: SEED_USER_IDS.judge2,
      name: 'Hon. Justice M. Thangavel',
      email: 'judge2@sevenseas.com',
      password: passwordHash,
      role: 'Judge',
      location: 'Theni, Tamil Nadu',
      district: 'Theni',
      state: 'Tamil Nadu',
      phone: '9000000009',
      specialization: 'Additional District & Sessions Court, Theni'
    });

    const judgeProfile2 = await Judge.create({
      userId: judgeUser2._id,
      name: judgeUser2.name,
      courtName: 'District Court, Theni',
      courtroom: 'Courtroom 2 (Fast Track Sessions Court)',
      designation: 'Additional District Judge',
      registrationNumber: 'JDG-TN-9104',
      specialization: 'Criminal Trials & Motor Accident Claims',
      jurisdiction: 'Theni District Jurisdiction',
      yearsServing: 12,
      status: 'Active',
      contactEmail: judgeUser2.email,
      phone: judgeUser2.phone
    });

    // 2. Create 10 Applicants (Citizens belonging to Theni, Tamil Nadu)
    console.log('👥 Seeding 10 Theni applicant citizens...');
    const applicantProfiles = [
      { name: 'M. Muthulakshmi', address: '14, NRT Nagar, Theni, Tamil Nadu - 625531', phone: '9842101001' },
      { name: 'K. Pandian', address: '28, Allinagaram Main Road, Theni, Tamil Nadu - 625531', phone: '9842101002' },
      { name: 'S. Selvaraj', address: '7, Bodi Road, Theni, Tamil Nadu - 625531', phone: '9842101003' },
      { name: 'R. Kalaiselvi', address: '52, Periyakulam Road, Theni, Tamil Nadu - 625531', phone: '9842101004' },
      { name: 'V. Alagarsamy', address: '19, Cumbum Road, Theni, Tamil Nadu - 625531', phone: '9842101005' },
      { name: 'P. Chellammal', address: '33, Subban Chetty Street, Theni, Tamil Nadu - 625531', phone: '9842101006' },
      { name: 'T. Marimuthu', address: '81, Forest Road, Theni, Tamil Nadu - 625531', phone: '9842101007' },
      { name: 'A. Soundararajan', address: '12, Bangalow Medu, Theni, Tamil Nadu - 625531', phone: '9842101008' },
      { name: 'G. Vijayalakshmi', address: '45, Madurai Road, Theni, Tamil Nadu - 625531', phone: '9842101009' },
      { name: 'M. Gurusamy', address: '66, Edamal Street, Theni, Tamil Nadu - 625531', phone: '9842101010' }
    ];

    const applicantTestUser = await User.create({
      _id: SEED_USER_IDS.applicantTest,
      name: 'M. Muthulakshmi (Applicant)',
      email: 'applicant@test.com',
      password: passwordHash,
      role: 'Applicant',
      location: 'Theni, Tamil Nadu',
      district: 'Theni',
      state: 'Tamil Nadu',
      address: '14, NRT Nagar, Theni, Tamil Nadu - 625531',
      phone: '9842101001',
      isVerified: true,
      profileCompleted: true
    });

    const applicantUsers = [applicantTestUser];
    for (let i = 0; i < applicantProfiles.length; i++) {
      const p = applicantProfiles[i];
      const u = await User.create({
        name: p.name,
        email: i === 0 ? 'user@sevenseas.com' : `applicant${i + 1}@sevenseas.com`,
        password: passwordHash,
        role: 'Applicant',
        location: 'Theni, Tamil Nadu',
        district: 'Theni',
        state: 'Tamil Nadu',
        address: p.address,
        phone: p.phone,
        isVerified: true,
        profileCompleted: true
      });
      applicantUsers.push(u);
    }

    // 3. Create 30 Authentic Advocates belonging to Theni District Court
    console.log('⚖️ Seeding 30 Theni District Court Advocates...');
    const lawyersList = [
      {
        name: 'Advocate S. Murugan',
        bar: 'MS/842/2002',
        specialization: 'Property Law & Land Partition',
        practiceAreas: ['Land Partition Suits', 'Title Declaration', 'Revenue Matters', 'Boundary Disputes'],
        experience: 22,
        education: 'LL.B, Madurai Law College',
        rating: 4.9,
        reviews: 240,
        casesWon: 215,
        successRate: 96,
        fee: 100,
        bio: 'Senior advocate with 22 years of dedicated practice in Theni Combined Court Complex specializing in agricultural land title disputes and revenue rectifications.'
      },
      {
        name: 'Advocate K. Meenakshi Sundaram',
        bar: 'MS/1120/2005',
        specialization: 'Criminal Law',
        practiceAreas: ['Bail Applications', 'Criminal Appeals', 'IPC Trials', 'Anticipatory Bail'],
        experience: 19,
        education: 'LL.M, Criminal Justice & Forensic Law',
        rating: 4.9,
        reviews: 198,
        casesWon: 182,
        successRate: 94,
        fee: 120,
        bio: 'Accomplished defense lawyer with vast trial advocacy experience before Judicial Magistrates and the Theni District Sessions Judge.'
      },
      {
        name: 'Advocate R. Kavitha',
        bar: 'MS/1456/2008',
        specialization: 'Family & Matrimonial Law',
        practiceAreas: ['Divorce & Mutual Consent', 'Child Custody', 'Maintenance Petitions (Sec 125 CrPC)', 'Domestic Violence Cases'],
        experience: 16,
        education: 'B.A.B.L, Dr. Ambedkar Govt Law College, Chennai',
        rating: 4.8,
        reviews: 165,
        casesWon: 151,
        successRate: 92,
        fee: 90,
        bio: 'Empathetic and steadfast matrimonial specialist resolving family disputes and legal guardianship claims across Theni and Periyakulam benches.'
      },
      {
        name: 'Advocate P. Senthil Kumar',
        bar: 'MS/1890/2006',
        specialization: 'Civil & Contract Law',
        practiceAreas: ['Money Suits & Recovery', 'Specific Performance of Contract', 'Injunction Petitions', 'Tenancy Disputes'],
        experience: 18,
        education: 'LL.B, Government Law College, Madurai',
        rating: 4.8,
        reviews: 174,
        casesWon: 158,
        successRate: 91,
        fee: 110,
        bio: 'Specialist in civil jurisprudence, contract enforcement, and promissory note disputes before Theni Sub Court and Principal District Court.'
      },
      {
        name: 'Advocate M. Balamurugan',
        bar: 'MS/2240/2011',
        specialization: 'Motor Accident Claims & Insurance',
        practiceAreas: ['MACT Claims', 'Insurance Tribunal Appeals', 'Personal Injury Compensation', 'Workmen Compensation'],
        experience: 13,
        education: 'LL.B, Government Law College, Coimbatore',
        rating: 4.7,
        reviews: 142,
        casesWon: 130,
        successRate: 89,
        fee: 80,
        bio: 'Dedicated advocate with extensive record securing highest MACT tribunal compensation awards for accident victims across Theni district.'
      },
      {
        name: 'Advocate V. Anitha',
        bar: 'MS/980/2009',
        specialization: 'Constitutional & Consumer Rights',
        practiceAreas: ['District Consumer Disputes Forum', 'Banking & Medical Negligence', 'RTI Applications', 'Writ Petitions'],
        experience: 15,
        education: 'LL.M (Constitutional Law), Madras University',
        rating: 4.8,
        reviews: 130,
        casesWon: 118,
        successRate: 93,
        fee: 95,
        bio: 'Experienced in consumer protection disputes at Theni District Consumer Commission and Madurai Bench writ petitions.'
      },
      {
        name: 'Advocate T. Rajendran',
        bar: 'MS/670/1998',
        specialization: 'Revenue & Agricultural Land Law',
        practiceAreas: ['Patta Passbook Transfers', 'Tahsildar & RDO Revenue Appeals', 'Agricultural Land Inam Settlement', 'Easement Rights'],
        experience: 26,
        education: 'B.L, Madurai Kamaraj University',
        rating: 5.0,
        reviews: 310,
        casesWon: 295,
        successRate: 97,
        fee: 130,
        bio: 'Doyen of agricultural land matters in Theni district with over a quarter-century handling revenue records and boundary settlement.'
      },
      {
        name: 'Advocate S. Priya Dharshini',
        bar: 'MS/2810/2015',
        specialization: 'Women Rights & Domestic Protection',
        practiceAreas: ['Protection of Women from DV Act', 'Dowry Prohibition Matters', 'Pari Delicto Injunctions', 'Legal Aid Free Clinics'],
        experience: 9,
        education: 'B.B.A.LL.B (Hons), Tamil Nadu National Law University (TNNLU)',
        rating: 4.9,
        reviews: 115,
        casesWon: 104,
        successRate: 95,
        fee: 75,
        bio: 'Proactive advocate serving underprivileged women and indigent applicants through Theni District Legal Services Authority (DLSA).'
      },
      {
        name: 'Advocate G. Karuppasamy',
        bar: 'MS/1340/2004',
        specialization: 'Criminal Trial & Sessions Advocacy',
        practiceAreas: ['Homicide & Sessions Trials', 'NDPS Act Cases', 'Preventive Detention (Goondas Act)', 'Criminal Revisions'],
        experience: 20,
        education: 'LL.B, Government Law College, Tirunelveli',
        rating: 4.8,
        reviews: 210,
        casesWon: 190,
        successRate: 92,
        fee: 125,
        bio: 'Vigorous criminal defense strategist regularly arguing trial sessions at Theni Combined Court Complex and Madurai Bench of Madras HC.'
      },
      {
        name: 'Advocate A. Mohamed Ismail',
        bar: 'MS/1730/2010',
        specialization: 'Commercial & Banking Litigation',
        practiceAreas: ['SARFAESI Act Defense', 'Bank Debt Recovery (DRT Madurai)', 'Partnership Dissolution', 'Commercial Leases'],
        experience: 14,
        education: 'LL.M (Corporate Law), Bharathidasan University',
        rating: 4.7,
        reviews: 95,
        casesWon: 86,
        successRate: 90,
        fee: 115,
        bio: 'Corporate and financial disputes counsel counseling agricultural traders, cardamom merchants, and local enterprises in Theni.'
      },
      {
        name: 'Advocate N. Lakshmi Narayanan',
        bar: 'MS/890/2001',
        specialization: 'Civil Appeals & Title Rectification',
        practiceAreas: ['First Appeals (Sub Court/District Court)', 'Will & Probate Settlement', 'Trust Property Litigation', 'Declaration Suits'],
        experience: 23,
        education: 'LL.B, Madurai Law College',
        rating: 4.9,
        reviews: 250,
        casesWon: 232,
        successRate: 94,
        fee: 140,
        bio: 'Veteran civil jurist renowned for comprehensive case preparation and appellate advocacy before Theni District Court benches.'
      },
      {
        name: 'Advocate D. Jayanthi',
        bar: 'MS/2150/2013',
        specialization: 'Child Custody & Guardianship',
        practiceAreas: ['Guardians and Wards Act', 'POCSO Legal Defense & Victim Support', 'Adoption Formalities', 'Matrimonial Mediation'],
        experience: 11,
        education: 'LL.B, Dr. Ambedkar Govt Law College, Pondicherry',
        rating: 4.8,
        reviews: 88,
        casesWon: 81,
        successRate: 92,
        fee: 85,
        bio: 'Compassionate family litigator with recognized proficiency handling sensitive juvenile and custodial issues in Theni.'
      },
      {
        name: 'Advocate K. Muthuvel',
        bar: 'MS/1560/2007',
        specialization: 'Labour & Industrial Disputes',
        practiceAreas: ['Industrial Disputes Act', 'Estate & Plantation Workers Rights', 'Gratuity & EPF Appeals', 'Trade Union Representation'],
        experience: 17,
        education: 'LL.B, Government Law College, Trichy',
        rating: 4.7,
        reviews: 134,
        casesWon: 122,
        successRate: 88,
        fee: 90,
        bio: 'Championing workers and agricultural estate labourers across Megamalai, Cumbum Valley, and Theni district tribunals.'
      },
      {
        name: 'Advocate C. Saravanan',
        bar: 'MS/2430/2014',
        specialization: 'Negotiable Instruments & Cheque Bounce',
        practiceAreas: ['Section 138 NI Act Suits', 'Summary Debt Suits', 'Promissory Note Enforcement', 'Commercial Arbitration'],
        experience: 10,
        education: 'B.A.B.L, Madurai Law College',
        rating: 4.8,
        reviews: 112,
        casesWon: 102,
        successRate: 93,
        fee: 80,
        bio: 'High-speed cheque bounce and commercial paper dispute lawyer with hundreds of settled matters across Judicial Magistrate Courts in Theni.'
      },
      {
        name: 'Advocate J. Deepa Rani',
        bar: 'MS/3120/2017',
        specialization: 'Cyber Crime & Financial Fraud',
        practiceAreas: ['Online Banking Fraud', 'IT Act Offenses & Data Theft', 'Defamation & Digital Harassment', 'E-commerce Redressal'],
        experience: 7,
        education: 'LL.M (Cyber Law & Cyber Security)',
        rating: 4.9,
        reviews: 76,
        casesWon: 70,
        successRate: 95,
        fee: 105,
        bio: 'Tech-savvy advocate fighting modern cyber crimes, UPI scams, and cyber stalking through Theni Cyber Crime Police Station and Sessions Court.'
      },
      {
        name: 'Advocate R. Thirunavukkarasu',
        bar: 'MS/510/1995',
        specialization: 'Senior Appellate Counsel',
        practiceAreas: ['High Court Writ Petitions', 'Civil & Criminal Second Appeals', 'Special Leave Petitions Consultation', 'Arbitration & Conciliation'],
        experience: 29,
        education: 'LL.M, Madras Law College',
        rating: 5.0,
        reviews: 380,
        casesWon: 360,
        successRate: 98,
        fee: 180,
        bio: 'Senior member of the Bar with 29 years experience appearing extensively before Theni District Court and Madras High Court Madurai Bench.'
      },
      {
        name: 'Advocate A. Sundaramurthy',
        bar: 'MS/750/2001',
        specialization: 'Property Law & Land Partition',
        practiceAreas: ['Ancestral Land Partitions', 'Boundary Encroachment Suits', 'Patta Cancellation Writs', 'Title Rectification'],
        experience: 23,
        education: 'B.Sc, LL.B, Government Law College, Madurai',
        rating: 4.9,
        reviews: 220,
        casesWon: 205,
        successRate: 95,
        fee: 110,
        bio: 'Prominent civil and property litigator practicing across Periyakulam and Theni courts with over two decades resolving complex ancestral partition and boundary disputes.'
      },
      {
        name: 'Advocate P. Mariselvi',
        bar: 'MS/1920/2010',
        specialization: 'Family & Matrimonial Law',
        practiceAreas: ['Contested & Mutual Divorce', 'Maintenance under Sec 125 CrPC', 'Protection of Women from DV Act', 'Custody Petitions'],
        experience: 14,
        education: 'B.A.B.L, Dr. Ambedkar Govt Law College, Chennai',
        rating: 4.8,
        reviews: 158,
        casesWon: 144,
        successRate: 92,
        fee: 85,
        bio: 'Respected matrimonial counsel in Theni Family Court dedicated to securing equitable alimony, maintenance decrees, and protective relief for aggrieved spouses.'
      },
      {
        name: 'Advocate M. Alagarsamy',
        bar: 'MS/1180/2003',
        specialization: 'Criminal Law',
        practiceAreas: ['Sessions Trials', 'Anticipatory & Regular Bail', 'NDPS Act Defense', 'Criminal Revisions'],
        experience: 21,
        education: 'LL.M (Criminal Law), Madurai Kamaraj University',
        rating: 4.9,
        reviews: 235,
        casesWon: 218,
        successRate: 94,
        fee: 130,
        bio: 'Hard-hitting criminal defense advocate with extensive trial experience defending serious sessions cases and securing urgent bail grants before Theni Sessions Judge.'
      },
      {
        name: 'Advocate S. Veerachamy',
        bar: 'MS/610/1997',
        specialization: 'Revenue & Agricultural Land Law',
        practiceAreas: ['Vaigai Basin Water & Irrigation Rights', 'Grama Natham & Poramboke Encroachments', 'Tahsildar Revenue Appeals', 'Agricultural Land Records'],
        experience: 27,
        education: 'B.L, Government Law College, Tiruchirappalli',
        rating: 5.0,
        reviews: 340,
        casesWon: 322,
        successRate: 97,
        fee: 140,
        bio: 'Senior authority on Tamil Nadu revenue jurisprudence, riparian water rights, and agrarian land settlements with 27 years of dedicated service in Theni district.'
      },
      {
        name: 'Advocate K. Bhuvaneswari',
        bar: 'MS/2540/2015',
        specialization: 'Family & Matrimonial Law',
        practiceAreas: ['Matrimonial Mediation', 'Restitution of Conjugal Rights', 'Child Welfare & Guardianship', 'Legal Heirship Certificates'],
        experience: 9,
        education: 'B.B.A.LL.B (Hons), Central Law College, Salem',
        rating: 4.8,
        reviews: 98,
        casesWon: 91,
        successRate: 93,
        fee: 75,
        bio: 'Accredited mediator and empathetic family lawyer adept at amicable marital dispute resolution, Lok Adalat awards, and child visitation agreements in Theni.'
      },
      {
        name: 'Advocate V. Manikandan',
        bar: 'MS/2105/2012',
        specialization: 'Negotiable Instruments & Cheque Bounce',
        practiceAreas: ['Section 138 NI Act Complaints', 'Statutory Demand Notices', 'Promissory Note Summary Suits', 'Commercial Debt Recovery'],
        experience: 12,
        education: 'B.Com, LL.B, Government Law College, Coimbatore',
        rating: 4.8,
        reviews: 145,
        casesWon: 134,
        successRate: 93,
        fee: 85,
        bio: 'Dynamic specialist in cheque bounce prosecution and defense before Judicial Magistrate Courts in Theni, Uthamapalayam, and Bodinayakanur.'
      },
      {
        name: 'Advocate T. Pandiarajan',
        bar: 'MS/1680/2009',
        specialization: 'Motor Accident Claims & Insurance',
        practiceAreas: ['MACT Claim Petitions', 'Fatal Vehicular Accident Claims', 'Disability Assessment Compensation', 'Insurance Company Appeals'],
        experience: 15,
        education: 'LL.B, Government Law College, Madurai',
        rating: 4.8,
        reviews: 162,
        casesWon: 150,
        successRate: 93,
        fee: 90,
        bio: 'Accomplished MACT practitioner having obtained substantial compensation awards for victims of highway collisions along Dindigul-Theni-Kollam NH.'
      },
      {
        name: 'Advocate N. Subbiah',
        bar: 'MS/480/1994',
        specialization: 'Civil & Contract Law',
        practiceAreas: ['Specific Performance of Sale Agreements', 'Injunction & Eviction Petitions', 'Civil Regular Appeals', 'Arbitration & Contract Breach'],
        experience: 30,
        education: 'M.A., LL.B, Madras Law College',
        rating: 5.0,
        reviews: 395,
        casesWon: 375,
        successRate: 98,
        fee: 160,
        bio: 'Distinguished senior jurist and former office bearer of Theni District Bar Association with three decades of unrivaled civil litigation excellence.'
      },
      {
        name: 'Advocate R. Malathi',
        bar: 'MS/3320/2018',
        specialization: 'Constitutional & Consumer Rights',
        practiceAreas: ['District Consumer Commission Disputes', 'Medical Negligence Claims', 'Insurance Claim Repudiation', 'RTI Appeals'],
        experience: 6,
        education: 'LL.M (Constitutional & Administrative Law), TNDALU Chennai',
        rating: 4.7,
        reviews: 68,
        casesWon: 62,
        successRate: 92,
        fee: 70,
        bio: 'Energetic consumer rights advocate holding deficient service providers and insurance firms accountable before Theni Consumer Forum.'
      },
      {
        name: 'Advocate G. Thavasi',
        bar: 'MS/1410/2006',
        specialization: 'Property Law & Land Partition',
        practiceAreas: ['Grama Natham Title Suits', 'Forest Boundary Settlements', 'Revenue Tahsildar Enquiries', 'Partition Decrees'],
        experience: 18,
        education: 'LL.B, Government Law College, Tirunelveli',
        rating: 4.8,
        reviews: 185,
        casesWon: 170,
        successRate: 92,
        fee: 105,
        bio: 'Specializes in rural land tenure, village site settlements (Grama Natham), and agricultural boundary demarcations across Andipatti and Theni taluks.'
      },
      {
        name: 'Advocate J. Francis Xavier',
        bar: 'MS/1860/2008',
        specialization: 'Commercial & Banking Litigation',
        practiceAreas: ['Spice Traders & Cardamom Auction Disputes', 'Commercial Contract Enforcement', 'SARFAESI Bank Notices', 'Partnership Firm Dissolutions'],
        experience: 16,
        education: 'LL.M (Commercial & Business Law), Pondicherry University',
        rating: 4.8,
        reviews: 135,
        casesWon: 122,
        successRate: 91,
        fee: 115,
        bio: 'Trusted legal counsel for agricultural trading enterprises, cardamom plantation syndicates, and commercial firms in Bodinayakanur and Theni.'
      },
      {
        name: 'Advocate D. Chidambaram',
        bar: 'MS/2380/2013',
        specialization: 'Criminal Law',
        practiceAreas: ['Magistrate Court Bail Petitions', 'Police Station Remand Defense', 'Assault & IPC Offenses', 'FIR Quashing Consultations'],
        experience: 11,
        education: 'B.A.B.L, Government Law College, Madurai',
        rating: 4.7,
        reviews: 128,
        casesWon: 116,
        successRate: 91,
        fee: 95,
        bio: 'Tenacious criminal trial practitioner known for swift response in pre-trial remands, bail arguments, and defense before Theni Judicial Magistrates.'
      },
      {
        name: 'Advocate M. Revathi',
        bar: 'MS/2980/2016',
        specialization: 'Cyber Crime & Financial Fraud',
        practiceAreas: ['UPI Payment Fraud Redressal', 'Social Media Harassment & Defamation', 'Identity Theft & OTP Scams', 'Digital Evidence Forensics'],
        experience: 8,
        education: 'B.Tech, LL.B (Cyber Laws Specialization)',
        rating: 4.8,
        reviews: 82,
        casesWon: 76,
        successRate: 94,
        fee: 100,
        bio: 'Specialized cyber law advocate with technical background collaborating with Theni Cyber Cell to trace defrauded funds and prosecute online scammers.'
      },
      {
        name: 'Advocate S. Palanichamy',
        bar: 'MS/1240/2004',
        specialization: 'Labour & Industrial Disputes',
        practiceAreas: ['Estate & Plantation Labour Rights', 'Minimum Wages Act Enforcement', 'Workmen Compensation Appeals', 'Trade Union Collective Bargaining'],
        experience: 20,
        education: 'LL.B, Government Law College, Madurai',
        rating: 4.9,
        reviews: 195,
        casesWon: 182,
        successRate: 93,
        fee: 95,
        bio: 'Stalwart advocate championing cardamom, tea, and rubber plantation labour rights across Cumbum Valley, Megamalai, and Uthamapalayam.'
      }
    ];

    const lawyerTestUser = await User.create({
      _id: SEED_USER_IDS.lawyerTest,
      name: 'Advocate S. Murugan (Lawyer)',
      email: 'lawyer@test.com',
      password: passwordHash,
      role: 'Lawyer',
      location: 'Theni, Tamil Nadu',
      district: 'Theni',
      state: 'Tamil Nadu',
      address: 'Advocate Chambers, Combined Court Complex, Theni, Tamil Nadu - 625531',
      phone: '9842102000',
      specialization: 'Property Law & Land Partition',
      experienceYears: 22,
      successRate: 96,
      availability: 'High',
      isVerified: true,
      profileCompleted: true
    });

    const lawyerTestProfile = await Lawyer.create({
      userId: lawyerTestUser._id,
      fullName: lawyerTestUser.name,
      barRegistrationNumber: 'MS/842/2002-TEST',
      specializations: ['Property Law & Land Partition', 'General Litigation'],
      practiceAreas: ['Land Partition Suits', 'Title Declaration', 'Revenue Matters', 'Boundary Disputes'],
      experience: 22,
      education: 'LL.B, Madurai Law College',
      languages: ['Tamil', 'English'],
      courts: ['District Court, Theni', 'Sub Court, Periyakulam'],
      courtLevel: 'District Court',
      location: 'Theni, Tamil Nadu',
      district: 'Theni',
      state: 'Tamil Nadu',
      consultationFee: 100,
      caseFilingFee: 200,
      courtRepresentationFee: 350,
      hourlyFee: 75,
      successRate: 96,
      totalCases: 265,
      completedCases: 215,
      activeCases: 4,
      rating: 4.9,
      reviewCount: 240,
      availabilityStatus: 'Available',
      verificationStatus: 'Verified',
      bio: 'Senior advocate with 22 years of dedicated practice in Theni Combined Court Complex specializing in agricultural land title disputes.'
    });

    const lawyerRecords = [lawyerTestProfile];
    for (let i = 0; i < lawyersList.length; i++) {
      const l = lawyersList[i];
      const userL = await User.create({
        name: l.name,
        email: i === 0 ? 'lawyer@sevenseas.com' : `lawyer${i + 1}@sevenseas.com`,
        password: passwordHash,
        role: 'Lawyer',
        location: 'Theni, Tamil Nadu',
        district: 'Theni',
        state: 'Tamil Nadu',
        address: 'Advocate Chambers, Combined Court Complex, Theni, Tamil Nadu - 625531',
        phone: `98421020${i < 10 ? '0' + i : i}`,
        specialization: l.specialization,
        experienceYears: l.experience,
        successRate: l.successRate,
        availability: 'High',
        isVerified: true,
        profileCompleted: true
      });

      const lawyerProfile = await Lawyer.create({
        userId: userL._id,
        fullName: userL.name,
        barRegistrationNumber: l.bar,
        specializations: [l.specialization, 'General Litigation'],
        practiceAreas: l.practiceAreas,
        experience: l.experience,
        education: l.education,
        languages: ['Tamil', 'English'],
        courts: ['District Court, Theni', 'Sub Court, Periyakulam'],
        courtLevel: 'District Court',
        location: 'Theni, Tamil Nadu',
        district: 'Theni',
        state: 'Tamil Nadu',
        consultationFee: l.fee,
        caseFilingFee: l.fee * 2,
        courtRepresentationFee: l.fee * 3.5,
        hourlyFee: Math.round(l.fee * 0.75),
        successRate: l.successRate,
        totalCases: l.reviews + 25,
        completedCases: l.casesWon,
        activeCases: (i % 4) + 2,
        rating: l.rating,
        reviewCount: l.reviews,
        availabilityStatus: 'Available',
        verificationStatus: 'Verified',
        bio: l.bio
      });

      lawyerRecords.push(lawyerProfile);
    }

    // 4. Create Courts, Courtrooms, and Judges
    console.log('🏛️ Seeding Theni District Courts & Judicial Infrastructure...');
    const courtData = [
      {
        name: 'District Court, Theni',
        location: 'Theni, Tamil Nadu',
        courtrooms: ['Courtroom 1 (Principal District Court)', 'Courtroom 2 (Fast Track Court)']
      },
      {
        name: 'Sub Court, Periyakulam',
        location: 'Periyakulam, Theni District, Tamil Nadu',
        courtrooms: ['Sub Court Hall A', 'Sub Court Hall B']
      },
      {
        name: 'Sub Court, Uthamapalayam',
        location: 'Uthamapalayam, Theni District, Tamil Nadu',
        courtrooms: ['Chamber 1', 'Chamber 2']
      },
      {
        name: 'Madras High Court (Madurai Bench)',
        location: 'Madurai, Tamil Nadu',
        courtrooms: ['Court Hall 3', 'Court Hall 7']
      },
      {
        name: 'Supreme Court of India',
        location: 'New Delhi, India',
        courtrooms: ['Chief Justice Court', 'Court No. 4']
      }
    ];

    const courts = [];
    for (const cd of courtData) {
      const c = await Court.create({
        name: cd.name,
        location: cd.location
      });
      courts.push(c);

      for (const crName of cd.courtrooms) {
        await Courtroom.create({
          courtId: c._id,
          name: crName,
          capacity: 60
        });
      }
    }

    // 5. Create 10 Legal Aid Applications all allocated to District Court, Theni
    console.log('📋 Seeding 10 legal aid applications for Theni District Court...');
    const appCases = [
      {
        title: 'Agricultural Land Partition & Boundary Dispute at Allinagaram',
        type: 'Property Law & Land Partition',
        desc: 'Suit for partition of 4.5 acres of ancestral coconut grove at Allinagaram village among legal co-heirs. Immediate injunction requested against unauthorized alienation.',
        urgency: 'High',
        status: 'CourtScheduled'
      },
      {
        title: 'Theni Cardamom Trading Society Commercial Settlement',
        type: 'Civil & Contract Law',
        desc: 'Application for recovery of arrears amounting to Rs. 4,80,000 for spice supplies provided to wholesale dealer with dishonored cheque.',
        urgency: 'Medium',
        status: 'Hearing'
      },
      {
        title: 'Indigent Bail Petiton in Road Dispute at Bodi Foot-hills',
        type: 'Criminal Law',
        desc: 'Seeking statutory and regular bail under Sec 437 CrPC in an alleged unlawful assembly case at Bodinayakanur foothills.',
        urgency: 'High',
        status: 'LawyerAssigned'
      },
      {
        title: 'Matrimonial Maintenance & Protection Application under DV Act',
        type: 'Family & Matrimonial Law',
        desc: 'Legal aid application under Section 12 of Protection of Women from Domestic Violence Act along with monthly subsistence allowance under Section 125 CrPC.',
        urgency: 'Medium',
        status: 'Under Review'
      },
      {
        title: 'Theni-Madurai National Highway Motor Accident Compensation Claim',
        type: 'Motor Accident Claims & Insurance',
        desc: 'MACT claim for serious grievance injuries sustained in commercial tanker collision near Theni bypass junction.',
        urgency: 'High',
        status: 'CourtScheduled'
      },
      {
        title: 'Revenue Patta Rectification Petition at Theni Combined Court',
        type: 'Revenue & Agricultural Land Law',
        desc: 'Petition against incorrect computerized revenue patta entry excluding survey no. 142/3 in Periyakulam taluk.',
        urgency: 'Medium',
        status: 'Completed'
      },
      {
        title: 'Consumer Redressal Against Defective Drip Irrigation Equipment',
        type: 'Constitutional & Consumer Rights',
        desc: 'Consumer complaint before Theni District Consumer Commission regarding failure of automated agricultural micro-irrigation system.',
        urgency: 'Low',
        status: 'Submitted'
      },
      {
        title: 'Plantation Workers Wage Disparity & Gratuity Claim',
        type: 'Labour & Industrial Disputes',
        desc: 'Industrial tribunal reference for recovery of long-pending wage differentials and retirement gratuity for 12 tea estate labourers.',
        urgency: 'Medium',
        status: 'LawyerAssigned'
      },
      {
        title: 'Agricultural Produce Cheque Dishonour Suit under Sec 138 NI Act',
        type: 'Negotiable Instruments & Cheque Bounce',
        desc: 'Prosecution under Section 138 of Negotiable Instruments Act for returned cheque value of Rs. 3,50,000 for banana harvests.',
        urgency: 'Medium',
        status: 'Hearing'
      },
      {
        title: 'Cyber Phishing Redressal for Theni Farmers Welfare Society',
        type: 'Cyber Crime & Financial Fraud',
        desc: 'Urgent intervention petition to freeze fraudulent unauthorized transfers of agricultural subsidy funds from rural co-op bank account.',
        urgency: 'High',
        status: 'Verification'
      }
    ];

    const opponentNames = [
      'K. Ramasamy & Sons Agro Traders',
      'Theni Commercial Transports Pvt Ltd',
      'V. Chelliah (Respondent 1)',
      'A. Natarajan & Family',
      'United India Insurance Co. Ltd',
      'Periyakulam Tahsildar (Revenue Dept)',
      'Kaveri Micro Drip Corp',
      'Megamalai Plantation Management Ltd',
      'Bodi Wholesale Spice Corporation',
      'Apex Digital Gateway Services'
    ];

    const seededApps = [];
    const sundaramurthyLawyer = lawyerRecords.find(l => l.fullName?.includes('Sundaramurthy')) || lawyerRecords[17];
    for (let i = 0; i < 10; i++) {
      const applicant = applicantUsers[i];
      // Explicitly assign Advocate A. Sundaramurthy to primary applicant user case!
      const lawyer = (i === 0 && sundaramurthyLawyer) ? sundaramurthyLawyer : lawyerRecords[i % lawyerRecords.length];
      const oppLawyer = lawyerRecords[(i + 5) % lawyerRecords.length];
      const oppName = opponentNames[i];
      const caseItem = appCases[i];

      const app = await Application.create({
        caseId: `CASE-THN-${2026}-${1000 + i}`,
        applicant: applicant._id,
        caseTitle: caseItem.title,
        caseType: caseItem.type,
        description: caseItem.desc,
        court: 'District Court, Theni',
        courtDetails: {
          state: 'Tamil Nadu',
          district: 'Theni',
          city: 'Theni',
          courtTier: 'District Court',
          courtName: 'District Court, Theni',
          registration: 'Combined Court Complex, Theni - 625531'
        },
        location: 'Theni, Tamil Nadu',
        urgency: caseItem.urgency,
        status: (i === 0) ? 'Active' : caseItem.status,
        assignedLawyer: lawyer.userId,
        chosenLawyer: lawyer.userId,
        representationStatus: (i === 0) ? 'Accepted' : 'None',
        assignedJudge: judgeUser1._id,
        judge: judgeUser1._id,
        judgeHistory: [
          {
            judge: judgeUser1._id,
            judgeName: judgeUser1.name,
            designation: 'Principal District Judge',
            assignedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            reason: 'Initial jurisdictional allocation for Theni District Court'
          }
        ],
        opposingLawyer: oppLawyer._id,
        opponentName: oppName,
        occupation: i % 2 === 0 ? 'Farmer / Agriculturalist' : 'Small Trader',
        monthlyIncome: 12000 + i * 3000,
        verificationStatus: 'Verified',
        timeline: [
          {
            status: 'Submitted',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            note: 'Initial legal aid request filed at Theni District Legal Services Authority.'
          },
          {
            status: 'Verification',
            date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            note: 'Income and land revenue certificates verified by Legal Aid Cell.'
          },
          {
            status: 'Under Review',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            note: 'Principal District Court Registry allocated case to Courtroom 1.'
          },
          {
            status: 'LawyerAssigned',
            date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            note: `Advocate ${lawyer.fullName} appointed from Theni District Bar panel.`
          }
        ]
      });

      // Seed Applicant Side Case Party
      await CaseParty.create({
        partyId: `PRT-THN-${1000 + (i * 2) + 1}`,
        caseId: app._id,
        userId: applicant._id,
        fullName: applicant.name,
        partyType: 'APPLICANT',
        side: 'YOUR_SIDE',
        phone: applicant.phone,
        email: applicant.email,
        address: applicant.address,
        lawyerId: lawyer._id,
        relationshipToCase: 'Primary Legal Aid Applicant'
      });

      // Seed Opposing Side Case Party
      await CaseParty.create({
        partyId: `PRT-THN-${1000 + (i * 2) + 2}`,
        caseId: app._id,
        fullName: oppName,
        partyType: 'OPPONENT',
        side: 'OPPOSING_SIDE',
        phone: '9842199999',
        email: 'respondent@theni-legal.org',
        address: 'Bypass Road, Theni, Tamil Nadu - 625531',
        lawyerId: oppLawyer._id,
        organization: i % 2 === 0 ? 'Commercial Trading Enterprise' : 'Individual Respondent',
        relationshipToCase: 'Opposing Defendant Entity'
      });

      seededApps.push(app);
    }

    // 6. Create Hearings
    console.log('📅 Seeding scheduled court hearings at Theni District Court...');
    const scheduledApp = seededApps.find((a) => a.status === 'CourtScheduled');
    if (scheduledApp) {
      const hearing = await Hearing.create({
        application: scheduledApp._id,
        hearingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        courtroom: 'Courtroom 1 (Principal District Court)',
        judge: judgeUser1._id,
        judgeName: 'Hon. Justice S. Shanmugam',
        notes: 'First argument and issues framing — both parties directed to appear with original revenue documents.'
      });
      scheduledApp.hearing = hearing._id;
      await scheduledApp.save();
    }

    // 7. Create Reviews
    console.log('⭐ Seeding advocate client reviews...');
    const completedApp = seededApps.find((a) => a.status === 'Completed');
    if (completedApp && completedApp.assignedLawyer) {
      const lawyerProfile = await Lawyer.findOne({ userId: completedApp.assignedLawyer });
      if (lawyerProfile) {
        await Review.create({
          applicantId: completedApp.applicant,
          lawyerId: lawyerProfile._id,
          caseId: completedApp._id,
          rating: 5,
          comment: 'Exceptional defense and land title rectification at Theni Combined Court Complex. Prompt and honest counsel.'
        });
        lawyerProfile.rating = 5.0;
        lawyerProfile.reviewCount += 1;
        await lawyerProfile.save();
      }
    }

    // 8. Create Cross-Role Conversations & Messages
    console.log('💬 Seeding interconnected conversations across all 4 roles...');
    
    // Conversation 1: Applicant <-> Lawyer on Case 0
    const primaryCase = seededApps[0];
    const convAppLawyer = await Conversation.create({
      participants: [applicantTestUser._id, lawyerTestUser._id],
      caseId: primaryCase._id,
      conversationType: 'Applicant-Lawyer',
      title: `Case: ${primaryCase.caseTitle}`,
      lastMessage: 'Please keep original land title deed and municipal tax receipts ready. The hearing is scheduled in Courtroom 1.',
      lastMessageSender: lawyerTestUser._id,
      lastMessageAt: new Date(Date.now() - 30 * 60 * 1000),
      unreadCounts: { [applicantTestUser._id.toString()]: 1 }
    });

    await Message.create([
      {
        conversation: convAppLawyer._id,
        sender: applicantTestUser._id,
        receiver: lawyerTestUser._id,
        application: primaryCase._id,
        text: 'Hello Advocate, I want to know the current status of my case.',
        createdAt: new Date(Date.now() - 3 * 3600 * 1000),
        read: true,
        readBy: [lawyerTestUser._id]
      },
      {
        conversation: convAppLawyer._id,
        sender: lawyerTestUser._id,
        receiver: applicantTestUser._id,
        application: primaryCase._id,
        text: 'Hello Muthulakshmi, I have reviewed your case docket. The boundary partition maps and patta revenue records are verified.',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
        read: true,
        readBy: [applicantTestUser._id]
      },
      {
        conversation: convAppLawyer._id,
        sender: applicantTestUser._id,
        receiver: lawyerTestUser._id,
        application: primaryCase._id,
        text: 'Thank you Advocate. What additional documents should I prepare for the upcoming hearing?',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
        read: true,
        readBy: [lawyerTestUser._id]
      },
      {
        conversation: convAppLawyer._id,
        sender: lawyerTestUser._id,
        receiver: applicantTestUser._id,
        application: primaryCase._id,
        text: 'Please keep original land title deed and municipal tax receipts ready. The hearing is scheduled in Courtroom 1.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      }
    ]);

    // Also link user@sevenseas.com and lawyer@sevenseas.com for dual compatibility
    const convSevenSeas = await Conversation.create({
      participants: [applicantUsers[1]._id, lawyerRecords[1].userId],
      caseId: seededApps[1]._id,
      conversationType: 'Applicant-Lawyer',
      title: `Case: ${seededApps[1].caseTitle}`,
      lastMessage: 'I have examined the cardamom trading contract agreement.',
      lastMessageSender: lawyerRecords[1].userId,
      lastMessageAt: new Date(),
      unreadCounts: { [applicantUsers[1]._id.toString()]: 1 }
    });

    await Message.create({
      conversation: convSevenSeas._id,
      sender: lawyerRecords[1].userId,
      receiver: applicantUsers[1]._id,
      application: seededApps[1]._id,
      text: 'I have examined the cardamom trading contract agreement. We will submit the commercial arbitration notice.',
      read: false
    });

    // Conversation 2: Admin <-> Applicant
    const convAdminApplicant = await Conversation.create({
      participants: [adminTestUser._id, applicantTestUser._id],
      caseId: primaryCase._id,
      conversationType: 'Admin-Applicant',
      title: 'Legal Aid Cell Administrative Desk',
      lastMessage: 'Thank you for the prompt assignment, Admin.',
      lastMessageSender: applicantTestUser._id,
      lastMessageAt: new Date(Date.now() - 4 * 3600 * 1000),
      unreadCounts: { [adminTestUser._id.toString()]: 0 }
    });

    await Message.create([
      {
        conversation: convAdminApplicant._id,
        sender: adminTestUser._id,
        receiver: applicantTestUser._id,
        application: primaryCase._id,
        text: 'Official Notice: Your application for legal aid has been verified and approved by Theni DLSA. Advocate S. Murugan has been appointed.',
        createdAt: new Date(Date.now() - 5 * 3600 * 1000),
        read: true,
        readBy: [applicantTestUser._id]
      },
      {
        conversation: convAdminApplicant._id,
        sender: applicantTestUser._id,
        receiver: adminTestUser._id,
        application: primaryCase._id,
        text: 'Thank you for the prompt assignment, Admin.',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000),
        read: true,
        readBy: [adminTestUser._id]
      }
    ]);

    // Conversation 3: Admin <-> Court Staff
    const convAdminStaff = await Conversation.create({
      participants: [adminTestUser._id, staffTestUser._id],
      conversationType: 'Admin-CourtStaff',
      title: 'Court Registry Administration',
      lastMessage: 'Administrative directive received. Courtroom 1 and Fast Track room schedules are verified and active.',
      lastMessageSender: staffTestUser._id,
      lastMessageAt: new Date(Date.now() - 2 * 3600 * 1000),
      unreadCounts: { [adminTestUser._id.toString()]: 0 }
    });

    await Message.create([
      {
        conversation: convAdminStaff._id,
        sender: adminTestUser._id,
        receiver: staffTestUser._id,
        text: 'Registrar Selvam, please verify hearing schedule and bench allocation for upcoming session trials.',
        createdAt: new Date(Date.now() - 3 * 3600 * 1000),
        read: true,
        readBy: [staffTestUser._id]
      },
      {
        conversation: convAdminStaff._id,
        sender: staffTestUser._id,
        receiver: adminTestUser._id,
        text: 'Administrative directive received. Courtroom 1 and Fast Track room schedules are verified and active.',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
        read: true,
        readBy: [adminTestUser._id]
      }
    ]);

    // Conversation 4: Court Staff <-> Lawyer
    const convStaffLawyer = await Conversation.create({
      participants: [staffTestUser._id, lawyerTestUser._id],
      caseId: primaryCase._id,
      conversationType: 'CourtStaff-Lawyer',
      title: `Docket Registry: ${primaryCase.caseId}`,
      lastMessage: 'Noted Registrar. Document bundles have been indexed and will be submitted before roll call.',
      lastMessageSender: lawyerTestUser._id,
      lastMessageAt: new Date(Date.now() - 1 * 3600 * 1000),
      unreadCounts: { [staffTestUser._id.toString()]: 0 }
    });

    await Message.create([
      {
        conversation: convStaffLawyer._id,
        sender: staffTestUser._id,
        receiver: lawyerTestUser._id,
        application: primaryCase._id,
        text: `Advocate Murugan, hearing for Partition Dispute ${primaryCase.caseId} is listed in Courtroom 1 at 10:00 AM. Please ensure case bundles are submitted.`,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
        read: true,
        readBy: [lawyerTestUser._id]
      },
      {
        conversation: convStaffLawyer._id,
        sender: lawyerTestUser._id,
        receiver: staffTestUser._id,
        application: primaryCase._id,
        text: 'Noted Registrar. Document bundles have been indexed and will be submitted before roll call.',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
        read: true,
        readBy: [staffTestUser._id]
      }
    ]);

    // 9. Create Notifications for All 4 Roles
    console.log('🔔 Seeding initial system notifications for all 4 roles...');
    
    // Lawyer Notifications
    await Notification.create([
      {
        user: lawyerTestUser._id,
        sender: adminTestUser._id,
        application: primaryCase._id,
        conversation: convAppLawyer._id,
        title: 'New Case Assigned',
        message: `Case Allocated: "${primaryCase.caseTitle}" (Case No: ${primaryCase.caseId}). Case Type: ${primaryCase.caseType}. Court: District Court, Theni. Applicant: M. Muthulakshmi. Action Required: Review case docket and schedule preliminary client consultation.`,
        category: 'CaseAssigned',
        read: false,
        metadata: {
          applicationId: primaryCase._id,
          caseId: primaryCase.caseId,
          caseTitle: primaryCase.caseTitle,
          court: 'District Court, Theni',
          applicantName: 'M. Muthulakshmi'
        }
      },
      {
        user: lawyerTestUser._id,
        sender: staffTestUser._id,
        application: primaryCase._id,
        title: 'Hearing Scheduled',
        message: `Court hearing scheduled for case "${primaryCase.caseTitle}" in Courtroom 1 at 10:00 AM on Friday.`,
        category: 'HearingScheduled',
        read: false,
        metadata: { applicationId: primaryCase._id }
      },
      {
        user: lawyerTestUser._id,
        sender: applicantTestUser._id,
        application: primaryCase._id,
        conversation: convAppLawyer._id,
        title: 'New Message from Applicant',
        message: 'Applicant Muthulakshmi: "What additional documents should I prepare for the upcoming hearing?"',
        category: 'Message',
        read: true
      }
    ]);

    // Applicant Notifications
    await Notification.create([
      {
        user: applicantTestUser._id,
        sender: adminTestUser._id,
        application: primaryCase._id,
        conversation: convAppLawyer._id,
        title: 'Advocate Assigned to Your Case',
        message: 'Advocate S. Murugan (Property Law & Land Partition) has been assigned to represent your case. You can now chat directly.',
        category: 'LawyerAssigned',
        read: false,
        metadata: { applicationId: primaryCase._id, lawyerName: 'Advocate S. Murugan' }
      },
      {
        user: applicantTestUser._id,
        sender: staffTestUser._id,
        application: primaryCase._id,
        title: 'Hearing Scheduled',
        message: `Your court hearing for case "${primaryCase.caseTitle}" has been scheduled in Courtroom 1 (Principal District Court) at 10:00 AM.`,
        category: 'HearingScheduled',
        read: false,
        metadata: { applicationId: primaryCase._id }
      },
      {
        user: applicantTestUser._id,
        sender: lawyerTestUser._id,
        application: primaryCase._id,
        conversation: convAppLawyer._id,
        title: 'New Message from Advocate',
        message: 'Advocate S. Murugan: "Please keep original land title deed and municipal tax receipts ready."',
        category: 'Message',
        read: false
      }
    ]);

    // Court Staff Notifications
    await Notification.create([
      {
        user: staffTestUser._id,
        sender: adminTestUser._id,
        conversation: convAdminStaff._id,
        title: 'New Administrative Directive',
        message: 'Registrar Selvam, please verify hearing schedule and bench allocation for upcoming session trials.',
        category: 'Message',
        read: false
      },
      {
        user: staffTestUser._id,
        sender: judgeUser1._id,
        application: primaryCase._id,
        title: 'Hearing Docket Listed',
        message: `Case ${primaryCase.caseId} listed in Courtroom 1 calendar for oral submissions.`,
        category: 'HearingUpdate',
        read: true
      }
    ]);

    // Admin Notifications
    await Notification.create([
      {
        user: adminTestUser._id,
        sender: staffTestUser._id,
        conversation: convAdminStaff._id,
        title: 'Registry Confirmation',
        message: 'Courtroom 1 and Fast Track room schedules verified by Registrar.',
        category: 'Message',
        read: false
      },
      {
        user: adminTestUser._id,
        message: 'System database successfully seeded with 4 interconnected roles, active conversations, and live case dockets.',
        category: 'System',
        read: true
      }
    ]);

    console.log('✅ Theni District Court Portal — Seed data populated successfully!');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log('TEST ACCOUNTS FOR ALL 4 ROLES (Password: Admin@1234):');
    console.log(`  1. Applicant   → applicant@test.com  (or user@sevenseas.com)`);
    console.log(`  2. Lawyer      → lawyer@test.com     (or lawyer@sevenseas.com)`);
    console.log(`  3. Court Staff → staff@test.com      (or staff@sevenseas.com)`);
    console.log(`  4. Admin       → admin@test.com      (or gokulrams.cs23@bitsathy.ac.in)`);
    console.log('─────────────────────────────────────────────────────────────────');

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
