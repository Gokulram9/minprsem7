const nodemailer = require('nodemailer');

const createTransporter = async () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = await createTransporter();
  if (!transporter) {
    console.log('[Email Simulation]', { to, subject, text, html });
    return { success: true, mode: 'mock' };
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@legalaid.gov',
    to,
    subject,
    text,
    html,
  });
  return { success: true, mode: 'smtp' };
};

module.exports = { sendEmail };
