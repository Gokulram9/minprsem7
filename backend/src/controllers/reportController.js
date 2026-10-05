const Application = require('../models/Application');

const getAnalytics = async (_req, res, next) => {
  try {
    const totalApplications = await Application.countDocuments();
    const statusCounts = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({ totalApplications, statusCounts });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
