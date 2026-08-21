const AuditLog = require('../models/AuditLog');

/**
 * Sanitizes sensitive personal party information unless the user is authorized.
 */
const sanitizePartyData = (partyObj, isPrivileged = false) => {
  const party = partyObj.toObject ? partyObj.toObject() : { ...partyObj };

  if (!isPrivileged) {
    party.phone = '[RESTRICTED - PRIVACY ENFORCED]';
    party.email = '[RESTRICTED - PRIVACY ENFORCED]';
    party.address = '[RESTRICTED - PRIVACY ENFORCED]';
  }

  return party;
};

/**
 * Audit logger for sensitive case data accesses
 */
const recordSensitiveAccess = async (user, caseId, resourceName) => {
  try {
    if (user && user.role !== 'Applicant') {
      await AuditLog.create({
        userId: user._id,
        action: 'SENSITIVE_CASE_PARTIES_ACCESS',
        resource: resourceName || 'CaseParty',
        resourceId: caseId.toString(),
      });
    }
  } catch (err) {
    console.error('Audit Log Privacy Error:', err.message);
  }
};

module.exports = {
  sanitizePartyData,
  recordSensitiveAccess
};
