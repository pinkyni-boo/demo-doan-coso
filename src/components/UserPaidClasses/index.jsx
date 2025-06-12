import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";

export default function PaidClassesPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [paidClasses, setPaidClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [registeredClasses, setRegisteredClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Decode token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const payload = jwtDecode(token);
      setUserId(payload.userId);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch user info + paid registrations
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [userRes, regRes] = await Promise.all([
          fetch(`http://localhost:5000/api/users/${userId}`),
          fetch(`http://localhost:5000/api/registrations/user/${userId}`),
        ]);

        const userInfo = await userRes.json();
        const regs = await regRes.json();

        if (!userRes.ok) throw new Error("User API error");
        if (!regRes.ok) throw new Error("Registrations API error");

        setUserData({
          name: userInfo.username,
          email: userInfo.email,
          phone: userInfo.phone || "",
          avatar:
            userInfo.avatar ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(userInfo.username) +
              "&background=0D8ABC&color=fff",
        });

        // Chỉ lấy các đăng ký đã thanh toán
        const paidRegs = regs.filter((reg) => reg.paymentStatus);

        // Loại bỏ trùng lịch học theo schedule._id
        const uniquePaid = paidRegs.filter(
          (reg, idx, arr) =>
            idx === arr.findIndex((r) => r.schedule._id === reg.schedule._id)
        );

        // Fetch thông tin chi tiết của từng lịch học
        const scheduleDetails = await Promise.all(
          uniquePaid.map(async ({ schedule, registrationDate }) => {
            // Gửi yêu cầu lấy chi tiết lịch học từ API schedules
            const scheduleRes = await fetch(
              `http://localhost:5000/api/schedules/${schedule._id}`
            );
            if (!scheduleRes.ok) throw new Error("Schedule API error");

            const scheduleInfo = await scheduleRes.json();

            return {
              ...scheduleInfo, // Lấy tất cả thông tin lịch học từ API
              className: schedule.className || scheduleInfo.className,
              instructor: scheduleInfo.instructor || "Chưa cập nhật",
              startTime: scheduleInfo.startTime,
              endTime: scheduleInfo.endTime,
              registrationDate: registrationDate || new Date().toISOString(),
              status: scheduleInfo.status || "active",
              service: scheduleInfo.service || "FITNESS",
              location: scheduleInfo.location || "Phòng tập chính",
              rating: Math.floor(Math.random() * 5) + 1, // Mô phỏng điểm đánh giá
              attendees: Math.floor(Math.random() * 15) + 5, // Mô phỏng số người tham gia
            };
          })
        );

        // Cập nhật lại danh sách các lớp đã thanh toán
        setRegisteredClasses(scheduleDetails);
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    const days = [
      "Chủ Nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return days[date.getDay()];
  };

  const getServiceColor = (service) => {
    switch (service?.toUpperCase()) {
      case "FITNESS":
        return "bg-blue-500";
      case "YOGA":
        return "bg-purple-500";
      case "ZUMBA":
        return "bg-pink-500";
      case "DANCE COVER":
        return "bg-yellow-500";
      case "BOXING":
        return "bg-red-500";
      case "MUAY THAI":
        return "bg-orange-500";
      case "CYCLING":
        return "bg-green-500";
      case "PERSONAL TRAINER":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  const getServiceIcon = (service) => {
    switch (service?.toUpperCase()) {
      case "FITNESS":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        );
      case "YOGA":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
    }
  };

  const isUpcoming = (dateString) => {
    const classDate = new Date(dateString);
    const today = new Date();
    return classDate >= today;
  };

  const filteredClasses = registeredClasses
    .filter((cls) => {
      // Filter by tab
      if (activeTab === "upcoming") return isUpcoming(cls.date);
      return !isUpcoming(cls.date);
    })
    .filter((cls) => {
      // Filter by search term
      if (!searchTerm) return true;
      return (
        cls.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.service?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const handleClassClick = (cls) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const generateStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">
          Đang tải thông tin...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 pt-24 pb-12 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg"
                  src={userData.avatar}
                  alt={userData.name}
                />
              </div>
              <div className="ml-5">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Xin chào, {userData.name}
                </h1>
                <p className="text-purple-100 mt-1">{userData.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-4">
        {/* Title and Search Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Các Lớp Học Của Bạn
            </h2>
            <p className="text-gray-600">
              Quản lý tất cả các lớp học đã đăng ký
            </p>
          </motion.div>

          <motion.div
            className="mt-4 md:mt-0 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          className="flex mb-6 border-b border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === "upcoming"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            } transition-colors duration-200`}
            onClick={() => setActiveTab("upcoming")}
          >
            Sắp diễn ra
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === "past"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            } transition-colors duration-200`}
            onClick={() => setActiveTab("past")}
          >
            Đã diễn ra
          </button>
        </motion.div>

        {/* Show info if no classes */}
        {filteredClasses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Không tìm thấy lớp học nào
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === "upcoming"
                ? "Bạn chưa đăng ký lớp học nào sắp diễn ra."
                : "Bạn chưa tham gia lớp học nào trước đây."}
            </p>
            <button
              onClick={() => navigate("/schedule")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Đăng ký lớp mới
            </button>
          </motion.div>
        )}

        {/* Class List */}
        {filteredClasses.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredClasses.map((cls, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer"
                onClick={() => handleClassClick(cls)}
              >
                <div className={`${getServiceColor(cls.service)} p-1`}></div>
                <div className="p-6">
                  {/* Class Title and Status */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {cls.className}
                    </h3>
                    {activeTab === "upcoming" ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Sắp diễn ra
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                        Đã diễn ra
                      </span>
                    )}
                  </div>

                  {/* Service Type */}
                  <div className="flex items-center mb-4">
                    <span
                      className={`${getServiceColor(
                        cls.service
                      )} p-2 rounded-full mr-2 text-white`}
                    >
                      {getServiceIcon(cls.service)}
                    </span>
                    <span className="font-medium text-gray-700">
                      {cls.service}
                    </span>
                  </div>

                  {/* Class Details */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center">
                      <span className="bg-blue-100 p-2 rounded-full mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">Ngày</p>
                        <p className="text-sm font-medium">
                          {formatDate(cls.date)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getDayOfWeek(cls.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="bg-purple-100 p-2 rounded-full mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-purple-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">Thời gian</p>
                        <p className="text-sm font-medium">
                          {cls.startTime} - {cls.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="bg-green-100 p-2 rounded-full mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">Huấn luyện viên</p>
                        <p className="text-sm font-medium">{cls.instructor}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="bg-orange-100 p-2 rounded-full mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-orange-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">Địa điểm</p>
                        <p className="text-sm font-medium">{cls.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom section */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">
                        {cls.attendees} học viên
                      </span>
                    </div>
                    <div className="flex items-center">
                      {generateStars(cls.rating)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Class Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedClass && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`${getServiceColor(
                  selectedClass.service
                )} h-2 w-full`}
              ></div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedClass.className}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>

                {/* Service badge */}
                <div className="mb-6">
                  <span
                    className={`${getServiceColor(
                      selectedClass.service
                    )} text-white text-sm px-3 py-1 rounded-full`}
                  >
                    {selectedClass.service}
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <span className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Ngày</p>
                      <p className="font-medium">
                        {formatDate(selectedClass.date)} (
                        {getDayOfWeek(selectedClass.date)})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="bg-purple-100 p-2 rounded-full mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-purple-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Thời gian</p>
                      <p className="font-medium">
                        {selectedClass.startTime} - {selectedClass.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="bg-green-100 p-2 rounded-full mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Huấn luyện viên</p>
                      <p className="font-medium">{selectedClass.instructor}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="bg-orange-100 p-2 rounded-full mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-orange-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Địa điểm</p>
                      <p className="font-medium">{selectedClass.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="bg-red-100 p-2 rounded-full mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Số học viên</p>
                      <p className="font-medium">
                        {selectedClass.attendees} học viên
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="bg-yellow-100 p-2 rounded-full mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Đánh giá</p>
                      <div className="flex items-center">
                        {generateStars(selectedClass.rating)}
                        <span className="ml-2 text-gray-700">
                          {selectedClass.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Ngày đăng ký</p>
                      <p className="font-medium">
                        {formatDate(selectedClass.registrationDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {isUpcoming(selectedClass.date) ? (
                  <div className="mt-8 flex space-x-3">
                    <button
                      onClick={() => navigate(`/schedule/${selectedClass._id}`)}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors duration-200"
                    >
                      Đóng
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 space-y-4">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => alert("Feature not implemented yet")}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      Đánh giá lớp học
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
