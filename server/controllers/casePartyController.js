const CaseParty = require('../models/CaseParty');
const Application = require('../models/Application');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { sanitizePartyData, recordSensitiveAccess } = require('../middleware/privacyMiddleware');

// Helper to check if requester is privileged for a given side/case
const checkPrivilege = (user, caseApp, targetSide) => {
  if (!user) return false;
  if (user.role === 'Admin' || user.role === 'CourtStaff') return true;

  // Lawyer assigned to case
  if (user.role === 'Lawyer') {
    if (caseApp.assignedLawyer && caseApp.assignedLawyer.toString() === user._id.toString()) {
      return targetSide === 'YOUR_SIDE';
    }
    if (caseApp.opposingLawyer && caseApp.opposingLawyer.toString() === user._id.toString()) {
      return targetSide === 'OPPOSING_SIDE';
    }
  }

  // Applicant owns case
  if (caseApp.applicant && caseApp.applicant.toString() === user._id.toString()) {
    return targetSide === 'YOUR_SIDE';
  }

  return false;
};

// Conflict of interest check helper
const checkConflictOfInterest = async (caseId, lawyerId, targetSide) => {
  const lawyer = await Lawyer.findById(lawyerId) || await Lawyer.findOne({ userId: lawyerId });
  const targetLawyerUserId = lawyer ? lawyer.userId.toString() : lawyerId.toString();

  // Find all opposing side parties for this case
  const oppositeSide = targetSide === 'YOUR_SIDE' ? 'OPPOSING_SIDE' : 'YOUR_SIDE';
  const opposingParties = await CaseParty.find({ caseId, side: oppositeSide });

  for (const party of opposingParties) {
    if (party.lawyerId) {
      const pLawyer = await Lawyer.findById(party.lawyerId) || await Lawyer.findOne({ userId: party.lawyerId });
      const pLawyerUserId = pLawyer ? pLawyer.userId.toString() : party.lawyerId.toString();

      if (pLawyerUserId === targetLawyerUserId) {
        return {
          hasConflict: true,
          conflictingParty: party.fullName,
          lawyerName: lawyer ? lawyer.fullName : 'Selected Counsel'
        };
      }
    }
  }

  // Also check Application direct fields
  const caseApp = await Application.findById(caseId);
  if (caseApp) {
    if (targetSide === 'YOUR_SIDE' && caseApp.opposingLawyer && caseApp.opposingLawyer.toString() === targetLawyerUserId) {
      return {
        hasConflict: true,
        conflictingParty: caseApp.opponentName || 'Opposing Party',
        lawyerName: lawyer ? lawyer.fullName : 'Selected Counsel'
      };
    }
    if (targetSide === 'OPPOSING_SIDE' && caseApp.assignedLawyer && caseApp.assignedLawyer.toString() === targetLawyerUserId) {
      return {
        hasConflict: true,
        conflictingParty: 'Applicant',
        lawyerName: lawyer ? lawyer.fullName : 'Selected Counsel'
      };
    }
  }

  return { hasConflict: false };
};

// GET /api/cases/:caseId/parties
const getCaseParties = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const caseApp = await Application.findById(caseId);
    if (!caseApp) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    await recordSensitiveAccess(req.user, caseId, 'CasePartyList');

    const parties = await CaseParty.find({ caseId }).populate('lawyerId');
    const sanitized = parties.map(p => {
      const isPrivileged = checkPrivilege(req.user, caseApp, p.side);
      return sanitizePartyData(p, isPrivileged);
    });

    res.json({ success: true, data: sanitized });
  } catch (error) {
    next(error);
  }
};

// GET /api/cases/:caseId/parties/my-side
const getMySideParties = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const caseApp = await Application.findById(caseId);
    if (!caseApp) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    const parties = await CaseParty.find({ caseId, side: 'YOUR_SIDE' }).populate('lawyerId');
    const sanitized = parties.map(p => sanitizePartyData(p, true)); // applicant side always visible to applicant

    res.json({ success: true, data: sanitized });
  } catch (error) {
    next(error);
  }
};

// GET /api/cases/:caseId/parties/opposing-side
const getOpposingSideParties = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const caseApp = await Application.findById(caseId);
    if (!caseApp) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    const isPrivileged = checkPrivilege(req.user, caseApp, 'OPPOSING_SIDE');
    await recordSensitiveAccess(req.user, caseId, 'OpposingParties');

    const parties = await CaseParty.find({ caseId, side: 'OPPOSING_SIDE' }).populate('lawyerId');
    const sanitized = parties.map(p => sanitizePartyData(p, isPrivileged));

    res.json({ success: true, data: sanitized });
  } catch (error) {
    next(error);
  }
};

