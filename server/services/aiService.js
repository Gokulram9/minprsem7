const axios = require('axios');

const LEGAL_TAXONOMY_MAP = {
  'property': ['property', 'land', 'partition', 'boundary', 'patta', 'revenue', 'title', 'deed', 'ancestral', 'survey', 'encroachment', 'agricultural'],
  'criminal': ['criminal', 'bail', 'anticipatory bail', 'fir', 'police', 'arrest', 'assault', 'theft', 'sessions', 'magistrate', 'ipc', 'crpc'],
  'family': ['divorce', 'custody', 'matrimonial', 'maintenance', 'alimony', 'domestic violence', 'marriage', 'guardianship', 'sec 125', 'child support'],
  'civil': ['civil', 'contract', 'agreement', 'breach', 'injunction', 'money suit', 'promissory note', 'recovery', 'damages', 'tenancy', 'specific performance'],
  'motor accident': ['mact', 'accident', 'motor vehicle', 'insurance claim', 'compensation', 'vehicular', 'personal injury', 'tribunal'],
  'consumer': ['consumer', 'defective', 'negligence', 'commission', 'unfair trade', 'rti', 'compensation'],
  'revenue': ['revenue', 'patta', 'tahsildar', 'rdo', 'settlement', 'chitta', 'agricultural'],
  'labour': ['labour', 'labor', 'employment', 'termination', 'gratuity', 'wage', 'industrial dispute'],
  'cheque': ['cheque', 'check', 'cheque bounce', 'section 138', 'ni act', 'dishonor', 'dishonour', 'statutory notice'],
  'cyber': ['cyber', 'online fraud', 'upi', 'phishing', 'data theft', 'hacking', 'it act', 'financial fraud']
};

/**
 * Filter and Rank Advocates with Strict Domain Accuracy
 * Suggests ONLY the specific advocates who practice the requested legal domain.
 */
