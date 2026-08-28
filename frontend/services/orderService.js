import { apiRequest } from "./api";

const buildQuery = (params = {}) => {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return query ? `?${query}` : "";
};

// payload: { customer: {name, phone, address, area, note}, items: [{product, qty}] }
export const createOrder = (payload) =>
  apiRequest("/orders", { method: "POST", body: payload });

export const trackOrder = (orderNumber, phone) =>
  apiRequest(`/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);

// params: status, page, limit
export const getOrders = (params) => apiRequest(`/orders${buildQuery(params)}`, { auth: true });

export const getOrder = (id) => apiRequest(`/orders/${id}`, { auth: true });

export const updateOrderStatus = (id, status) =>
  apiRequest(`/orders/${id}/status`, { method: "PUT", body: { status }, auth: true });
