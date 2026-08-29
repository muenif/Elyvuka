const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Parses "Name <email@example.com>" into { name, email }. Falls back to
// treating the whole string as the email if it's not in that format.
const parseFromAddress = (fromString) => {
  const match = fromString?.match(/^(.*?)<(.+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ""), email: match[2].trim() };
  }
  return { name: "ELYVUKA", email: fromString };
};

/**
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    console.error(`Email not sent to ${to}: BREVO_API_KEY is not set`);
    return;
  }

  const sender = parseFromAddress(process.env.EMAIL_FROM || process.env.ADMIN_EMAIL);

  try {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Brevo API returned ${res.status}`);
    }
  } catch (error) {
    // Email failing should never block an order from being saved -
    // we log it so the admin can still see/act on the order in the dashboard.
    console.error(`Email send failed to ${to}: ${error.message}`);
  }
};

module.exports = sendEmail;