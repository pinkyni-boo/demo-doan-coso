import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  VintageContainer,
  VintageSection,
  VintageCard,
  VintageHeading,
  VintageText,
  VintageButton,
  VintageGrid,
} from "../Templates/VintageLayout";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  User,
  ArrowLeft,
  CheckCircle,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Star,
  Play,
  Shield,
  Crown,
  Sparkles,
  Heart,
  Trophy,
  Timer,
  Zap,
  Eye,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [user, setUser] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
  const [sessionContents, setSessionContents] = useState({});
  const [loadingContents, setLoadingContents] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchClassDetails();
      // Fetch attendance if user is enrolled
      if (parsedUser) {
        fetchAttendanceHistory(parsedUser._id || parsedUser.id);
        fetchSessionContents();
      }
    } else {
      fetchClassDetails();
    }
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/classes/${id}/details`
      );
      setClassData(response.data);
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast.error("Không thể tải thông tin lớp học");
      navigate("/classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async (userId) => {
    try {
      setLoadingAttendance(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/attendance/class/${id}/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Filter to only show past sessions (up to today)
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        const pastSessions = response.data.filter(record => {
          const sessionDate = new Date(record.sessionDate);
          return sessionDate <= today;
        });
        
        setAttendanceHistory(pastSessions.sort((a, b) => a.sessionNumber - b.sessionNumber));
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      // Don't show error toast, just log it
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchSessionContents = async () => {
    try {
      setLoadingContents(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/session-content/class/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const contentsMap = {};
        response.data.data.forEach(content => {
          contentsMap[content.sessionNumber] = content;
        });
        setSessionContents(contentsMap);
      }
    } catch (error) {
      console.error("Error fetching session contents:", error);
    } finally {
      setLoadingContents(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng ký lớp học");
      navigate("/login");
      return;
    }

    try {
      setEnrolling(true);
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/classes/enroll",
        { classId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Đăng ký lớp học thành công!");
      navigate("/my-classes");
    } catch (error) {
      console.error("Error enrolling:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể đăng ký lớp học";
      toast.error(errorMessage);
    } finally {
      setEnrolling(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
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
      case "cancelled":
        return {
          color: "red",
          icon: XCircle,
          text: "Đã hủy",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
        };
      default:
        return {
          color: "gray",
          icon: Clock,
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
        return `${day}: ${slot.startTime}-${slot.endTime}`;
      })
      .join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream pt-24 pb-16">
        <VintageContainer>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center items-center py-20"
          >
            <VintageCard className="p-12 text-center shadow-elegant">
              <div className="w-16 h-16 border-4 border-vintage-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <VintageHeading level={4} className="mb-2 text-vintage-dark">
                Đang tải thông tin lớp học
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

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream pt-24 pb-16">
        <VintageContainer>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <VintageCard className="p-16 text-center max-w-2xl mx-auto shadow-elegant">
              <div className="w-24 h-24 bg-gradient-to-br from-vintage-warm to-vintage-gold/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <BookOpen className="h-12 w-12 text-vintage-primary" />
              </div>
              <VintageHeading level={2} className="mb-6 text-vintage-dark">
                Không tìm thấy lớp học
              </VintageHeading>
              <VintageText variant="lead" className="mb-8 text-vintage-neutral">
                Lớp học bạn đang tìm kiếm có thể đã được cập nhật hoặc không còn khả dụng.
              </VintageText>
              <VintageButton 
                onClick={() => navigate("/my-classes")}
                className="inline-flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại lớp của tôi
              </VintageButton>
            </VintageCard>
          </motion.div>
        </VintageContainer>
      </div>
    );
  }

  const statusInfo = getStatusInfo(classData.status);
  const progressPercent = classData.totalSessions 
    ? (classData.currentSession / classData.totalSessions) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream pt-24 pb-16"
    >
      <VintageContainer>
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <VintageButton
            variant="outline"
            onClick={() => navigate("/my-classes")}
            className="inline-flex items-center hover:bg-vintage-warm transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại lớp của tôi
          </VintageButton>
        </motion.div>

        <VintageGrid cols={{ lg: 3 }} gap={8}>
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <VintageCard className="p-8 shadow-elegant">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                        <statusInfo.icon className={`h-4 w-4 ${statusInfo.textColor} inline mr-1`} />
                        <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <span className="text-sm text-vintage-neutral">
                        ID: {classData._id?.slice(-6) || 'N/A'}
                      </span>
                    </div>
                    
                    <VintageHeading level={1} className="mb-4 text-vintage-dark">
                      {classData.className}
                    </VintageHeading>
                    
                    <VintageText variant="lead" className="text-vintage-neutral mb-6">
                      {classData.description || "Không có mô tả cho lớp học này."}
                    </VintageText>
                  </div>
                </div>

                {/* Class Stats */}
                <VintageGrid cols={{ sm: 2, md: 4 }} gap={4} className="mb-6">
                  {[
                    {
                      icon: Users,
                      value: `${classData.currentMembers || 0}/${classData.maxMembers}`,
                      label: "Học viên",
                      color: "blue",
                    },
                    {
                      icon: Calendar,
                      value: `${classData.totalSessions}`,
                      label: "Tổng buổi",
                      color: "green",
                    },
                    {
                      icon: Timer,
                      value: `${classData.currentSession || 0}`,
                      label: "Đã học",
                      color: "purple",
                    },
                    {
                      icon: Trophy,
                      value: `${progressPercent.toFixed(0)}%`,
                      label: "Tiến độ",
                      color: "amber",
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={`bg-${stat.color}-50 border border-${stat.color}-200 rounded-xl p-4 text-center`}
                    >
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600 mx-auto mb-2`} />
                      <div className={`text-xl font-bold text-${stat.color}-800`}>
                        {stat.value}
                      </div>
                      <div className={`text-xs text-${stat.color}-600`}>
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </VintageGrid>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <VintageText variant="caption" className="text-vintage-neutral">
                      Tiến độ lớp học
                    </VintageText>
                    <VintageText variant="caption" className="text-vintage-primary font-semibold">
                      {progressPercent.toFixed(1)}% hoàn thành
                    </VintageText>
                  </div>
                  <div className="w-full bg-vintage-warm rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full shadow-inner"
                    ></motion.div>
                  </div>
                </div>
              </VintageCard>
            </motion.div>

            {/* Service Image */}
            {classData.service?.image && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <VintageCard className="overflow-hidden shadow-elegant">
                  <div className="relative group">
                    <img
                      src={classData.service.image}
                      alt={classData.serviceName}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-vintage-dark/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{classData.serviceName}</h3>
                      <p className="text-white/90">Dịch vụ chuyên nghiệp</p>
                    </div>
                  </div>
                </VintageCard>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <VintageCard className="p-6 shadow-elegant">
                <VintageHeading level={4} className="mb-6 text-vintage-dark">
                  Thông tin chi tiết
                </VintageHeading>

                <div className="space-y-4">
                  {[
                    {
                      icon: User,
                      label: "Huấn luyện viên",
                      value: classData.instructorName || "Chưa có",
                      color: "purple",
                    },
                    {
                      icon: MapPin,
                      label: "Địa điểm",
                      value: classData.location || classData.room?.name || "Chưa có thông tin",
                      color: "blue",
                    },
                    {
                      icon: Users,
                      label: "Học viên",
                      value: `${classData.currentMembers || 0}/${classData.maxMembers}`,
                      color: "green",
                    },
                    {
                      icon: DollarSign,
                      label: "Học phí",
                      value: classData.fee ? `${classData.fee.toLocaleString('vi-VN')} VNĐ` : 
                             classData.price ? `${classData.price.toLocaleString('vi-VN')} VNĐ` : "Liên hệ",
                      color: "red",
                    },
                    {
                      icon: BookOpen,
                      label: "Tổng buổi học",
                      value: `${classData.totalSessions} buổi`,
                      color: "amber",
                    },
                    {
                      icon: Clock,
                      label: "Thời gian học",
                      value: formatSchedule(classData.schedule),
                      color: "indigo",
                    },
                    {
                      icon: Calendar,
                      label: "Khoá học",
                      value: `${new Date(classData.startDate).toLocaleDateString("vi-VN")} - ${new Date(classData.endDate).toLocaleDateString("vi-VN")}`,
                      color: "emerald",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 bg-vintage-warm hover:bg-white hover:shadow-soft"
                    >
                      <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <VintageText variant="caption" className="text-vintage-neutral">
                          {item.label}
                        </VintageText>
                        <VintageText
                          variant="body"
                          className="font-semibold text-vintage-dark break-words"
                        >
                          {item.value}
                        </VintageText>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </VintageCard>
            </motion.div>

            {/* Attendance History Card */}
            {user && attendanceHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <VintageCard className="p-6 shadow-elegant">
                  <div className="flex items-center justify-between mb-4">
                    <VintageHeading level={4} className="text-vintage-dark">
                      Lịch sử điểm danh
                    </VintageHeading>
                    <button
                      onClick={() => setShowAttendanceHistory(!showAttendanceHistory)}
                      className="text-vintage-primary hover:text-vintage-gold transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>

                  {showAttendanceHistory && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {loadingAttendance ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vintage-primary mx-auto"></div>
                        </div>
                      ) : (
                        attendanceHistory.map((record, index) => (
                          <motion.div
                            key={record._id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              record.isPresent
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {record.isPresent ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <div className="flex-1">
                                <div className="font-semibold text-sm">
                                  Buổi {record.sessionNumber}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {new Date(record.sessionDate).toLocaleDateString('vi-VN')}
                                </div>
                                {sessionContents[record.sessionNumber] && (
                                  <div className="mt-2 text-xs">
                                    <div className="font-medium text-purple-700 mb-1">
                                      📚 {sessionContents[record.sessionNumber].title}
                                    </div>
                                    <div className="text-gray-600 line-clamp-2">
                                      {sessionContents[record.sessionNumber].content}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={`text-xs font-medium ${
                              record.isPresent ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {record.isPresent ? 'Có mặt' : 'Vắng'}
                            </div>
                          </motion.div>
                        ))
                      )}
                      {!loadingAttendance && attendanceHistory.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          Chưa có lịch sử điểm danh
                        </div>
                      )}
                    </div>
                  )}

                  {!showAttendanceHistory && (
                    <div className="text-center text-sm text-gray-600 py-2">
                      Nhấn biểu tượng mắt để xem chi tiết
                    </div>
                  )}
                </VintageCard>
              </motion.div>
            )}

          </div>
        </VintageGrid>
      </VintageContainer>
    </motion.div>
  );
}

