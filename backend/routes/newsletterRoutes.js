const express = require("express");
const rateLimit = require("express-rate-limit");
const { subscribe } = require("../controllers/newsletterController");

const router = express.Router();

// Public, unauthenticated endpoint - throttle per IP to stop signup-form abuse
// (e.g. someone scripting it to spam an inbox with welcome emails).
const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts. Please try again later." },
});

router.post("/subscribe", subscribeLimiter, subscribe);

module.exports = router;
