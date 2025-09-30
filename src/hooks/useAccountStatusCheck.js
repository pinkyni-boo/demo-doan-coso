import { useEffect } from 'react';
import axios from 'axios';

export const useAccountStatusCheck = (user) => {
  useEffect(() => {
    if (!user || user.role !== 'trainer') return;

    const checkAccountStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Gọi API để kiểm tra trạng thái tài khoản
        await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.isLocked) {
          // Tài khoản bị khóa, logout tự động
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          alert(`Tài khoản của bạn đã bị khóa: ${error.response.data.reason}`);
          window.location.href = '/login';
        }
      }
    };

    // Kiểm tra mỗi 30 giây
    const interval = setInterval(checkAccountStatus, 30000);

    return () => clearInterval(interval);
  }, [user]);
};