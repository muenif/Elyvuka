import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Pagination from "../../components/Pagination";
import { useToast } from "../../context/ToastContext";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { getOrders, updateOrderStatus } from "../../services/orderService";

const STATUS_CLASS = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  out_for_delivery: "status-out",
  delivered: "status-delivered",
  cancelled: "status-lowstock",
};

const STATUSES = ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"];

export default function AdminOrders() {
  const { addToast } = useToast();
  const { isAuthenticated, checked } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = (page = 1) => {
    setLoading(true);
    getOrders({ status: statusFilter, page })
      .then((res) => {
        setOrders(res.data);
        setPagination({ page: res.page, pages: res.pages });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!checked || !isAuthenticated) return;
    load(1);
  }, [checked, isAuthenticated, statusFilter]);

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      addToast("Order status updated", { type: "success" });
      load(pagination.page);
    } catch (err) {
      addToast(err.message || "Could not update status", { type: "error" });
    }
  };

  return (
    <AdminLayout>
      <div className="admin-topbar">
        <h2 style={{ fontSize: 18 }}>Orders</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ fontSize: 12, border: "1px solid var(--line)", borderRadius: 8, padding: "6px 10px" }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Email</th><th>Phone</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.customer?.name}</td>
                <td>{o.customer?.email}</td>
                <td>{o.customer?.phone}</td>
                <td>KSh {o.total?.toLocaleString()}</td>
                <td><span className={`status-pill ${STATUS_CLASS[o.status]}`}>{o.status.replace(/_/g, " ")}</span></td>
                <td>
                  <select value={o.status} onChange={(e) => changeStatus(o._id, e.target.value)} style={{ fontSize: 12, border: "1px solid var(--line)", borderRadius: 6, padding: "4px 6px" }}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--ink-faint)" }}>No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={pagination.page} pages={pagination.pages} onChange={load} />
    </AdminLayout>
  );
}
