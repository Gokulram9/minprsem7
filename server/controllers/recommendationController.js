const { recommendLawyers } = require('../services/aiService');

const getRecommendations = async (req, res, next) => {
  try {
    const payload = {
      caseType: req.query.caseType || 'General',
      court: req.query.court || 'District Court',
      location: req.query.location || 'Colombo',
      experience: Number(req.query.experience || 5),
      successRate: Number(req.query.successRate || 75),
      availability: req.query.availability || 'High',
      specialization: req.query.specialization || 'General',
      activeCases: Number(req.query.activeCases || 5),
    };
    const recommendations = await recommendLawyers(payload);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations };
