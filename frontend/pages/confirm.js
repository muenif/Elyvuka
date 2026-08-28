import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function Confirm() {
  const router = useRouter();
  const { orderNumber, total } = router.query;

  return (
    <Layout>
      <div className="section conf-wrap">
        <div className="conf-check">✓</div>
        <h1 style={{ fontSize: 22 }}>Order placed</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 8 }}>
          We've sent the details to your email and notified our team.
        </p>
        <div className="order-id">{orderNumber ? `Order #${orderNumber}` : "Order confirmed"}</div>
        {total && (
          <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            Total to pay on delivery: <strong>KSh {Number(total).toLocaleString()}</strong>
          </p>
        )}
        <div className="steps-row">
          <div className="step"><div className="dot">1</div><p>Order<br />received</p></div>
          <div className="step"><div className="dot">2</div><p>Confirmed<br />by phone</p></div>
          <div className="step"><div className="dot">3</div><p>Out for<br />delivery</p></div>
          <div className="step"><div className="dot">4</div><p>Delivered,<br />pay rider</p></div>
        </div>
        <Link href="/track"><button className="btn-primary" style={{ background: "var(--forest)", color: "#fff" }}>Track this order</button></Link>
      </div>
    </Layout>
  );
}
