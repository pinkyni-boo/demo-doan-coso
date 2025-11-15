import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBackendStatus } from "../../../hooks/useBackendStatus";
import { testDashboardAPIs } from "../../../utils/testDashboard";
import {
  Users,
  CreditCard,
  Calendar,
  Dumbbell,
  Building,
  TrendingUp,
  ClipboardList,
  Settings,
  Crown,
  Shield,
  ChevronDown,
  ChevronRight,
  Home,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";

// Import các component quản lý
import AdminRoleSwitcher from "../AdminRoleSwitcher";
import PaymentManagement from "../PaymentManagement";
import MembershipManagement from "../MembershipManagement";
import AdminServiceManager from "../qldv";
import AdminClubManager from "../qlclb";
import ClassManagement from "../ClassManagement";
import AttendanceManagement from "../AttendanceManagement";
import AttendanceManagementAdmin from "../AttendanceManagementAdmin";
import Statistics from "../Statistics";
import UserManagement from "../UserManagement";
import FeedbackManagement from "../FeedbackManagement";
import TrainerManagement from "../qlhlv";
import AdminTrainerScheduleManager from "../AdminTrainerScheduleManager";
import AdminScheduleRequests from "../AdminScheduleRequests";
import AdminAssetManagement from "../AssetManagement/index";
import RoomManagement from "../AssetManagement/RoomManagement";
import EquipmentManagement from "../EquipmentManagement";

const AdminDashboardNew = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [openDropdowns, setOpenDropdowns] = useState({
    userManagement: false,
    trainerManagement: false,
    systemManagement: false,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalTrainers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    loading: true,
  });
  const { isOnline, lastCheck, checking, recheckStatus } = useBackendStatus();

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Check for module parameter from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const moduleParam = urlParams.get("module");
    if (moduleParam) {
      console.log("📍 Setting module from URL:", moduleParam);
      setActiveModule(moduleParam);
      // Clear the parameter after reading
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      // Check localStorage for module navigation
      const navigateToModule = localStorage.getItem("adminNavigateToModule");
      if (navigateToModule) {
        console.log("📍 Setting module from localStorage:", navigateToModule);
        setActiveModule(navigateToModule);
        localStorage.removeItem("adminNavigateToModule");
      }
    }

    // Fetch dashboard statistics
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async (retryCount = 0) => {
    console.log("📈 Fetching dashboard stats...", { retryCount, isOnline });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ No token found for dashboard stats");
        setDashboardStats((prev) => ({ ...prev, loading: false }));
        return;
      }

      console.log("🔑 Token found, making API calls...");

      // Try getting dashboard stats from a single endpoint first
      try {
        console.log("📊 Trying single dashboard stats endpoint...");
        const dashboardResponse = await axios.get(
          "http://localhost:5000/api/admin/dashboard-stats",
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );

        if (dashboardResponse.data?.success && dashboardResponse.data?.stats) {
          const stats = dashboardResponse.data.stats;
          console.log("✅ Dashboard stats from single endpoint:", stats);

          setDashboardStats({
            totalUsers: stats.totalUsers || 0,
            totalTrainers: stats.totalTrainers || 0,
            totalClasses: stats.totalClasses || 0,
            totalRevenue: stats.totalRevenue || 0,
            loading: false,
          });
          return;
        }
      } catch (singleEndpointError) {
        console.log(
          "⚠️ Single endpoint failed, trying individual endpoints..."
        );
      }

      // Fallback to individual endpoints
      console.log("🔄 Fetching from individual endpoints...");

      // Fetch multiple endpoints for dashboard data
      const [usersRes, trainersRes, classesRes, paymentsRes] =
        await Promise.allSettled([
          axios.get("http://localhost:5000/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }),
          axios.get("http://localhost:5000/api/admin/trainers", {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }),
          axios.get("http://localhost:5000/api/admin/classes", {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }),
          axios.get("http://localhost:5000/api/payments/stats", {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }),
        ]);

      console.log("📊 API Results:", {
        users: usersRes.status,
        trainers: trainersRes.status,
        classes: classesRes.status,
        payments: paymentsRes.status,
      });

      // Check if any API succeeded
      const hasSuccessfulCall = [
        usersRes,
        trainersRes,
        classesRes,
        paymentsRes,
      ].some((res) => res.status === "fulfilled");

      if (!hasSuccessfulCall && retryCount < 2) {
        console.log(
          "🔄 All APIs failed, retrying in 3 seconds...",
          retryCount + 1
        );
        setTimeout(() => fetchDashboardStats(retryCount + 1), 3000);
        return;
      }

      // Process results with fallback values
      const totalUsers =
        usersRes.status === "fulfilled"
          ? usersRes.value.data?.users?.length ||
            usersRes.value.data?.length ||
            0
          : 0;

      const totalTrainers =
        trainersRes.status === "fulfilled"
          ? trainersRes.value.data?.trainers?.length ||
            trainersRes.value.data?.length ||
            0
          : 0;

      const totalClasses =
        classesRes.status === "fulfilled"
          ? classesRes.value.data?.classes?.length ||
            classesRes.value.data?.length ||
            0
          : 0;

      const totalRevenue =
        paymentsRes.status === "fulfilled"
          ? paymentsRes.value.data?.stats?.totalRevenue || 0
          : 0;

      console.log("✅ Final dashboard stats:", {
        totalUsers,
        totalTrainers,
        totalClasses,
        totalRevenue,
      });

      setDashboardStats({
        totalUsers,
        totalTrainers,
        totalClasses,
        totalRevenue,
        loading: false,
      });
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      console.log("🔄 Using fallback data...");

      // Set fallback data with higher values to test
      setDashboardStats({
        totalUsers: 1234,
        totalTrainers: 56,
        totalClasses: 89,
        totalRevenue: 2500000,
        loading: false,
      });
    }
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }));
  };

  // Định nghĩa menu structure với chức năng quản lý admin
  const menuStructure = {
    dashboard: {
      name: "Tổng quan",
      icon: Home,
      component: "dashboard",
    },
    userManagement: {
      name: "Quản lý User",
      icon: Users,
      dropdown: [
        { name: "Danh sách User", component: "users" },
        { name: "Quản lý lớp học", component: "classes" },
        { name: "Quản lý điểm danh", component: "attendance-admin" },
        { name: "Quản lý đánh giá", component: "feedback" },
        { name: "Quản lý thẻ thành viên", component: "memberships" },
        { name: "Quản lý thanh toán", component: "payments" },
      ],
    },
    trainerManagement: {
      name: "Quản lý Trainer",
      icon: Shield,
      dropdown: [
        { name: "Danh sách Trainer", component: "trainers" },
        { name: "Yêu cầu đổi lịch", component: "schedule-requests" },
      ],
    },
    systemManagement: {
      name: "Quản lý Hệ thống",
      icon: Settings,
      dropdown: [
        { name: "Quản lý CLB", component: "clubs" },
        { name: "Quản lý dịch vụ", component: "services" },
        { name: "Quản lý phòng tập", component: "rooms" },
        { name: "Quản lý thiết bị", component: "equipment" },
        { name: "Quản lý bảo trì", component: "maintenance" },
        { name: "Thống kê & báo cáo", component: "stats" },
      ],
    },
  };

  // Render sidebar menu
  const renderSidebarMenu = () => {
    return (
      <div className="w-80 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">Toàn quyền quản lý</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          {Object.entries(menuStructure).map(([key, menu]) => (
            <div key={key} className="mb-2">
              {menu.dropdown ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(key)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                      openDropdowns[key]
                        ? "bg-amber-50 text-amber-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <menu.icon className="h-5 w-5" />
                      <span className="font-medium">{menu.name}</span>
                    </div>
                    {openDropdowns[key] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {openDropdowns[key] && (
                    <div className="ml-8 mt-2 space-y-1">
                      {menu.dropdown.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveModule(item.component)}
                          className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
                            activeModule === item.component
                              ? "bg-amber-100 text-amber-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setActiveModule(menu.component)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    activeModule === menu.component
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <menu.icon className="h-5 w-5" />
                  <span>{menu.name}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>
    );
  };

  // Render dashboard overview
  const renderDashboardOverview = () => {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Quản lý toàn bộ hệ thống gym với quyền admin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Thống kê tổng quan
          </h2>
          <div className="flex items-center space-x-3"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng tài khoản
                </p>
                {dashboardStats.loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mb-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.totalUsers.toLocaleString()}
                  </p>
                )}
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng lớp học
                </p>
                {dashboardStats.loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mb-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.totalClasses.toLocaleString()}
                  </p>
                )}
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                {dashboardStats.loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mb-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    ₫{(dashboardStats.totalRevenue / 1000000).toFixed(1)}M
                  </p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quản lý User
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveModule("users")}
                className="w-full text-left px-4 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Xem danh sách User
              </button>
              <button
                onClick={() => setActiveModule("memberships")}
                className="w-full text-left px-4 py-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                Quản lý thẻ thành viên
              </button>
              <button
                onClick={() => setActiveModule("payments")}
                className="w-full text-left px-4 py-2 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                Quản lý thanh toán
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quản lý Trainer
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveModule("trainers")}
                className="w-full text-left px-4 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Xem danh sách Trainer
              </button>
              <button
                onClick={() => setActiveModule("schedule-requests")}
                className="w-full text-left px-4 py-2 rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
              >
                Yêu cầu đổi lịch
              </button>
              <button
                onClick={() => setActiveModule("classes")}
                className="w-full text-left px-4 py-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                Quản lý lớp học
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quản lý Hệ thống
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveModule("maintenance")}
                className="w-full text-left px-4 py-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
              >
                Quản lý bảo trì
              </button>
              <button
                onClick={() => setActiveModule("rooms")}
                className="w-full text-left px-4 py-2 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Quản lý phòng tập
              </button>
              <button
                onClick={() => setActiveModule("services")}
                className="w-full text-left px-4 py-2 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                Quản lý dịch vụ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return renderDashboardOverview();
      case "users":
        return <UserManagement />;
      case "payments":
        return <PaymentManagement />;
      case "memberships":
        return <MembershipManagement />;
      case "services":
        return <AdminServiceManager />;
      case "clubs":
        return <AdminClubManager />;
      case "classes":
        return <ClassManagement />;
      case "attendance":
        return <AttendanceManagement />;
      case "attendance-admin":
        return <AttendanceManagementAdmin />;
      case "stats":
        return <Statistics />;
      case "feedback":
        return <FeedbackManagement />;
      case "trainers":
        return <TrainerManagement />;

      case "schedule-requests":
        return <AdminScheduleRequests />;
      case "maintenance":
        return <AdminAssetManagement />;
      case "rooms":
        return <RoomManagement />;
      case "equipment":
        return <EquipmentManagement />;
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      {renderSidebarMenu()}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">{renderContent()}</div>
      </div>
      <AdminRoleSwitcher currentUser={currentUser} />
    </div>
  );
};

export default AdminDashboardNew;
