export default function EmptyState({ icon = "🔍", title, message, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {actionLabel && onAction && (
        <button className="btn-primary" style={{ background: "var(--forest)", color: "#fff", marginTop: 14 }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
