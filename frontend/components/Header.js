import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import { getProducts } from "../services/productService";

export default function Header() {
  const { count, hydrated } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const wrapRef = useRef();
  const debounceRef = useRef();

  const submit = (e) => {
    e?.preventDefault();
    const q = query.trim();
    router.push({ pathname: "/listing", query: q ? { search: q } : {} });
    setShowSuggestions(false);
    setMenuOpen(false);
    setMobileSearchOpen(false);
  };

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      getProducts({ search: query.trim(), limit: 5 })
        .then((res) => setSuggestions(res.data))
        .catch(() => setSuggestions([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handle = () => {
      setMenuOpen(false);
      setMobileSearchOpen(false);
      setShowSuggestions(false);
    };
    router.events.on("routeChangeStart", handle);
    return () => router.events.off("routeChangeStart", handle);
  }, [router.events]);

  const goToProduct = (slug) => {
    router.push(`/product/${slug}`);
    setQuery("");
    setShowSuggestions(false);
    setMobileSearchOpen(false);
  };

  const SuggestionsDropdown = () =>
    showSuggestions && query.trim().length >= 2 ? (
      <div className="search-suggestions">
        {searching && <div className="suggestion-status">Searching…</div>}
        {!searching && suggestions.length === 0 && (
          <div className="suggestion-status">No matches for "{query.trim()}"</div>
        )}
        {!searching &&
          suggestions.map((p) => (
            <div key={p._id} className="suggestion-item" onClick={() => goToProduct(p.slug)}>
              <div className="suggestion-thumb">
                {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} /> : "💻"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="suggestion-name">{p.name}</div>
                <div className="suggestion-price">KSh {p.price?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        {!searching && suggestions.length > 0 && (
          <div className="suggestion-viewall" onClick={submit}>
            View all results for "{query.trim()}" →
          </div>
        )}
      </div>
    ) : null;

  return (
    <header>
      <div className="top-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" className="logo" style={{ color: "#fff", textDecoration: "none" }}>
            ELYVUKA
          </Link>
          <nav className="nav-links" role="navigation" aria-label="Main navigation">
            <Link href="/" className={router.pathname === "/" ? "nav-link active" : "nav-link"}>
              Home
            </Link>
            <Link href="/listing" className={router.pathname === "/listing" ? "nav-link active" : "nav-link"}>
              Laptops
            </Link>
            <Link href="/track" className={router.pathname === "/track" ? "nav-link active" : "nav-link"}>
              Track order
            </Link>
            <a href="tel:0737766052" className="nav-link">For more info: 0737766052</a>
          </nav>
        </div>
        <div className="nav-actions">
          <div className="search-wrap desktop-search" ref={wrapRef}>
            <form onSubmit={submit} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                aria-label="Search"
                placeholder="Search laptops, brands, specs…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="search-bar"
              />
              <button type="submit" className="icon-btn" aria-label="Search">🔍</button>
            </form>
            <SuggestionsDropdown />
          </div>

          <button className="icon-btn search-icon-mobile" aria-label="Search" onClick={() => setMobileSearchOpen((s) => !s)}>
            🔍
          </button>

          <Link href="/checkout">
            <div className="icon-btn">
              🛒<span className="badge">{hydrated ? count : ""}</span>
            </div>
          </Link>
          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((s) => !s)}
          >
            ☰
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="mobile-search-overlay" ref={wrapRef}>
          <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
            <input
              autoFocus
              aria-label="Search"
              placeholder="Search laptops, brands, specs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="search-bar"
              style={{ flex: 1 }}
            />
            <button type="submit" className="icon-btn" aria-label="Search">🔍</button>
          </form>
          <SuggestionsDropdown />
        </div>
      )}

      <div className={`mobile-menu ${menuOpen ? "show" : ""}`} role="menu" aria-hidden={!menuOpen}>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
          <Link href="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/listing" className="nav-link" onClick={() => setMenuOpen(false)}>Laptops</Link>
          <Link href="/track" className="nav-link" onClick={() => setMenuOpen(false)}>Track order</Link>
          <Link href="/checkout" className="nav-link" onClick={() => setMenuOpen(false)}>Cart</Link>
          <a href="tel:0737766052" className="nav-link" onClick={() => setMenuOpen(false)}>For more info: 0737766052</a>
        </nav>
      </div>
    </header>
  );
}