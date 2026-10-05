const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validateEmail, validatePassword } = require('../utils/validators');
const { sendEmail } = require('../services/emailService');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, specialization, experienceYears } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      return next(new Error('Name, email, and password are required')); 
    }
    if (!validateEmail(email) || !validatePassword(password)) {
      res.status(400);
      return next(new Error('Invalid registration data')); 
    }

    // Force role check: only gokulrams.cs23@bitsathy.ac.in can register as Admin
    let assignedRole = role || 'User';
    if (assignedRole === 'Admin' && email.toLowerCase() !== 'gokulrams.cs23@bitsathy.ac.in') {
      res.status(403);
      return next(new Error('Unauthorized: Only gokulrams.cs23@bitsathy.ac.in can be Admin.'));
    }
    if (email.toLowerCase() === 'gokulrams.cs23@bitsathy.ac.in') {
      assignedRole = 'Admin';
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      return next(new Error('Email already in use')); 
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: assignedRole,
      phone,
      specialization,
      experienceYears: Number(experienceYears) || 0,
      profileCompleted: true
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401);
      return next(new Error('Invalid email or password')); 
    }
    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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

module.exports = { register, login, forgotPassword, resetPassword, getProfile, updateProfile };
