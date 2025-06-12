import React from "react";
import {
  LayoutDashboard,
  Users,
  ImageIcon,
  Calendar,
  BarChart,
  CreditCard,
  UserCheck,
  Building,
  Dumbbell,
  ClipboardList,
  Crown,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminNav = ({ activeModule, setActiveModule }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      description: "Tổng quan hệ thống",
    },
    {
      id: "users",
      label: "Người dùng",
      icon: <Users size={20} />,
      description: "Quản lý tài khoản",
    },
    {
      id: "classes",
      label: "Lớp học",
      icon: <Calendar size={20} />,
      description: "Quản lý lớp tập",
    },
    {
      id: "attendance",
      label: "Điểm danh",
      icon: <ClipboardList size={20} />,
      description: "Theo dõi tham gia",
    },
    {
      id: "payments",
      label: "Thanh toán",
      icon: <CreditCard size={20} />,
      description: "Quản lý giao dịch",
    },
    {
      id: "memberships",
      label: "Thành viên",
      icon: <UserCheck size={20} />,
      description: "Quản lý thẻ thành viên",
    },
    {
      id: "services",
      label: "Dịch vụ",
      icon: <Dumbbell size={20} />,
      description: "Quản lý dịch vụ gym",
    },
    {
      id: "clubs",
      label: "CLB",
      icon: <Building size={20} />,
      description: "Quản lý câu lạc bộ",
    },
    {
      id: "images",
      label: "Hình ảnh",
      icon: <ImageIcon size={20} />,
      description: "Quản lý media",
    },
    {
      id: "stats",
      label: "Thống kê",
      icon: <BarChart size={20} />,
      description: "Báo cáo & phân tích",
    },
  ];

  return (
    <aside className="bg-gradient-to-b from-stone-800 via-stone-900 to-amber-900 text-white w-64 min-h-screen fixed left-0 top-0 pt-20 overflow-y-auto z-30 shadow-2xl border-r border-amber-700/30 mt-4">
      {/* Header with vintage styling */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-b border-amber-700/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold vintage-heading text-amber-100">
              Admin Panel
            </h2>
            <p className="text-amber-200/80 text-xs vintage-serif">
              Royal Fitness Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-4 pb-6">
        <div className="px-4 mb-4">
          <h3 className="text-amber-300 text-xs font-semibold uppercase tracking-wider vintage-sans">
            Quản lý hệ thống
          </h3>
        </div>

        <div className="space-y-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`group flex w-full items-center px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-lg ${
                activeModule === item.id
                  ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-golden transform scale-105"
                  : "text-stone-300 hover:text-white hover:bg-stone-700/50"
              }`}
            >
              <span
                className={`mr-4 transition-transform duration-300 ${
                  activeModule === item.id
                    ? "scale-110"
                    : "group-hover:scale-110"
                }`}
              >
                {item.icon}
              </span>
              <div className="text-left flex-1">
                <div
                  className={`text-sm font-medium vintage-sans ${
                    activeModule === item.id ? "text-white" : "text-stone-200"
                  }`}
                >
                  {item.label}
                </div>
                <div
                  className={`text-xs vintage-serif ${
                    activeModule === item.id
                      ? "text-amber-100"
                      : "text-stone-400"
                  }`}
                >
                  {item.description}
                </div>
              </div>
              {activeModule === item.id && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom section with logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-900 to-transparent border-t border-amber-700/30">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-4 py-3 text-stone-300 hover:text-white hover:bg-red-600/20 rounded-xl transition-all duration-300"
        >
          <LogOut className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="text-sm font-medium vintage-sans">Đăng xuất</div>
            <div className="text-xs text-stone-400 vintage-serif">
              Thoát khỏi admin
            </div>
          </div>
        </button>

        {/* Version info */}
        <div className="mt-4 pt-4 border-t border-stone-700/50 text-center">
          <p className="text-xs text-stone-500 vintage-serif">
            Royal Fitness v1.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default AdminNav;
