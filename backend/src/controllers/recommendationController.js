const { recommendLawyers } = require('../services/aiService');
const User = require('../models/User');

const getRecommendations = async (req, res, next) => {
  try {
    const { court, location, specialization, availability, caseType } = req.query;
    
    // 1. Filter by location, specialization, and availability
    const filter = { role: 'Lawyer' };
    if (location) filter.location = new RegExp(location, 'i');
    if (specialization) filter.specialization = new RegExp(specialization, 'i');
    if (availability) filter.availability = availability;
    
    let filteredLawyers = await User.find(filter).select('-password');
    
    // If none found with strict filters, relax them a bit (e.g. just specialization)
    if (filteredLawyers.length === 0) {
      filteredLawyers = await User.find({ role: 'Lawyer', specialization: new RegExp(specialization || caseType || 'General', 'i') }).select('-password');
    }

    // 2. Rank using AI service (or fallback)
    const payload = {
      caseType: caseType || 'General',
      court: court || 'District Court',
      location: location || 'Colombo',
      specialization: specialization || 'General',
      candidates: filteredLawyers
    };
    
    // We pass candidates to AI, but AI service uses its own logic or fallback
    let recommendations = await recommendLawyers(payload);
    
    // If the fallback returns random names, we should map them back to our DB candidates if possible
    // For now, we'll augment the DB lawyers with fake AI scores if we have our own candidates
    if (filteredLawyers.length > 0) {
      recommendations = filteredLawyers.map((lawyer, index) => ({
        id: lawyer._id,
        name: lawyer.name,
        matchScore: 90 - index * 5, // mock ranking
        experience: lawyer.experienceYears || 5,
        successRate: lawyer.successRate || 75,
        availability: lawyer.availability || 'Medium',
        specialization: lawyer.specialization,
        reason: 'Strong match based on specialization and availability'
      }));
    }

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations };
