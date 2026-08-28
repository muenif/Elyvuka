import Link from "next/link";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { getRandomProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

export async function getStaticProps() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([getRandomProducts(8), getCategories()]);
    return {
      props: {
        initialProducts: productsRes.data,
        initialCategories: categoriesRes.data,
        loadError: null,
      },
      revalidate: 15,
    };
  } catch (err) {
    // Backend was unreachable at build/regenerate time - render the page
    // with an honest error state instead of failing the whole build.
    return {
      props: { initialProducts: [], initialCategories: [], loadError: err.message },
      revalidate: 10, // retry sooner than the normal 15s since something's wrong
    };
  }
}

export default function Home({ initialProducts, initialCategories, loadError }) {
  return (
    <Layout>
      <section className="section">
        <div className="hero">
          <div>
            <p className="eyebrow" style={{ color: "#BCE3CD" }}>Pay on delivery</p>
            <h1>Solid laptops. No surprises at checkout.</h1>
            <p>Browse specs, place an order in under a minute, and pay only when it arrives at your door.</p>
            <Link href="/listing"><button className="btn-primary">Shop laptops</button></Link>
          </div>
          <div className="laptop-mark" />
        </div>

        {initialCategories.length > 0 && (
          <div className="cat-row">
            {initialCategories.map((c) => (
              <Link key={c._id} href={`/listing?category=${c._id}`} style={{ textDecoration: "none", flex: 1, minWidth: 120 }}>
                <div className="cat-chip">{c.name}</div>
              </Link>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: 17, marginTop: 30 }}>Popular right now</h2>

        {loadError && (
          <EmptyState
            icon="⚠️"
            title="Couldn't load products right now"
            message="The store is temporarily unavailable. This page automatically retries in the background, so try refreshing shortly."
          />
        )}
        {!loadError && initialProducts.length === 0 && (
          <EmptyState
            icon="🛍️"
            title="Nothing on the shelves yet"
            message="We're setting things up — new laptops and accessories will appear here as soon as they're added."
          />
        )}

        <div className="grid">
          {initialProducts.map((p, i) => (
            <ProductCard key={p._id} product={p} priority={i < 4} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
