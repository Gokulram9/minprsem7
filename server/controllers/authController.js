const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { validateEmail, validatePassword } = require('../utils/validators');
const { sendEmail } = require('../services/emailService');

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
      return next(new Error('Invalid registration data')); 
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
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      return next(new Error('Email already in use')); 
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    
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
      emailVerificationToken
    });

    // If registering as a Lawyer, provision associated Lawyer profile
    if (assignedRole === 'Lawyer') {
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
          verificationStatus: 'Verified',
          rating: 4.8,
          totalCases: 12,
          successRate: 90
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
        location: user.location
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
        location: user.location
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
      return next(new Error('User not found')); 
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5175'}/reset-password?token=${resetToken}`;

    // In a real application, store the token and expiry in the database.
    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      text: `Reset your password by visiting: ${resetUrl}`,
    });

    res.json({ message: 'Password reset instructions have been sent to email.' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!validatePassword(password)) {
      res.status(400);
      return next(new Error('Password must be at least 8 characters')); 
    }
    // Password reset token validation is mocked for this starter app.
    const user = await User.findOne({});
    if (!user) {
      res.status(404);
      return next(new Error('Reset token invalid or expired')); 
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const jwt = require('jsonwebtoken');

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

module.exports = { register, login, forgotPassword, resetPassword, getProfile, updateProfile, verifyEmail, logout, refresh };
