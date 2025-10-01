// Utility functions để xử lý authentication
export const handleAccountLocked = (error) => {
  // Chỉ xử lý khi thực sự là lỗi account locked
  if (error.response?.status === 403 && 
      error.response?.data?.isLocked === true && 
      error.response?.data?.reason) {
    
    console.log('Account locked detected:', error.response.data);
    
    // Tài khoản bị khóa, xóa token và redirect về login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Hiển thị thông báo
    alert(`Tài khoản đã bị khóa: ${error.response.data.reason}`);
    
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
      // Chỉ xử lý account locked, bỏ qua các lỗi 403 khác
      if (error.response?.status === 403 && 
          error.response?.data?.isLocked === true) {
        handleAccountLocked(error);
        return Promise.reject(new Error('Account locked'));
      }
      
      // Log các lỗi khác để debug
      if (error.response?.status >= 400) {
        console.log('API Error:', error.response.status, error.response.data);
      }
      
      return Promise.reject(error);
    }
  );
};