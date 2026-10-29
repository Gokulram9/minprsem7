const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { validateEmail, validatePassword } = require('../utils/validators');
const { sendEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      phone, 
      specialization, 
      experienceYears,
      district,
      state,
      address,
      location,
      barRegistrationNumber,
      courtLevel
    } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      return next(new Error('Name, email, and password are required')); 
    }
    if (!validateEmail(email) || !validatePassword(password)) {
      res.status(400);
      return next(new Error('Invalid registration data: Password must be at least 8 characters with letters, numbers, and symbols')); 
    }

    // Force role check: only recognized admin emails can register as Admin
    let assignedRole = role || 'Applicant';
    const allowedAdminEmails = ['gokulrams.cs23@bitsathy.ac.in', 'admin@test.com', 'admin@sevenseas.com'];
    if (assignedRole === 'Admin' && !allowedAdminEmails.includes(email.toLowerCase())) {
      res.status(403);
      return next(new Error('Unauthorized: Admin registration restricted to designated administrative email accounts.'));
    }
    if (allowedAdminEmails.includes(email.toLowerCase())) {
      assignedRole = 'Admin';
    } else if (assignedRole === 'Judge' || assignedRole === 'CourtStaff') {
      res.status(403);
      return next(new Error('Unauthorized: Judge and Court Staff accounts must be provisioned securely by the Administrator.'));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      return next(new Error('Email already in use')); 
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    const isLawyerRole = assignedRole === 'Lawyer';
    
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: assignedRole,
      phone: phone || '',
      district: district || '',
      state: state || '',
      address: address || '',
      location: location || district || '',
      specialization,
      experienceYears: Number(experienceYears) || 0,
      profileCompleted: true,
      isVerified: assignedRole === 'Admin' || assignedRole === 'Applicant' || assignedRole === 'User',
      emailVerificationToken
    });

    // If registering as a Lawyer, provision associated Lawyer profile (pending admin verification)
    if (isLawyerRole) {
      try {
        const barNumber = barRegistrationNumber || `BAR-${state ? state.slice(0, 2).toUpperCase() : 'IN'}-${Date.now().toString().slice(-6)}`;
        await Lawyer.create({
          userId: user._id,
          fullName: user.name,
          barRegistrationNumber: barNumber,
          specializations: specialization ? [specialization] : ['General Practice'],
          experience: Number(experienceYears) || 3,
          location: location || district || 'Local District',
          district: district || '',
          state: state || '',
          courtLevel: courtLevel || 'District Court',
          courts: [`${district || 'District'} Court`],
          verificationStatus: 'Pending',
          rating: 4.8,
          totalCases: 0,
          successRate: 85
        });
      } catch (lawyerErr) {
        console.warn('Could not auto-create Lawyer document:', lawyerErr.message);
      }
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken,
      user: { 
        id: user._id, 
        _id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role,
        district: user.district,
        state: user.state,
        phone: user.phone,
        address: user.address,
        location: user.location,
        isVerified: user.isVerified
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const query = (email || '').trim();

    if (!query) {
      res.status(400);
      return next(new Error('Email address or Advocate name is required'));
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Find user by email (case-insensitive) OR by Name (e.g. "Advocate A. Sundaramurthy")
    let user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${escapedQuery}$`, 'i') } },
        { name: { $regex: new RegExp(`^${escapedQuery}$`, 'i') } },
        { name: { $regex: new RegExp(`Advocate\\s+${escapedQuery.replace(/^Advocate\s+/i, '')}$`, 'i') } }
      ]
    });

    // If still not found and query contains a partial name or alias email
    if (!user) {
      const cleanWord = query.replace(/^Advocate\s+/i, '').replace(/@.*$/, '').trim();
      if (cleanWord.length >= 3) {
        user = await User.findOne({
          role: 'Lawyer',
          name: { $regex: new RegExp(cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
        });
      }
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401);
      return next(new Error('Invalid email, advocate name, or password')); 
    }
    
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: { 
        id: user._id, 
        _id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role,
        district: user.district,
        state: user.state,
        phone: user.phone,
        address: user.address,
        location: user.location,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      return next(new Error('User with this email not found')); 
    }
    const resetToken = crypto.randomBytes(24).toString('hex');
    user.emailVerificationToken = resetToken;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5175'}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Court Portal — Password Reset Request',
      text: `Reset your portal password by clicking: ${resetUrl}`,
      html: `<p>Hello ${user.name},</p><p>You requested a password reset for your legal aid portal account.</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>If you did not request this, please ignore this email.</p>`
    });

    res.json({ success: true, message: 'Password reset instructions have been dispatched.' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token) {
      res.status(400);
      return next(new Error('Reset token is required'));
    }
    if (!validatePassword(password)) {
      res.status(400);
      return next(new Error('Password must be at least 8 characters with letters, numbers, and symbols')); 
    }
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      res.status(400);
      return next(new Error('Reset token is invalid or has expired')); 
    }
    user.password = await bcrypt.hash(password, 10);
    user.emailVerificationToken = '';
    await user.save();
    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400);
      return next(new Error('Current password and new password are required'));
    }
    if (newPassword.length < 8) {
      res.status(400);
      return next(new Error('New password must be at least 8 characters long'));
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400);
      return next(new Error('Current password is incorrect'));
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      location,
      district,
      state,
      address,
      specialization,
      experienceYears,
      bio,
      profileImage
    } = req.body;

    const allowedUpdates = {};
    if (name !== undefined) allowedUpdates.name = name;
    if (phone !== undefined) allowedUpdates.phone = phone;
    if (location !== undefined) allowedUpdates.location = location;
    if (district !== undefined) allowedUpdates.district = district;
    if (state !== undefined) allowedUpdates.state = state;
    if (address !== undefined) allowedUpdates.address = address;
    if (specialization !== undefined) allowedUpdates.specialization = specialization;
    if (experienceYears !== undefined) allowedUpdates.experienceYears = Number(experienceYears) || 0;
    if (bio !== undefined) allowedUpdates.bio = bio;
    if (profileImage !== undefined) allowedUpdates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.user._id, allowedUpdates, { new: true, runValidators: true }).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      res.status(400);
      return next(new Error('Invalid or expired email verification token'));
    }
    user.isVerified = true;
    user.emailVerificationToken = '';
    await user.save();
    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.refreshToken = '';
      await req.user.save();
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401);
      return next(new Error('Refresh token is required'));
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshsecret');
    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) {
      res.status(401);
      return next(new Error('Invalid refresh token'));
    }
    const accessToken = generateToken(user._id);
    res.json({ success: true, token: accessToken });
  } catch (error) {
    res.status(401);
    next(new Error('Token verification failed'));
  }
};

module.exports = { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  changePassword, 
  getProfile, 
  updateProfile, 
  verifyEmail, 
  logout, 
  refresh 
};
