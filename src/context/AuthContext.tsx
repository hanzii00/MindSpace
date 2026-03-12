import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api.get("/api/auth/me/")
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await api.post("/api/auth/login/", { email, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    const { data: me } = await api.get("/api/auth/me/");
    setUser(me);
    return me;
  };

const register = async (name: string, email: string, password: string): Promise<User> => {
    await api.post("/api/auth/register/", { name, email, password }); // was username: name
    return await login(email, password);
};

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};