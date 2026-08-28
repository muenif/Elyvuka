import { useState } from "react";
import { useRouter } from "next/router";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLogin() {
  const { login, isAuthenticated, checked } = useAdminAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (checked && isAuthenticated) {
    router.replace("/admin");
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form.email, form.password);
      router.push("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wrap" style={{ display: "flex", minHeight: "80vh", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 340, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: 24 }}>
        <div className="logo" style={{ color: "var(--forest)", marginBottom: 18 }}>
          <span className="dot" style={{ background: "var(--mint-deep)" }}></span>ELYVUKA Admin
        </div>
        <div className="form-field">
          <label>Email</label>
          <input required type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" />
        </div>
        <div className="form-field">
          <label>Password</label>
          <input required type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 10 }}>{error}</p>}
        <button className="btn-primary" style={{ width: "100%", background: "var(--forest)", color: "#fff", padding: 12 }} disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
