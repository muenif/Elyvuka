import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getProducts, createProduct, updateProduct, deleteProduct, deleteProductImage } from "../../services/productService";
import { getCategories } from "../../services/categoryService";

const emptyForm = {
  name: "",
  brand: "",
  category: "",
  price: "",
  stock: "",
  sku: "",
  description: "",
  processor: "",
  ram: "",
  storage: "",
  display: "",
};

export default function AdminProducts() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletingImage, setDeletingImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts({ limit: 50 }).then((res) => setProducts(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFiles([]);
    setExistingImages([]);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      brand: p.brand || "",
      category: p.category?._id || p.category || "",
      price: p.price,
      stock: p.stock,
      sku: p.sku || "",
      description: p.description || "",
      processor: p.specs?.processor || "",
      ram: p.specs?.ram || "",
      storage: p.specs?.storage || "",
      display: p.specs?.display || "",
    });
    setFiles([]);
    setExistingImages(p.images || []);
    setShowModal(true);
  };

  const removeExistingImage = async (publicId) => {
    if (!confirm("Remove this image from the product?")) return;
    setDeletingImage(publicId);
    try {
      await deleteProductImage(editingId, publicId);
      setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
      addToast("Image removed", { type: "info" });
      load();
    } catch (err) {
      addToast(err.message || "Could not remove image", { type: "error" });
    } finally {
      setDeletingImage(null);
    }
  };

  const removeSelectedFile = (index) => {
    setFiles((prev) => Array.from(prev).filter((_, i) => i !== index));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("brand", form.brand);
    fd.append("category", form.category);
    fd.append("price", form.price);
    fd.append("stock", form.stock);
    fd.append("sku", form.sku);
    fd.append("description", form.description);
    fd.append(
      "specs",
      JSON.stringify({ processor: form.processor, ram: form.ram, storage: form.storage, display: form.display })
    );
    Array.from(files).forEach((file) => fd.append("images", file));
    return fd;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      addToast("Name, category and price are required", { type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const fd = buildFormData();
      if (editingId) {
        await updateProduct(editingId, fd);
        addToast("Product updated", { type: "success" });
      } else {
        await createProduct(fd);
        addToast("Product created", { type: "success" });
      }
      setShowModal(false);
      load();
    } catch (err) {
      addToast(err.message || "Something went wrong", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      addToast("Product deleted", { type: "info" });
      load();
    } catch (err) {
      addToast(err.message || "Could not delete product", { type: "error" });
    }
  };

  return (
    <AdminLayout>
      <div className="admin-topbar" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 18 }}>Products</h2>
        <button className="btn-primary" style={{ background: "var(--forest)", color: "#fff" }} onClick={openAdd}>
          + Add product
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category?.name || "—"}</td>
                <td>KSh {p.price?.toLocaleString()}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={`status-pill ${p.stock === 0 ? "status-lowstock" : p.stock < 5 ? "status-lowstock" : "status-confirmed"}`}>
                    {p.stock === 0 ? "Out of stock" : p.stock < 5 ? "Low stock" : "Active"}
                  </span>
                </td>
                <td>
                  <span className="row-actions" onClick={() => openEdit(p)}>Edit</span>{" "}
                  <span className="row-actions" style={{ color: "var(--danger)", marginLeft: 8 }} onClick={() => remove(p._id)}>Delete</span>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--ink-faint)" }}>No products yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,61,46,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
          onClick={() => setShowModal(false)}
        >
          <div className="add-product-modal" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Edit product" : "Add product"}</h3>
            <form onSubmit={submit}>
              <div className="form-field">
                <label>Product name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. HP EliteBook 840 G8" />
              </div>
              <div className="form-field">
                <label>Brand</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="HP" />
              </div>
              <div className="form-field">
                <label>Category</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Price (KSh)</label>
                  <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="68500" />
                </div>
                <div className="form-field">
                  <label>Stock qty</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="12" />
                </div>
              </div>
              <div className="form-field">
                <label>SKU (optional)</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Processor</label>
                  <input value={form.processor} onChange={(e) => setForm({ ...form, processor: e.target.value })} placeholder="i5-1135G7" />
                </div>
                <div className="form-field">
                  <label>RAM</label>
                  <input value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} placeholder="16GB" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Storage</label>
                  <input value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} placeholder="512GB SSD" />
                </div>
                <div className="form-field">
                  <label>Display</label>
                  <input value={form.display} onChange={(e) => setForm({ ...form, display: e.target.value })} placeholder="14 inch FHD" />
                </div>
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Product images {editingId ? "(new ones add to existing)" : ""}</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                />
              </div>

              {existingImages.length > 0 && (
                <div className="form-field">
                  <label>Current images</label>
                  <div className="image-preview-grid">
                    {existingImages.map((img) => (
                      <div key={img.publicId} className="image-preview-tile">
                        <img src={img.url} alt="" />
                        <button
                          type="button"
                          className="image-remove-btn"
                          disabled={deletingImage === img.publicId}
                          onClick={() => removeExistingImage(img.publicId)}
                          aria-label="Remove image"
                        >
                          {deletingImage === img.publicId ? "…" : "×"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {files.length > 0 && (
                <div className="form-field">
                  <label>New images to upload</label>
                  <div className="image-preview-grid">
                    {files.map((file, i) => (
                      <div key={`${file.name}-${i}`} className="image-preview-tile">
                        <img src={URL.createObjectURL(file)} alt="" />
                        <button
                          type="button"
                          className="image-remove-btn"
                          onClick={() => removeSelectedFile(i)}
                          aria-label="Remove from upload"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn-primary" style={{ width: "100%", background: "var(--forest)", color: "#fff" }} disabled={submitting}>
                {submitting ? "Saving…" : "Save product"}
              </button>
              <button type="button" className="tab-btn" style={{ width: "100%", marginTop: 8 }} onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
