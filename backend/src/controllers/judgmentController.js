const { searchJudgments } = require('../services/aiService');

const getJudgments = async (req, res, next) => {
  try {
    const payload = {
      query: req.query.query || '',
      year: req.query.year ? Number(req.query.year) : null,
      specialization: req.query.specialization || 'All',
      limit: Number(req.query.limit || 50)
    };
    const results = await searchJudgments(payload);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

module.exports = { getJudgments };
