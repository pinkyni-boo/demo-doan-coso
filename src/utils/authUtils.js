// Utility functions để xử lý authentication
export const handleAccountLocked = (error) => {
  if (error.response?.status === 403 && error.response?.data?.isLocked) {
    // Tài khoản bị khóa, xóa token và redirect về login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Hiển thị thông báo
    alert(`Tài khoản đã bị khóa: ${error.response.data.reason || 'Tài khoản bị khóa bởi admin'}`);
    
    // Redirect về trang login
    window.location.href = '/login';
    return true;
  }
  return false;
};

export const setupAxiosInterceptors = (axios) => {
  // Interceptor để tự động xử lý lỗi 403 (tài khoản bị khóa)
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (handleAccountLocked(error)) {
        return Promise.reject(new Error('Account locked'));
      }
      return Promise.reject(error);
    }
  );
};