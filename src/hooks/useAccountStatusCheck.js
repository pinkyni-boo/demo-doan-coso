import { useEffect } from "react";
import axios from "axios";
import { getToken, removeToken } from "../utils/tokenUtils";

export const useAccountStatusCheck = (user) => {
  useEffect(() => {
    if (!user || user.role !== "trainer") return;

    const checkAccountStatus = async () => {
      try {
        const token = getToken();
        if (!token) return;

        await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.log(
          "Account status check error:",
          error.response?.status,
          error.response?.data
        );

        // Chỉ logout khi tài khoản thực sự bị khóa
        if (
          error.response?.status === 403 &&
          error.response?.data?.isLocked === true
        ) {
          // Tài khoản bị khóa, logout tự động
          removeToken();
          alert(
            `Tài khoản của bạn đã bị khóa: ${
              error.response.data.reason || "Không rõ lý do"
            }`
          );

          // Only redirect if not already on login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        // Bỏ qua các lỗi khác (network, server error, etc.) để tránh logout không mong muốn
      }
    };

    // Kiểm tra ngay lập tức
    checkAccountStatus();

    // Kiểm tra mỗi 5 phút thay vì 30 giây để giảm tải
    const interval = setInterval(checkAccountStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
};
