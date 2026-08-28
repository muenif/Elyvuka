import { useToast } from "../context/ToastContext";

export default function Toasts() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
