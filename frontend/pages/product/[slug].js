import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import ImageSlideshow from "../../components/ImageSlideshow";
import { getProduct } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

const SPEC_LABELS = {
  processor: "Processor",
  ram: "RAM",
  storage: "Storage",
  display: "Display",
  graphics: "Graphics",
  battery: "Battery",
  warranty: "Warranty",
};

// No paths are pre-built at deploy time - the first visitor to a given slug
// triggers a server-side render (fallback: "blocking"), and the HTML is then
// cached and reused for every subsequent visitor until it revalidates. This
// replaces a client-side fetch + spinner with content that's ready on arrival.
export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  try {
    const res = await getProduct(params.slug);
    return {
      props: { product: res.data },
      revalidate: 30,
    };
  } catch (err) {
    // Covers both a genuine 404 and a temporarily unreachable backend -
    // either way, show the "not found" state rather than failing the build.
    return { notFound: true, revalidate: 10 };
  }
}

export default function ProductPage({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  if (!product) {
    return (
      <Layout>
        <div className="section">Product not found.</div>
      </Layout>
    );
  }

  const inStock = product.stock > 0;
  const specEntries = Object.entries(product.specs || {}).filter(([, v]) => v);

  return (
    <Layout>
      <div className="section">
        <div className="breadcrumb">Home / {product.category?.name || "Laptops"} / {product.name}</div>
        <div className="pd-layout">
          <ImageSlideshow images={product.images || []} alt={product.name} />
          <div className="pd-buy">
            <div className="buy-box">
              <p className="eyebrow">{product.category?.name} {product.brand ? `· ${product.brand}` : ""}</p>
              <h2 style={{ fontSize: 19 }}>{product.name}</h2>
              <div className="price-lg">KSh {product.price?.toLocaleString()}</div>
              <div className="stock-line" style={{ color: inStock ? "var(--mint-deep)" : "var(--danger)" }}>
                ● {inStock ? `In stock — ${product.stock} available` : "Out of stock"}
              </div>
              <button
                className="btn-primary"
                style={{ width: "100%", background: "var(--forest)", color: "#fff", padding: 13 }}
                disabled={!inStock}
                onClick={() => {
                  addToCart(product);
                  router.push("/checkout");
                }}
              >
                Order now, pay on delivery
              </button>
              <button
                className="btn-ghost"
                style={{ width: "100%", borderColor: "var(--line)", color: "var(--forest)", marginTop: 8 }}
                disabled={!inStock}
                onClick={() => {
                  addToCart(product);
                  addToast(`${product.name} added to cart`, { type: "success" });
                }}
              >
                Add to cart
              </button>

              {specEntries.length > 0 && (
                <table className="spec-table">
                  <tbody>
                    {specEntries.map(([key, value]) => (
                      <tr key={key}>
                        <td>{SPEC_LABELS[key] || key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {product.description && (
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 14 }}>{product.description}</p>
              )}

              <div className="cod-note">
                💬 Pay on delivery: our rider confirms the order by phone, delivers to your address, and you pay cash or M-Pesa on arrival.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
