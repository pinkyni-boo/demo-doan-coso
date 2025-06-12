import React from "react";
import { motion } from "framer-motion";
import pricingPlansData from "../../data/pricingPlansData";
import {
  Crown,
  Star,
  Sparkles,
  CheckCircle,
  Zap,
  Heart,
  Award,
  Shield,
  TrendingUp,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react";

const PricingPlans = ({
  selectedPlan,
  onSelectPlan,
  filterCategory = "all",
  onFilterChange,
  message,
  isUpgrade = false,
  containerClassName = "",
  readOnly = false,
}) => {
  // Format price để hiển thị đẹp hơn
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getFilteredPlans = () => {
    if (filterCategory === "all") return pricingPlansData;
    return pricingPlansData.filter((plan) => plan.category === filterCategory);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "basic":
        return Star;
      case "standard":
        return Crown;
      case "vip":
        return Sparkles;
      default:
        return Award;
    }
  };

  const getDurationText = (duration) => {
    switch (duration) {
      case 30:
        return "1 tháng";
      case 90:
        return "3 tháng";
      case 180:
        return "6 tháng";
      case 365:
        return "1 năm";
      default:
        return `${duration} ngày`;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={containerClassName}
    >
      {/* Enhanced Category Filters */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-soft border border-amber-200/50 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              {
                key: "all",
                label: "Tất cả gói",
                icon: Award,
                color: "vintage-primary",
              },
              { key: "basic", label: "Cơ bản", icon: Star, color: "blue" },
              {
                key: "standard",
                label: "Tiêu chuẩn",
                icon: Crown,
                color: "green",
              },
              { key: "vip", label: "VIP", icon: Sparkles, color: "amber" },
            ].map((filter) => {
              const IconComponent = filter.icon;
              const isActive = filterCategory === filter.key;

              return (
                <button
                  key={filter.key}
                  onClick={() => onFilterChange(filter.key)}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg`
                      : `text-stone-600 hover:text-amber-700 hover:bg-amber-50`
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Message Display */}
      {message && message.text && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
                <AlertCircle className="h-4 w-4" />
              )}
            </div>
            <span className="vintage-sans font-medium">{message.text}</span>
          </div>
        </motion.div>
      )}

      {/* Enhanced Plans Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 border-t border-amber-200/50 pt-8 pb-12"
      >
        {getFilteredPlans().map((plan, index) => {
          const IconComponent = getCategoryIcon(plan.category);
          const isSelected = selectedPlan?.id === plan.id;
          const isPopular = plan.popular || plan.badge;

          return (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative bg-white rounded-2xl shadow-elegant overflow-hidden border-2 transition-all duration-500 flex flex-col h-full ${
                isSelected
                  ? `border-amber-400 shadow-lg shadow-amber-200/50`
                  : "border-transparent hover:border-amber-300/50"
              } ${isPopular ? "transform md:-translate-y-4" : ""}`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white text-center py-2 font-semibold relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-center space-x-2">
                      <Crown className="h-4 w-4" />
                      <span>{plan.badge || "Phổ biến nhất"}</span>
                      <Crown className="h-4 w-4" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full animate-shimmer"></div>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div
                className={`p-8 bg-gradient-to-br from-${plan.color}-50 to-${
                  plan.color
                }-100 ${isPopular ? "pt-12" : ""}`}
              >
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-${plan.color}-500 to-${plan.color}-600 rounded-2xl shadow-lg mb-4`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  <h2
                    className={`text-2xl font-bold text-${plan.color}-900 mb-2`}
                  >
                    {plan.name}
                  </h2>

                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-extrabold text-stone-800">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-lg text-stone-600 ml-1">đ</span>
                  </div>

                  <div
                    className={`inline-flex items-center px-3 py-1 bg-${plan.color}-200 text-${plan.color}-800 rounded-full text-sm font-medium`}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {getDurationText(plan.duration)}
                  </div>
                </div>
              </div>

              {/* Plan Content - flex-grow để chiếm không gian còn lại */}
              <div className="flex-grow flex flex-col">
                {/* Features List - flex-grow để đẩy bottom section xuống */}
                <div className="flex-grow px-8 pt-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * featureIndex }}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-${plan.color}-100 flex items-center justify-center mt-0.5 flex-shrink-0`}
                        >
                          <CheckCircle
                            className={`h-3 w-3 text-${plan.color}-600`}
                          />
                        </div>
                        <span className="text-stone-600 leading-relaxed">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Section - luôn ở cuối card */}
                <div className="mt-auto">
                  {/* Plan Stats */}
                  <div className="px-8 pt-6">
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-200/50">
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold text-${plan.color}-600`}
                        >
                          {plan.duration > 30 ? "✓" : "~"}
                        </div>
                        <div className="text-xs text-stone-500">Tiết kiệm</div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold text-${plan.color}-600`}
                        >
                          {Math.round(
                            (plan.price / plan.duration) * 30
                          ).toLocaleString()}
                          đ
                        </div>
                        <div className="text-xs text-stone-500">/ tháng</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!readOnly && (
                    <div className="px-8 pt-4">
                      {plan.type !== "Platinum" ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelectPlan(plan)}
                          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                            isSelected
                              ? `bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-200/50`
                              : `bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl hover:shadow-amber-200/50`
                          }`}
                        >
                          <div className="relative z-10 flex items-center justify-center space-x-2">
                            {isSelected ? (
                              <>
                                <CheckCircle className="h-5 w-5" />
                                <span>Đã chọn</span>
                              </>
                            ) : (
                              <>
                                <span>
                                  {isUpgrade
                                    ? "Nâng cấp lên gói này"
                                    : "Đăng ký gói này"}
                                </span>
                                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                              </>
                            )}
                          </div>
                          {!isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => (window.location.href = "/contact")}
                          className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-yellow-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl hover:shadow-amber-200/50 group relative overflow-hidden"
                        >
                          <div className="relative z-10 flex items-center justify-center space-x-2">
                            <Crown className="h-5 w-5" />
                            <span>Liên hệ tư vấn</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </motion.button>
                      )}
                    </div>
                  )}

                  {/* Trust Signals - thật sự ở cuối card */}
                  <div className="px-8 py-4 bg-amber-50/30 border-t border-amber-200/50">
                    <div className="flex items-center justify-center space-x-4 text-xs text-stone-400">
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-amber-500" />
                        <span>Bảo đảm</span>
                      </div>
                      <div className="w-1 h-1 bg-stone-300 rounded-full"></div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3 text-amber-500" />
                        <span>Uy tín</span>
                      </div>
                      <div className="w-1 h-1 bg-stone-300 rounded-full"></div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-amber-500" />
                        <span>Hiệu quả</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200/50"
                >
                  <CheckCircle className="h-5 w-5 text-white" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Additional Features Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-amber-200/50"
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-stone-800 mb-4">
            Tại sao chọn gói thành viên của chúng tôi?
          </h3>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Với hơn 5 năm kinh nghiệm, chúng tôi cam kết mang đến trải nghiệm
            tập luyện tốt nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Award,
              title: "Chất lượng đảm bảo",
              description: "Được chứng nhận bởi các tổ chức uy tín",
              color: "blue",
            },
            {
              icon: Shield,
              title: "An toàn tuyệt đối",
              description: "Thiết bị hiện đại, quy trình an toàn",
              color: "green",
            },
            {
              icon: Heart,
              title: "Hỗ trợ 24/7",
              description: "Đội ngũ tư vấn luôn sẵn sàng hỗ trợ",
              color: "red",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="text-center p-6 rounded-xl bg-amber-50 hover:bg-white hover:shadow-soft transition-all duration-300 border border-amber-100"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 bg-${feature.color}-100 rounded-xl mb-4`}
              >
                <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
              </div>
              <h4 className="text-lg font-semibold text-stone-800 mb-2">
                {feature.title}
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PricingPlans;
