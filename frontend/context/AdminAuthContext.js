import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import * as authService from "../services/authService";
import { getToken } from "../services/api";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setChecked(true);
      return;
    }
    authService
      .getMe()
      .then((data) => setAdmin(data))
      .catch(() => authService.logout())
      .finally(() => setChecked(true));
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setAdmin(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setAdmin(null);
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, checked, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
