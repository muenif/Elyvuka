import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

export default function Listing() {
  const router = useRouter();
  const { search, category, minPrice, maxPrice, sort, page = "1" } = router.query;

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load categories once on initial mount
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  // Fetch products whenever route query changes
  useEffect(() => {
    if (!router.isReady) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getProducts({ search, category, minPrice, maxPrice, sort, page })
      .then((res) => {
        if (!isMounted) return;
        setProducts(res.data || []);
        setPagination({ page: res.page, pages: res.pages, total: res.total });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router.isReady, search, category, minPrice, maxPrice, sort, page]);

  const updateQuery = (patch) => {
    router.push(
      { pathname: "/listing", query: { ...router.query, ...patch, page: 1 } },
      undefined,
      { shallow: false }
    );
  };

  const goToPage = (p) => {
    router.push(
      { pathname: "/listing", query: { ...router.query, page: p } },
      undefined,
      { shallow: false }
    );
  };

  return (
    <Layout>
      <section className="section">
        <div className="breadcrumb">Home / Laptops</div>
        <h1 style={{ fontSize: 22 }}>
          Laptops{" "}
          <span style={{ color: "var(--ink-faint)", fontSize: 13, fontWeight: 400 }}>
            {pagination.total} results
          </span>
        </h1>

        <div className="listing-layout" style={{ marginTop: 12 }}>
          <aside className="filters" style={{ display: showFilters ? "block" : undefined }}>
            <div className="filter-block">
              <h4>Category</h4>
              {categories.map((c) => (
                <label key={c._id} className="filter-opt" style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="category"
                    checked={category === c._id}
                    onChange={() => updateQuery({ category: c._id })}
                    style={{ marginRight: 4 }}
                  />
                  {c.name}
                </label>
              ))}
              {category && (
                <button
                  className="tab-btn"
                  style={{ marginTop: 6, fontSize: 11 }}
                  onClick={() => updateQuery({ category: "" })}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="filter-block">
              <h4>Price</h4>
              {[
                { label: "Under KSh 40,000", min: "", max: "40000" },
                { label: "KSh 40,000 – 80,000", min: "40000", max: "80000" },
                { label: "Above KSh 80,000", min: "80000", max: "" },
              ].map((range) => (
                <label key={range.label} className="filter-opt" style={{ cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="price"
                    checked={minPrice === range.min && maxPrice === range.max}
                    onChange={() => updateQuery({ minPrice: range.min, maxPrice: range.max })}
                    style={{ marginRight: 4 }}
                  />
                  {range.label}
                </label>
              ))}
            </div>
          </aside>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <select
                value={sort || ""}
                onChange={(e) => updateQuery({ sort: e.target.value })}
                style={{ fontSize: 12, border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px" }}
              >
                <option value="">Sort: Most relevant</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
                <option value="newest">Newest first</option>
              </select>
              <button className="tab-btn" onClick={() => setShowFilters((s) => !s)}>
                Filters
              </button>
            </div>

            {loading && <p style={{ color: "var(--ink-faint)" }}>Loading…</p>}
            {error && (
              <EmptyState
                icon="⚠️"
                title="Couldn't load products"
                message="Something went wrong fetching results. Try again in a moment."
              />
            )}
            {!loading && !error && products.length === 0 && (
              <EmptyState
                icon="🔍"
                title="No matches for these filters"
                message={
                  search
                    ? `We couldn't find anything for "${search}". Try a different search or clear your filters.`
                    : "Try widening your price range or picking a different category."
                }
                actionLabel={category || minPrice || maxPrice || search ? "Clear all filters" : undefined}
                onAction={() => router.push({ pathname: "/listing" })}
              />
            )}

            <div className="grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            <Pagination page={pagination.page} pages={pagination.pages} onChange={goToPage} />
          </div>
        </div>
      </section>
    </Layout>
  );
}