// POST /api/cases/:caseId/parties
const createCaseParty = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const caseApp = await Application.findById(caseId);
    if (!caseApp) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    const partyCount = await CaseParty.countDocuments({ caseId });
    const partyId = `PRT-${1000 + partyCount + 1}`;

    const payload = {
      ...req.body,
      partyId,
      caseId
    };

    const party = await CaseParty.create(payload);

    // Synchronize opponent name if opposing party added
    if (party.side === 'OPPOSING_SIDE') {
      caseApp.opponentName = party.fullName;
      await caseApp.save();
    }

    res.status(201).json({ success: true, data: party });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cases/:caseId/parties/:partyId
const updateCaseParty = async (req, res, next) => {
  try {
    const party = await CaseParty.findOneAndUpdate(
      { caseId: req.params.caseId, _id: req.params.partyId },
      req.body,
      { new: true }
    );
    if (!party) {
      res.status(404);
      return next(new Error('Case Party record not found'));
    }
    res.json({ success: true, data: party });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cases/:caseId/parties/:partyId
const deleteCaseParty = async (req, res, next) => {
  try {
    const party = await CaseParty.findOneAndDelete({ caseId: req.params.caseId, _id: req.params.partyId });
    if (!party) {
      res.status(404);
      return next(new Error('Case Party record not found'));
    }
    res.json({ success: true, message: 'Case party removed' });
  } catch (error) {
    next(error);
  }
};

// POST /api/cases/:caseId/parties/:partyId/assign-lawyer
const assignPartyLawyer = async (req, res, next) => {
  try {
    const { lawyerId } = req.body;
    const party = await CaseParty.findOne({ caseId: req.params.caseId, _id: req.params.partyId });
    if (!party) {
      res.status(404);
      return next(new Error('Case party not found'));
    }

    // Perform Conflict of Interest Detection
    const conflict = await checkConflictOfInterest(req.params.caseId, lawyerId, party.side);
    if (conflict.hasConflict) {
      await AuditLog.create({
        userId: req.user ? req.user._id : null,
        action: 'CONFLICT_OF_INTEREST_DETECTED',
        resource: 'CaseParty',
        resourceId: req.params.caseId,
      });

      res.status(409);
      return res.json({
        success: false,
        hasConflict: true,
        message: `Potential Conflict of Interest: Adv. ${conflict.lawyerName} is already representing an opposing party (${conflict.conflictingParty}) in this case.`,
        requiresAdminReview: true
      });
    }

    party.lawyerId = lawyerId;
    await party.save();

    res.json({ success: true, message: 'Advocate successfully assigned to party', data: party });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cases/:caseId/opponent
const updateCaseOpponent = async (req, res, next) => {
  try {
    const { opponentName, organization, relationshipToCase } = req.body;
    const caseApp = await Application.findById(req.params.caseId);
    if (!caseApp) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    caseApp.opponentName = opponentName;
    await caseApp.save();

    let party = await CaseParty.findOne({ caseId: req.params.caseId, side: 'OPPOSING_SIDE' });
    if (party) {
      party.fullName = opponentName;
      if (organization) party.organization = organization;
      if (relationshipToCase) party.relationshipToCase = relationshipToCase;
      await party.save();
    } else {
      const partyCount = await CaseParty.countDocuments({ caseId: req.params.caseId });
      party = await CaseParty.create({
        partyId: `PRT-${1000 + partyCount + 1}`,
        caseId: req.params.caseId,
        fullName: opponentName,
        partyType: 'OPPONENT',
        side: 'OPPOSING_SIDE',
        organization,
        relationshipToCase: relationshipToCase || 'Opposing Party'
      });
    }

    res.json({ success: true, message: 'Opponent information updated', data: caseApp });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cases/:caseId/opponent-lawyer
const updateCaseOpposingLawyer = async (req, res, next) => {
  try {
    const { lawyerId } = req.body;
    const caseApp = await Application.findById(req.params.caseId);
    if (!caseApp) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    // Conflict detection check
    const conflict = await checkConflictOfInterest(req.params.caseId, lawyerId, 'OPPOSING_SIDE');
    if (conflict.hasConflict) {
      res.status(409);
      return res.json({
        success: false,
        hasConflict: true,
        message: `Potential Conflict of Interest: Adv. ${conflict.lawyerName} is already representing an applicant party in this case.`,
        requiresAdminReview: true
      });
    }

    caseApp.opposingLawyer = lawyerId;
    await caseApp.save();

    // Link lawyer to opposing party record
    const party = await CaseParty.findOne({ caseId: req.params.caseId, side: 'OPPOSING_SIDE' });
    if (party) {
      party.lawyerId = lawyerId;
      await party.save();
    }

    res.json({ success: true, message: 'Opposing lawyer assigned successfully', data: caseApp });
  } catch (error) {
    next(error);
  }
};

// GET /api/cases/:caseId/representation
const getRepresentationStructure = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const caseApp = await Application.findById(caseId)
      .populate('applicant', 'name email phone location')
      .populate('assignedLawyer', 'name email phone location specialization')
      .populate('opposingLawyer')
      .populate('hearing');

    if (!caseApp) {
      res.status(404);
      return next(new Error('Case not found'));
    }

    await recordSensitiveAccess(req.user, caseId, 'RepresentationStructure');

    // Fetch parties
    const mySideParties = await CaseParty.find({ caseId, side: 'YOUR_SIDE' }).populate('lawyerId');
    const opposingSideParties = await CaseParty.find({ caseId, side: 'OPPOSING_SIDE' }).populate('lawyerId');

    const isOpposingPrivileged = checkPrivilege(req.user, caseApp, 'OPPOSING_SIDE');

    // Process Lawyers
    let applicantLawyerObj = null;
    if (caseApp.assignedLawyer) {
      const lawyerProf = await Lawyer.findOne({ userId: caseApp.assignedLawyer._id });
      applicantLawyerObj = {
        id: caseApp.assignedLawyer._id,
        name: caseApp.assignedLawyer.name,
        specialization: lawyerProf?.specializations[0] || caseApp.assignedLawyer.specialization || 'Civil & Criminal',
        experience: lawyerProf?.experience || 10,
        rating: lawyerProf?.rating || 4.9,
        profileImage: lawyerProf?.profileImage || '',
        barRegistrationNumber: lawyerProf?.barRegistrationNumber || 'BC/SL/88219'
      };
    }

    let opposingLawyerObj = null;
    if (caseApp.opposingLawyer) {
      const oppProf = await Lawyer.findById(caseApp.opposingLawyer) || await Lawyer.findOne({ userId: caseApp.opposingLawyer });
      if (oppProf) {
        opposingLawyerObj = {
          id: oppProf._id,
          name: oppProf.fullName,
          specialization: oppProf.specializations[0] || 'Litigation Counsel',
          experience: oppProf.experience,
          rating: oppProf.rating,
          profileImage: oppProf.profileImage || '',
          barRegistrationNumber: oppProf.barRegistrationNumber,
          courts: oppProf.courts,
          languages: oppProf.languages,
          verificationStatus: oppProf.verificationStatus
        };
      }
    }

    // Default fallbacks if parties list empty
    const myPartiesList = mySideParties.length > 0 
      ? mySideParties.map(p => sanitizePartyData(p, true))
      : [{ fullName: caseApp.applicant?.name || 'Applicant', partyType: 'APPLICANT', relationshipToCase: 'Primary Legal Aid Claim Applicant' }];

    const opposingPartiesList = opposingSideParties.length > 0
      ? opposingSideParties.map(p => sanitizePartyData(p, isOpposingPrivileged))
      : [{ fullName: caseApp.opponentName || 'Municipal Corporation / Opponent', partyType: 'OPPONENT', relationshipToCase: 'Opposing Defendant Entity' }];

    const representation = {
      caseId: caseApp._id,
      caseNumber: `CASE-2026-${caseApp._id.toString().substring(caseApp._id.length - 4).toUpperCase()}`,
      caseTitle: caseApp.caseTitle,
      caseType: caseApp.caseType,
      court: caseApp.court || 'District Court',
      status: caseApp.status,
      nextHearing: caseApp.hearing?.hearingDate ? new Date(caseApp.hearing.hearingDate).toLocaleDateString() : 'Pending Scheduling',
      yourSide: {
        parties: myPartiesList,
        lawyers: applicantLawyerObj ? [applicantLawyerObj] : []
      },
      opposingSide: {
        parties: opposingPartiesList,
        lawyers: opposingLawyerObj ? [opposingLawyerObj] : []
      }
    };

    res.json({ success: true, data: representation });
  } catch (error) {
    next(error);
  }
};

const getOpposingParty = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const caseApp = await Application.findById(caseId);
    if (!caseApp) {
      res.status(404);
      return next(new Error('Case not found'));
    }
    const isPrivileged = checkPrivilege(req.user, caseApp, 'OPPOSING_SIDE');
    const parties = await CaseParty.find({ caseId, side: 'OPPOSING_SIDE' });
    const sanitized = parties.map(p => sanitizePartyData(p, isPrivileged));
    res.json({ success: true, data: sanitized });
  } catch (error) {
    next(error);
  }
};

const getOpposingLawyer = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const caseApp = await Application.findById(caseId).populate('opposingLawyer');
    if (!caseApp) {
      res.status(404);
      return next(new Error('Case not found'));
    }
    if (!caseApp.opposingLawyer) {
      return res.json({ success: true, data: null, message: 'No opposing lawyer assigned yet' });
    }
    const oppProf = await Lawyer.findById(caseApp.opposingLawyer) || await Lawyer.findOne({ userId: caseApp.opposingLawyer });
    res.json({ success: true, data: oppProf });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCaseParties,
  getMySideParties,
  getOpposingSideParties,
  createCaseParty,
  updateCaseParty,
  deleteCaseParty,
  assignPartyLawyer,
  updateCaseOpponent,
  updateCaseOpposingLawyer,
  getRepresentationStructure,
  getOpposingParty,
  getOpposingLawyer
};