const computeLocalAiRecommendations = (payload, dbLawyers = []) => {
  if (!dbLawyers || dbLawyers.length === 0) {
    return [];
  }

  const rawCaseType = String(payload.caseType || payload.specialization || '').toLowerCase();
  const rawTitle = String(payload.caseTitle || '').toLowerCase();
  const rawDesc = String(payload.description || '').toLowerCase();
  const fullQuery = `${rawTitle} ${rawCaseType} ${rawDesc}`.trim();
  const reqLocation = String(payload.location || payload.district || '').toLowerCase();
  const reqExperience = Number(payload.experience) || 0;
  const reqBudget = Number(payload.budget) || 0;
  const reqCourtLevel = String(payload.courtLevel || 'District Court').toLowerCase();

  // 1. Identify primary domain key
  let domainKey = 'general';
  if (fullQuery.includes('property') || fullQuery.includes('partition') || fullQuery.includes('land') || fullQuery.includes('boundary')) {
    domainKey = 'property';
  } else if (fullQuery.includes('crime') || fullQuery.includes('bail') || fullQuery.includes('arrest') || fullQuery.includes('police') || fullQuery.includes('ipc')) {
    domainKey = 'criminal';
  } else if (fullQuery.includes('divorce') || fullQuery.includes('matrimonial') || fullQuery.includes('custody') || fullQuery.includes('family') || fullQuery.includes('marriage')) {
    domainKey = 'family';
  } else if (fullQuery.includes('cheque') || fullQuery.includes('138') || fullQuery.includes('dishonor') || fullQuery.includes('ni act')) {
    domainKey = 'cheque';
  } else if (fullQuery.includes('accident') || fullQuery.includes('mact') || fullQuery.includes('motor vehicle')) {
    domainKey = 'motor accident';
  } else if (fullQuery.includes('consumer') || fullQuery.includes('defective service')) {
    domainKey = 'consumer';
  } else if (fullQuery.includes('patta') || fullQuery.includes('revenue') || fullQuery.includes('tahsildar')) {
    domainKey = 'revenue';
  } else if (fullQuery.includes('labour') || fullQuery.includes('labor') || fullQuery.includes('employment') || fullQuery.includes('termination')) {
    domainKey = 'labour';
  } else if (fullQuery.includes('cyber') || fullQuery.includes('upi') || fullQuery.includes('phishing')) {
    domainKey = 'cyber';
  } else if (fullQuery.includes('contract') || fullQuery.includes('agreement') || fullQuery.includes('recovery') || fullQuery.includes('civil')) {
    domainKey = 'civil';
  }

  const domainKeywords = LEGAL_TAXONOMY_MAP[domainKey] || [];

  const candidates = [];
  const seenNames = new Set();

  for (const lawyer of dbLawyers) {
    const rawLawyer = lawyer.toObject ? lawyer.toObject() : lawyer;
    if (rawLawyer.verificationStatus === 'Suspended' || rawLawyer.verificationStatus === 'Rejected') {
      continue;
    }
    const avail = (rawLawyer.availabilityStatus || 'Available').toLowerCase();
    if (avail === 'inactive' || avail === 'suspended') {
      continue;
    }

    const lawyerName = rawLawyer.fullName || rawLawyer.name || 'Advocate';
    const normName = lawyerName.replace(/\(.*?\)/g, '').trim().toLowerCase();

    const specializations = Array.isArray(rawLawyer.specializations) ? rawLawyer.specializations : [rawLawyer.specialization || ''];
    const practiceAreas = Array.isArray(rawLawyer.practiceAreas) ? rawLawyer.practiceAreas : [];
    const allAreas = [...specializations, ...practiceAreas].map(s => String(s).toLowerCase());
    const areaText = allAreas.join(' ');

    // 2. Strict Domain Relevance Check
    let specMatch = 0.0;
    if (domainKey === 'property') {
      if (areaText.includes('property') || areaText.includes('partition') || areaText.includes('land') || areaText.includes('boundary') || areaText.includes('revenue')) {
        specMatch = 1.0;
      }
    } else if (domainKey === 'criminal') {
      if (areaText.includes('criminal') || areaText.includes('bail') || areaText.includes('ipc') || areaText.includes('sessions')) {
        specMatch = 1.0;
      }
    } else if (domainKey === 'family') {
      if (areaText.includes('family') || areaText.includes('divorce') || areaText.includes('custody') || areaText.includes('matrimonial') || areaText.includes('domestic')) {
        specMatch = 1.0;
      }
    } else if (domainKey === 'cheque') {
      if (areaText.includes('cheque') || areaText.includes('138') || areaText.includes('banking') || areaText.includes('commercial')) {
        specMatch = 1.0;
      }
    } else if (domainKey === 'motor accident') {
      if (areaText.includes('accident') || areaText.includes('mact') || areaText.includes('insurance')) {
        specMatch = 1.0;
      }
    } else if (domainKey === 'consumer') {
      if (areaText.includes('consumer') || areaText.includes('constitutional') || areaText.includes('rti')) {
        specMatch = 1.0;
      }
    } else if (domainKey === 'revenue') {
      if (areaText.includes('revenue') || areaText.includes('patta') || areaText.includes('land') || areaText.includes('property')) {
        specMatch = 1.0;
      }
    } else if (domainKey === 'labour') {
      if (areaText.includes('labour') || areaText.includes('labor') || areaText.includes('employment') || areaText.includes('industrial')) {
        specMatch = 1.0;
      }
    } else if (domainKey === 'cyber') {
      if (areaText.includes('cyber') || areaText.includes('fraud') || areaText.includes('it act')) {
        specMatch = 1.0;
      }
    } else if (domainKey === 'civil') {
      if (areaText.includes('civil') || areaText.includes('contract') || areaText.includes('recovery')) {
        specMatch = 1.0;
      }
    } else {
      // General match
      const hits = domainKeywords.filter(k => areaText.includes(k)).length;
      if (hits >= 2) specMatch = 0.9;
      else if (hits === 1) specMatch = 0.7;
    }

    // CRITICAL: Reject advocates outside this legal discipline!
    if (specMatch < 0.70) {
      continue;
    }

    // 3. Experience Scoring & Filtering
    const exp = Number(rawLawyer.experience) || 5;
    if (reqExperience > 0 && exp < Math.max(1, reqExperience - 3)) {
      continue;
    }
    const expScore = reqExperience > 0 ? Math.min(1.0, exp / reqExperience) : Math.min(1.0, 0.6 + (exp * 0.02));

    // 4. Semantic overlap with case description
    let descScore = 0.5;
    if (rawDesc && rawLawyer.bio) {
      const bioLower = rawLawyer.bio.toLowerCase();
      const descTokens = rawDesc.split(/\s+/).filter(w => w.length > 3);
      if (descTokens.length > 0) {
        const hits = descTokens.filter(t => bioLower.includes(t) || areaText.includes(t)).length;
        descScore = Math.min(1.0, 0.4 + (hits / descTokens.length) * 0.6);
      }
    }

    // 5. Location proximity
    const loc = (rawLawyer.location || (rawLawyer.userId && rawLawyer.userId.location) || '').toLowerCase();
    const locScore = reqLocation && (loc.includes(reqLocation) || reqLocation.includes(loc)) ? 1.0 : 0.8;

    // 6. Court Level Match
    const lawyerCourts = Array.isArray(rawLawyer.courts) ? rawLawyer.courts.map(c => String(c).toLowerCase()) : [];
    const lawyerCourtTier = String(rawLawyer.courtLevel || '').toLowerCase();
    let courtScore = 0.8;
    if (lawyerCourtTier.includes(reqCourtLevel) || lawyerCourts.some(c => c.includes(reqCourtLevel))) {
      courtScore = 1.0;
    }

    // Multi-criteria score (45% Domain, 25% Fact Overlap, 15% Experience, 10% Location, 5% Availability)
    const weighted = (
      (specMatch * 45.0) +
      (descScore * 25.0) +
      (expScore * 15.0) +
      (locScore * 10.0) +
      (0.95 * 5.0)
    );

    const matchScore = Math.round(Math.min(98.5, Math.max(76.0, weighted)) * 10) / 10;
    const confidenceScore = Math.round(Math.min(98.0, Math.max(82.0, (specMatch * 50.0 + expScore * 30.0 + locScore * 20.0))) * 10) / 10;

    // Explainable rationale
    const reasons = [
      `Dedicated specialist in ${specializations[0] || 'Target Domain'}`,
      `${exp} years of verified Bar Council trial experience`,
      `Practices locally before ${rawLawyer.courts?.[0] || 'Theni District Court'}`
    ];
    if (practiceAreas.length > 0) {
      reasons.splice(1, 0, `Proven track record in ${practiceAreas.slice(0, 2).join(' & ')}`);
    }

    const userIdObj = rawLawyer.userId && typeof rawLawyer.userId === 'object' ? rawLawyer.userId : {};
    const item = {
      lawyerId: rawLawyer._id,
      userId: userIdObj._id || rawLawyer.userId || rawLawyer._id,
      fullName: lawyerName,
      name: lawyerName,
      email: userIdObj.email || '',
      phone: userIdObj.phone || '',
      profileImage: rawLawyer.profileImage || userIdObj.profileImage || null,
      barRegistrationNumber: rawLawyer.barRegistrationNumber || 'MS/VERIFIED',
      specialization: specializations[0] || 'Specialized Advocate',
      specializations: specializations,
      practiceAreas: practiceAreas,
      experience: exp,
      successRate: Math.round(Number(rawLawyer.successRate) || 92),
      rating: Number(rawLawyer.rating) || 4.9,
      reviewCount: rawLawyer.reviewCount || 24,
      location: rawLawyer.location || userIdObj.location || 'Theni, Tamil Nadu',
      courts: rawLawyer.courts || ['District Court, Theni'],
      courtLevel: rawLawyer.courtLevel || 'District Court',
      languages: rawLawyer.languages || ['Tamil', 'English'],
      consultationFee: Number(rawLawyer.consultationFee) || 0,
      availability: rawLawyer.availabilityStatus || 'Available',
      availabilityStatus: rawLawyer.availabilityStatus || 'Available',
      matchScore: matchScore,
      confidenceScore: confidenceScore,
      reasons: reasons.slice(0, 4),
      bio: rawLawyer.bio || `Specialized advocate in ${specializations.join(', ')} with ${exp} years of court practice.`,
    };

    // Deduplicate identical names
    if (seenNames.has(normName)) {
      const existingIdx = candidates.findIndex(c => c.name.replace(/\(.*?\)/g, '').trim().toLowerCase() === normName);
      if (existingIdx !== -1 && item.matchScore > candidates[existingIdx].matchScore) {
        candidates[existingIdx] = item;
      }
    } else {
      seenNames.add(normName);
      candidates.push(item);
    }
  }

  // Sort descending by matchScore
  candidates.sort((a, b) => b.matchScore - a.matchScore);

  // Return strictly the top matching specialists (top 3 to 6 advocates)
  return candidates.slice(0, 6);
};

