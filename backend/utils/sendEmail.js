const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

/**
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!to || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email send skipped: EMAIL_USER, EMAIL_PASS, and recipient are required");
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Email accepted for delivery to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Email send failed to ${to}: ${error.code || "SMTP_ERROR"} ${error.message}`);
    if (error.response) console.error(`SMTP response: ${error.response}`);
    return false;
  }
};

module.exports = sendEmail;
