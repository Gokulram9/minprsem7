const User = require('../models/User');
const Application = require('../models/Application');
const Lawyer = require('../models/Lawyer');
const Judge = require('../models/Judge');
const Hearing = require('../models/Hearing');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

const getDashboardSummary = async (_req, res, next) => {
  try {
    const [
      usersCount,
      applicationsCount,
      pendingCount,
      activeCasesCount,
      lawyersCount,
      pendingLawyersCount,
      judgesCount,
      hearingsTodayCount
    ] = await Promise.all([
      User.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: { $in: ['Submitted', 'Application Submitted', 'Under Review', 'Verification'] } }),
      Application.countDocuments({ status: { $in: ['Active', 'Case In Progress', 'Hearing Scheduled', 'CourtScheduled', 'Hearing'] } }),
      Lawyer.countDocuments({ verificationStatus: 'Verified' }),
      Lawyer.countDocuments({ verificationStatus: 'Pending' }),
      Judge.countDocuments(),
      Hearing.countDocuments({
        hearingDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    res.json({
      success: true,
      users: usersCount,
      applications: applicationsCount,
      pending: pendingCount,
      activeCases: activeCasesCount,
      verifiedLawyers: lawyersCount,
      pendingLawyers: pendingLawyersCount,
      totalJudges: judgesCount,
      hearingsToday: hearingsTodayCount
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'User', 
      phone, 
      district, 
      state, 
      address, 
      specialization,
      experienceYears,
      barRegistrationNumber,
      courtName,
      designation,
      courtroom
    } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      return next(new Error('Name, email, and password are required'));
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      return next(new Error('User with this email already exists'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || '',
      district: district || 'Theni',
      state: state || 'Tamil Nadu',
      address: address || '',
      location: `${district || 'Theni'}, ${state || 'Tamil Nadu'}`,
      specialization: specialization || '',
      experienceYears: Number(experienceYears) || 0,
      isVerified: true,
      profileCompleted: true
    });

    if (role === 'Lawyer') {
      const barNum = barRegistrationNumber || `BAR-${Date.now().toString().slice(-6)}`;
      await Lawyer.create({
        userId: user._id,
        fullName: user.name,
        barRegistrationNumber: barNum,
        specializations: specialization ? [specialization] : ['General Practice'],
        experience: Number(experienceYears) || 5,
        location: user.location,
        district: user.district,
        state: user.state,
        verificationStatus: 'Verified',
        rating: 4.9,
        successRate: 90
      });
    } else if (role === 'Judge') {
      await Judge.create({
        userId: user._id,
        name: user.name,
        courtName: courtName || 'District Court, Theni',
        courtroom: courtroom || 'Courtroom 1',
        designation: designation || 'District Judge',
        registrationNumber: `JDG-${Date.now().toString().slice(-6)}`,
        specialization: specialization || 'Civil & Criminal Jurisdiction',
        jurisdiction: `${district || 'Theni'} Judicial District`,
        contactEmail: user.email,
        phone: user.phone
      });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'ADMIN_CREATE_USER',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip
    });

    const safeUser = user.toObject();
    delete safeUser.password;
    res.status(201).json({ success: true, user: safeUser });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    } else if (status) {
      user.isActive = status === 'Active';
    } else {
      user.isActive = !user.isActive;
    }

    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'ADMIN_UPDATE_USER_STATUS',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        status: user.isActive ? 'Active' : 'Suspended'
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (user.role === 'Admin' && user._id.toString() === req.user._id.toString()) {
      res.status(400);
      return next(new Error('Administrators cannot delete their own active account'));
    }

    await User.findByIdAndDelete(id);
    await Lawyer.deleteMany({ userId: id });
    await Judge.deleteMany({ userId: id });

    await AuditLog.create({
      userId: req.user._id,
      action: 'ADMIN_DELETE_USER',
      resource: 'User',
      resourceId: id,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getAllLawyers = async (_req, res, next) => {
  try {
    const lawyers = await Lawyer.find().populate('userId', 'name email phone location district state isVerified isActive').sort({ createdAt: -1 });
    res.json({ success: true, data: lawyers });
  } catch (error) {
    next(error);
  }
};

const verifyLawyer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status = 'Verified' } = req.body;

    // Search by Lawyer _id or Lawyer.userId or User _id
    let lawyer = await Lawyer.findById(id);
    if (!lawyer) {
      lawyer = await Lawyer.findOne({ userId: id });
    }
    if (!lawyer) {
      res.status(404);
      return next(new Error('Lawyer record not found'));
    }

    lawyer.verificationStatus = status;
    await lawyer.save();

    if (lawyer.userId) {
      await User.findByIdAndUpdate(lawyer.userId, {
        isVerified: status === 'Verified'
      });

      await Notification.create({
        user: lawyer.userId,
        title: status === 'Verified' ? 'Bar Council Credentials Verified' : 'Bar Verification Update',
        message: status === 'Verified'
          ? 'Your legal aid advocate licensure has been verified and approved by the Court Administrator. You are now authorized to accept and represent cases.'
          : `Your advocate verification request has been updated to: ${status}. Please contact the registrar for clarifications.`,
        category: 'Update'
      });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: `ADMIN_VERIFY_LAWYER_${status.toUpperCase()}`,
      resource: 'Lawyer',
      resourceId: lawyer._id.toString(),
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: `Lawyer ${lawyer.fullName} verification status set to ${status}.`,
      data: lawyer
    });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (_req, res, next) => {
  try {
    const logs = await AuditLog.find().populate('userId', 'name email role').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getUsers,
  createUser,
  updateUserStatus,
  deleteUser,
  getAllLawyers,
  verifyLawyer,
  getAuditLogs
};
