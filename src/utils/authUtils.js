// Utility functions để xử lý authentication
export const handleAccountLocked = (error) => {
  // Chỉ xử lý khi thực sự là lỗi account locked
  if (
    error.response?.status === 403 &&
    error.response?.data?.isLocked === true &&
    error.response?.data?.reason
  ) {
    console.log("Account locked detected:", error.response.data);

    // Tài khoản bị khóa, xóa token và redirect về login
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Hiển thị thông báo
    alert(`Tài khoản đã bị khóa: ${error.response.data.reason}`);

    // Redirect về trang login
    window.location.href = "/login";
    return true;
  }
  return false;
};

// Simplified setup - no longer adding duplicate interceptors
export const setupAxiosInterceptors = (axios) => {
  // Interceptors are now handled in config/axios.js to avoid duplication
  console.log("Axios interceptors already configured in config/axios.js");
};
