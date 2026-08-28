const asyncHandler = require("../utils/asyncHandler");
const Subscriber = require("../models/Subscriber");
const sendEmail = require("../utils/sendEmail");
const { welcomeSubscriberEmail } = require("../utils/newsletterEmailTemplates");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Subscribe an email to the newsletter and send a welcome email
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = asyncHandler(async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }

  const existing = await Subscriber.findOne({ email });

  if (existing) {
    // Already subscribed - respond as a success (idempotent) but don't
    // re-send the welcome email or create a duplicate record.
    return res.json({ success: true, message: "You're already subscribed!" });
  }

  await Subscriber.create({ email });

  // Don't let a slow/broken SMTP provider hold up the response - the
  // subscription itself already succeeded and is what matters most.
  sendEmail({
    to: email,
    subject: "Welcome to ELYVUKA 👋",
    html: welcomeSubscriberEmail(email),
  });

  res.status(201).json({ success: true, message: "Subscribed! Check your inbox." });
});

module.exports = { subscribe };
