import { useEffect } from "react";
import axios from "axios";

export const useAccountStatusCheck = (user) => {
  useEffect(() => {
    if (!user || user.role !== "trainer") return;

    const checkAccountStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Gọi API để kiểm tra trạng thái tài khoản
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
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          alert(
            `Tài khoản của bạn đã bị khóa: ${
              error.response.data.reason || "Không rõ lý do"
            }`
          );
          window.location.href = "/login";
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
