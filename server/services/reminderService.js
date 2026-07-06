const nodemailer = require('nodemailer');
const Hearing = require('../models/Hearing');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

/**
 * Creates an Ethereal test transporter (captured emails, no real delivery).
 * Preview URL is logged to console after each send.
 */
const createTransporter = async () => {
  // Create a one-time Ethereal test account
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Send a hearing reminder email to a user or lawyer.
 */
const sendHearingReminder = async ({ toEmail, toName, caseTitle, hearingDate, courtroom, judge }) => {
  try {
    const transporter = await createTransporter();
    const formattedDate = new Date(hearingDate).toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const info = await transporter.sendMail({
      from: '"Seven Seas Justice System" <noreply@sevenseas.gov>',
      to: toEmail,
      subject: `⚖️ Hearing Reminder — ${caseTitle}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 32px; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 10px;">
              <span style="font-size: 28px;">⚓</span>
              <span style="color: white; font-size: 18px; font-weight: 700; letter-spacing: 0.05em;">SEVEN SEAS JUSTICE SYSTEM</span>
            </div>
          </div>

          <!-- Body -->
          <div style="background: white; padding: 32px;">
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 8px;">
              ⏰ Upcoming Hearing Reminder
            </h2>
            <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">
              Dear <strong>${toName}</strong>, this is an official reminder from the Seven Seas Justice System about your scheduled court hearing.
            </p>

            <!-- Details card -->
            <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">📁 Case Title</td><td style="color: #0f172a; font-weight: 600;">${caseTitle}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">📅 Date & Time</td><td style="color: #0f172a; font-weight: 600;">${formattedDate}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">🏛️ Courtroom</td><td style="color: #0f172a; font-weight: 600;">${courtroom}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">⚖️ Judge</td><td style="color: #0f172a; font-weight: 600;">${judge}</td></tr>
              </table>
            </div>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 12px 16px; margin-bottom: 24px;">
              <p style="color: #1e40af; font-size: 12px; margin: 0;">
                Please arrive <strong>30 minutes before</strong> the scheduled time with all required documents.
              </p>
            </div>

            <a href="http://localhost:5175/dashboard" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none;">
              View Case Dashboard →
            </a>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              Seven Seas Justice System · Official Court Notification<br/>
              This is an automated message. Do not reply to this email.
            </p>
          </div>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('📧 Hearing reminder sent!');
    console.log('   Preview URL:', previewUrl);
    return { success: true, previewUrl };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send a case status update notification email.
 */
const sendCaseUpdateNotification = async ({ toEmail, toName, caseTitle, newStatus, message }) => {
  try {
    const transporter = await createTransporter();

    const statusColors = {
      Submitted: '#6366f1',
      'Under Review': '#f59e0b',
      LawyerAssigned: '#10b981',
      CourtScheduled: '#3b82f6',
      Completed: '#22c55e',
      Rejected: '#ef4444',
    };
    const color = statusColors[newStatus] || '#64748b';

    const info = await transporter.sendMail({
      from: '"Seven Seas Justice System" <noreply@sevenseas.gov>',
      to: toEmail,
      subject: `📋 Case Update — ${caseTitle}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 32px; text-align: center;">
            <span style="color: white; font-size: 18px; font-weight: 700;">⚓ SEVEN SEAS JUSTICE SYSTEM</span>
          </div>
          <div style="background: white; padding: 32px;">
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 8px;">Case Status Updated</h2>
            <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">Dear <strong>${toName}</strong>,</p>
            <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">${message}</p>
            <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">CASE TITLE</p>
              <p style="color: #0f172a; font-weight: 700; margin: 0 0 16px 0;">${caseTitle}</p>
              <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">NEW STATUS</p>
              <span style="display: inline-block; background: ${color}20; color: ${color}; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700;">${newStatus}</span>
            </div>
            <a href="http://localhost:5175/dashboard" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none;">
              View Dashboard →
            </a>
          </div>
          <div style="background: #f8fafc; padding: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Seven Seas Justice System · Automated Notification</p>
          </div>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('📧 Case update email sent!');
    console.log('   Preview URL:', previewUrl);
    return { success: true, previewUrl };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
};

const checkTomorrowHearings = async () => {
  try {
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date();
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const tomorrowHearings = await Hearing.find({
      hearingDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
      status: 'Scheduled'
    });

    const dispatched = [];

    for (const hearing of tomorrowHearings) {
      const application = await Application.findById(hearing.application)
        .populate('applicant')
        .populate('assignedLawyer');

      if (!application) continue;

      // Send to applicant
      if (application.applicant) {
        const mailRes = await sendHearingReminder({
          toEmail: application.applicant.email,
          toName: application.applicant.name,
          caseTitle: application.caseTitle,
          hearingDate: hearing.hearingDate,
          courtroom: hearing.courtroom,
          judge: hearing.judge,
        });

        await Notification.create({
          user: application.applicant._id,
          application: application._id,
          message: `⏰ Tomorrow Hearing Alert: Your hearing for "${application.caseTitle}" is scheduled tomorrow at ${hearing.courtroom}. Please audit your email reminders.`,
          category: 'Hearing',
        });

        dispatched.push({ type: 'applicant', name: application.applicant.name, email: application.applicant.email, preview: mailRes.previewUrl });
      }

      // Send to lawyer
      if (application.assignedLawyer) {
        const mailRes = await sendHearingReminder({
          toEmail: application.assignedLawyer.email,
          toName: application.assignedLawyer.name,
          caseTitle: application.caseTitle,
          hearingDate: hearing.hearingDate,
          courtroom: hearing.courtroom,
          judge: hearing.judge,
        });

        await Notification.create({
          user: application.assignedLawyer._id,
          application: application._id,
          message: `⏰ Tomorrow Hearing Alert: You have a scheduled trial hearing tomorrow for case "${application.caseTitle}" in ${hearing.courtroom}.`,
          category: 'Hearing',
        });

        dispatched.push({ type: 'lawyer', name: application.assignedLawyer.name, email: application.assignedLawyer.email, preview: mailRes.previewUrl });
      }
    }

    return dispatched;
  } catch (err) {
    console.error('Error running tomorrow hearings scheduler:', err);
    throw err;
  }
};

module.exports = { sendHearingReminder, sendCaseUpdateNotification, checkTomorrowHearings };
