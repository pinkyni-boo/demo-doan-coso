import React, { useState, useEffect } from "react";
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

export default function ViewClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [userEnrollments, setUserEnrollments] = useState([]);

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

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/services");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

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
          color: "amber",
          text: "Đang diễn ra",
          bgColor: "bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200",
          textColor: "text-amber-900",
          borderColor: "border-amber-400",
          icon: PlayCircle,
          shadowColor: "shadow-amber-300/50",
        };
      case "completed":
        return {
          color: "vintage",
          text: "Hoàn thành",
          bgColor:
            "bg-gradient-to-r from-vintage-warm via-vintage-cream to-vintage-warm",
          textColor: "text-vintage-dark",
          borderColor: "border-vintage-accent",
          icon: CheckCircle,
          shadowColor: "shadow-vintage-accent/50",
        };
      case "cancelled":
        return {
          color: "neutral",
          text: "Đã hủy",
          bgColor: "bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-300",
          icon: AlertCircle,
          shadowColor: "shadow-gray-200/50",
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

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.instructorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || cls.status === statusFilter;
    const matchesService = !serviceFilter || cls.serviceName === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

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
                <div className="flex justify-center items-center space-x-12 pt-8 border-t-2 border-vintage-accent/30">
                  {[
                    {
                      icon: Award,
                      text: "50+ lớp học",
                    },
                    {
                      icon: Users,
                      text: "1000+ học viên",
                    },
                    {
                      icon: Crown,
                      text: "Chất lượng cao",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center space-x-3 group"
                    >
                      <div className="w-12 h-12 bg-vintage-warm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-soft">
                        <item.icon className="h-6 w-6 text-vintage-primary" />
                      </div>
                      <span className="text-vintage-dark font-semibold">
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
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
            <VintageGrid cols={{ sm: 1, md: 3 }} gap={6}>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-vintage-primary h-6 w-6 group-hover:text-vintage-gold transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm kiếm lớp học, huấn luyện viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full p-4 border-2 border-vintage-accent rounded-xl focus:ring-4 focus:ring-vintage-gold/30 focus:border-vintage-gold bg-white/90 backdrop-blur-sm transition-all duration-300 text-vintage-dark placeholder-vintage-neutral font-medium shadow-inner"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-4 border-2 border-vintage-accent rounded-xl focus:ring-4 focus:ring-vintage-gold/30 focus:border-vintage-gold bg-white/90 backdrop-blur-sm transition-all duration-300 text-vintage-dark font-medium shadow-inner"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Hoàn thành</option>
              </select>

              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="p-4 border-2 border-vintage-accent rounded-xl focus:ring-4 focus:ring-vintage-gold/30 focus:border-vintage-gold bg-white/90 backdrop-blur-sm transition-all duration-300 text-vintage-dark font-medium shadow-inner"
              >
                <option value="">Tất cả dịch vụ</option>
                {services.map((service) => (
                  <option key={service._id} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </VintageGrid>
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
                <VintageCard className="h-full overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/30 shadow-elegant hover:shadow-golden hover:border-vintage-gold/50 transition-all duration-500 relative">
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

                  {/* Luxury Class Header */}
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
                      </div>
                    </div>
                  </div>

                  {/* Luxury Class Info Grid */}
                  <div className="px-8 pb-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        {
                          icon: User,
                          label: "HLV",
                          value: classItem.instructorName || "Chưa có",
                        },
                        {
                          icon: Users,
                          label: "Học viên",
                          value: `${classItem.currentMembers || 0}/${
                            classItem.maxMembers
                          }`,
                        },
                        {
                          icon: MapPin,
                          label: "Địa điểm",
                          value: classItem.location || "Phòng tập chính",
                        },
                        {
                          icon: DollarSign,
                          label: "Học phí",
                          value: `${classItem.price?.toLocaleString() || 0}đ`,
                        },
                      ].map((info, infoIndex) => (
                        <div
                          key={infoIndex}
                          className="flex items-center p-3 bg-vintage-warm rounded-xl border border-vintage-accent hover:shadow-soft transition-all duration-300 group"
                        >
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0 shadow-soft group-hover:scale-110 transition-transform">
                            <info.icon className="h-5 w-5 text-vintage-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <VintageText
                              variant="caption"
                              className="text-vintage-neutral block font-medium"
                            >
                              {info.label}
                            </VintageText>
                            <VintageText
                              variant="body"
                              className="text-vintage-dark font-bold text-sm truncate"
                            >
                              {info.value}
                            </VintageText>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Luxury Schedule & Date */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center p-4 bg-gradient-to-r from-vintage-warm to-vintage-cream rounded-xl border-2 border-vintage-accent shadow-soft">
                        <Clock className="h-5 w-5 text-vintage-primary mr-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <VintageText
                            variant="caption"
                            className="text-vintage-neutral font-semibold"
                          >
                            Lịch học
                          </VintageText>
                          <VintageText
                            variant="body"
                            className="text-vintage-dark font-bold text-sm"
                          >
                            {formatSchedule(classItem.schedule)}
                          </VintageText>
                        </div>
                      </div>

                      <div className="flex items-center p-4 bg-gradient-to-r from-vintage-warm to-vintage-cream rounded-xl border-2 border-vintage-accent shadow-soft">
                        <Calendar className="h-5 w-5 text-vintage-primary mr-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <VintageText
                            variant="caption"
                            className="text-vintage-neutral font-semibold"
                          >
                            Thời gian
                          </VintageText>
                          <VintageText
                            variant="body"
                            className="text-vintage-dark font-bold text-sm"
                          >
                            {new Date(classItem.startDate).toLocaleDateString(
                              "vi-VN"
                            )}{" "}
                            -{" "}
                            {new Date(classItem.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </VintageText>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Luxury Description */}
                  {classItem.description && (
                    <div className="px-8 pb-6">
                      <div className="bg-gradient-to-r from-vintage-warm to-vintage-cream rounded-xl p-4 border-2 border-vintage-accent/60 shadow-inner">
                        <VintageText
                          variant="body"
                          className="text-vintage-neutral text-sm line-clamp-3 leading-relaxed"
                        >
                          {classItem.description}
                        </VintageText>
                      </div>
                    </div>
                  )}

                  {/* Luxury Action Buttons */}
                  <div className="px-8 pb-8 mt-auto">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        {user ? (
                          isEnrolled ? (
                            <VintageButton
                              variant="secondary"
                              size="sm"
                              disabled
                              className="w-full bg-vintage-warm border-2 border-vintage-accent text-vintage-dark opacity-90"
                            >
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Đã đăng ký
                            </VintageButton>
                          ) : canEnroll ? (
                            <VintageButton
                              variant="gold"
                              size="sm"
                              onClick={() => handleEnroll(classItem._id)}
                              disabled={enrolling === classItem._id}
                              className="w-full bg-gradient-golden hover:bg-gradient-luxury text-vintage-dark hover:text-white border-0 shadow-golden hover:shadow-elegant group relative overflow-hidden font-bold"
                            >
                              <div className="relative z-10 flex items-center justify-center">
                                {enrolling === classItem._id ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Đang đăng ký...
                                  </>
                                ) : (
                                  <>
                                    <BookOpen className="h-5 w-5 mr-2" />
                                    Đăng ký ngay
                                  </>
                                )}
                              </div>
                              {enrolling !== classItem._id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                              )}
                            </VintageButton>
                          ) : (
                            <VintageButton
                              variant="secondary"
                              size="sm"
                              disabled
                              className="w-full bg-gray-100 border-2 border-gray-300 text-gray-500 opacity-60"
                            >
                              <AlertCircle className="h-5 w-5 mr-2" />
                              Không thể đăng ký
                            </VintageButton>
                          )
                        ) : (
                          <VintageButton
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate("/login")}
                            className="w-full bg-vintage-warm border-2 border-vintage-accent text-vintage-dark hover:bg-vintage-accent group"
                          >
                            <User className="h-5 w-5 mr-2" />
                            Đăng nhập
                          </VintageButton>
                        )}
                      </div>

                      <VintageButton
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/classes/${classItem._id}`)}
                        className="px-4 bg-vintage-warm border-2 border-vintage-accent text-vintage-primary hover:bg-vintage-accent group"
                      >
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </VintageButton>
                    </div>
                  </div>

                  {/* Luxury Progress Bar */}
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
                  setServiceFilter("");
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
        >
          <VintageCard className="p-10 bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/30 shadow-elegant">
            <VintageHeading
              level={2}
              className="text-center mb-12 text-vintage-dark text-3xl"
            >
              Thống kê lớp học
            </VintageHeading>
            <VintageGrid cols={{ sm: 2, md: 4 }} gap={8}>
              {[
                {
                  icon: BookOpen,
                  label: "Tổng lớp học",
                  value: classes.length,
                },
                {
                  icon: PlayCircle,
                  label: "Đang hoạt động",
                  value: classes.filter((c) => c.status === "ongoing").length,
                },
                {
                  icon: Calendar,
                  label: "Sắp diễn ra",
                  value: classes.filter((c) => c.status === "upcoming").length,
                },
                {
                  icon: Users,
                  label: "Tổng học viên",
                  value: classes.reduce(
                    (sum, c) => sum + (c.currentMembers || 0),
                    0
                  ),
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="text-center p-8 bg-gradient-to-br from-vintage-warm to-vintage-cream rounded-2xl border-2 border-vintage-accent hover:shadow-golden transition-all duration-300 group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-vintage-accent rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-soft">
                    <stat.icon className="h-8 w-8 text-vintage-primary" />
                  </div>
                  <div className="text-4xl font-bold text-vintage-dark mb-3">
                    {stat.value}
                  </div>
                  <VintageText
                    variant="body"
                    className="text-vintage-neutral font-semibold text-lg"
                  >
                    {stat.label}
                  </VintageText>
                </motion.div>
              ))}
            </VintageGrid>

            {/* Luxury Features */}
            <div className="mt-12 pt-12 border-t-2 border-vintage-accent/30">
              <VintageHeading
                level={3}
                className="text-center mb-8 text-vintage-dark text-2xl"
              >
                Tại sao chọn chúng tôi?
              </VintageHeading>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Crown,
                    title: "Chất lượng hàng đầu",
                    description:
                      "Đội ngũ huấn luyện viên chuyên nghiệp với chứng chỉ quốc tế",
                  },
                  {
                    icon: Shield,
                    title: "An toàn tuyệt đối",
                    description:
                      "Thiết bị hiện đại, quy trình an toàn nghiêm ngặt",
                  },
                  {
                    icon: Heart,
                    title: "Tận tâm chu đáo",
                    description:
                      "Hỗ trợ học viên 24/7, cam kết mang lại kết quả tốt nhất",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="text-center p-6 bg-gradient-to-br from-vintage-warm to-vintage-cream rounded-2xl border-2 border-vintage-accent hover:shadow-golden transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 bg-vintage-accent rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-7 w-7 text-vintage-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-vintage-dark mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-vintage-neutral leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </VintageCard>
        </motion.div>
      </VintageContainer>
    </motion.div>
  );
}
