import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import PricingPlans from "../PricingPlans";
import ConfirmationDialog from "../PricingPlans/index";
import Toast from "../common/Toast";
import {
  Crown,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Star,
  Sparkles,
  Award,
} from "lucide-react";

export default function MembershipPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filterCategory, setFilterCategory] = useState("all");
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);

      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/users/${decoded.userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // Check if this is an upgrade request
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeParam = urlParams.get("upgrade");

    if (upgradeParam === "true") {
      setIsUpgrade(true);

      // Get current membership from localStorage
      const storedMembership = localStorage.getItem("currentMembership");
      if (storedMembership) {
        setCurrentMembership(JSON.parse(storedMembership));
      }
    }
  }, []);

  // Update the handleSelectPlan function to go directly to payment
  const handleSelectPlan = async (plan) => {
    // First set the selected plan
    setSelectedPlan(plan);

    // If user is not logged in, redirect to login
    if (!userId) {
      setToast({
        message: "Vui lòng đăng nhập để đăng ký gói tập",
        type: "error",
      });
      navigate("/login");
      return;
    }

    // Check if user already has an active membership
    if (user && user.membership && user.membership.endDate) {
      const endDate = new Date(user.membership.endDate);
      if (endDate > new Date()) {
        setToast({
          message:
            "Bạn đã có thẻ thành viên đang hoạt động. Vui lòng chờ hết hạn hoặc chọn nâng cấp gói tập.",
          type: "error",
        });
        return;
      }
    }

    // Skip confirmation and proceed directly to registration
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({
          text: "Bạn cần đăng nhập để đăng ký thành viên.",
          type: "error",
        });
        navigate("/login");
        return;
      }

      // Tính ngày hết hạn từ ngày hiện tại
      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000
      );

      const membershipData = {
        userId,
        type: plan.type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        price: plan.price,
      };

      console.log("Sending membership registration:", membershipData);

      let endpoint = "http://localhost:5000/api/memberships";
      let method = "POST";

      // If upgrading, use PUT method instead and include current membership ID
      if (isUpgrade && currentMembership) {
        endpoint = `http://localhost:5000/api/memberships/upgrade/${currentMembership.id}`;
        method = "PUT";
      }

      console.log(`Making ${method} request to ${endpoint}`);

      const response = await axios({
        method: method,
        url: endpoint,
        data: membershipData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Membership registration response:", response.data);

      // Clear upgrade data from localStorage
      if (isUpgrade) {
        localStorage.removeItem("currentMembership");
      }

      if (!response.data.membership || !response.data.membership._id) {
        throw new Error("Invalid membership response from server");
      }

      // Lưu thông tin membership vào localStorage để trang thanh toán có thể truy cập
      localStorage.setItem(
        "pendingMembership",
        JSON.stringify({
          id: response.data.membership._id,
          type: plan.type,
          price: plan.price,
          name: plan.name,
          duration: plan.duration,
          isUpgrade: isUpgrade,
        })
      );

      // Navigate directly to payment page
      navigate("/payment", {
        state: {
          fromMembership: true,
          isUpgrade: isUpgrade,
          membershipId: response.data.membership._id,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      // Get detailed error information
      const errorDetail =
        error.response?.data?.message ||
        error.message ||
        "Đăng ký thất bại. Vui lòng thử lại sau.";

      // Use toast instead of message state
      setToast({
        message: errorDetail,
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream pt-24 pb-12">
      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-elegant border border-vintage-gold/20">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-luxury rounded-xl flex items-center justify-center mr-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-extrabold vintage-heading text-vintage-dark mb-2">
                  {isUpgrade
                    ? "Nâng Cấp Thẻ Thành Viên"
                    : "Đăng Ký Thẻ Thành Viên"}
                </h1>
                <div className="w-24 h-1 bg-gradient-luxury rounded-full"></div>
              </div>
            </div>
            <p className="text-xl text-vintage-neutral vintage-serif leading-relaxed">
              Trở thành thành viên của chúng tôi để tận hưởng trải nghiệm tập
              luyện tốt nhất cùng nhiều ưu đãi hấp dẫn và dịch vụ cao cấp.
            </p>

            {/* Trust Indicators */}
            <div className="flex justify-center items-center space-x-8 mt-6 pt-6 border-t border-vintage-gold/20">
              {[
                {
                  icon: Star,
                  text: "5 sao đánh giá",
                  color: "text-yellow-500",
                },
                { icon: Award, text: "Chứng nhận ISO", color: "text-blue-500" },
                {
                  icon: Sparkles,
                  text: "500+ thành viên",
                  color: "text-purple-500",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-vintage-neutral"
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Message Display */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-8 p-6 rounded-2xl backdrop-blur-sm border-2 ${
              message.type === "success"
                ? "bg-green-50/80 text-green-700 border-green-200"
                : "bg-red-50/80 text-red-700 border-red-200"
            } shadow-soft`}
          >
            <div className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                  message.type === "success" ? "bg-green-200" : "bg-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </div>
              <span className="vintage-sans font-medium">{message.text}</span>
            </div>
          </motion.div>
        )}

        {/* Enhanced PricingPlans Container with Equal Height Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-elegant border border-vintage-gold/20 mb-16"
        >
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-vintage-dark mb-4">
              Chọn gói thành viên phù hợp
            </h2>
            <p className="text-vintage-neutral max-w-2xl mx-auto">
              Mỗi gói đều được thiết kế để mang đến trải nghiệm tốt nhất cho
              từng nhu cầu tập luyện
            </p>
          </div>

          <PricingPlans
            selectedPlan={selectedPlan}
            onSelectPlan={handleSelectPlan}
            filterCategory={filterCategory}
            onFilterChange={setFilterCategory}
            message={message}
            isUpgrade={isUpgrade}
            containerClassName="pricing-plans-equal-height"
          />
        </motion.div>

        {/* Enhanced Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-elegant border border-vintage-gold/20">
            <h3 className="text-2xl font-bold text-vintage-dark mb-6">
              Tại sao chọn chúng tôi?
            </h3>
            <div className="space-y-4">
              {[
                "Trang thiết bị hiện đại nhất",
                "Huấn luyện viên chuyên nghiệp",
                "Không gian tập luyện rộng rãi",
                "Chương trình đa dạng",
                "Hỗ trợ 24/7",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-vintage-neutral">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-elegant border border-vintage-gold/20">
            <h3 className="text-2xl font-bold text-vintage-dark mb-6">
              Cam kết của chúng tôi
            </h3>
            <div className="space-y-4">
              {[
                "Hoàn tiền 100% nếu không hài lòng",
                "Đảm bảo an toàn tuyệt đối",
                "Chế độ bảo hành thiết bị",
                "Tư vấn miễn phí trọn đời",
                "Ưu đãi đặc biệt cho thành viên lâu năm",
              ].map((commitment, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <span className="text-vintage-neutral">{commitment}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-elegant border border-vintage-gold/20"
        >
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-luxury rounded-xl flex items-center justify-center mr-4">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold vintage-heading text-vintage-dark">
              Câu hỏi thường gặp
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                question: "Làm thế nào để gia hạn thẻ thành viên?",
                answer:
                  'Bạn có thể gia hạn thẻ thành viên bằng cách đăng nhập vào tài khoản và chọn phần "Thẻ thành viên" trong hồ sơ cá nhân, sau đó chọn "Gia hạn" và làm theo hướng dẫn.',
              },
              {
                question:
                  "Tôi có thể chuyển nhượng thẻ tập cho người khác không?",
                answer:
                  "Các gói Cao Cấp và Đặc Quyền cho phép 1 lần chuyển nhượng miễn phí cho người thân trong gia đình. Các gói khác sẽ tính phí chuyển nhượng là 10% giá trị còn lại của gói tập.",
              },
              {
                question: "Có hình thức trả góp cho các gói dài hạn không?",
                answer:
                  "Có, chúng tôi liên kết với các ngân hàng đối tác để cung cấp hình thức trả góp 0% lãi suất trong 3-6 tháng cho các gói tập từ 6 tháng trở lên.",
              },
              {
                question:
                  "Thẻ thành viên có được sử dụng ở chi nhánh khác không?",
                answer:
                  "Có, thẻ thành viên của bạn có thể sử dụng tại tất cả các chi nhánh trong hệ thống. Bạn chỉ cần xuất trình thẻ hoặc ứng dụng mobile để check-in.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-vintage-warm/50 rounded-xl p-6 border border-vintage-gold/10 hover:bg-white hover:shadow-soft transition-all duration-300"
              >
                <h3 className="text-lg font-semibold vintage-heading text-vintage-dark mb-3">
                  {faq.question}
                </h3>
                <p className="text-vintage-neutral vintage-serif leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Confirmation Dialog với styling cải thiện */}
        {showConfirmation && (
          <ConfirmationDialog
            selectedPlan={selectedPlan}
            onClose={() => setShowConfirmation(false)}
            onConfirm={confirmRegistration}
            isUpgrade={isUpgrade}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
