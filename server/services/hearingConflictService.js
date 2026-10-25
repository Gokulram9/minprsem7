const Hearing = require('../models/Hearing');

/**
 * Checks for hearing scheduling conflicts involving Judge and Courtroom
 */
const checkHearingConflict = async ({ hearingDate, timeSlot, courtroom, judgeId, excludeHearingId }) => {
  if (!hearingDate) return { hasConflict: false };

  const startOfDay = new Date(hearingDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(hearingDate);
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    status: { $in: ['Scheduled', 'Rescheduled', 'Adjourned'] },
    hearingDate: { $gte: startOfDay, $lte: endOfDay }
  };

  if (excludeHearingId) {
    query._id = { $ne: excludeHearingId };
  }

  const dayHearings = await Hearing.find(query).populate('application', 'caseId caseTitle');

  // Check judge conflict
  if (judgeId) {
    const judgeConflict = dayHearings.find(h => {
      const matchJudge = h.judge && h.judge.toString() === judgeId.toString();
      const matchSlot = !timeSlot || !h.timeSlot || h.timeSlot.trim().toLowerCase() === timeSlot.trim().toLowerCase();
      return matchJudge && matchSlot;
    });

    if (judgeConflict) {
      return {
        hasConflict: true,
        conflictType: 'Judge',
        message: `Conflict detected: Judge already has a hearing scheduled at ${judgeConflict.timeSlot || 'this time'} for case ${judgeConflict.application?.caseTitle || judgeConflict.application?.caseId || 'another case'}.`,
        conflictingHearing: judgeConflict,
        suggestedSlots: ['09:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'].filter(s => s !== timeSlot)
      };
    }
  }

  // Check courtroom conflict
  if (courtroom) {
    const courtroomConflict = dayHearings.find(h => {
      const matchRoom = h.courtroom && h.courtroom.trim().toLowerCase() === courtroom.trim().toLowerCase();
      const matchSlot = !timeSlot || !h.timeSlot || h.timeSlot.trim().toLowerCase() === timeSlot.trim().toLowerCase();
      return matchRoom && matchSlot;
    });

    if (courtroomConflict) {
      return {
        hasConflict: true,
        conflictType: 'Courtroom',
        message: `Conflict detected: ${courtroom} is already booked at ${courtroomConflict.timeSlot || 'this time'} for case ${courtroomConflict.application?.caseTitle || courtroomConflict.application?.caseId || 'another case'}.`,
        conflictingHearing: courtroomConflict,
        suggestedSlots: ['09:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'].filter(s => s !== timeSlot)
      };
    }
  }

  return { hasConflict: false };
};

module.exports = { checkHearingConflict };
