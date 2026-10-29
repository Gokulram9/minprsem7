const axios = require('axios');
const Lawyer = require('../models/Lawyer');
const Application = require('../models/Application');
const CaseParty = require('../models/CaseParty');
const { recommendLawyers } = require('../services/aiService');

const handleChatbotMessage = async (req, res, next) => {
  try {
    const { message, context = {} } = req.body;
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    let reply = "";
    let updatedContext = { ...context };
    let triggerRecommendation = false;
    let filters = {};
    let intent = null;

    try {
      // Call Python chatbot NLP parser
      const chatbotResp = await axios.post(`${aiUrl}/chatbot`, { message, context }, { timeout: 4000 });
      reply = chatbotResp.data.reply;
      updatedContext = chatbotResp.data.context || {};
      triggerRecommendation = chatbotResp.data.triggerRecommendation || false;
      filters = chatbotResp.data.filters || {};
      intent = chatbotResp.data.intent || null;

      if (updatedContext.caseType === 'Family & Matrimonial Law') {
        updatedContext.caseType = 'Family Law';
      }
      if (updatedContext.location && updatedContext.location.includes(',')) {
        updatedContext.location = updatedContext.location.split(',')[0].trim();
      }
    } catch (err) {
      console.warn('Python chatbot service unavailable, executing Node.js legal intent parser:', err.message);
      
      const lower = message ? message.toLowerCase() : '';

      if (lower.includes('other side') || lower.includes('opposing lawyer') || lower.includes('opponent lawyer')) {
        intent = 'OPPOSING_LAWYER_QUERY';
      } else if (lower.includes('who is the opponent') || lower.includes('opponent in my case')) {
        intent = 'OPPONENT_QUERY';
      } else if (lower.includes('who represents me') || lower.includes('my lawyer') || lower.includes('my counsel')) {
        intent = 'MY_LAWYER_QUERY';
      } else if (lower.includes('property') || lower.includes('land') || lower.includes('partition') || lower.includes('boundary') || lower.includes('patta')) {
        updatedContext.caseType = 'Property Law & Land Partition';
      } else if (lower.includes('arrest') || lower.includes('bail') || lower.includes('police') || lower.includes('crime') || lower.includes('fir')) {
        updatedContext.caseType = 'Criminal Law';
      } else if (lower.includes('divorce') || lower.includes('custody') || lower.includes('marriage') || lower.includes('maintenance')) {
        updatedContext.caseType = 'Family Law';
      } else if (lower.includes('contract') || lower.includes('agreement') || lower.includes('money suit') || lower.includes('recovery')) {
        updatedContext.caseType = 'Civil & Contract Law';
      } else if (lower.includes('cheque') || lower.includes('check') || lower.includes('138') || lower.includes('dishonor')) {
        updatedContext.caseType = 'Negotiable Instruments & Cheque Bounce';
      } else if (lower.includes('accident') || lower.includes('mact') || lower.includes('insurance')) {
        updatedContext.caseType = 'Motor Accident Claims & Insurance';
      } else if (lower.includes('consumer') || lower.includes('defective') || lower.includes('negligence')) {
        updatedContext.caseType = 'Constitutional & Consumer Rights';
      } else if (lower.includes('cyber') || lower.includes('fraud') || lower.includes('upi') || lower.includes('online scam')) {
        updatedContext.caseType = 'Cyber Crime & Financial Fraud';
      }
      
      for (const city of ['Theni', 'Madurai', 'Dindigul', 'Chennai', 'Coimbatore', 'Tamil Nadu']) {
        if (lower.includes(city.toLowerCase())) {
          updatedContext.district = city === 'Tamil Nadu' ? 'Theni' : city;
          updatedContext.state = 'Tamil Nadu';
          updatedContext.location = updatedContext.district;
        }
      }

      if (!intent) {
        if (['hai', 'haii', 'hi', 'hello', 'hey', 'hy', 'sup', 'yo', 'greetings', 'help'].some(k => lower.includes(k))) {
          reply = "Hello! 👋 I am **Lexora AI**, your virtual legal assistant.\n\nI can help you with:\n• ⚖️ **Match Advocates**: Describe your dispute in Theni District to find verified lawyers.\n• 🏛️ **Court Venue & Dockets**: Locate your assigned courtroom in Theni Combined Court Complex.\n• 💳 **Fees & Legal Aid**: Check subsidized legal aid eligibility and manage retainers in Rupees (₹).\n\nHow can I assist you with your case today?";
        } else if (['thanks', 'thank you', 'thx', 'ty', 'great', 'cool', 'awesome', 'bye'].some(k => lower.includes(k))) {
          reply = "You're very welcome! 😊 I am here 24/7 whenever you need help matching advocates or checking case proceedings. Wishing you the best with your legal matter!";
        } else if (['fee', 'fees', 'pay', 'cost', 'charge', 'rupee', 'rupees', 'rs', '₹', 'escrow', 'price'].some(k => lower.includes(k))) {
          reply = "All advocate retainers and court filing fees are displayed transparently in **Rupees (₹)** under judicial escrow safeguards. You can review and settle fees under **Lawyer Fees** in your dashboard.";
        } else if (['legal aid', 'apply', 'indigent', 'subsidy', 'free lawyer'].some(k => lower.includes(k))) {
          reply = "Applying for state-subsidized legal aid in Theni District is simple:\n\n1. Go to **Applications** -> click **Apply for Legal Aid**.\n2. Complete the form and upload income proof or Aadhaar card.\n3. The District Legal Services Authority will process and assign an advocate.";
        } else if (['hearing', 'track', 'status', 'next date', 'courtroom', 'docket'].some(k => lower.includes(k))) {
          reply = "You can track upcoming court hearing dates, assigned judges, and advocate litigation notes under the **My Cases** or **Case Tracker** tab in your sidebar.";
        } else if (updatedContext.caseType && (updatedContext.district || updatedContext.location)) {
          reply = `I have analyzed your dispute regarding **${updatedContext.caseType}** in **${updatedContext.location || 'Theni, Tamil Nadu'}**.\n\nScanning verified advocates with active practice standing before the District Court...`;
          triggerRecommendation = true;
          filters = { caseType: updatedContext.caseType, location: updatedContext.location || 'Theni, Tamil Nadu', district: updatedContext.district || 'Theni' };
        } else if (updatedContext.caseType) {
          reply = `I see your matter involves **${updatedContext.caseType}**.\n\nWhich district or court jurisdiction (e.g. **Theni, Tamil Nadu**) requires representation?`;
        } else {
          reply = "I understand you have a legal dispute. Please briefly describe your issue (e.g., *'I have a property partition dispute in Theni, Tamil Nadu and need an experienced lawyer'*), and I will recommend verified advocates from the Theni District Bar panel.";
        }
      }
    }

    // Process representation intent queries if logged in
    if (intent && req.user) {
      const userApp = await Application.findOne({ applicant: req.user._id })
        .populate('assignedLawyer', 'name email specialization')
        .populate('opposingLawyer');

      if (userApp) {
        if (intent === 'OPPOSING_LAWYER_QUERY') {
          if (userApp.opposingLawyer) {
            const oppProf = await Lawyer.findById(userApp.opposingLawyer) || await Lawyer.findOne({ userId: userApp.opposingLawyer });
            const oppName = oppProf ? oppProf.fullName : 'Advocate';
            const oppSpec = oppProf && oppProf.specializations ? oppProf.specializations[0] : 'Civil & Criminal Law';
            reply = `The opposing party is represented by **${oppName}**, specializing in **${oppSpec}**.`;
          } else {
            reply = "No opposing counsel has been registered on your active case docket yet.";
          }
        } else if (intent === 'OPPONENT_QUERY') {
          reply = `Your case currently lists **${userApp.opponentName || 'Opposing Party'}** as the opposing party.`;
        } else if (intent === 'MY_LAWYER_QUERY') {
          if (userApp.assignedLawyer) {
            reply = `Your assigned advocate is **${userApp.assignedLawyer.name}**.`;
          } else {
            reply = "You currently do not have an advocate assigned. Your legal aid application is pending allocation.";
          }
        }
      } else {
        reply = "You currently do not have any active case dockets registered to query representation details.";
      }
    }

    let lawyers = [];
    if (triggerRecommendation) {
      try {
        const dbLawyers = await Lawyer.find({ verificationStatus: { $ne: 'Suspended' } })
          .populate('userId', 'name email phone location district state profileImage');

        if (dbLawyers.length > 0) {
          const recPayload = {
            caseType: filters.caseType || updatedContext.caseType || 'Property Law & Land Partition',
            district: filters.district || updatedContext.district || 'Theni',
            state: filters.state || updatedContext.state || 'Tamil Nadu',
            location: filters.location || updatedContext.location || 'Theni, Tamil Nadu',
            courtLevel: filters.courtLevel || 'District Court',
            language: req.user?.preferredLanguage || 'Tamil',
            description: message
          };

          const rankedLawyers = await recommendLawyers(recPayload, dbLawyers);
          lawyers = rankedLawyers.slice(0, 4);
        }
      } catch (err) {
        console.warn('Error fetching chatbot lawyer recommendations:', err.message);
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
