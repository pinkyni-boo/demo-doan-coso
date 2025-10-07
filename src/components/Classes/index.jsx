import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  User,
  DollarSign,
  BookOpen,
  Target,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Crown,
  Sparkles,
  Award,
  Heart,
  TrendingUp,
  PlayCircle,
  ArrowRight,
  Shield,
  UserPlus,
  X,
  XCircle,
  Timer,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  VintageContainer,
  VintageSection,
  VintageCard,
  VintageHeading,
  VintageText,
  VintageButton,
  VintageGrid,
} from "../Templates/VintageLayout";
import TrainerDetailsModal from "./TrainerDetailsModal";

export default function ViewClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showTrainerModal, setShowTrainerModal] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchServices();
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        if (userData._id) {
          fetchUserEnrollments(userData._id);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/classes");
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      showMessage("❌ Không thể tải danh sách lớp học", "error");
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/services");
      console.log("📊 Services API response:", response.data);

      // Xử lý response tùy theo format API
      if (Array.isArray(response.data)) {
        // Nếu API trả về array trực tiếp
        setServices(response.data);
      } else if (response.data.success && response.data.data) {
        // Nếu API trả về object với success và data
        setServices(response.data.data);
      } else if (response.data.services) {
        // Nếu API trả về object với key services
        setServices(response.data.services);
      } else {
        // Fallback: thử dùng response.data
        setServices(response.data || []);
      }
    } catch (error) {
      console.error("❌ Error fetching services:", error);

      // Fallback với dữ liệu mẫu nếu API lỗi
      setServices([
        {
          _id: "default1",
          name: "FITNESS",
          description: "Tập luyện thể hình cơ bản",
        },
        {
          _id: "default2",
          name: "YOGA",
          description: "Yoga thư giãn và cân bằng",
        },
        {
          _id: "default3",
          name: "BOXING",
          description: "Boxing và võ thuật",
        },
      ]);
    }
  }, []);

  const fetchUserEnrollments = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/classes/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserEnrollments(response.data || []);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      setUserEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (classId) => {
    if (!user) {
      showMessage("❌ Vui lòng đăng nhập để đăng ký lớp học", "error");
      return;
    }

    const isEnrolled = userEnrollments.some(
      (enrollment) => enrollment.class?._id === classId
    );

    if (isEnrolled) {
      showMessage("ℹ️ Bạn đã đăng ký lớp học này rồi", "error");
      return;
    }

    try {
      setEnrolling(classId);
      const token = localStorage.getItem("token");

      if (!token) {
        showMessage("❌ Vui lòng đăng nhập lại", "error");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/classes/enroll",
        { classId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showMessage("✅ Đăng ký lớp học thành công!");
      fetchClasses();
      if (user._id) {
        fetchUserEnrollments(user._id);
      }
    } catch (error) {
      console.error("Error enrolling:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đăng ký";
      showMessage(`❌ ${errorMessage}`, "error");
    } finally {
      setEnrolling(null);
    }
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  // Helper function: Convert time string to minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;

    // Remove any whitespace and convert to string
    const cleanTime = String(timeStr).trim();

    // Handle different time formats
    let hours = 0,
      minutes = 0;

    if (cleanTime.includes(":")) {
      // Format: "HH:MM" or "H:MM"
      const parts = cleanTime.split(":");
      hours = parseInt(parts[0]) || 0;
      minutes = parseInt(parts[1]) || 0;
    } else if (cleanTime.length === 4) {
      // Format: "HHMM"
      hours = parseInt(cleanTime.substring(0, 2)) || 0;
      minutes = parseInt(cleanTime.substring(2, 4)) || 0;
    } else if (cleanTime.length === 3) {
      // Format: "HMM"
      hours = parseInt(cleanTime.substring(0, 1)) || 0;
      minutes = parseInt(cleanTime.substring(1, 3)) || 0;
    }

    const totalMinutes = hours * 60 + minutes;
    console.log(
      `⏰ Converting time ${timeStr} -> ${hours}:${minutes} -> ${totalMinutes} minutes`
    );

    return totalMinutes;
  };

  // Helper function: Get day name
  const getDayName = (dayOfWeek) => {
    const dayNames = [
      "Chủ nhật", // 0
      "Thứ hai", // 1
      "Thứ ba", // 2
      "Thứ tư", // 3
      "Thứ năm", // 4
      "Thứ sáu", // 5
      "Thứ bảy", // 6
    ];

    const dayIndex = parseInt(dayOfWeek);
    return dayNames[dayIndex] || `Ngày ${dayOfWeek}`;
  };

  // Function to check schedule conflicts
  const checkScheduleConflict = (newClass, userCurrentClasses) => {
    if (
      !newClass.schedule ||
      !Array.isArray(newClass.schedule) ||
      newClass.schedule.length === 0
    ) {
      return { hasConflict: false };
    }

    // Kiểm tra từng slot thời gian của lớp mới
    for (const newSlot of newClass.schedule) {
      const newDayOfWeek = newSlot.dayOfWeek;
      const newStartTime = newSlot.startTime;
      const newEndTime = newSlot.endTime;

      if (!newStartTime || !newEndTime) {
        continue;
      }

      // Convert time strings to minutes for easier comparison
      const newStartMinutes = timeToMinutes(newStartTime);
      const newEndMinutes = timeToMinutes(newEndTime);

      // Kiểm tra với tất cả lớp học hiện tại của user
      for (const enrollment of userCurrentClasses) {
        const existingClass = enrollment.class;

        console.log(
          "🔍 Checking against existing class:",
          existingClass?.className
        );
        console.log("📊 Enrollment status:", enrollment.status);
        console.log("📊 Enrollment paymentStatus:", enrollment.paymentStatus);
        console.log("� Class status:", existingClass?.status);
        console.log("�📅 Existing class schedule:", existingClass?.schedule);

        // Chỉ kiểm tra với các lớp đang hoạt động (enrolled, confirmed, paid, ongoing)
        const activeStatuses = [
          "enrolled",
          "confirmed",
          "paid",
          "ongoing",
          "active",
        ];
        if (
          !existingClass ||
          !activeStatuses.includes(enrollment.status) ||
          existingClass.status === "completed" ||
          existingClass.status === "cancelled" ||
          !existingClass.schedule ||
          !Array.isArray(existingClass.schedule) ||
          existingClass.schedule.length === 0
        ) {
          console.log(
            `⏭️ Skipping class ${existingClass?.className} - Status: ${enrollment.status}, ClassStatus: ${existingClass?.status}, ScheduleLength: ${existingClass?.schedule?.length}`
          );
          continue;
        }

        // Kiểm tra từng slot của lớp hiện tại
        for (const existingSlot of existingClass.schedule) {
          if (existingSlot.dayOfWeek !== newDayOfWeek) {
            continue;
          }

          const existingStartMinutes = timeToMinutes(existingSlot.startTime);
          const existingEndMinutes = timeToMinutes(existingSlot.endTime);

          // Kiểm tra trùng thời gian (overlap)
          const hasTimeOverlap =
            (newStartMinutes >= existingStartMinutes &&
              newStartMinutes < existingEndMinutes) ||
            (newEndMinutes > existingStartMinutes &&
              newEndMinutes <= existingEndMinutes) ||
            (newStartMinutes <= existingStartMinutes &&
              newEndMinutes >= existingEndMinutes);

          if (hasTimeOverlap) {
            return {
              hasConflict: true,
              conflictClass: existingClass,
              conflictDay: getDayName(newDayOfWeek),
              conflictTime: `${existingSlot.startTime} - ${existingSlot.endTime}`,
              newClassTime: `${newStartTime} - ${newEndTime}`,
              conflictEnrollment: enrollment,
            };
          }
        }
      }
    }

    return { hasConflict: false };
  };

  const openDetailModal = (classItem) => {
    setSelectedClass(classItem);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedClass(null);
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

  const getStatusInfo = (status) => {
    switch (status) {
      case "upcoming":
        return {
          color: "amber",
          text: "Sắp diễn ra",
          bgColor: "bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100",
          textColor: "text-amber-800",
          borderColor: "border-amber-300",
          icon: Calendar,
          shadowColor: "shadow-amber-200/50",
        };
      case "ongoing":
        return {
          color: "green",
          text: "Đang diễn ra",
          bgColor: "bg-gradient-to-r from-green-100 via-green-50 to-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-300",
          icon: PlayCircle,
          shadowColor: "shadow-green-200/50",
        };
      case "completed":
        return {
          color: "gray",
          text: "Đã kết thúc",
          bgColor: "bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-300",
          icon: CheckCircle,
          shadowColor: "shadow-gray-200/50",
        };
      case "cancelled":
        return {
          color: "red",
          text: "Đã hủy",
          bgColor: "bg-gradient-to-r from-red-100 via-red-50 to-red-100",
          textColor: "text-red-700",
          borderColor: "border-red-300",
          icon: AlertCircle,
          shadowColor: "shadow-red-200/50",
        };
      default:
        return {
          color: "neutral",
          text: "Không xác định",
          bgColor: "bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-300",
          icon: Target,
          shadowColor: "shadow-gray-200/50",
        };
    }
  };

  const isUserEnrolled = (classId) => {
    return userEnrollments.some(
      (enrollment) => enrollment.class?._id === classId
    );
  };

  // Check if class is full
  const isClassFull = (classItem) => {
    const currentMembers = classItem.currentMembers || 0;
    const maxMembers = classItem.maxMembers || 0;
    return currentMembers >= maxMembers;
  };

  // Check if user can enroll (not full, not already enrolled, and class is upcoming/ongoing)
  const canEnrollInClass = (classItem) => {
    if (!user) return false;
    if (isUserEnrolled(classItem._id)) return false;
    if (isClassFull(classItem)) return false;

    // Only allow enrollment for upcoming and ongoing classes
    const validStatuses = ["upcoming", "ongoing"];
    return validStatuses.includes(classItem.status);
  };

  // Check if class has ended/completed
  const isClassEnded = (classItem) => {
    const classEndDate = new Date(classItem.endDate);
    const today = new Date();
    return classItem.status === "completed" || classEndDate <= today;
  };

  // Check if user has confirmed payment (admin approved enrollment)
  const hasConfirmedPayment = (classItem) => {
    const enrollment = userEnrollments.find(
      (enrollment) => enrollment.class?._id === classItem._id
    );
    console.log("🔍 Checking payment status for class:", classItem.className);
    console.log("🔍 Found enrollment:", enrollment);

    if (!enrollment) return false;

    // Check various possible payment status fields
    const isConfirmed =
      enrollment.status === "confirmed" ||
      enrollment.status === "paid" ||
      enrollment.paymentStatus === true ||
      enrollment.paymentStatus === "confirmed" ||
      enrollment.paymentStatus === "paid";

    console.log("💳 Payment confirmed:", isConfirmed);
    return isConfirmed;
  };

  // Check if user has pending payment (enrolled but not yet confirmed by admin)
  const hasPendingPayment = (classItem) => {
    const enrollment = userEnrollments.find(
      (enrollment) => enrollment.class?._id === classItem._id
    );

    if (!enrollment) return false;

    // Has enrollment but payment not yet confirmed
    const isPending = enrollment && !hasConfirmedPayment(classItem);
    console.log("⏳ Payment pending:", isPending);
    return isPending;
  };

  // Updated enrollment handler to redirect to payment
  const handleEnrollRedirect = (classItem) => {
    if (!user) {
      showMessage("❌ Vui lòng đăng nhập để đăng ký lớp học", "error");
      navigate("/login");
      return;
    }

    // Kiểm tra các điều kiện cơ bản
    if (isClassEnded(classItem)) {
      showMessage("❌ Lớp học này đã kết thúc", "error");
      return;
    }

    if (isClassFull(classItem)) {
      showMessage("❌ Lớp học đã đầy", "error");
      return;
    }

    if (isUserEnrolled(classItem._id)) {
      showMessage("ℹ️ Bạn đã đăng ký lớp học này rồi", "error");
      return;
    }

    if (!canEnrollInClass(classItem)) {
      showMessage("❌ Không thể đăng ký lớp học này", "error");
      return;
    }

    // Kiểm tra trùng lịch thời khóa biểu
    const scheduleConflict = checkScheduleConflict(classItem, userEnrollments);

    if (scheduleConflict.hasConflict) {
      // Thông báo ngắn gọn trong UI
      showMessage(
        `⚠️ Trùng lịch với lớp "${scheduleConflict.conflictClass.className}" vào ${scheduleConflict.conflictDay}. Không thể đăng ký!`,
        "error"
      );

      // Alert chi tiết
      setTimeout(() => {
        alert(
          `🚨 TRÙNG LỊCH THỜI KHÓA BIỂU\n\n` +
            `❌ Không thể đăng ký lớp "${classItem.className}"\n\n` +
            `📅 Lý do: Trùng lịch với lớp đã đăng ký\n\n` +
            `🔄 Lớp bị trùng: "${scheduleConflict.conflictClass.className}"\n` +
            `📅 Ngày: ${scheduleConflict.conflictDay}\n` +
            `⏰ Thời gian trùng: ${scheduleConflict.conflictTime}\n` +
            `🆕 Thời gian lớp mới: ${scheduleConflict.newClassTime}\n\n` +
            `💡 Gợi ý:\n` +
            `• Chọn lớp học khác có lịch không trùng\n` +
            `• Liên hệ admin để được tư vấn về lịch học phù hợp\n` +
            `• Kiểm tra lại lịch học của bạn trong "Lớp của tôi"`
        );
      }, 500);

      return; // Dừng lại, không cho phép đăng ký
    }

    // Nếu không có conflict, tiếp tục đăng ký
    const navigationData = {
      classData: classItem,
      enrollmentType: "class",
      amount: classItem.fee || classItem.price || 0,
      description: `Đăng ký lớp học: ${classItem.className}`,
    };

    navigate("/payment", {
      state: navigationData,
    });
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const matchesSearch =
        !searchTerm ||
        classItem.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.serviceName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        classItem.instructorName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Cải thiện logic filter service
      let matchesService = filterService === "all";

      if (!matchesService && filterService) {
        // Thử match theo serviceId hoặc service._id
        if (
          classItem.serviceId === filterService ||
          classItem.service === filterService
        ) {
          matchesService = true;
        }
        // Thử match theo serviceName với service.name từ database
        else {
          const selectedService = services.find((s) => s._id === filterService);
          if (
            selectedService &&
            classItem.serviceName === selectedService.name
          ) {
            matchesService = true;
          }
        }
      }

      return matchesSearch && matchesService;
    });
  }, [classes, searchTerm, filterService, services]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream pt-24 pb-16">
        <VintageContainer>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center items-center py-20"
          >
            <VintageCard className="p-12 text-center bg-white/90 backdrop-blur-sm border-2 border-vintage-accent/50 shadow-elegant">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-vintage-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-vintage-accent rounded-full mx-auto animate-pulse"></div>
              </div>
              <VintageHeading level={4} className="mb-3 text-vintage-dark">
                Đang tải danh sách lớp học
              </VintageHeading>
              <VintageText variant="body" className="text-vintage-neutral">
                Vui lòng đợi trong giây lát...
              </VintageText>
            </VintageCard>
          </motion.div>
        </VintageContainer>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream pt-24 pb-16"
    >
      {/* Luxury Hero Section */}
      <VintageSection background="transparent">
        <VintageContainer>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto mb-12"
          >
            <VintageCard className="p-12 bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/30 shadow-elegant relative overflow-hidden">
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="vintage-pattern h-full w-full"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-20 h-20 bg-gradient-luxury rounded-2xl flex items-center justify-center mr-6 shadow-golden">
                    <BookOpen className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-left">
                    <VintageHeading
                      level={1}
                      className="text-vintage-dark mb-3 text-5xl"
                    >
                      Khám Phá Các Lớp Học
                    </VintageHeading>
                    <div className="w-32 h-2 bg-gradient-golden rounded-full shadow-md"></div>
                  </div>
                </div>

                <VintageText
                  variant="lead"
                  className="text-vintage-neutral mb-8 text-xl leading-relaxed max-w-3xl mx-auto"
                >
                  Tham gia các lớp học đa dạng với huấn luyện viên chuyên
                  nghiệp. Từ Yoga thư giãn đến Boxing mạnh mẽ - tìm lớp học phù
                  hợp với bạn!
                </VintageText>

                {/* Luxury Trust Indicators */}
              </div>
            </VintageCard>
          </motion.div>
        </VintageContainer>
      </VintageSection>

      <VintageContainer>
        {/* Luxury Message Display */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`mb-8 p-6 rounded-2xl backdrop-blur-sm border-2 shadow-elegant ${
                messageType === "success"
                  ? "bg-vintage-warm text-vintage-dark border-vintage-accent"
                  : "bg-gray-50 text-gray-800 border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full mr-4 flex items-center justify-center ${
                    messageType === "success"
                      ? "bg-vintage-accent"
                      : "bg-gray-200"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle className="h-5 w-5 text-vintage-dark" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <span className="font-semibold text-lg">{message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Luxury Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <VintageCard className="p-8 bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/30 shadow-elegant">
            <div className="flex flex-col lg:flex-row gap-6 items-end">
              {/* Service Filter */}
              <div className="w-full lg:w-64">
                <label className="block text-sm font-medium text-vintage-dark mb-3 vintage-sans">
                  Lọc theo dịch vụ
                </label>
                <div className="relative">
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-vintage-accent/30 rounded-xl focus:ring-2 focus:ring-vintage-gold focus:border-vintage-gold transition-all bg-white text-vintage-dark vintage-sans appearance-none cursor-pointer"
                  >
                    <option value="all">Tất cả dịch vụ</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-vintage-neutral"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || filterService !== "all") && (
                <VintageButton
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterService("all");
                  }}
                  className="px-6 py-4 border-2 border-vintage-accent/30 text-vintage-neutral hover:text-vintage-dark hover:border-vintage-accent transition-all"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Xóa bộ lọc
                </VintageButton>
              )}
            </div>

            {/* Filter Results Summary */}
            <div className="mt-6 pt-6 border-t border-vintage-accent/20">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-vintage-neutral vintage-sans">
                  Hiển thị {filteredClasses.length} trong tổng số{" "}
                  {classes.length} lớp học
                </span>
                {filterService !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-vintage-accent/20 text-vintage-dark">
                    Dịch vụ:{" "}
                    {services.find((s) => s._id === filterService)?.name ||
                      "Không xác định"}
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Từ khóa: "{searchTerm}"
                  </span>
                )}
              </div>
            </div>
          </VintageCard>
        </motion.div>

        {/* Luxury Classes Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {filteredClasses.map((classItem, index) => {
            const statusInfo = getStatusInfo(classItem.status);
            const StatusIcon = statusInfo.icon;
            const isEnrolled = isUserEnrolled(classItem._id);
            const canEnroll =
              (classItem.status === "upcoming" ||
                classItem.status === "ongoing") &&
              !isEnrolled;

            return (
              <motion.div
                key={classItem._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <VintageCard
                  className={`h-full overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/30 shadow-elegant hover:shadow-golden hover:border-vintage-gold/50 transition-all duration-500 relative ${
                    isClassEnded(classItem) ? "opacity-70 bg-gray-50/95" : ""
                  }`}
                >
                  {/* Luxury Status Badge */}
                  <div className="absolute top-6 right-6 z-10">
                    <div
                      className={`flex items-center px-4 py-2 rounded-full border-2 ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} backdrop-blur-sm ${statusInfo.shadowColor} shadow-lg`}
                    >
                      <StatusIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm font-bold">
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Class Header */}
                  <div className="p-8 pb-6 relative bg-gradient-to-br from-vintage-warm to-vintage-cream">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-golden"></div>

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1 pr-6">
                        <VintageHeading
                          level={4}
                          className="text-vintage-dark mb-3 group-hover:text-vintage-primary transition-colors line-clamp-2 text-xl"
                        >
                          {classItem.className}
                        </VintageHeading>
                        <div className="flex items-center mb-3">
                          <Star className="h-5 w-5 text-vintage-gold mr-3 fill-current" />
                          <VintageText
                            variant="caption"
                            className="text-vintage-primary font-bold text-base"
                          >
                            {classItem.serviceName}
                          </VintageText>
                        </div>

                        {/* Class ID for reference */}
                        <div className="text-xs text-vintage-neutral/70 mb-2">
                          ID: {classItem._id?.slice(-6) || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="px-8 pb-6">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Enrollment Info */}
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-green-600 mr-2" />
                        <div>
                          <div className="text-xs text-vintage-neutral">
                            Sĩ số
                          </div>
                          <div className="text-sm font-bold text-vintage-dark">
                            {classItem.currentMembers || 0}/
                            {classItem.maxMembers || 0}
                          </div>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-red-600 mr-2" />
                        <div>
                          <div className="text-xs text-vintage-neutral">
                            Học phí
                          </div>
                          <div className="text-sm font-bold text-vintage-primary">
                            {classItem.fee
                              ? `${classItem.fee.toLocaleString("vi-VN")} VNĐ`
                              : classItem.price
                              ? `${classItem.price.toLocaleString("vi-VN")} VNĐ`
                              : "Liên hệ"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Class Information Summary */}
                  <div className="px-8 pb-6">
                    <div className="bg-gradient-to-r from-vintage-warm to-vintage-cream rounded-xl p-4 border border-vintage-accent/30">
                      <VintageText
                        variant="caption"
                        className="text-vintage-neutral font-bold mb-3 block"
                      >
                        📋 Thông tin chung về lớp học
                      </VintageText>

                      <div className="space-y-3">
                        {/* Course Duration */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm text-vintage-dark">
                              Thời gian:
                            </span>
                          </div>
                          <span className="text-sm font-bold text-vintage-primary">
                            {new Date(classItem.startDate).toLocaleDateString(
                              "vi-VN"
                            )}{" "}
                            -{" "}
                            {new Date(classItem.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>

                        {/* Class Schedule */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-vintage-dark">
                              Lịch học:
                            </span>
                          </div>
                          <span className="text-sm font-bold text-vintage-dark">
                            {formatSchedule(classItem.schedule)}
                          </span>
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="text-sm text-vintage-dark">
                              Huấn luyện viên:
                            </span>
                          </div>
                          <span className="text-sm font-bold text-vintage-primary">
                            {classItem.instructorName || "Chưa có"}
                          </span>
                        </div>

                        {/* Capacity */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-orange-600 mr-2" />
                            <span className="text-sm text-vintage-dark">
                              Sĩ số:
                            </span>
                          </div>
                          <span className="text-sm font-bold text-vintage-dark">
                            {classItem.currentMembers || 0}/
                            {classItem.maxMembers || 0} học viên
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-red-600 mr-2" />
                            <span className="text-sm text-vintage-dark">
                              Học phí:
                            </span>
                          </div>
                          <span className="text-sm font-bold text-vintage-primary">
                            {classItem.fee
                              ? `${classItem.fee.toLocaleString("vi-VN")} VNĐ`
                              : classItem.price
                              ? `${classItem.price.toLocaleString("vi-VN")} VNĐ`
                              : "Liên hệ"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="px-8 pb-8 mt-auto">
                    <div className="space-y-3">
                      {/* Enrollment Button */}
                      <div className="w-full">
                        {user ? (
                          isEnrolled && hasConfirmedPayment(classItem) ? (
                            <VintageButton
                              variant="secondary"
                              size="md"
                              disabled
                              className="w-full bg-green-50 border-2 border-green-300 text-green-700 font-bold py-3"
                            >
                              <CheckCircle className="h-5 w-5 mr-2" />✅ Đã tham
                              gia lớp
                            </VintageButton>
                          ) : isEnrolled && hasPendingPayment(classItem) ? (
                            <VintageButton
                              variant="secondary"
                              size="md"
                              disabled
                              className="w-full bg-yellow-50 border-2 border-yellow-300 text-yellow-700 font-bold py-3"
                            >
                              <Clock className="h-5 w-5 mr-2" />⏳ Chờ admin xác
                              nhận
                            </VintageButton>
                          ) : isClassEnded(classItem) ? (
                            <VintageButton
                              variant="secondary"
                              size="md"
                              disabled
                              className="w-full bg-gray-100 border-2 border-gray-300 text-gray-500 font-bold py-3 opacity-60"
                            >
                              <XCircle className="h-5 w-5 mr-2" />
                              🔒 Lớp học đã kết thúc
                            </VintageButton>
                          ) : isClassFull(classItem) ? (
                            <VintageButton
                              variant="secondary"
                              size="md"
                              disabled
                              className="w-full bg-red-50 border-2 border-red-300 text-red-700 font-bold py-3"
                            >
                              <XCircle className="h-5 w-5 mr-2" />❌ Hết chỗ (
                              {classItem.currentMembers}/{classItem.maxMembers})
                            </VintageButton>
                          ) : canEnrollInClass(classItem) ? (
                            <VintageButton
                              variant="secondary"
                              size="md"
                              onClick={() => handleEnrollRedirect(classItem)}
                              className="w-full bg-vintage-primary from-vintage-primary to-vintage-secondary hover:from-vintage-secondary hover:to-vintage-primary text-white border-0 shadow-lg hover:shadow-xl font-bold py-3 transform hover:scale-105 transition-all duration-300"
                            >
                              <div className="flex items-center justify-center">
                                <DollarSign className="h-5 w-5 mr-2" />
                                Đăng ký lớp học
                              </div>
                            </VintageButton>
                          ) : (
                            <VintageButton
                              variant="secondary"
                              size="md"
                              disabled
                              className="w-full bg-gray-100 border-2 border-gray-300 text-gray-500 font-bold py-3"
                            >
                              <XCircle className="h-5 w-5 mr-2" />
                              Không thể đăng ký
                            </VintageButton>
                          )
                        ) : (
                          <VintageButton
                            variant="secondary"
                            size="md"
                            onClick={() => navigate("/login")}
                            className="w-full bg-orange-50 border-2 border-orange-300 text-orange-700 hover:bg-orange-100 font-bold py-3 transform hover:scale-105 transition-all duration-300"
                          >
                            <User className="h-5 w-5 mr-2" />
                            🔐 Đăng nhập để đăng ký
                          </VintageButton>
                        )}
                      </div>
                    </div>
                  </div>

                  {classItem.status === "ongoing" &&
                    classItem.currentSession &&
                    classItem.totalSessions && (
                      <div className="absolute bottom-0 left-0 right-0">
                        <div className="w-full bg-vintage-accent h-2">
                          <div
                            className="bg-gradient-golden h-full transition-all duration-1000 shadow-inner"
                            style={{
                              width: `${
                                (classItem.currentSession /
                                  classItem.totalSessions) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                  {/* Luxury Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-vintage-gold/0 via-vintage-gold/0 to-vintage-gold/0 group-hover:from-vintage-gold/5 group-hover:via-vintage-gold/3 group-hover:to-vintage-gold/5 transition-all duration-500 pointer-events-none"></div>
                </VintageCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Luxury Empty State */}
        {filteredClasses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <VintageCard className="p-16 max-w-3xl mx-auto bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/30 shadow-elegant">
              <div className="w-32 h-32 bg-gradient-luxury rounded-full flex items-center justify-center mx-auto mb-8 shadow-golden">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
              <VintageHeading
                level={2}
                className="mb-6 text-vintage-dark text-3xl"
              >
                Không tìm thấy lớp học nào
              </VintageHeading>
              <VintageText
                variant="lead"
                className="mb-10 text-vintage-neutral text-xl"
              >
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm lớp học phù
                hợp.
              </VintageText>
              <VintageButton
                variant="gold"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setFilterService("");
                }}
                className="bg-gradient-golden hover:bg-gradient-luxury text-vintage-dark hover:text-white border-0 shadow-golden hover:shadow-elegant px-8 py-4 text-lg font-bold group"
              >
                <Target className="h-6 w-6 mr-3" />
                Xem tất cả lớp học
              </VintageButton>
            </VintageCard>
          </motion.div>
        )}

        {/* Luxury Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20"
        ></motion.div>
      </VintageContainer>

      {/* Luxury Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDetailModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-vintage-warm to-vintage-cream">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-vintage-dark mb-2">
                      {selectedClass.className}
                    </h2>
                    <p className="text-vintage-primary font-semibold">
                      {selectedClass.serviceName}
                    </p>
                  </div>
                  <button
                    onClick={closeDetailModal}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Schedule Information */}
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Lịch học chi tiết
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <ScheduleInfo schedule={selectedClass.schedule} />
                    </div>
                  </div>

                  {/* Existing trainer and enrollment info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div
                        className="flex items-center cursor-pointer hover:bg-purple-50 p-3 rounded-lg transition-colors"
                        onClick={() => {
                          console.log(
                            "Opening trainer modal for:",
                            selectedClass.instructorName
                          );
                          setShowTrainerModal(true);
                        }}
                      >
                        <User className="h-5 w-5 text-purple-600 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Huấn luyện viên
                          </div>
                          <div className="font-semibold text-purple-600 hover:text-purple-800">
                            {selectedClass.instructorName || "Chưa có"}
                          </div>
                          <div className="text-xs text-purple-500 italic font-medium">
                            👆 Click để xem thông tin HLV
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">Sĩ số lớp</div>
                          <div className="font-semibold">
                            {selectedClass.currentMembers || 0}/
                            {selectedClass.maxMembers || 0} học viên
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-red-600 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">Học phí</div>
                          <div className="font-semibold text-vintage-primary">
                            {selectedClass.fee
                              ? `${selectedClass.fee.toLocaleString(
                                  "vi-VN"
                                )} VNĐ`
                              : selectedClass.price
                              ? `${selectedClass.price.toLocaleString(
                                  "vi-VN"
                                )} VNĐ`
                              : "Liên hệ"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-amber-600 mr-3" />
                        <div>
                          <div className="text-sm text-gray-600">Tiến độ</div>
                          <div className="font-semibold">
                            {selectedClass.totalSessions
                              ? `${selectedClass.currentSession || 0}/${
                                  selectedClass.totalSessions
                                } buổi`
                              : "Chưa xác định"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning about schedule conflicts */}
                  {user &&
                    (() => {
                      const conflict = checkScheduleConflict(
                        selectedClass,
                        userEnrollments
                      );
                      if (conflict.hasConflict) {
                        return (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-red-800 mb-2">
                                  ⚠️ Cảnh báo trùng lịch
                                </h4>
                                <p className="text-red-700 text-sm mb-2">
                                  Lớp này trùng lịch với lớp{" "}
                                  <strong>
                                    "{conflict.conflictClass.className}"
                                  </strong>
                                  vào {conflict.conflictDay} (
                                  {conflict.conflictTime})
                                </p>
                                <p className="text-red-600 text-xs">
                                  ❌ Không thể đăng ký do trùng thời khóa biểu
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                  {/* Description */}
                  {selectedClass.description && (
                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-vintage-primary" />
                        Mô tả lớp học
                      </h3>
                      <div className="bg-vintage-warm rounded-lg p-4">
                        <p className="text-vintage-neutral leading-relaxed">
                          {selectedClass.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <VintageButton
                    variant="outline"
                    onClick={closeDetailModal}
                    className="flex-1"
                  >
                    Đóng
                  </VintageButton>
                  {user && (
                    <>
                      {isUserEnrolled(selectedClass._id) &&
                      hasConfirmedPayment(selectedClass) ? (
                        <VintageButton
                          variant="secondary"
                          disabled
                          className="flex-1 bg-green-50 border-green-300 text-green-700"
                        >
                          ✅ Đã tham gia
                        </VintageButton>
                      ) : isUserEnrolled(selectedClass._id) &&
                        hasPendingPayment(selectedClass) ? (
                        <VintageButton
                          variant="secondary"
                          disabled
                          className="flex-1 bg-yellow-50 border-yellow-300 text-yellow-700"
                        >
                          ⏳ Chờ admin xác nhận
                        </VintageButton>
                      ) : isClassEnded(selectedClass) ? (
                        <VintageButton
                          variant="secondary"
                          disabled
                          className="flex-1 bg-gray-50 border-gray-300 text-gray-500 opacity-60"
                        >
                          🔒 Lớp học đã kết thúc
                        </VintageButton>
                      ) : isClassFull(selectedClass) ? (
                        <VintageButton
                          variant="secondary"
                          disabled
                          className="flex-1 bg-red-50 border-red-300 text-red-700"
                        >
                          ❌ Hết chỗ
                        </VintageButton>
                      ) : canEnrollInClass(selectedClass) ? (
                        <VintageButton
                          variant="primary"
                          onClick={() => {
                            handleEnrollRedirect(selectedClass);
                            closeDetailModal();
                          }}
                          className="flex-1"
                        >
                          🎯 Đăng ký & Thanh toán
                        </VintageButton>
                      ) : (
                        <VintageButton
                          variant="secondary"
                          disabled
                          className="flex-1 bg-gray-50 border-gray-300 text-gray-700"
                        >
                          Không thể đăng ký
                        </VintageButton>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trainer Details Modal */}
      {showTrainerModal && selectedClass && (
        <TrainerDetailsModal
          isOpen={showTrainerModal}
          onClose={() => setShowTrainerModal(false)}
          trainerId={selectedClass.trainerId || selectedClass.instructorId}
          trainerName={selectedClass.instructorName}
        />
      )}
    </motion.div>
  );
}

// Thêm component hiển thị thông tin lịch học trong modal chi tiết
const ScheduleInfo = ({ schedule }) => {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return <span className="text-gray-500 italic">Chưa có lịch học</span>;
  }

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="space-y-2">
      {schedule.map((slot, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg"
        >
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">
              {dayNames[slot.dayOfWeek] || `Ngày ${slot.dayOfWeek}`}
            </span>
          </div>
          <div className="flex items-center text-blue-700">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {slot.startTime} - {slot.endTime}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
