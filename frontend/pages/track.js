import { useState } from "react";
import Layout from "../components/Layout";
import { trackOrder } from "../services/orderService";

const STATUS_LABELS = {
  pending: "Order received",
  confirmed: "Confirmed by phone",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_ORDER = ["pending", "confirmed", "out_for_delivery", "delivered"];

export default function Track() {
  const [form, setForm] = useState({ orderNumber: "", phone: "" });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await trackOrder(form.orderNumber.trim(), form.phone.trim());
      setOrder(res.data);
    } catch (err) {
      setError(err.message || "No matching order found.");
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <Layout>
      <div className="section" style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20 }}>Track your order</h1>
        <form onSubmit={submit} style={{ marginTop: 16 }}>
          <div className="form-field">
            <label>Order number</label>
            <input required placeholder="LH-20240824-4821" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Phone number used at checkout</label>
            <input required placeholder="07XX XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button className="btn-primary" style={{ width: "100%", background: "var(--forest)", color: "#fff", padding: 12 }} disabled={loading}>
            {loading ? "Searching…" : "Track order"}
          </button>
        </form>

        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 14 }}>{error}</p>}

        {order && (
          <div style={{ marginTop: 24 }}>
            <div className="order-id">{order.orderNumber}</div>
            {STATUS_ORDER.map((status, idx) => (
              <div key={status} className="admin-mobile-card">
                <div className="top">
                  <span style={{ fontWeight: 600, fontSize: 12.5, color: idx > currentIndex ? "var(--ink-faint)" : "var(--ink)" }}>
                    {STATUS_LABELS[status]}
                  </span>
                  {idx < currentIndex && <span className="status-pill status-delivered">Done</span>}
                  {idx === currentIndex && <span className="status-pill status-pending">Current</span>}
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 12 }}>
              Total: KSh {order.total?.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
