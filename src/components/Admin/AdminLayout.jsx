import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminNav from "./AdminNav";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const checkAdminAuth = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          navigate("/login");
          return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "admin") {
          toast.error("Bạn không có quyền truy cập trang này");
          navigate("/");
        }
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Phiên đăng nhập không hợp lệ");
        navigate("/login");
      }
    };

    checkAdminAuth();
  }, [navigate]);

  // Pass through any props to children (particularly activeModule and setActiveModule)
  return <div className="min-h-screen bg-gray-100 pt-16">{children}</div>;
};

export default AdminLayout;
