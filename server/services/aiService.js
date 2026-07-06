const axios = require('axios');

const fallbackRecommendations = [
  { name: 'Ava Deshmukh', matchScore: 96, experience: 12, successRate: 88, availability: 'High', reason: 'Strong family law experience and immediate availability' },
  { name: 'Niranjani Perera', matchScore: 92, experience: 14, successRate: 91, availability: 'High', reason: 'Property specialization and excellent court record' },
  { name: 'Dilan Fernando', matchScore: 84, experience: 9, successRate: 79, availability: 'Medium', reason: 'Criminal and employment expertise' },
];

const recommendLawyers = async (payload) => {
  const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/recommend';
  try {
    const response = await axios.post(aiUrl, payload, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.warn('AI recommendation service unavailable, returning fallback recommendations.', error.message);
    return fallbackRecommendations;
  }
};

const searchJudgments = async (payload) => {
  const aiUrl = process.env.AI_SERVICE_URL_JUDGMENTS || 'http://localhost:8000/search-judgments';
  try {
    const response = await axios.post(aiUrl, payload, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.warn('AI search judgments service unavailable, returning empty list.', error.message);
    return { judgments: [] };
  }
};

module.exports = { recommendLawyers, searchJudgments };
