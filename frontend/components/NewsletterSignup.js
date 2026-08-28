import { useState } from "react";
import { subscribeToNewsletter } from "../services/newsletterService";
import { useToast } from "../context/ToastContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const { addToast } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    const value = email.trim();

    if (!EMAIL_RE.test(value)) {
      addToast("Enter a valid email address", { type: "error" });
      return;
    }

    setStatus("loading");
    try {
      const res = await subscribeToNewsletter(value);
      addToast(res.message || "Subscribed! Check your inbox.", { type: "success" });
      setEmail("");
      setStatus("done");
    } catch (err) {
      addToast(err.message || "Couldn't subscribe right now", { type: "error" });
      setStatus("idle");
    }
  };

  return (
    <div className="newsletter-box">
      <div>
        <h2 style={{ fontSize: 17 }}>Get laptop deals in your inbox</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "6px 0 0" }}>
          New arrivals and price drops. No spam, unsubscribe anytime.
        </p>
      </div>
      <form onSubmit={submit} className="newsletter-form">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="newsletter-input"
          aria-label="Email address"
        />
        <button type="submit" className="btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
