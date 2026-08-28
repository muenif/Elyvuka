import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/categoryService";

export default function AdminCategories() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getCategories().then((res) => setCategories(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        addToast("Category updated", { type: "success" });
      } else {
        await createCategory(form);
        addToast("Category created", { type: "success" });
      }
      resetForm();
      load();
    } catch (err) {
      addToast(err.message || "Something went wrong", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const edit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, description: c.description || "" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      addToast("Category deleted", { type: "info" });
      load();
    } catch (err) {
      addToast(err.message || "Could not delete category", { type: "error" });
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 260 }}>
          <h2 style={{ fontSize: 18, marginBottom: 14 }}>Categories</h2>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>Name</th><th>Description</th><th></th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.description || "—"}</td>
                    <td>
                      <span className="row-actions" onClick={() => edit(c)}>Edit</span>{" "}
                      <span className="row-actions" style={{ color: "var(--danger)", marginLeft: 8 }} onClick={() => remove(c._id)}>Delete</span>
                    </td>
                  </tr>
                ))}
                {!loading && categories.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--ink-faint)" }}>No categories yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="add-product-modal" style={{ flex: 1, minWidth: 280, position: "static" }}>
          <h3>{editingId ? "Edit category" : "Add category"}</h3>
          <form onSubmit={submit}>
            <div className="form-field">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Laptops" />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <button className="btn-primary" style={{ width: "100%", background: "var(--forest)", color: "#fff" }} disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Update category" : "Save category"}
            </button>
            {editingId && (
              <button type="button" className="tab-btn" style={{ width: "100%", marginTop: 8 }} onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
