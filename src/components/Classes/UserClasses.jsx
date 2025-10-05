import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  BookOpen,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Users,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  Target,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";

export default function UserClasses() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "paid", label: "Đã thanh toán" },
    { value: "pending", label: "Chờ thanh toán" },
    { value: "upcoming", label: "Sắp diễn ra" },
    { value: "ongoing", label: "Đang học" },
    { value: "completed", label: "Hoàn thành" },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const id = parsedUser._id || parsedUser.id;
        if (id) {
          setUserId(id);
          fetchUserClasses(id);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserClasses = async (uid, showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/classes/user/${uid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEnrollments(response.data || []);

      // Fetch attendance data for each class
      if (response.data && response.data.length > 0) {
        fetchAttendanceData(uid);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lớp học của user:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn");
        navigate("/login");
      } else {
        toast.error("Không thể tải danh sách lớp học");
      }
      setEnrollments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAttendanceData = async (uid) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/attendance/user/${uid}/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Group attendance by class
      const attendanceByClass = {};
      response.data.attendanceRecords?.forEach((record) => {
        const classId = record.classId?._id || record.classId;
        if (!attendanceByClass[classId]) {
          attendanceByClass[classId] = {
            total: 0,
            attended: 0,
            missed: 0,
          };
        }
        attendanceByClass[classId].total++;
        if (record.isPresent) {
          attendanceByClass[classId].attended++;
        } else {
          attendanceByClass[classId].missed++;
        }
      });

      setAttendanceData(attendanceByClass);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu điểm danh:", error);
    }
  };

  const handleRefresh = () => {
    if (userId) {
      fetchUserClasses(userId, false);
    }
  };

  const getStatusInfo = (enrollment) => {
    const classStatus = enrollment.class?.status;
    const paymentStatus = enrollment.paymentStatus;

    if (!paymentStatus) {
      return {
        color: "amber",
        icon: AlertTriangle,
        text: "Chờ thanh toán",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        textColor: "text-amber-700",
      };
    }

    switch (classStatus) {
      case "upcoming":
        return {
          color: "blue",
          icon: Clock,
          text: "Sắp diễn ra",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-700",
        };
      case "ongoing":
        return {
          color: "green",
          icon: CheckCircle,
          text: "Đang diễn ra",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
        };
      case "completed":
        return {
          color: "gray",
          icon: Award,
          text: "Hoàn thành",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-700",
        };
      default:
        return {
          color: "gray",
          icon: XCircle,
          text: "Không xác định",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-700",
        };
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return "Chưa có lịch";

    const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return schedule
      .map((slot) => {
        const day = daysOfWeek[slot.dayOfWeek] || "N/A";
        return `${day}: ${slot.startTime || "N/A"}-${slot.endTime || "N/A"}`;
      })
      .join(", ");
  };

  const getAttendanceStats = (classId) => {
    const data = attendanceData[classId];
    if (!data || data.total === 0) {
      return { rate: 0, attended: 0, total: 0 };
    }
    return {
      rate: Math.round((data.attended / data.total) * 100),
      attended: data.attended,
      total: data.total,
    };
  };

  const getProgressPercent = (enrollment) => {
    const currentSession = enrollment.class?.currentSession || 0;
    const totalSessions = enrollment.class?.totalSessions || 0;
    return totalSessions > 0 ? (currentSession / totalSessions) * 100 : 0;
  };

  // Thêm function để tính số buổi còn lại
  const getRemainingSessionsCount = (enrollment) => {
    const totalSessions = enrollment.class?.totalSessions || 0;
    const currentSession = enrollment.class?.currentSession || 0;
    return Math.max(0, totalSessions - currentSession);
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.class?.className
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.class?.serviceName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.class?.instructorName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "all") return true;
    if (filterStatus === "paid") return enrollment.paymentStatus;
    if (filterStatus === "pending") return !enrollment.paymentStatus;
    if (filterStatus === "ongoing")
      return enrollment.class?.status === "ongoing";
    if (filterStatus === "completed")
      return enrollment.class?.status === "completed";
    if (filterStatus === "upcoming")
      return enrollment.class?.status === "upcoming";

    return true;
  });

  // Statistics
  const stats = {
    total: enrollments.length,
    paid: enrollments.filter((e) => e.paymentStatus).length,
    pending: enrollments.filter((e) => !e.paymentStatus).length,
    ongoing: enrollments.filter((e) => e.class?.status === "ongoing").length,
    completed: enrollments.filter((e) => e.class?.status === "completed")
      .length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-elegant border border-vintage-gold/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-luxury rounded-xl flex items-center justify-center mr-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold vintage-heading text-vintage-dark mb-2">
                      Lịch Học Của Tôi
                    </h1>
                    <p className="text-vintage-neutral vintage-serif">
                      Theo dõi tiến độ và quản lý các lớp học bạn đã đăng ký
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center px-4 py-2 bg-vintage-warm border border-vintage-primary/20 rounded-xl hover:bg-vintage-primary hover:text-white transition-all duration-300 group"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      refreshing ? "animate-spin" : ""
                    } group-hover:text-white`}
                  />
                  Làm mới
                </button>
                <button
                  onClick={() => navigate("/classes")}
                  className="flex items-center px-6 py-2 bg-gradient-luxury text-white rounded-xl hover:shadow-golden transition-all duration-300 group"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Đăng ký thêm
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Statistics */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {[
            {
              icon: BarChart3,
              value: stats.total,
              label: "Tổng lớp học",
              color: "blue",
            },
            {
              icon: CheckCircle,
              value: stats.paid,
              label: "Đã thanh toán",
              color: "green",
            },
            {
              icon: AlertTriangle,
              value: stats.pending,
              label: "Chờ thanh toán",
              color: "amber",
            },
            {
              icon: TrendingUp,
              value: stats.ongoing,
              label: "Đang học",
              color: "indigo",
            },
            {
              icon: Award,
              value: stats.completed,
              label: "Hoàn thành",
              color: "purple",
            },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-vintage-gold/10 hover:shadow-golden transition-all duration-300"
              >
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mr-3`}
                  >
                    <IconComponent
                      className={`h-6 w-6 text-${stat.color}-600`}
                    />
                  </div>
                  <div>
                    <div className="text-2xl font-bold vintage-heading text-vintage-dark">
                      {stat.value}
                    </div>
                    <div className="text-sm text-vintage-neutral vintage-sans">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-vintage-gold/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-vintage-neutral h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm lớp học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full p-3 bg-vintage-warm border border-vintage-primary/20 rounded-xl focus:ring-2 focus:ring-vintage-gold focus:border-vintage-gold transition-all vintage-sans"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-vintage-neutral" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-3 bg-vintage-warm border border-vintage-primary/20 rounded-xl focus:ring-2 focus:ring-vintage-gold focus:border-vintage-gold transition-all vintage-sans"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Classes Grid */}
        {filteredEnrollments.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-elegant p-10 text-center border border-vintage-gold/20"
          >
            <div className="w-24 h-24 bg-vintage-warm rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-vintage-primary" />
            </div>
            <h2 className="text-xl font-semibold vintage-heading text-vintage-dark mb-3">
              {enrollments.length === 0
                ? "Bạn chưa đăng ký lớp học nào"
                : "Không tìm thấy lớp học"}
            </h2>
            <p className="text-vintage-neutral mb-6 vintage-serif">
              {enrollments.length === 0
                ? "Khám phá các lớp học của chúng tôi và bắt đầu hành trình fitness của bạn."
                : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
            </p>
            <button
              className="inline-flex items-center px-6 py-3 bg-gradient-luxury text-white font-medium rounded-xl shadow-golden hover:shadow-elegant transition-all duration-300 vintage-sans"
              onClick={() => navigate("/classes")}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Đăng ký ngay
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrollments.map((enrollment) => {
              const statusInfo = getStatusInfo(enrollment);
              const attendanceStats = getAttendanceStats(enrollment.class?._id);
              const progressPercent = getProgressPercent(enrollment);
              const remainingSessions = getRemainingSessionsCount(enrollment);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={enrollment._id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-vintage-gold/20 overflow-hidden hover:shadow-elegant hover:border-vintage-gold/40 transition-all duration-300"
                >
                  {/* Enhanced Header */}
                  <div className="bg-gradient-to-r from-vintage-warm to-vintage-cream px-6 py-4 border-b border-vintage-gold/20">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold vintage-heading text-vintage-dark truncate flex-1 mr-4">
                        {enrollment.class?.className || "Lớp học"}
                      </h3>
                      <div
                        className={`flex items-center px-3 py-1 rounded-full ${statusInfo.textColor} bg-white/70 backdrop-blur-sm`}
                      >
                        <StatusIcon className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium vintage-sans">
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-vintage-neutral mt-1 vintage-serif">
                      {enrollment.class?.serviceName || "N/A"}
                    </p>
                  </div>

                  {/* Enhanced Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Instructor */}
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-vintage-warm rounded-lg flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-vintage-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-vintage-neutral vintage-sans">
                            Huấn luyện viên
                          </p>
                          <p className="font-medium text-vintage-dark vintage-serif">
                            {enrollment.class?.instructorName || "Chưa có"}
                          </p>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-vintage-warm rounded-lg flex items-center justify-center mr-3">
                          <Clock className="h-5 w-5 text-vintage-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-vintage-neutral vintage-sans">
                            Lịch học
                          </p>
                          <p className="font-medium text-vintage-dark text-sm vintage-serif">
                            {formatSchedule(enrollment.class?.schedule)}
                          </p>
                        </div>
                      </div>

                      {/* Progress with enhanced design */}
                      <div className="bg-gradient-to-r from-vintage-warm/50 to-vintage-cream/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-vintage-dark vintage-sans">
                            Tiến độ học tập
                          </span>
                          <span className="text-sm font-bold text-vintage-primary vintage-sans">
                            {enrollment.class?.currentSession || 0}/
                            {enrollment.class?.totalSessions || 0}
                          </span>
                        </div>
                        <div className="w-full bg-vintage-cream rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-luxury h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                            style={{ width: `${progressPercent}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-vintage-neutral vintage-sans">
                            {progressPercent.toFixed(1)}% hoàn thành
                          </span>
                          <span className="text-xs font-medium text-vintage-primary vintage-sans">
                            Còn lại: {remainingSessions} buổi
                          </span>
                        </div>
                      </div>

                      {/* Attendance with enhanced design */}
                      {attendanceStats.total > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-800 vintage-sans">
                              Điểm danh
                            </span>
                            <span className="text-sm font-bold text-green-600 vintage-sans">
                              {attendanceStats.rate}% (
                              {attendanceStats.attended}/{attendanceStats.total}
                              )
                            </span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${attendanceStats.rate}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Actions */}
                    <div className="mt-6 pt-4 border-t border-vintage-gold/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            navigate(
                              `/classes/${enrollment.class?._id}/details`
                            )
                          }
                          className="flex items-center text-vintage-primary hover:text-vintage-gold font-medium text-sm vintage-sans transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem chi tiết
                        </button>

                        <button
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setShowDetailModal(true);
                          }}
                          className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm vintage-sans transition-colors"
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Thống kê
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {!enrollment.paymentStatus && (
                          <button
                            onClick={() => navigate("/payment")}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 text-sm font-medium vintage-sans shadow-soft"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Thanh toán
                          </button>
                        )}

                        <span className="text-xs text-vintage-neutral vintage-sans">
                          Đăng ký:{" "}
                          {new Date(
                            enrollment.enrollmentDate
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Detail Modal giữ nguyên nhưng cải thiện styling */}
        <AnimatePresence>
          {showDetailModal && selectedEnrollment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-elegant border border-vintage-gold/20"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Enhanced modal content - giữ nguyên logic nhưng cải thiện styling */}
                <div className="p-6 border-b border-vintage-gold/20 bg-gradient-to-r from-vintage-warm to-vintage-cream">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold vintage-heading text-vintage-dark">
                        {selectedEnrollment.class?.className}
                      </h2>
                      <p className="text-vintage-neutral vintage-serif">
                        {selectedEnrollment.class?.serviceName}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-vintage-neutral hover:text-vintage-dark transition-colors"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Enhanced stats grid với màu sắc vintage */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {[
                      {
                        value: selectedEnrollment.class?.currentSession || 0,
                        label: "Buổi đã học",
                        color: "blue",
                      },
                      {
                        value: selectedEnrollment.class?.totalSessions || 0,
                        label: "Tổng buổi",
                        color: "gray",
                      },
                      {
                        value: getRemainingSessionsCount(selectedEnrollment),
                        label: "Còn lại",
                        color: "amber",
                      },
                      {
                        value: getAttendanceStats(selectedEnrollment.class?._id)
                          .attended,
                        label: "Đã tham gia",
                        color: "green",
                      },
                      {
                        value: `${
                          getAttendanceStats(selectedEnrollment.class?._id).rate
                        }%`,
                        label: "Tỷ lệ tham gia",
                        color: "purple",
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className={`text-center p-4 bg-${stat.color}-50 rounded-xl border border-${stat.color}-200`}
                      >
                        <div
                          className={`text-xl font-bold text-${stat.color}-600 vintage-heading`}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-600 vintage-sans">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rest of modal content với styling cải thiện */}
                  {/* ... giữ nguyên logic hiện tại nhưng thêm các class vintage styling */}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
