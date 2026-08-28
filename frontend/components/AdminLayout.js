import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAdminAuth } from "../context/AdminAuthContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/products", label: "Products", icon: "💻" },
  { href: "/admin/categories", label: "Categories", icon: "🗂" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
];

export default function AdminLayout({ children }) {
  const { isAuthenticated, checked, admin, logout } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (checked && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [checked, isAuthenticated, router]);

  if (!checked) {
    return (
      <div className="section" style={{ textAlign: "center", color: "var(--ink-faint)" }}>
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) return null; // redirect is in flight

  return (
    <div className="admin-shell">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <span style={{ background: "var(--mint)", width: 8, height: 8, borderRadius: "50%", display: "inline-block" }} />
          ELYVUKA Admin
        </div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-item ${router.pathname === item.href ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            {item.icon} {item.label}
          </Link>
        ))}
        <div
          className="admin-nav-item"
          style={{ marginTop: 20, cursor: "pointer" }}
          onClick={logout}
        >
          ⎋ Logout
        </div>
      </div>
      <div className="admin-main">
        <div className="admin-topbar">
          <div />
          <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>Hi, {admin?.name || "Admin"} 👋</span>
        </div>
        {children}
      </div>
    </div>
  );
}
