import axios from "axios";
import { getToken, removeToken } from "../utils/tokenUtils.js";

// Thiết lập base URL cho API
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Interceptor để tự động thêm token vào headers
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Request sent with token:", `${token.substring(0, 20)}...`);
    } else {
      console.log("Request sent without token");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      console.log("401 error detected, removing token");
      removeToken();

      // Only redirect if not already on login page to prevent loops
      if (window.location.pathname !== "/login") {
        console.log("Redirecting to login page");
        window.location.href = "/login";
      } else {
        console.log("Already on login page, not redirecting");
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
