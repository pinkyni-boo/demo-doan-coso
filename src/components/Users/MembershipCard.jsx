import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Crown,
  Star,
  Calendar,
  Gift,
  Award,
  Shield,
  Clock,
  Users,
  Zap,
  Heart,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Diamond,
  Gem,
  BadgeCheck,
  Flame,
  Coins,
  Trophy,
  MapPin,
  Phone,
  Mail,
  Wifi,
  CreditCard as CardIcon,
} from "lucide-react";
import axios from "axios";

const BenefitItem = ({ children }) => (
  <li className="flex items-start group hover:transform hover:translate-x-2 transition-all duration-300">
    <div className="relative">
      <CheckCircle className="h-5 w-5 text-vintage-gold mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
      <div className="absolute -inset-1 bg-vintage-gold/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <span className="text-vintage-dark vintage-body group-hover:text-vintage-primary transition-colors duration-300">
      {children}
    </span>
  </li>
);

// CSS Animation Styles
const addCardStyles = () => {
  if (!document.getElementById("membership-card-styles")) {
    const style = document.createElement("style");
    style.id = "membership-card-styles";
    style.textContent = `
      @keyframes float {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg) scale(1); 
          opacity: 0.7;
        }
        33% { 
          transform: translateY(-12px) rotate(120deg) scale(1.1); 
          opacity: 1;
        }
        66% { 
          transform: translateY(8px) rotate(240deg) scale(0.9); 
          opacity: 0.8;
        }
      }
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      .shimmer-effect {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        animation: shimmer 2s infinite;
      }
      
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
        50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
      }
      
      .pulse-glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }

      @keyframes hologram {
        0%, 100% { 
          background-position: 0% 50%;
          filter: hue-rotate(0deg);
        }
        50% { 
          background-position: 100% 50%;
          filter: hue-rotate(180deg);
        }
      }
      
      .hologram-effect {
        background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1));
        background-size: 200% 200%;
        animation: hologram 4s ease-in-out infinite;
      }

      @keyframes circuit-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      
      .circuit-pattern {
        animation: circuit-pulse 4s ease-in-out infinite;
      }

      @keyframes geometric-rotate {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.1); }
        100% { transform: rotate(360deg) scale(1); }
      }
      
      .geometric-pattern {
        animation: geometric-rotate 15s linear infinite;
      }

      @keyframes wave-flow {
        0% { transform: translateX(-100%) skewX(-5deg); }
        100% { transform: translateX(100%) skewX(-5deg); }
      }
      
      .wave-pattern {
        animation: wave-flow 8s ease-in-out infinite;
      }

      @keyframes constellation {
        0%, 100% { opacity: 0.4; transform: translateY(0px); }
        25% { opacity: 1; transform: translateY(-3px); }
        75% { opacity: 0.6; transform: translateY(2px); }
      }
      
      .constellation-star {
        animation: constellation 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }
};

const MembershipCard = ({ user, cardVariants }) => {
  const navigate = useNavigate();
  const [showMembershipDetails, setShowMembershipDetails] = useState(false);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBenefits, setShowBenefits] = useState(false);
  const [hasActiveMembership, setHasActiveMembership] = useState(false);
  const [userStats, setUserStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    completionRate: 0,
    membershipMonths: 0,
  });

  // Benefits data
  const standardBenefits = [
    "🏋️ Truy cập tất cả thiết bị cơ bản",
    "👥 Tham gia lớp học nhóm không giới hạn",
    "🚿 Phòng thay đồ và tủ khóa cao cấp",
    "💪 Hỗ trợ kỹ thuật và tư vấn cơ bản",
    "🎁 Ưu đãi đặc biệt các dịp lễ tết",
    "📱 Ứng dụng theo dõi tiến độ tập luyện",
  ];

  const vipBenefits = [
    "💎 Truy cập không giới hạn tất cả thiết bị",
    "👨‍💼 Lớp học cá nhân với PT chuyên nghiệp",
    "🏛️ Phòng VIP và spa thư giãn cao cấp",
    "🥗 Tư vấn dinh dưỡng chuyên sâu",
    "⭐ Ưu tiên đặt lịch và hỗ trợ 24/7",
    "🥤 Miễn phí đồ uống và khăn tập cao cấp",
    "👫 Quyền mang 2 khách tham quan/tháng",
    "🏆 Chương trình thưởng điểm VIP",
  ];

  const platinumBenefits = [
    ...vipBenefits,
    "🌟 Dịch vụ concierge 24/7",
    "🎯 Phòng tập riêng biệt",
    "🥇 Ưu tiên tuyệt đối mọi dịch vụ",
  ];

  const diamondBenefits = [
    ...platinumBenefits,
    "💎 Dịch vụ VIP tối cao",
    "👑 Quyền lợi độc quyền",
    "🏆 Trải nghiệm đẳng cấp hoàng gia",
  ];

  // Enhanced membership configurations with beautiful colors
  const membershipConfigs = {
    Standard: {
      // Giữ nguyên màu thẻ
      cardGradient: "from-blue-600 via-blue-700 to-blue-800",
      glowEffect: "from-blue-300 via-sky-300 to-blue-400",
      textColor: "text-white",
      primaryColor: "text-blue-200",
      secondaryColor: "text-blue-100",
      icon: CreditCard,
      badge: "bg-gradient-to-r from-blue-500 to-sky-600",
      benefits: standardBenefits,
      tier: "STANDARD",
      accentColor: "border-blue-300",
      statsBg: "bg-blue-50/80",
      // Đổi màu nút thành vintage
      buttonStyle:
        "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-yellow-600 hover:to-amber-600",
      pattern: "opacity-10",
    },
    VIP: {
      // Giữ nguyên màu thẻ vàng
      cardGradient: "from-amber-500 via-yellow-600 to-orange-600",
      glowEffect: "from-amber-400 via-yellow-400 to-orange-400",
      textColor: "text-white",
      primaryColor: "text-amber-100",
      secondaryColor: "text-yellow-100",
      icon: Crown,
      badge: "bg-gradient-to-r from-amber-500 to-yellow-600",
      benefits: vipBenefits,
      tier: "VIP LUXURY",
      accentColor: "border-amber-300",
      statsBg: "bg-amber-50/80",
      // Đổi màu nút thành vintage
      buttonStyle:
        "bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-yellow-700 hover:to-amber-700",
      pattern: "opacity-15",
    },
    Platinum: {
      // Giữ nguyên màu thẻ xanh lá
      cardGradient: "from-emerald-600 via-teal-700 to-cyan-700",
      glowEffect: "from-emerald-400 via-teal-400 to-cyan-400",
      textColor: "text-white",
      primaryColor: "text-emerald-100",
      secondaryColor: "text-teal-100",
      icon: Diamond,
      badge: "bg-gradient-to-r from-emerald-500 to-teal-600",
      benefits: platinumBenefits,
      tier: "PLATINUM ELITE",
      accentColor: "border-emerald-300",
      statsBg: "bg-emerald-50/80",
      // Đổi màu nút thành vintage
      buttonStyle:
        "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-yellow-600 hover:to-amber-600",
      pattern: "opacity-20",
    },
    Diamond: {
      // Giữ nguyên màu thẻ tím
      cardGradient: "from-purple-700 via-violet-800 to-indigo-800",
      glowEffect: "from-purple-400 via-violet-400 to-fuchsia-400",
      textColor: "text-white",
      primaryColor: "text-purple-100",
      secondaryColor: "text-violet-100",
      icon: Gem,
      badge: "bg-gradient-to-r from-purple-500 to-violet-600",
      benefits: diamondBenefits,
      tier: "DIAMOND ROYAL",
      accentColor: "border-purple-300",
      statsBg: "bg-purple-50/80",
      // Đổi màu nút thành vintage
      buttonStyle:
        "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-yellow-600 hover:to-amber-600",
      pattern: "opacity-25",
    },
  };

  useEffect(() => {
    addCardStyles();
    fetchMembershipData();
    fetchUserStats();
  }, [user]);

  const fetchMembershipData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Reset states
      setHasActiveMembership(false);
      setMembership(null);

      // Nếu có token và user ID, thử lấy từ API trước
      if (token && user?._id) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/memberships/user/${user._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data && response.data.status === "active") {
            console.log("Active membership found:", response.data);
            setHasActiveMembership(true);
            setMembership({
              id: response.data._id || response.data.id,
              type: response.data.type,
              startDate: response.data.startDate,
              endDate: response.data.endDate,
              isActive: true,
              status: response.data.status,
              benefits:
                membershipConfigs[response.data.type]?.benefits ||
                standardBenefits,
            });
            return;
          } else {
            console.log("No active membership found from API");
            setHasActiveMembership(false);
          }
        } catch (apiError) {
          console.log("API call failed:", apiError.message);
          // Kiểm tra nếu là 404 (không tìm thấy) thì user chưa có membership
          if (apiError.response?.status === 404) {
            setHasActiveMembership(false);
          }
        }
      }

      // Kiểm tra membership từ user object
      if (user?.membership && user.membership.status === "active") {
        console.log("Using membership from user object:", user.membership);
        setHasActiveMembership(true);
        const membershipData = {
          id:
            user.membership.id ||
            "MEM" + Math.floor(10000 + Math.random() * 90000),
          type: user.membership.type,
          startDate: user.membership.startDate,
          endDate: user.membership.endDate,
          isActive: true,
          status: user.membership.status,
          benefits:
            membershipConfigs[user.membership.type]?.benefits ||
            standardBenefits,
        };
        setMembership(membershipData);
      } else {
        console.log("No active membership found, user needs to register");
        setHasActiveMembership(false);
        setMembership(null);
      }
    } catch (err) {
      console.error("Error fetching membership:", err);
      setError("Không thể tải thông tin thẻ thành viên");
      setHasActiveMembership(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user?._id) return;

      const response = await axios.get(
        `http://localhost:5000/api/classes/user/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const enrollments = response.data || [];
      const activeClasses = enrollments.filter(
        (e) => e.class?.status === "ongoing" || e.class?.status === "upcoming"
      ).length;
      const completedClasses = enrollments.filter(
        (e) => e.class?.status === "completed"
      ).length;
      const completionRate =
        enrollments.length > 0
          ? Math.round((completedClasses / enrollments.length) * 100)
          : 0;
      const startDate = new Date(user?.createdAt || Date.now());
      const now = new Date();
      const membershipMonths = Math.max(
        1,
        Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 30))
      );

      setUserStats({
        totalClasses: enrollments.length,
        activeClasses,
        completionRate,
        membershipMonths,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setUserStats({
        totalClasses: 24,
        activeClasses: 5,
        completionRate: 92,
        membershipMonths: 6,
      });
    }
  };

  if (loading) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/95 backdrop-blur-sm border-2 border-amber-200/50 shadow-2xl rounded-3xl p-8"
      >
        <div className="text-center py-12">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-amber-200/30 rounded-full mx-auto animate-pulse"></div>
          </div>
          <h4 className="text-stone-800 text-lg font-semibold vintage-heading mb-2">
            Đang tải thông tin thẻ thành viên
          </h4>
          <p className="text-stone-600 vintage-serif">
            Vui lòng đợi trong giây lát...
          </p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/95 backdrop-blur-sm border-2 border-red-200 shadow-2xl rounded-3xl p-8"
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-red-500" />
          </div>
          <h4 className="text-red-600 text-lg font-semibold vintage-heading mb-2">
            Không thể tải thông tin
          </h4>
          <p className="text-red-500 vintage-serif">{error}</p>
        </div>
      </motion.div>
    );
  }

  // Nếu chưa có thẻ thành viên active
  if (!hasActiveMembership || !membership) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* No Membership Card */}
        <div className="bg-white/95 backdrop-blur-sm border-2 border-amber-200/50 shadow-2xl rounded-3xl p-8">
          <div className="text-center py-12">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto border-4 border-amber-300/50 shadow-lg">
                <CreditCard className="h-12 w-12 text-amber-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-stone-800 mb-4 vintage-heading">
              Bạn chưa có thẻ thành viên
            </h3>
            <p className="text-stone-600 mb-8 vintage-serif max-w-md mx-auto">
              Đăng ký thẻ thành viên ngay để tận hưởng các quyền lợi độc quyền
              và trải nghiệm tập luyện tốt nhất!
            </p>

            {/* Benefits Preview */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                {
                  icon: "🏋️",
                  title: "Thiết bị hiện đại",
                  desc: "Truy cập tất cả thiết bị cao cấp",
                },
                {
                  icon: "👥",
                  title: "Lớp học đa dạng",
                  desc: "Tham gia các lớp fitness chuyên nghiệp",
                },
                {
                  icon: "💪",
                  title: "Huấn luyện viên PT",
                  desc: "Hỗ trợ từ các chuyên gia fitness",
                },
                {
                  icon: "🎁",
                  title: "Ưu đãi đặc biệt",
                  desc: "Nhiều chương trình khuyến mãi hấp dẫn",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/50 text-left"
                >
                  <div className="text-2xl mb-2">{benefit.icon}</div>
                  <h4 className="font-semibold text-stone-800 mb-1 vintage-heading">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-stone-600 vintage-serif">
                    {benefit.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate("/membership")}
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-yellow-600 hover:to-amber-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Crown className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Đăng ký thẻ thành viên ngay
              </motion.button>

              <motion.button
                onClick={() => navigate("/classes")}
                className="bg-gradient-to-r from-stone-600 to-amber-700 hover:from-amber-700 hover:to-stone-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="h-5 w-5 mr-2" />
                Xem lớp học
              </motion.button>
            </div>
          </div>
        </div>

        {/* Membership Packages Preview */}
        <motion.div
          className="bg-white/95 backdrop-blur-sm border-2 border-amber-200/50 shadow-2xl rounded-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="text-xl font-bold text-stone-800 mb-6 text-center vintage-heading">
            Các gói thành viên phổ biến
          </h4>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Standard",
                price: "299,000đ/tháng",
                color: "from-blue-500 to-blue-600",
                popular: false,
              },
              {
                name: "VIP",
                price: "599,000đ/tháng",
                color: "from-amber-500 to-yellow-600",
                popular: true,
              },
              {
                name: "Platinum",
                price: "999,000đ/tháng",
                color: "from-emerald-500 to-teal-600",
                popular: false,
              },
            ].map((pkg, index) => (
              <motion.div
                key={index}
                className={`relative p-4 bg-gradient-to-r ${pkg.color} text-white rounded-xl text-center cursor-pointer hover:shadow-lg transition-all duration-300 m-4`}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/membership")}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Phổ biến nhất
                  </div>
                )}
                <h5 className="font-bold text-lg mb-2">{pkg.name}</h5>
                <p className="text-sm opacity-90 mb-2">{pkg.price}</p>
                <p className="text-xs opacity-75">Nhấn để xem chi tiết</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Nếu có thẻ thành viên, hiển thị như bình thường
  const config =
    membershipConfigs[membership.type] || membershipConfigs.Standard;
  const IconComponent = config.icon;
  const daysLeft = membership?.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Physical Membership Card Design */}
      <div className="relative group">
        {/* Enhanced Glow Effect */}
        <div
          className={`absolute -inset-4 bg-gradient-to-r ${config.glowEffect} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500 pulse-glow`}
        ></div>

        {/* Credit Card Container */}
        <motion.div
          className="relative"
          style={{ aspectRatio: "1.586" }}
          whileHover={{
            scale: 1.05,
            rotateY: 5,
            rotateX: 5,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Credit Card */}
          <div
            className={`
            relative w-full h-full
            bg-gradient-to-br ${config.cardGradient}
            rounded-2xl shadow-2xl overflow-hidden
            border border-white/20
            transform-gpu perspective-1000
          `}
          >
            {/* Holographic/Shimmer Effect */}
            <div className="absolute inset-0 hologram-effect opacity-30"></div>

            {/* Advanced Background Patterns */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Circuit Board Pattern */}
              <div className="absolute top-4 right-4 w-20 h-20 circuit-pattern">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-white/20"
                >
                  <path
                    d="M10,10 L30,10 L30,30 L50,30 L50,50 L70,50 L70,70 L90,70"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d="M20,20 L40,20 L40,40 L60,40 L60,60 L80,60"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <circle cx="30" cy="30" r="2" fill="currentColor" />
                  <circle cx="50" cy="50" r="2" fill="currentColor" />
                  <circle cx="70" cy="70" r="2" fill="currentColor" />
                </svg>
              </div>

              {/* Geometric Hexagon Pattern */}
              <div className="absolute bottom-4 left-4 w-16 h-16 geometric-pattern">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-white/15"
                >
                  <polygon
                    points="50,5 85,25 85,75 50,95 15,75 15,25"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                  />
                  <polygon
                    points="50,20 70,30 70,70 50,80 30,70 30,30"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Constellation Pattern */}
              <div className="absolute top-8 left-8 w-24 h-24">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white/60 rounded-full constellation-star"
                    style={{
                      left: `${Math.random() * 80}%`,
                      top: `${Math.random() * 80}%`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  />
                ))}
                {/* Constellation Lines */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-white/10"
                >
                  <path
                    d="M20,30 L40,20 L60,35 L80,25 L70,50 L85,70 L65,80 L45,70 L25,75 L15,55 Z"
                    stroke="currentColor"
                    strokeWidth="0.3"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Wave Flow Pattern */}
              <div className="absolute top-1/2 left-0 w-full h-8 wave-pattern opacity-20">
                <svg viewBox="0 0 400 32" className="w-full h-full">
                  <path
                    d="M0,16 Q50,8 100,16 T200,16 T300,16 T400,16"
                    stroke="url(#waveGradient)"
                    strokeWidth="1"
                    fill="none"
                  />
                  <defs>
                    <linearGradient
                      id="waveGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                      <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* DNA Helix Pattern */}
              <div className="absolute bottom-8 right-8 w-12 h-20">
                <svg
                  viewBox="0 0 48 80"
                  className="w-full h-full text-white/15"
                >
                  <path
                    d="M12,10 Q24,20 36,10 Q24,30 12,20 Q24,40 36,30 Q24,50 12,40 Q24,60 36,50 Q24,70 12,60"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d="M36,10 Q24,20 12,10 Q24,30 36,20 Q24,40 12,30 Q24,50 36,40 Q24,60 12,50 Q24,70 36,60"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                  />
                  {[...Array(8)].map((_, i) => (
                    <line
                      key={i}
                      x1="12"
                      y1={10 + i * 10}
                      x2="36"
                      y2={10 + i * 10}
                      stroke="currentColor"
                      strokeWidth="0.3"
                    />
                  ))}
                </svg>
              </div>

              {/* Matrix Digital Rain Effect */}
              <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-px bg-gradient-to-b from-transparent via-white/20 to-transparent animate-float"
                    style={{
                      left: `${5 + i * 6}%`,
                      height: "60%",
                      top: `${Math.random() * 40}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${4 + Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>

              {/* Mandala Pattern (for VIP+ tiers) */}
              {membership?.type !== "Standard" && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-5">
                  <svg
                    viewBox="0 0 128 128"
                    className="w-full h-full text-white geometric-pattern"
                  >
                    <g transform="translate(64,64)">
                      {[...Array(8)].map((_, i) => (
                        <g key={i} transform={`rotate(${i * 45})`}>
                          <path
                            d="M0,-30 Q15,-20 0,-10 Q-15,-20 0,-30"
                            fill="currentColor"
                          />
                          <circle cx="0" cy="-25" r="2" fill="currentColor" />
                        </g>
                      ))}
                      <circle
                        cx="0"
                        cy="0"
                        r="15"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="25"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                    </g>
                  </svg>
                </div>
              )}

              {/* Premium Luxury Ornaments (for Platinum+ tiers) */}
              {(membership?.type === "Platinum" ||
                membership?.type === "Diamond") && (
                <>
                  {/* Corner Ornaments */}
                  <div className="absolute top-2 left-2 w-8 h-8">
                    <svg
                      viewBox="0 0 32 32"
                      className="w-full h-full text-white/25"
                    >
                      <path
                        d="M2,2 L15,2 Q16,2 16,3 L16,15 Q16,16 15,16 L3,16 Q2,16 2,15 L2,3 Q2,2 3,2"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <path
                        d="M4,4 L13,4 L13,13 L4,13 Z"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                      <circle
                        cx="8.5"
                        cy="8.5"
                        r="2"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                    </svg>
                  </div>

                  <div className="absolute top-2 right-2 w-8 h-8 transform rotate-90">
                    <svg
                      viewBox="0 0 32 32"
                      className="w-full h-full text-white/25"
                    >
                      <path
                        d="M2,2 L15,2 Q16,2 16,3 L16,15 Q16,16 15,16 L3,16 Q2,16 2,15 L2,3 Q2,2 3,2"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <path
                        d="M4,4 L13,4 L13,13 L4,13 Z"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                      <circle
                        cx="8.5"
                        cy="8.5"
                        r="2"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                    </svg>
                  </div>

                  <div className="absolute bottom-2 left-2 w-8 h-8 transform rotate-270">
                    <svg
                      viewBox="0 0 32 32"
                      className="w-full h-full text-white/25"
                    >
                      <path
                        d="M2,2 L15,2 Q16,2 16,3 L16,15 Q16,16 15,16 L3,16 Q2,16 2,15 L2,3 Q2,2 3,2"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <path
                        d="M4,4 L13,4 L13,13 L4,13 Z"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                      <circle
                        cx="8.5"
                        cy="8.5"
                        r="2"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                    </svg>
                  </div>

                  <div className="absolute bottom-2 right-2 w-8 h-8 transform rotate-180">
                    <svg
                      viewBox="0 0 32 32"
                      className="w-full h-full text-white/25"
                    >
                      <path
                        d="M2,2 L15,2 Q16,2 16,3 L16,15 Q16,16 15,16 L3,16 Q2,16 2,15 L2,3 Q2,2 3,2"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <path
                        d="M4,4 L13,4 L13,13 L4,13 Z"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                      <circle
                        cx="8.5"
                        cy="8.5"
                        r="2"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                    </svg>
                  </div>
                </>
              )}

              {/* Original Floating Particles - Enhanced */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute bg-white/40 rounded-full animate-float`}
                  style={{
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    left: `${15 + i * 7}%`,
                    top: `${25 + i * 4}%`,
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: `${4 + i * 0.2}s`,
                  }}
                />
              ))}

              {/* Sparkle Effects */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`sparkle-${i}`}
                  className="absolute animate-pulse"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.8}s`,
                    animationDuration: `${2 + Math.random()}s`,
                  }}
                >
                  <Sparkles className="h-3 w-3 text-white/30" />
                </div>
              ))}
            </div>

            {/* Card Content - keep existing content unchanged */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              {/* Top Section - Logo & Tier */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                      <IconComponent className="h-7 w-7 text-white drop-shadow-sm" />
                    </div>
                    {membership?.type !== "Standard" && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-pulse shadow-sm"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg tracking-wider drop-shadow-sm">
                      FITNESS CLUB
                    </h3>
                    <p
                      className={`${config.primaryColor} text-sm font-semibold tracking-widest drop-shadow-sm`}
                    >
                      {config.tier}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                {membership?.isActive && (
                  <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-green-400/50 shadow-lg">
                    ACTIVE
                  </div>
                )}
              </div>

              {/* Middle Section - Card Number */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CardIcon className="h-5 w-5 text-white/70 drop-shadow-sm" />
                  <p className="text-white/90 text-sm font-medium tracking-wider drop-shadow-sm">
                    MEMBER ID
                  </p>
                </div>
                <p className="text-white font-mono text-xl tracking-[0.2em] font-bold drop-shadow-md">
                  {membership?.id}
                </p>
              </div>

              {/* Bottom Section - Member Info & Dates */}
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-white/80 text-xs font-medium tracking-wide uppercase drop-shadow-sm">
                    Member Name
                  </p>
                  <p className="text-white font-semibold text-sm tracking-wide uppercase drop-shadow-sm">
                    {user?.fullName || user?.username || "PREMIUM MEMBER"}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-white/80 text-xs font-medium tracking-wide drop-shadow-sm">
                    VALID UNTIL
                  </p>
                  <p className="text-white font-mono text-sm font-bold drop-shadow-sm">
                    {new Date(membership?.endDate).toLocaleDateString("en-US", {
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Chip Design */}
            <div className="absolute top-16 left-6">
              <div className="w-8 h-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-sm shadow-inner border border-yellow-500/50 relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-yellow-300/50 to-transparent rounded-sm"></div>
                {/* Chip circuit lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-yellow-600/30"></div>
                  <div className="absolute w-px h-full bg-yellow-600/30"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Contactless Payment Symbol */}
            <div className="absolute top-16 right-6">
              <div className="relative">
                <Wifi className="h-6 w-6 text-white/60 rotate-90 drop-shadow-sm" />
                {/* Radio wave animations */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 border border-white/20 rounded-full animate-ping"
                    style={{
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: "2s",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Security Watermark */}
            <div className="absolute bottom-4 right-4 opacity-10">
              <div className="text-xs font-mono text-white/50 transform rotate-45">
                AUTHENTIC
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Membership Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Information */}
        <motion.div
          className="bg-white/95 backdrop-blur-md border-2 border-vintage-accent/30 shadow-xl rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <div
              className={`w-12 h-12 ${config.badge} rounded-xl flex items-center justify-center mr-4 shadow-lg`}
            >
              <Users className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-vintage-dark vintage-heading">
              Thông tin thành viên
            </h4>
          </div>

          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <Mail className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <Calendar className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Ngày kích hoạt</p>
                <p className="font-semibold text-gray-900">
                  {new Date(membership?.startDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <Clock className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Thời gian còn lại</p>
                <p className="font-semibold text-gray-900">{daysLeft} ngày</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          className="bg-white/95 backdrop-blur-md border-2 border-vintage-accent/30 shadow-xl rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center mb-6">
            <div
              className={`w-12 h-12 ${config.badge} rounded-xl flex items-center justify-center mr-4 shadow-lg`}
            >
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-vintage-dark vintage-heading">
              Thống kê hoạt động
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                value: userStats.totalClasses,
                label: "Tổng lớp học",
                icon: "📚",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                value: userStats.activeClasses,
                label: "Đang tham gia",
                icon: "⚡",
                color: "text-yellow-600",
                bg: "bg-yellow-50",
              },
              {
                value: `${userStats.completionRate}%`,
                label: "Tỷ lệ hoàn thành",
                icon: "⭐",
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                value: userStats.membershipMonths,
                label: "Tháng thành viên",
                icon: "👑",
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className={`text-center p-4 ${stat.bg} rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300`}
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={`text-xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Benefits Section */}
      <motion.div
        className="bg-white/95 backdrop-blur-md border-2 border-vintage-accent/30 shadow-xl rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div
                className={`w-12 h-12 ${config.badge} rounded-xl flex items-center justify-center mr-4 shadow-lg`}
              >
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-vintage-dark vintage-heading">
                Quyền lợi thành viên {config.tier}
              </h4>
            </div>
            <motion.button
              onClick={() => setShowBenefits(!showBenefits)}
              className={`w-10 h-10 ${config.badge} rounded-lg flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all duration-300`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight
                className={`h-5 w-5 transition-transform duration-300 ${
                  showBenefits ? "rotate-90" : ""
                }`}
              />
            </motion.button>
          </div>

          {showBenefits && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3">
                  {config.benefits
                    .slice(0, Math.ceil(config.benefits.length / 2))
                    .map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <BenefitItem>{benefit}</BenefitItem>
                      </motion.div>
                    ))}
                </ul>
                <ul className="space-y-3">
                  {config.benefits
                    .slice(Math.ceil(config.benefits.length / 2))
                    .map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay:
                            (index + Math.ceil(config.benefits.length / 2)) *
                            0.1,
                        }}
                      >
                        <BenefitItem>{benefit}</BenefitItem>
                      </motion.div>
                    ))}
                </ul>
              </div>

              {/* Premium Features */}
              {membership?.type !== "Standard" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`mt-6 p-4 bg-gradient-to-r ${config.glowEffect} bg-opacity-10 rounded-xl border border-gray-200`}
                >
                  <h5 className="text-lg font-bold text-vintage-dark vintage-heading mb-4 flex items-center">
                    <Trophy className={`h-5 w-5 ${config.primaryColor} mr-2`} />
                    Đặc quyền {config.tier} độc quyền
                  </h5>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-white/80 rounded-lg shadow-sm">
                      <Coins
                        className={`h-8 w-8 ${config.primaryColor} mx-auto mb-2`}
                      />
                      <p className="text-sm font-semibold text-vintage-dark">
                        Tích điểm thưởng
                      </p>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg shadow-sm">
                      <Star
                        className={`h-8 w-8 ${config.primaryColor} mx-auto mb-2`}
                      />
                      <p className="text-sm font-semibold text-vintage-dark">
                        Ưu tiên booking
                      </p>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg shadow-sm">
                      <Heart
                        className={`h-8 w-8 ${config.primaryColor} mx-auto mb-2`}
                      />
                      <p className="text-sm font-semibold text-vintage-dark">
                        Chăm sóc 24/7
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons with Vintage Colors */}
      <motion.div
        className="grid md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => navigate("/classes")}
          className="relative overflow-hidden bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-yellow-600 hover:to-amber-600 text-white p-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative flex items-center justify-center">
            <Target className="h-5 w-5 mr-2" />
            Đăng ký lớp học ngay
          </div>
        </motion.button>

        <motion.button
          onClick={() => setShowMembershipDetails(!showMembershipDetails)}
          className="relative overflow-hidden bg-gradient-to-r from-stone-600 to-amber-700 hover:from-amber-700 hover:to-stone-600 text-white p-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative flex items-center justify-center">
            <Award className="h-5 w-5 mr-2" />
            Xem chi tiết thẻ
          </div>
        </motion.button>
      </motion.div>

      {/* Enhanced Membership Details Modal với màu vintage */}
      {showMembershipDetails && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMembershipDetails(false)}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div
                className={`w-16 h-16 ${config.badge} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                <IconComponent className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-vintage-dark mb-2">
                Chi tiết thẻ {config.tier}
              </h4>
              <p className="text-gray-600">
                Thông tin đầy đủ về thẻ thành viên của bạn
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Loại thẻ",
                  value: membership?.type,
                  icon: Award,
                },
                {
                  label: "Ngày kích hoạt",
                  value: new Date(membership?.startDate).toLocaleDateString(
                    "vi-VN"
                  ),
                  icon: Calendar,
                },
                {
                  label: "Ngày hết hạn",
                  value: new Date(membership?.endDate).toLocaleDateString(
                    "vi-VN"
                  ),
                  icon: Clock,
                },
                {
                  label: "Trạng thái",
                  value: membership?.isActive
                    ? "Đang hoạt động"
                    : "Không hoạt động",
                  icon: Shield,
                  valueClass: membership?.isActive
                    ? "text-green-600"
                    : "text-red-600",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="font-medium text-gray-700">
                      {item.label}:
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      item.valueClass || "text-gray-900"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowMembershipDetails(false)}
              className="mt-6 w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-yellow-600 hover:to-amber-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Đóng chi tiết
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MembershipCard;