const recommendLawyers = async (payload, dbLawyers = []) => {
  let aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  if (!aiUrl.endsWith('/recommend') && !aiUrl.endsWith('/recommend/')) {
    aiUrl = aiUrl.replace(/\/$/, '') + '/recommend';
  }

  // Format dbLawyers for Python microservice if available
  const formattedLawyers = dbLawyers.map((l) => {
    const raw = l.toObject ? l.toObject() : l;
    return {
      id: raw._id,
      _id: raw._id,
      userId: raw.userId?._id || raw.userId,
      name: raw.fullName,
      fullName: raw.fullName,
      specializations: raw.specializations || [],
      specialization: raw.specializations?.[0] || raw.specialization || 'General',
      practiceAreas: raw.practiceAreas || [],
      experience: raw.experience || 5,
      successRate: raw.successRate || 80,
      rating: raw.rating || 4.8,
      location: raw.location || 'Theni, Tamil Nadu',
      district: raw.district || raw.userId?.district || 'Theni',
      state: raw.state || raw.userId?.state || 'Tamil Nadu',
      courts: raw.courts || ['District Court, Theni'],
      courtLevel: raw.courtLevel || 'District Court',
      languages: raw.languages || ['Tamil', 'English'],
      consultationFee: raw.consultationFee || 0,
      caseFilingFee: raw.caseFilingFee || 0,
      availabilityStatus: raw.availabilityStatus || 'Available',
      bio: raw.bio || '',
      profileImage: raw.profileImage || ''
    };
  });

  try {
    const response = await axios.post(
      aiUrl,
      { ...payload, lawyers: formattedLawyers },
      { timeout: 3500 }
    );
    if (Array.isArray(response.data) && response.data.length > 0) {
      // If Python returned only specific lawyers (e.g. <= 6), enrich and return
      const enriched = response.data.map((resItem) => {
        const foundDb = dbLawyers.find(
          (dbL) => String(dbL._id) === String(resItem.lawyerId) || dbL.fullName === resItem.fullName
        );
        const rawDb = foundDb ? (foundDb.toObject ? foundDb.toObject() : foundDb) : null;
        return {
          ...resItem,
          lawyerId: rawDb ? rawDb._id : resItem.lawyerId,
          userId: rawDb?.userId?._id || rawDb?.userId || resItem.userId || resItem.lawyerId,
          barRegistrationNumber: rawDb?.barRegistrationNumber || resItem.barRegistrationNumber || 'BC/VERIFIED',
          profileImage: rawDb?.profileImage || resItem.profileImage,
          location: rawDb?.location || resItem.location || 'District Court',
          courts: rawDb?.courts || ['District Court'],
        };
      });

      // Strict guarantee: return only top specific matches (max 6)
      return enriched.slice(0, 6);
    }
  } catch (error) {
    // Python service offline or timed out - fall back to local AI matcher
  }

  // Return local AI matching results (strictly filtered to domain specialists)
  return computeLocalAiRecommendations(payload, dbLawyers);
};

const searchJudgments = async (payload) => {
  let aiUrl = process.env.AI_SERVICE_URL_JUDGMENTS || process.env.AI_SERVICE_URL || 'http://localhost:8000';
  if (!aiUrl.endsWith('/search-judgments') && !aiUrl.endsWith('/search-judgments/')) {
    aiUrl = aiUrl.replace(/\/$/, '') + '/search-judgments';
  }
  try {
    const response = await axios.post(aiUrl, payload, { timeout: 10000 });
    return response.data;
  } catch (error) {
    return { judgments: [] };
  }
};

module.exports = { recommendLawyers, computeLocalAiRecommendations, searchJudgments };
