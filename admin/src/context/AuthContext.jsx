import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = "gym_admin_token";
const STORAGE_USER_KEY = "gym_admin_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY) || "");
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setToken("");
    setUser(null);
  }, []);

  const login = useCallback(async (payload) => {
    const result = await apiRequest({
      method: "POST",
      url: "/api/auth/login",
      data: payload,
    });

    const incomingUser = result?.data?.user;
    const incomingToken = result?.data?.token;

    if (!incomingUser || !incomingToken) {
      throw new Error("Phản hồi đăng nhập không hợp lệ");
    }

    if (!["admin", "staff"].includes(incomingUser.role)) {
      throw new Error("Tài khoản này không có quyền truy cập trang quản trị");
    }

    localStorage.setItem(STORAGE_TOKEN_KEY, incomingToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(incomingUser));

    setToken(incomingToken);
    setUser(incomingUser);

    return incomingUser;
  }, []);

  const refreshProfile = useCallback(async () => {
    const result = await apiRequest({ method: "GET", url: "/api/me" });
    const incomingUser = result?.data;

    if (!incomingUser || !["admin", "staff"].includes(incomingUser.role)) {
      logout();
      return null;
    }

    setUser(incomingUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(incomingUser));
    return incomingUser;
  }, [logout]);

  /**
   * 🌟 HÀM MỚI ĐƯỢC THÊM VÀO:
   * Cập nhật ngay lập tức thông tin user ở State nội bộ và LocalStorage 
   * giúp thanh Header đổi giao diện lập tức mà không cần gọi lại API
   */
  const updateUserState = useCallback((newFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...newFields };
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [logout, refreshProfile, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshProfile,
      updateUserState, // 👈 Đã thêm hàm mới vào đây để các component khác sử dụng được
    }),
    [token, user, loading, login, logout, refreshProfile, updateUserState] // 👈 Đã thêm dependency để tối ưu re-render
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}