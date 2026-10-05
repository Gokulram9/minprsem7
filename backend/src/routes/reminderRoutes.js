const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { sendHearingReminder, sendCaseUpdateNotification, checkTomorrowHearings } = require('../services/reminderService');
const Application = require('../models/Application');
const Hearing = require('../models/Hearing');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * POST /api/reminders/hearing
 * Admin sends a hearing reminder to the applicant and assigned lawyer.
 */
router.post('/hearing', protect, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { applicationId } = req.body;

    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email')
      .populate('assignedLawyer', 'name email')
      .populate('hearing');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const hearing = application.hearing;
    if (!hearing) {
      return res.status(400).json({ message: 'No hearing scheduled for this case yet' });
    }

    const results = [];

    // Send to applicant
    if (application.applicant) {
      const r = await sendHearingReminder({
        toEmail: application.applicant.email,
        toName: application.applicant.name,
        caseTitle: application.caseTitle,
        hearingDate: hearing.hearingDate,
        courtroom: hearing.courtroom,
        judge: hearing.judge,
      });
      results.push({ recipient: 'applicant', ...r });

      // Save in-app notification for applicant
      await Notification.create({
        user: application.applicant._id,
        application: application._id,
        message: `Reminder: Your hearing for "${application.caseTitle}" is scheduled. Check your email for details.`,
        category: 'Hearing',
      });
    }

    // Send to lawyer
    if (application.assignedLawyer) {
      const r = await sendHearingReminder({
        toEmail: application.assignedLawyer.email,
        toName: application.assignedLawyer.name,
        caseTitle: application.caseTitle,
        hearingDate: hearing.hearingDate,
        courtroom: hearing.courtroom,
        judge: hearing.judge,
      });
      results.push({ recipient: 'lawyer', ...r });
    }

    res.json({ message: 'Reminders dispatched successfully', results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send reminders', error: err.message });
  }
});

/**
 * POST /api/reminders/update
 * Admin sends a case status update notification.
 */
router.post('/update', protect, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { applicationId, message } = req.body;

    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const result = await sendCaseUpdateNotification({
      toEmail: application.applicant.email,
      toName: application.applicant.name,
      caseTitle: application.caseTitle,
      newStatus: application.status,
      message: message || `Your case "${application.caseTitle}" has been updated to status: ${application.status}.`,
    });

    await Notification.create({
      user: application.applicant._id,
      application: application._id,
      message: message || `Your case status has been updated to: ${application.status}`,
      category: 'General',
    });

    res.json({ message: 'Notification sent', result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send notification', error: err.message });
  }
});

/**
 * POST /api/reminders/check-tomorrow
 * Scans database for scheduled hearings tomorrow and triggers alerts.
 */
router.post('/check-tomorrow', protect, async (req, res) => {
  try {
    const results = await checkTomorrowHearings();
    res.json({ message: 'Tomorrow check completed', results });
  } catch (err) {
    res.status(500).json({ message: 'Scheduler run failed', error: err.message });
  }
});

module.exports = router;
