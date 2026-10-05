const User = require('../models/User');
const Application = require('../models/Application');

const getDashboardSummary = async (_req, res, next) => {
  try {
    const users = await User.countDocuments();
    const applications = await Application.countDocuments();
    const pending = await Application.countDocuments({ status: 'Submitted' });
    res.json({ users, applications, pending });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary, getUsers };
