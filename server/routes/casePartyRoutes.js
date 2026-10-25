const express = require('express');
const {
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
} = require('../controllers/casePartyController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/:caseId/parties', protect, getCaseParties);
router.get('/:caseId/parties/my-side', protect, getMySideParties);
router.get('/:caseId/parties/opposing-side', protect, getOpposingSideParties);
router.get('/:caseId/opposing-party', protect, getOpposingParty);
router.get('/:caseId/opposing-lawyer', protect, getOpposingLawyer);
router.get('/:caseId/representation', protect, getRepresentationStructure);

router.post('/:caseId/parties', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), createCaseParty);
router.put('/:caseId/parties/:partyId', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), updateCaseParty);
router.delete('/:caseId/parties/:partyId', protect, authorizeRoles('Admin', 'CourtStaff'), deleteCaseParty);

router.post('/:caseId/parties/:partyId/assign-lawyer', protect, authorizeRoles('Admin', 'CourtStaff'), assignPartyLawyer);
router.put('/:caseId/opponent', protect, authorizeRoles('Admin', 'CourtStaff', 'Lawyer'), updateCaseOpponent);
router.put('/:caseId/opponent-lawyer', protect, authorizeRoles('Admin', 'CourtStaff'), updateCaseOpposingLawyer);

module.exports = router;
