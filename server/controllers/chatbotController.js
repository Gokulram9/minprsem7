const axios = require('axios');
const Lawyer = require('../models/Lawyer');

const handleChatbotMessage = async (req, res, next) => {
  try {
    const { message, context = {} } = req.body;
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    let reply = "";
    let updatedContext = { ...context };
    let triggerRecommendation = false;
    let filters = {};

    try {
      // Direct call to Python chatbot parser
      const chatbotResp = await axios.post(`${aiUrl}/chatbot`, { message, context }, { timeout: 4000 });
      reply = chatbotResp.data.reply;
      updatedContext = chatbotResp.data.context;
      triggerRecommendation = chatbotResp.data.triggerRecommendation;
      filters = chatbotResp.data.filters || {};
    } catch (err) {
      console.warn('Flask chatbot service down, running Node.js fallback parser:', err.message);
      
      // Node.js fallback keyword parser
      const lower = message.lower ? message.lower() : message.toLowerCase();
      if (lower.includes('divorce') || lower.includes('custody') || lower.includes('marriage')) {
        updatedContext.caseType = 'Family Law';
      } else if (lower.includes('landlord') || lower.includes('deposit') || lower.includes('property')) {
        updatedContext.caseType = 'Property Law';
      } else if (lower.includes('terminate') || lower.includes('job') || lower.includes('employer')) {
        updatedContext.caseType = 'Labor & Employment Law';
      } else if (lower.includes('arrest') || lower.includes('bail') || lower.includes('police')) {
        updatedContext.caseType = 'Criminal Law';
      }
      
      for (const city of ['Chennai', 'Mumbai', 'Delhi', 'Colombo', 'Galle', 'Kandy']) {
        if (lower.includes(city.toLowerCase())) {
          updatedContext.location = city;
        }
      }

      if (!updatedContext.caseType) {
        reply = "I understand you need legal aid. Could you briefly describe your issue? (e.g. employment termination, land dispute, divorce, etc.)";
      } else if (!updatedContext.location) {
        reply = `I have noted a request for **${updatedContext.caseType}**. Which city or courtroom location are you in?`;
      } else {
        reply = `Searching for verified advocates specializing in **${updatedContext.caseType}** in **${updatedContext.location}**...`;
        triggerRecommendation = true;
        filters = { caseType: updatedContext.caseType, location: updatedContext.location };
      }
      
      reply += "\n\n*\*Seven Seas Legal Aid AI Concierge Fallback Mode active\**";
    }

    let lawyers = [];
    if (triggerRecommendation) {
      try {
        const dbLawyers = await Lawyer.find({ verificationStatus: 'Verified' });
        
        if (dbLawyers.length > 0) {
          const recResp = await axios.post(`${aiUrl}/recommend`, {
            lawyers: dbLawyers,
            caseType: filters.caseType || 'General',
            location: filters.location || '',
            language: req.user ? req.user.preferredLanguage || 'English' : 'English',
            description: message
          }, { timeout: 4000 });
          
          lawyers = recResp.data;
        }
      } catch (err) {
        console.warn('Flask matching engine down, running Node.js fallback recommendations:', err.message);
        
        // Return matching lawyers from database directly
        const matchedDb = await Lawyer.find({
          verificationStatus: 'Verified',
          specializations: { $in: [filters.caseType || 'General'] }
        }).limit(3);
        
        lawyers = matchedDb.map(l => ({
          lawyerId: l._id,
          fullName: l.fullName,
          specialization: filters.caseType,
          consultationFee: l.consultationFee,
          matchScore: 90,
          reasons: ["Verified advocate in database", "Fits requested specialization"],
          matchedSkills: l.practiceAreas || []
        }));
      }
    }

    res.json({
      success: true,
      reply,
      context: updatedContext,
      triggerRecommendation,
      lawyers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleChatbotMessage };
