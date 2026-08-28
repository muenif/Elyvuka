const welcomeSubscriberEmail = (email) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#12201A;">
    <div style="background:#0F3D2E;padding:20px;border-radius:10px 10px 0 0;">
      <span style="color:#fff;font-size:18px;font-weight:bold;">ELYVUKA</span>
    </div>
    <div style="border:1px solid #DCE5DE;border-top:none;padding:24px;border-radius:0 0 10px 10px;">
      <h2 style="color:#0F3D2E;margin-top:0;">You're on the list! 🎉</h2>
      <p>Thanks for subscribing with <strong>${email}</strong>. We'll email you when new laptops
      land and when prices drop — no spam, just the good stuff.</p>
      <p style="font-size:13px;color:#4A5A52;">Didn't sign up for this? You can ignore this email
      and you won't hear from us again.</p>
    </div>
  </div>
`;

module.exports = { welcomeSubscriberEmail };
