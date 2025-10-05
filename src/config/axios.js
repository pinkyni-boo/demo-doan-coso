import axios from "axios";

// Thiết lập base URL cho API
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Interceptor để tự động thêm token vào headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Single response interceptor - consolidated error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific account locked case first
    if (
      error.response?.status === 403 &&
      error.response?.data?.isLocked === true &&
      error.response?.data?.reason
    ) {
      console.log("Account locked detected:", error.response.data);

      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Show message and redirect
      alert(`Tài khoản đã bị khóa: ${error.response.data.reason}`);
      window.location.href = "/login";

      return Promise.reject(new Error("Account locked"));
    }

    // Handle general auth errors (invalid/expired token)
    if (error.response?.status === 401) {
      console.log("Unauthorized access, clearing auth data");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if not already on login/signup pages
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/sign-up") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
