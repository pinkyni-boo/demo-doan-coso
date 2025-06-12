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
} from "lucide-react";
import { toast } from "react-toastify";

export default function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchClassDetails();
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
          text: "Sắp diễn ra",
          bgColor: "bg-gradient-to-r from-blue-100 to-blue-200",
          textColor: "text-blue-800",
          borderColor: "border-blue-300",
        };
      case "ongoing":
        return {
          color: "green",
          text: "Đang diễn ra",
          bgColor: "bg-gradient-to-r from-green-100 to-green-200",
          textColor: "text-green-800",
          borderColor: "border-green-300",
        };
      case "completed":
        return {
          color: "gray",
          text: "Hoàn thành",
          bgColor: "bg-gradient-to-r from-gray-100 to-gray-200",
          textColor: "text-gray-800",
          borderColor: "border-gray-300",
        };
      case "cancelled":
        return {
          color: "red",
          text: "Đã hủy",
          bgColor: "bg-gradient-to-r from-red-100 to-red-200",
          textColor: "text-red-800",
          borderColor: "border-red-300",
        };
      default:
        return {
          color: "gray",
          text: "Không xác định",
          bgColor: "bg-gradient-to-r from-gray-100 to-gray-200",
          textColor: "text-gray-800",
          borderColor: "border-gray-300",
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
                Lớp học bạn đang tìm kiếm có thể đã được cập nhật hoặc không còn
                khả dụng.
              </VintageText>
              <VintageButton
                variant="primary"
                onClick={() => navigate("/classes")}
                className="group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Quay lại danh sách lớp học
              </VintageButton>
            </VintageCard>
          </motion.div>
        </VintageContainer>
      </div>
    );
  }

  const statusInfo = getStatusInfo(classData.status);
  const canEnroll =
    classData.status === "upcoming" &&
    classData.currentMembers < classData.maxMembers;
  const progressPercent =
    classData.totalSessions > 0
      ? ((classData.currentSession || 0) / classData.totalSessions) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream pt-24 pb-16"
    >
      <VintageContainer>
        {/* Enhanced Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 shadow-soft border border-vintage-gold/20">
            <div className="flex items-center space-x-3 text-sm">
              <button
                onClick={() => navigate("/classes")}
                className="flex items-center text-vintage-primary hover:text-vintage-gold transition-colors font-medium group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Danh sách lớp học
              </button>
              <span className="text-vintage-gold">•</span>
              <span className="text-vintage-neutral font-medium">
                {classData.className}
              </span>
            </div>
          </div>
        </motion.div>

        <VintageGrid cols={{ sm: 1, lg: 3 }} gap={12}>
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <VintageCard className="p-8 shadow-elegant">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-luxury rounded-xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <VintageHeading
                          level={1}
                          className="text-vintage-dark leading-tight"
                        >
                          {classData.className}
                        </VintageHeading>
                        <VintageText
                          variant="body"
                          className="text-vintage-primary font-medium"
                        >
                          {classData.serviceName}
                        </VintageText>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full border ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor}`}
                    >
                      <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></div>
                      <span className="font-semibold text-sm">
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Class Stats */}
                <VintageGrid cols={{ sm: 2, md: 4 }} gap={4} className="mb-6">
                  {[
                    {
                      icon: Users,
                      value: `${classData.currentMembers || 0}/${
                        classData.maxMembers
                      }`,
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
                      <stat.icon
                        className={`h-6 w-6 text-${stat.color}-600 mx-auto mb-2`}
                      />
                      <div
                        className={`text-xl font-bold text-${stat.color}-800`}
                      >
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
                    <VintageText
                      variant="caption"
                      className="text-vintage-neutral"
                    >
                      Tiến độ lớp học
                    </VintageText>
                    <VintageText
                      variant="caption"
                      className="text-vintage-primary font-semibold"
                    >
                      {progressPercent.toFixed(1)}% hoàn thành
                    </VintageText>
                  </div>
                  <div className="w-full bg-vintage-warm rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-luxury h-full rounded-full shadow-inner"
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

                    {/* Floating Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-8 w-8 text-vintage-primary ml-1" />
                      </div>
                    </div>

                    {/* Class Info Overlay */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-soft">
                        <div className="flex items-center justify-between">
                          <div>
                            <VintageText
                              variant="caption"
                              className="text-vintage-neutral"
                            >
                              Học phí
                            </VintageText>
                            <VintageText
                              variant="body"
                              className="font-bold text-vintage-primary text-lg"
                            >
                              {classData.price?.toLocaleString() || "0"}đ
                            </VintageText>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-vintage-gold fill-current" />
                            <span className="text-sm font-medium text-vintage-primary">
                              4.8/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </VintageCard>
              </motion.div>
            )}

            {/* Description */}
            {classData.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <VintageCard className="p-8 shadow-elegant">
                  <VintageHeading
                    level={3}
                    className="mb-6 text-vintage-dark flex items-center"
                  >
                    <Target className="h-6 w-6 mr-3 text-vintage-primary" />
                    Mô tả lớp học
                  </VintageHeading>
                  <VintageText
                    variant="body"
                    className="text-vintage-neutral leading-relaxed text-lg"
                  >
                    {classData.description}
                  </VintageText>
                </VintageCard>
              </motion.div>
            )}

            {/* Service Benefits */}
            {classData.service?.benefits &&
              classData.service.benefits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <VintageCard className="p-8 shadow-elegant">
                    <VintageHeading
                      level={3}
                      className="mb-6 text-vintage-dark flex items-center"
                    >
                      <Award className="h-6 w-6 mr-3 text-vintage-gold" />
                      Lợi ích từ lớp học
                    </VintageHeading>
                    <VintageGrid cols={{ sm: 1, md: 2 }} gap={4}>
                      {classData.service.benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center p-3 bg-vintage-warm rounded-lg"
                        >
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                          <VintageText
                            variant="body"
                            className="text-vintage-neutral"
                          >
                            {benefit}
                          </VintageText>
                        </motion.div>
                      ))}
                    </VintageGrid>
                  </VintageCard>
                </motion.div>
              )}

            {/* Requirements */}
            {classData.requirements && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <VintageCard className="p-8 shadow-elegant">
                  <VintageHeading
                    level={3}
                    className="mb-6 text-vintage-dark flex items-center"
                  >
                    <Shield className="h-6 w-6 mr-3 text-red-500" />
                    Yêu cầu tham gia
                  </VintageHeading>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <VintageText
                      variant="body"
                      className="text-red-700 leading-relaxed"
                    >
                      {classData.requirements}
                    </VintageText>
                  </div>
                </VintageCard>
              </motion.div>
            )}

            {/* Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <VintageCard className="p-8 shadow-elegant">
                <VintageHeading
                  level={3}
                  className="mb-6 text-vintage-dark flex items-center"
                >
                  <Clock className="h-6 w-6 mr-3 text-blue-500" />
                  Lịch học chi tiết
                </VintageHeading>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <VintageText
                    variant="body"
                    className="text-blue-700 font-medium text-lg"
                  >
                    {formatSchedule(classData.schedule)}
                  </VintageText>
                </div>
              </VintageCard>
            </motion.div>
          </div>

          {/* Sidebar - Enhanced */}
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

                <div className="space-y-6">
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
                      value: classData.location,
                      color: "blue",
                    },
                    {
                      icon: Users,
                      label: "Học viên",
                      value: `${classData.currentMembers || 0}/${
                        classData.maxMembers
                      }`,
                      color: "green",
                    },
                    {
                      icon: BookOpen,
                      label: "Tổng buổi học",
                      value: `${classData.totalSessions} buổi`,
                      color: "amber",
                    },
                    {
                      icon: Calendar,
                      label: "Thời gian",
                      value: `${new Date(
                        classData.startDate
                      ).toLocaleDateString("vi-VN")} - ${new Date(
                        classData.endDate
                      ).toLocaleDateString("vi-VN")}`,
                      color: "red",
                    },
                    {
                      icon: DollarSign,
                      label: "Học phí",
                      value: `${classData.price?.toLocaleString() || 0}đ`,
                      color: "emerald",
                      highlight: true,
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 ${
                        item.highlight
                          ? "bg-gradient-to-r from-vintage-gold/20 to-vintage-accent/20 border border-vintage-gold/30"
                          : "bg-vintage-warm hover:bg-white hover:shadow-soft"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <item.icon
                          className={`h-5 w-5 text-${item.color}-600`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <VintageText
                          variant="caption"
                          className="text-vintage-neutral"
                        >
                          {item.label}
                        </VintageText>
                        <VintageText
                          variant="body"
                          className={`font-semibold ${
                            item.highlight
                              ? "text-vintage-primary text-lg"
                              : "text-vintage-dark"
                          } break-words`}
                        >
                          {item.value}
                        </VintageText>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </VintageCard>
            </motion.div>

            {/* Enrollment Stats */}
            {classData.enrollmentStats && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <VintageCard className="p-6 shadow-elegant">
                  <VintageHeading
                    level={4}
                    className="mb-6 text-vintage-dark flex items-center"
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Thống kê đăng ký
                  </VintageHeading>

                  <div className="space-y-4">
                    {[
                      {
                        label: "Tổng đăng ký",
                        value: classData.enrollmentStats.totalEnrollments,
                        color: "blue",
                      },
                      {
                        label: "Đã thanh toán",
                        value: classData.enrollmentStats.paidEnrollments,
                        color: "green",
                      },
                      {
                        label: "Chờ thanh toán",
                        value: classData.enrollmentStats.pendingPayments,
                        color: "amber",
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-vintage-warm rounded-lg"
                      >
                        <VintageText
                          variant="body"
                          className="text-vintage-neutral"
                        >
                          {stat.label}:
                        </VintageText>
                        <VintageText
                          variant="body"
                          className={`font-bold text-${stat.color}-600`}
                        >
                          {stat.value}
                        </VintageText>
                      </div>
                    ))}
                  </div>
                </VintageCard>
              </motion.div>
            )}

            {/* Enrollment Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <VintageCard className="p-6 shadow-elegant">
                {canEnroll ? (
                  <VintageButton
                    variant="gold"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full group relative overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      {enrolling ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Đang đăng ký...
                        </>
                      ) : (
                        <>
                          <Crown className="h-5 w-5 mr-2" />
                          Đăng ký ngay
                          <Sparkles className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform" />
                        </>
                      )}
                    </div>
                    {!enrolling && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    )}
                  </VintageButton>
                ) : (
                  <div className="text-center">
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                      <VintageText
                        variant="body"
                        className="text-gray-600 mb-2"
                      >
                        {classData.status === "completed"
                          ? "Lớp học đã kết thúc"
                          : classData.status === "ongoing"
                          ? "Lớp học đang diễn ra"
                          : classData.status === "cancelled"
                          ? "Lớp học đã bị hủy"
                          : classData.currentMembers >= classData.maxMembers
                          ? "Lớp học đã đầy"
                          : "Không thể đăng ký"}
                      </VintageText>
                    </div>
                    <VintageButton
                      variant="secondary"
                      size="lg"
                      disabled
                      className="w-full"
                    >
                      Không thể đăng ký
                    </VintageButton>
                  </div>
                )}

                {/* Additional CTA */}
                <div className="mt-4 pt-4 border-t border-vintage-gold/20">
                  <VintageText
                    variant="caption"
                    className="text-center text-vintage-neutral mb-3"
                  >
                    Cần hỗ trợ?
                  </VintageText>
                  <VintageButton
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate("/club")}
                  >
                    Liên hệ tư vấn
                  </VintageButton>
                </div>
              </VintageCard>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <VintageCard className="p-6 shadow-elegant">
                <VintageHeading
                  level={5}
                  className="mb-4 text-vintage-dark text-center"
                >
                  Cam kết chất lượng
                </VintageHeading>
                <div className="space-y-3 text-center">
                  {[
                    { icon: Shield, text: "Đảm bảo an toàn" },
                    { icon: Award, text: "Chứng chỉ quốc tế" },
                    { icon: Heart, text: "500+ học viên hài lòng" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center space-x-2 text-vintage-neutral"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </VintageCard>
            </motion.div>
          </div>
        </VintageGrid>
      </VintageContainer>
    </motion.div>
  );
}
