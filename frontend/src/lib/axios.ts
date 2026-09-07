import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Interceptor Instance
export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper kiểm tra Token JWT đã hết hạn chưa
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;
    // Kiểm tra hết hạn (đệm trước 5 giây)
    return Date.now() >= exp * 1000 - 5000;
  } catch (e) {
    return true;
  }
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Hàm xử lý đăng xuất & chuyển hướng về trang /login khi Token hết hạn hoàn toàn
export const handleLogoutAndRedirect = () => {
  useAuthStore.getState().logout();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
};

const requestHandler = (config: any) => {
  const token =
    useAuthStore.getState().token ||
    (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const responseErrorHandler = async (error: any) => {
  const originalRequest = error.config;
  if (!originalRequest) return Promise.reject(error);

  // Nếu trả về lỗi 401 Unauthorized và chưa từng thử Retry Refresh Token
  if (error.response?.status === 401 && !originalRequest._retry) {
    // Nếu chính request login hoặc refresh bị 401 -> Logout và về /login luôn
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      handleLogoutAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken =
      useAuthStore.getState().refreshToken ||
      (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);

    if (!refreshToken || isTokenExpired(refreshToken)) {
      isRefreshing = false;
      handleLogoutAndRedirect();
      return Promise.reject(error);
    }

    try {
      // Gọi API /auth/refresh cấp Access Token mới
      const res = await axios.post(`${API_BASE}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: newRefreshToken, user, permissions } = res.data;

      // Cập nhật lại Zustand state & localStorage
      useAuthStore.getState().login(user, permissions, access_token, newRefreshToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }
      }

      axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      originalRequest.headers.Authorization = `Bearer ${access_token}`;

      processQueue(null, access_token);
      isRefreshing = false;

      // Thử lại request ban đầu với Token mới
      return axios(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      isRefreshing = false;
      handleLogoutAndRedirect();
      return Promise.reject(refreshErr);
    }
  }

  return Promise.reject(error);
};

// Đăng ký Interceptors toàn cục cho cả axios gốc lẫn api instance
api.interceptors.request.use(requestHandler, (error) => Promise.reject(error));
api.interceptors.response.use((r) => r, responseErrorHandler);

axios.interceptors.request.use(requestHandler, (error) => Promise.reject(error));
axios.interceptors.response.use((r) => r, responseErrorHandler);

export default api;
