import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

//const DELIVERY_FEE = 300;

export default function Checkout() {
  const { items, subtotal, updateQty, removeFromCart, placeOrder, hydrated } = useCart();
  const router = useRouter();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", area: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const total = subtotal //+ DELIVERY_FEE;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address || !form.area) {
      setError("Please fill in name, email, phone, address and area.");
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const order = await placeOrder(form);
      addToast("Order placed — we will contact you shortly", { type: "success" });
      router.push({ pathname: "/confirm", query: { orderNumber: order.orderNumber, total: order.total } });
    } catch (err) {
      setError(err.message || "Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="section">
        <h1 style={{ fontSize: 20 }}>Checkout</h1>
        <form className="co-layout" style={{ marginTop: 18 }} onSubmit={placeOrderHandler}>
          <div className="co-form">
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Delivery details</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Full name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Wanjiru" />
              </div>
              <div className="form-field">
                <label>Phone number</label>
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XX XXX XXX" />
              </div>
            </div>
            <div className="form-field">
              <label>Email address</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
            </div>
            <div className="form-field">
              <label>Delivery address</label>
              <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, building, town" />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>County / area</label>
                <input required value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Nairobi" />
              </div>
              <div className="form-field">
                <label>Delivery note (optional)</label>
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Gate code, landmark…" />
              </div>
            </div>
            <h3 style={{ fontSize: 14, margin: "20px 0 12px" }}>Payment method</h3>
            <div className="pay-method">💵 Pay on delivery — cash or M-Pesa</div>
            {error && <p style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 12 }}>{error}</p>}
          </div>

          <div className="co-summary">
            <div className="summary-card">
              <h3 style={{ fontSize: 14, marginBottom: 14 }}>Order summary</h3>
              {hydrated && items.length === 0 && <div style={{ color: "var(--ink-faint)" }}>Cart is empty</div>}
              {items.map((i) => (
                <div key={i._id} className="summary-line" style={{ alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600 }}>{i.name}</span>
                    <button type="button" className="mini-btn" onClick={() => updateQty(i._id, i.qty - 1)}>-</button>
                    <span style={{ padding: "6px 10px", background: "var(--canvas)", borderRadius: 8 }}>{i.qty}</span>
                    <button type="button" className="mini-btn" onClick={() => updateQty(i._id, i.qty + 1)}>+</button>
                    <button
                      type="button"
                      onClick={() => {
                        removeFromCart(i._id);
                        addToast("Removed from cart", { type: "info" });
                      }}
                      style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                    >
                      Remove
                    </button>
                  </span>
                  <span>KSh {(i.price * i.qty).toLocaleString()}</span>
                </div>
              ))}
              
              <div className="summary-total">
                <span>Total</span>
                <span>KSh {total.toLocaleString()}</span>
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", background: "var(--forest)", color: "#fff", padding: 13, marginTop: 16 }}
                disabled={items.length === 0 || submitting}
              >
                {submitting ? "Placing order…" : "Place order — pay on delivery"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
