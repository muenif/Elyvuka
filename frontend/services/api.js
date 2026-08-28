const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "lh_admin_token";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Wraps fetch with base URL, JSON/FormData body handling, and Bearer auth.
 * @param {string} path - e.g. "/products" or "/orders/123"
 * @param {object} options - { method, body, auth }
 */
export const apiRequest = async (path, options = {}) => {
  const { method = "GET", body, auth = false, ...rest } = options;

  const headers = { ...(rest.headers || {}) };
  let finalBody = body;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body && !isFormData) {
    headers["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: finalBody,
    ...rest,
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
};
