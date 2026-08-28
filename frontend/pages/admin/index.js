import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { getOrders } from "../../services/orderService";
import { getProducts } from "../../services/productService";

const STATUS_CLASS = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  out_for_delivery: "status-out",
  delivered: "status-delivered",
  cancelled: "status-lowstock",
};

export default function AdminDashboard() {
  const { isAuthenticated, checked } = useAdminAuth();
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until AdminAuthContext has actually confirmed a valid session -
    // otherwise this fires with no token and the API correctly rejects it.
    if (!checked || !isAuthenticated) return;

    Promise.all([
      getOrders({ limit: 5 }),
      getOrders({ status: "pending", limit: 1 }),
      getProducts({ limit: 1 }),
    ])
      .then(([recent, pending, prods]) => {
        setRecentOrders(recent.data);
        setStats({ totalOrders: recent.total, pendingOrders: pending.total, totalProducts: prods.total });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [checked, isAuthenticated]);

  return (
    <AdminLayout>
      <h2 style={{ fontSize: 18 }}>Dashboard</h2>
      <div className="metric-grid" style={{ marginTop: 16 }}>
        <div className="metric-card">
          <div className="label">Total orders</div>
          <div className="value">{loading ? "…" : stats.totalOrders}</div>
        </div>
        <div className="metric-card">
          <div className="label">Pending confirmation</div>
          <div className="value">{loading ? "…" : stats.pendingOrders}</div>
        </div>
        <div className="metric-card">
          <div className="label">Total products</div>
          <div className="value">{loading ? "…" : stats.totalProducts}</div>
        </div>
      </div>

      <h3 style={{ fontSize: 14, marginBottom: 10 }}>Recent orders</h3>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.customer?.name}</td>
                <td>KSh {o.total?.toLocaleString()}</td>
                <td><span className={`status-pill ${STATUS_CLASS[o.status]}`}>{o.status.replace(/_/g, " ")}</span></td>
              </tr>
            ))}
            {!loading && recentOrders.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--ink-faint)" }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
