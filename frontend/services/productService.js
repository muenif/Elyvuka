import { apiRequest } from "./api";

const buildQuery = (params = {}) => {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return query ? `?${query}` : "";
};

// params: search, category, brand, minPrice, maxPrice, inStock, sort, page, limit
export const getProducts = (params) => apiRequest(`/products${buildQuery(params)}`);

export const getRandomProducts = (limit = 8) => apiRequest(`/products/random?limit=${limit}`);

export const getProduct = (slug) => apiRequest(`/products/${slug}`);

// formData fields: name, brand, description, category, price, stock, sku, specs (JSON string), images (files)
export const createProduct = (formData) =>
  apiRequest("/products", { method: "POST", body: formData, auth: true });

export const updateProduct = (id, formData) =>
  apiRequest(`/products/${id}`, { method: "PUT", body: formData, auth: true });

export const deleteProductImage = (productId, publicId) =>
  apiRequest(`/products/${productId}/images/${encodeURIComponent(publicId)}`, { method: "DELETE", auth: true });

export const deleteProduct = (id) =>
  apiRequest(`/products/${id}`, { method: "DELETE", auth: true });
