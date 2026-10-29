const nodemailer = require('nodemailer');

const createTransporter = async () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
};

/**
 * Send transactional email with resilient fallback
 * Ensures database state is never lost if an external SMTP provider is unreachable.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = await createTransporter();
    if (!transporter) {
      console.log(`[Email Simulation - SMTP Unconfigured] To: ${to} | Subject: ${subject}`);
      return { success: true, mode: 'simulation' };
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Court Portal <no-reply@courtportal.gov.in>',
      to,
      subject,
      text,
      html,
    });

    console.log(`📧 Email delivered via SMTP to ${to} (Message ID: ${info.messageId})`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.warn(`⚠️ [Email Delivery Failed]: ${error.message}. Case database state preserved.`);
    return { success: false, mode: 'failed', error: error.message };
  }
};

/**
 * Verify SMTP connection credentials without sending an email
 */
const verifySmtpConnection = async () => {
  if (!process.env.SMTP_HOST) {
    return { configured: false, status: 'SMTP credentials not configured (using simulation)' };
  }
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    return { configured: true, status: 'SMTP server verified and ready' };
  } catch (err) {
    return { configured: false, status: `SMTP verification failed: ${err.message}` };
  }
};

module.exports = { sendEmail, verifySmtpConnection };
