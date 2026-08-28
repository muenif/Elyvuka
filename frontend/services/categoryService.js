import { apiRequest } from "./api";

export const getCategories = () => apiRequest("/categories");

export const getCategory = (slug) => apiRequest(`/categories/${slug}`);

export const createCategory = (data) =>
  apiRequest("/categories", { method: "POST", body: data, auth: true });

export const updateCategory = (id, data) =>
  apiRequest(`/categories/${id}`, { method: "PUT", body: data, auth: true });

export const deleteCategory = (id) =>
  apiRequest(`/categories/${id}`, { method: "DELETE", auth: true });
