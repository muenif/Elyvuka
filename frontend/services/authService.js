import { apiRequest, setToken, clearToken } from "./api";

export const login = async (email, password) => {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setToken(res.data.token);
  return res.data;
};

export const getMe = async () => {
  const res = await apiRequest("/auth/me", { auth: true });
  return res.data;
};

export const logout = () => {
  clearToken();
};
