const axios = require('axios');
const Lawyer = require('../models/Lawyer');
const Application = require('../models/Application');
const CaseParty = require('../models/CaseParty');

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
      // Direct call to Python chatbot parser
      const chatbotResp = await axios.post(`${aiUrl}/chatbot`, { message, context }, { timeout: 4000 });
      reply = chatbotResp.data.reply;
      updatedContext = chatbotResp.data.context;
      triggerRecommendation = chatbotResp.data.triggerRecommendation;
      filters = chatbotResp.data.filters || {};
      intent = chatbotResp.data.intent;
    } catch (err) {
      console.warn('Flask chatbot service down, running Node.js fallback parser:', err.message);
      
      // Node.js fallback keyword & intent parser
      const lower = message ? message.toLowerCase() : '';
      const snippet = message ? (message.length > 55 ? message.slice(0, 55) + '...' : message) : '';

      if (lower.includes('other side') || lower.includes('opposing lawyer') || lower.includes('opponent lawyer') || lower.includes('representing the other side')) {
        intent = 'OPPOSING_LAWYER_QUERY';
      } else if (lower.includes('who is the opponent') || lower.includes('opponent in my case') || lower.includes('opposing party')) {
        intent = 'OPPONENT_QUERY';
      } else if (lower.includes('who represents me') || lower.includes('my lawyer') || lower.includes('my counsel') || lower.includes('representing me')) {
        intent = 'MY_LAWYER_QUERY';
      } else if (lower.includes('divorce') || lower.includes('custody') || lower.includes('marriage')) {
        updatedContext.caseType = 'Family Law';
      } else if (lower.includes('landlord') || lower.includes('deposit') || lower.includes('property') || lower.includes('land')) {
        updatedContext.caseType = 'Property Law';
      } else if (lower.includes('terminate') || lower.includes('job') || lower.includes('employer') || lower.includes('wages')) {
        updatedContext.caseType = 'Labor & Employment Law';
      } else if (lower.includes('arrest') || lower.includes('bail') || lower.includes('police') || lower.includes('crime')) {
        updatedContext.caseType = 'Criminal Law';
      }
      
      for (const city of ['Chennai', 'Mumbai', 'Delhi', 'Colombo', 'Galle', 'Kandy']) {
        if (lower.includes(city.toLowerCase())) {
          updatedContext.location = city;
        }
      }

      if (!intent) {
        if (['hai', 'haii', 'hi', 'hello', 'hey', 'hy', 'sup', 'yo', 'howdy', 'hola', 'greetings', 'good morning', 'good afternoon', 'good evening', 'who are you', 'help'].some(k => lower.includes(k))) {
          reply = "Hello! 👋 How can I assist you today?\n\nI am **Lexora AI**, your virtual legal assistant. Here is what I can help you with:\n\n• ⚖️ **Match Advocates**: Describe your dispute (property, divorce, employment, criminal) to find top verified lawyers.\n• 💳 **Lawyer Fees & Escrow**: Check due retainers, pay securely in Rupees (₹), and download PDF receipts.\n• 📄 **Legal Aid Applications**: Step-by-step guidance on applying for state-subsidized legal assistance.\n• 📅 **Case Docket Tracking**: View upcoming court hearing dates, judge details & courtroom halls.\n\nWhat would you like to explore today?";
        } else if (['thanks', 'thank you', 'thx', 'ty', 'awesome', 'great', 'cool', 'good', 'ok', 'okay', 'bye'].some(k => lower.includes(k))) {
          reply = "You're very welcome! 😊 I am here 24/7 whenever you need help with legal aid, lawyer fee payments in Rupees (₹), or checking court case schedules. Have a wonderful day!";
        } else if (['fee', 'fees', 'pay', 'cost', 'charge', 'rupee', 'rupees', 'rs', '₹', 'escrow', 'payment', 'price'].some(k => lower.includes(k))) {
          reply = "Hello! All advocate retainers and court filing fees on our portal are processed in **Rupees (₹)** under secure judicial escrow protection.\n\n• **View & Pay Fees**: Select **Lawyer Fees** from your dashboard sidebar.\n• **Payment Methods**: Pay via Credit/Debit Card, UPI (GPay/PhonePe), or Net Banking.\n• **Receipts**: Download instant PDF receipts after payment.";
        } else if (['legal aid', 'apply', 'indigent', 'subsidy', 'free lawyer'].some(k => lower.includes(k))) {
          reply = "Hello! Applying for state-subsidized legal aid is simple:\n\n1. Go to **Applications** -> click **Apply for Legal Aid**.\n2. Fill out the 3-step wizard with your contact details and dispute category.\n3. Upload your National Identity Card or Income Certificate.";
        } else if (['hearing', 'track', 'status', 'next date', 'courtroom', 'docket'].some(k => lower.includes(k))) {
          reply = "Hello! You can track real-time court case details under the **My Cases** or **Case Tracker** tab in your sidebar.";
        } else if (!updatedContext.caseType) {
          reply = "Hello! I understand you have a legal query.\n\nCould you briefly describe your dispute (e.g. property boundary issue, divorce, workplace termination, or criminal allegation)? I can match you with an advocate or assist with fee payments in Rupees (₹).";
        } else if (!updatedContext.location) {
          reply = `Hello! I have noted your request for **${updatedContext.caseType}**. Which city or courtroom location (e.g. Colombo, Chennai, Delhi, Galle) are you in?`;
        } else {
          reply = `Hello! Searching for verified advocates specializing in **${updatedContext.caseType}** in **${updatedContext.location}**...`;
          triggerRecommendation = true;
          filters = { caseType: updatedContext.caseType, location: updatedContext.location };
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
            const oppSpec = oppProf && oppProf.specializations ? oppProf.specializations[0] : 'Criminal & Civil Law';
            reply = `The opposing party is represented by **${oppName}**, who specializes in **${oppSpec}**.`;
          } else {
            reply = "No opposing counsel has been registered on your active case docket yet.";
          }
        } else if (intent === 'OPPONENT_QUERY') {
          reply = `Your case currently lists **${userApp.opponentName || 'Opposing Party'}** as the opposing party.`;
        } else if (intent === 'MY_LAWYER_QUERY') {
          if (userApp.assignedLawyer) {
            reply = `Your assigned lawyer is **${userApp.assignedLawyer.name}**.`;
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
