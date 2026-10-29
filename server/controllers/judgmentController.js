const { searchJudgments } = require('../services/aiService');
const { LEGAL_PRECEDENTS } = require('../data/legalPrecedents');

const getJudgments = async (req, res, next) => {
  try {
    const query = (req.query.query || '').trim().toLowerCase();
    const year = req.query.year ? Number(req.query.year) : null;
    const specialization = req.query.specialization || 'All';
    const limit = Number(req.query.limit || 50);

    const payload = {
      query,
      year,
      specialization,
      limit
    };

    let aiResults = { judgments: [] };
    try {
      aiResults = await searchJudgments(payload);
    } catch (e) {
      aiResults = { judgments: [] };
    }

    // Filter built-in verified precedents repository
    let localPrecedents = LEGAL_PRECEDENTS.filter(item => {
      // Query match (checks title, summary, citation, bench, ratio, category)
      if (query) {
        const fullText = `${item.title} ${item.citation} ${item.summary} ${item.ratio || ''} ${item.bench || ''} ${item.category || ''} ${item.specialization || ''}`.toLowerCase();
        const words = query.split(/\s+/).filter(Boolean);
        const matchesQuery = words.some(w => fullText.includes(w));
        if (!matchesQuery) return false;
      }

      // Year match
      if (year && Number(item.year) !== year) {
        return false;
      }

      // Specialization match
      if (specialization && specialization !== 'All') {
        const specMatches = 
          item.specialization === specialization || 
          item.category?.toLowerCase().includes(specialization.toLowerCase()) ||
          specialization.toLowerCase().includes(item.category?.toLowerCase() || '');
        if (!specMatches) return false;
      }

      return true;
    });

    // Merge AI results and local precedents without duplicates
    const combined = [...(aiResults?.judgments || [])];
    const existingTitles = new Set(combined.map(j => (j.title || '').toLowerCase()));

    for (const prec of localPrecedents) {
      if (!existingTitles.has((prec.title || '').toLowerCase())) {
        combined.push({
          id: prec.id,
          title: prec.title,
          citation: prec.citation,
          court: prec.court,
          bench: prec.bench,
          benchType: prec.benchType,
          year: prec.year,
          category: prec.category,
          specialization: prec.specialization,
          outcome: prec.outcome,
          match: prec.match,
          statutes: prec.statutes || [],
          summary: prec.summary,
          ratio: prec.ratio,
          practicalImpact: prec.practicalImpact,
          filename: `${prec.citation.split('•')[0].trim().replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
        });
        existingTitles.add((prec.title || '').toLowerCase());
      }
    }

    res.json({
      success: true,
      judgments: combined.slice(0, limit),
      source: aiResults?.judgments?.length > 0 ? 'hybrid_ai' : 'verified_archive',
      totalCount: combined.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getJudgments };
