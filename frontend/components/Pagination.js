export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 24 }}>
      <button className="tab-btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Prev
      </button>
      <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
        Page {page} of {pages}
      </span>
      <button className="tab-btn" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </div>
  );
}
