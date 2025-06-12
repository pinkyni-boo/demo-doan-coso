import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
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
  Star,
  Clock,
  Calendar,
  Users,
  ArrowLeft,
  Crown,
  ArrowRight,
  CheckCircle,
  MapPin,
  Phone,
  Award,
  Target,
  Heart,
  Sparkles,
  Play,
  Shield,
  Zap,
  TrendingUp,
  Dumbbell,
  Timer,
  Medal,
  ThumbsUp,
} from "lucide-react";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/services/${id}`
        );
        setService(response.data);
      } catch (error) {
        console.error("Error fetching service detail:", error);
        const mockService = generateMockService(id);
        if (mockService) {
          setService(mockService);
        } else {
          setError("Không tìm thấy dịch vụ");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceDetail();
    }
  }, [id]);

  const generateMockService = (serviceId) => {
    const serviceTemplates = {
      1: {
        id: "1",
        name: "Personal Training Premium",
        shortDescription: "Huấn luyện cá nhân 1-on-1 với chuyên gia hàng đầu",
        fullDescription:
          "Chương trình huấn luyện cá nhân được thiết kế riêng cho bạn với sự hướng dẫn tận tình của các huấn luyện viên chuyên nghiệp. Mỗi buổi tập sẽ được tùy chỉnh theo mục tiêu, thể trạng và thời gian của bạn.",
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200",
        price: 1200000,
        duration: "60 phút/buổi",
        level: "Tất cả cấp độ",
        category: "Personal Training",
        rating: 4.9,
        sessions: 12,
        features: [
          "Đánh giá thể trạng ban đầu",
          "Chế độ tập luyện cá nhân hóa",
          "Theo dõi tiến độ chi tiết",
          "Tư vấn dinh dưỡng miễn phí",
          "Hỗ trợ 24/7",
        ],
      },
      2: {
        id: "2",
        name: "Group Fitness Classes",
        shortDescription: "Lớp học nhóm năng động với nhiều môn thể thao",
        fullDescription:
          "Tham gia các lớp học nhóm đa dạng từ Yoga, Zumba, CrossFit đến các bài tập công năng. Không gian học tập vui vẻ, tạo động lực và kết nối với cộng đồng yêu thể thao.",
        image:
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200",
        price: 800000,
        duration: "45-60 phút/buổi",
        level: "Cơ bản đến nâng cao",
        category: "Group Classes",
        rating: 4.8,
        sessions: 16,
        features: [
          "Đa dạng các môn thể thao",
          "Lịch học linh hoạt",
          "Cộng đồng tích cực",
          "Thiết bị hiện đại",
          "Huấn luyện viên chuyên nghiệp",
        ],
      },
      3: {
        id: "3",
        name: "Nutrition & Wellness",
        shortDescription: "Tư vấn dinh dưỡng và chăm sóc sức khỏe toàn diện",
        fullDescription:
          "Dịch vụ tư vấn dinh dưỡng cá nhân hóa giúp bạn xây dựng chế độ ăn uống khoa học, phù hợp với mục tiêu thể hình và lối sống.",
        image:
          "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
        price: 600000,
        duration: "45 phút/buổi",
        level: "Tất cả",
        category: "Nutrition",
        rating: 4.7,
        sessions: 8,
        features: [
          "Phân tích thành phần cơ thể",
          "Thực đơn cá nhân hóa",
          "Theo dõi tiến độ",
          "Tư vấn bổ sung dinh dưỡng",
          "Hỗ trợ lifestyle",
        ],
      },
      "683552029157fd0b9a32dee5": {
        id: "683552029157fd0b9a32dee5",
        name: "Elite Fitness Program",
        shortDescription: "Chương trình tập luyện ưu tú với công nghệ AI",
        fullDescription:
          "Trải nghiệm chương trình tập luyện cao cấp với trang thiết bị hiện đại nhất và công nghệ AI hỗ trợ, được thiết kế đặc biệt cho những ai muốn đạt được kết quả tối ưu.",
        image:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200",
        price: 2000000,
        duration: "90 phút/buổi",
        level: "Nâng cao",
        category: "Elite Program",
        rating: 5.0,
        sessions: 20,
        features: [
          "Công nghệ AI phân tích",
          "Thiết bị VR training",
          "Theo dõi sinh học",
          "Recovery therapy",
          "Chế độ VIP",
        ],
      },
      "683550399157fd0b9a32de18": {
        id: "683550399157fd0b9a32de18",
        name: "Mind & Body Harmony",
        shortDescription: "Yoga và thiền định cho sự cân bằng hoàn hảo",
        fullDescription:
          "Khóa học Yoga kết hợp thiền định và các phương pháp chăm sóc sức khỏe tinh thần, giúp bạn tìm lại cân bằng trong cuộc sống.",
        image:
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200",
        price: 900000,
        duration: "75 phút/buổi",
        level: "Tất cả cấp độ",
        category: "Yoga & Wellness",
        rating: 4.9,
        sessions: 12,
        features: [
          "Yoga đa dạng styles",
          "Thiền định hướng dẫn",
          "Không gian thanh tịnh",
          "Essential oils therapy",
          "Sound healing",
        ],
      },
    };

    if (serviceTemplates[serviceId]) {
      return serviceTemplates[serviceId];
    }

    // Generic fallback
    const serviceTypes = [
      {
        name: "CrossFit Intensive",
        description: "Tập luyện CrossFit chuyên nghiệp với cường độ cao",
        category: "CrossFit",
        price: 1500000,
        image:
          "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=1200",
        rating: 4.6,
      },
      {
        name: "Aqua Fitness",
        description: "Tập luyện dưới nước an toàn và hiệu quả",
        category: "Swimming",
        price: 1100000,
        image:
          "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200",
        rating: 4.5,
      },
      {
        name: "Combat Training",
        description: "Võ thuật và tự vệ thực chiến",
        category: "Martial Arts",
        price: 1300000,
        image:
          "https://images.unsplash.com/photo-1555597673-b21d5c935d16?w=1200",
        rating: 4.7,
      },
    ];

    const index =
      Math.abs(serviceId.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
      serviceTypes.length;
    const selectedType = serviceTypes[index];

    return {
      id: serviceId,
      name: selectedType.name,
      shortDescription: selectedType.description,
      fullDescription: `${selectedType.description}. Chương trình được thiết kế bởi các chuyên gia hàng đầu với phương pháp khoa học và hiện đại.`,
      image: selectedType.image,
      price: selectedType.price,
      duration: "60 phút/buổi",
      level: "Tất cả cấp độ",
      category: selectedType.category,
      rating: selectedType.rating,
      sessions: 16,
      features: [
        "Huấn luyện viên chuyên nghiệp",
        "Thiết bị hiện đại",
        "Theo dõi tiến độ",
        "Hỗ trợ 24/7",
        "Chế độ dinh dưỡng",
      ],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream pt-24 pb-16">
        <VintageContainer>
          <div className="flex justify-center items-center py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-elegant border border-vintage-gold/20"
            >
              <div className="w-16 h-16 border-4 border-vintage-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <VintageHeading level={4} className="mb-2 text-vintage-dark">
                Đang tải chi tiết dịch vụ
              </VintageHeading>
              <VintageText variant="body" className="text-vintage-neutral">
                Vui lòng đợi trong giây lát...
              </VintageText>
            </motion.div>
          </div>
        </VintageContainer>
      </div>
    );
  }

  if (error || !service) {
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
                <Heart className="h-12 w-12 text-vintage-primary" />
              </div>
              <VintageHeading level={2} className="mb-6 text-vintage-dark">
                Oops! Không tìm thấy dịch vụ
              </VintageHeading>
              <VintageText variant="lead" className="mb-8 text-vintage-neutral">
                Dịch vụ bạn đang tìm kiếm có thể đã được cập nhật hoặc không còn
                khả dụng. Hãy khám phá các dịch vụ tuyệt vời khác của chúng tôi.
              </VintageText>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <VintageButton
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  className="group"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Quay lại
                </VintageButton>
                <Link to="/services">
                  <VintageButton variant="primary" className="group">
                    <span>Khám phá dịch vụ</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </VintageButton>
                </Link>
              </div>
            </VintageCard>
          </motion.div>
        </VintageContainer>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream min-h-screen pt-24 pb-16"
    >
      {/* Enhanced Breadcrumb */}
      <motion.div variants={itemVariants}>
        <VintageSection background="transparent">
          <VintageContainer>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 shadow-soft border border-vintage-gold/20">
              <div className="flex items-center space-x-3 text-sm">
                <Link
                  to="/"
                  className="text-vintage-neutral hover:text-vintage-primary transition-colors font-medium"
                >
                  Trang chủ
                </Link>
                <span className="text-vintage-gold">•</span>
                <Link
                  to="/services"
                  className="text-vintage-neutral hover:text-vintage-primary transition-colors font-medium"
                >
                  Dịch vụ
                </Link>
                <span className="text-vintage-gold">•</span>
                <span className="text-vintage-primary font-semibold">
                  {service.name}
                </span>
              </div>
            </div>
          </VintageContainer>
        </VintageSection>
      </motion.div>

      {/* Hero Section - Enhanced */}
      <motion.div variants={itemVariants}>
        <VintageSection background="transparent">
          <VintageContainer>
            <VintageGrid
              cols={{ sm: 1, lg: 2 }}
              gap={16}
              className="items-center"
            >
              {/* Enhanced Content */}
              <div className="space-y-8">
                {/* Service Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-vintage-gold/20 to-vintage-accent/20 rounded-full border border-vintage-gold/30"
                >
                  <Star className="h-4 w-4 text-vintage-gold mr-2 fill-current" />
                  <span className="text-vintage-primary font-semibold vintage-sans text-sm">
                    {service.category} • ⭐ {service.rating || "4.8"}/5
                  </span>
                </motion.div>

                {/* Enhanced Title */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <VintageHeading
                      level={1}
                      className="mb-6 text-vintage-dark leading-tight"
                    >
                      {service.name}
                    </VintageHeading>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <VintageText
                      variant="lead"
                      className="text-vintage-neutral mb-8 leading-relaxed"
                    >
                      {service.shortDescription}
                    </VintageText>
                  </motion.div>
                </div>

                {/* Enhanced Service Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-2 gap-6"
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-vintage-gold/20 shadow-soft hover:shadow-golden transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <Timer className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <VintageText
                          variant="caption"
                          className="text-vintage-neutral"
                        >
                          Thời lượng
                        </VintageText>
                        <VintageText
                          variant="body"
                          className="font-semibold text-vintage-dark"
                        >
                          {service.duration}
                        </VintageText>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-vintage-gold/20 shadow-soft hover:shadow-golden transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                        <Target className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <VintageText
                          variant="caption"
                          className="text-vintage-neutral"
                        >
                          Cấp độ
                        </VintageText>
                        <VintageText
                          variant="body"
                          className="font-semibold text-vintage-dark"
                        >
                          {service.level}
                        </VintageText>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-vintage-gold/20 shadow-soft hover:shadow-golden transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <VintageText
                          variant="caption"
                          className="text-vintage-neutral"
                        >
                          Số buổi
                        </VintageText>
                        <VintageText
                          variant="body"
                          className="font-semibold text-vintage-dark"
                        >
                          {service.sessions || 12} buổi
                        </VintageText>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-vintage-gold/20 to-vintage-accent/20 backdrop-blur-sm rounded-xl p-4 border border-vintage-gold/40 shadow-golden">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-lg flex items-center justify-center">
                        <Medal className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <VintageText
                          variant="caption"
                          className="text-vintage-neutral"
                        >
                          Giá trọn gói
                        </VintageText>
                        <VintageText
                          variant="body"
                          className="font-bold text-vintage-primary text-lg"
                        >
                          {typeof service.price === "number"
                            ? service.price.toLocaleString("vi-VN") + " đ"
                            : service.price}
                        </VintageText>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link to="/membership" className="flex-1">
                    <VintageButton
                      variant="gold"
                      size="lg"
                      className="w-full group relative overflow-hidden"
                    >
                      <div className="relative z-10 flex items-center justify-center">
                        <Crown className="h-5 w-5 mr-2" />
                        <span>Đăng ký ngay</span>
                        <Sparkles className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </VintageButton>
                  </Link>

                  <Link to="/club" className="flex-1">
                    <VintageButton
                      variant="secondary"
                      size="lg"
                      className="w-full group"
                    >
                      <span>Tham quan CLB</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </VintageButton>
                  </Link>
                </motion.div>
              </div>

              {/* Enhanced Image Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="relative group">
                  <VintageCard className="overflow-hidden shadow-elegant ml-10 mt-6">
                    <div className="relative">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-vintage-dark/60 via-transparent to-transparent"></div>

                      {/* Floating Elements */}
                      <div className="absolute top-6 left-6">
                        <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-vintage-dark font-medium vintage-sans text-sm">
                              Đang hoạt động
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-6 right-6">
                        <div className="bg-vintage-gold/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-golden">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-white fill-current" />
                            <span className="text-white font-bold vintage-sans text-sm">
                              {service.rating || "4.8"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-300 cursor-pointer">
                          <Play className="h-8 w-8 text-vintage-primary ml-1" />
                        </div>
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-soft">
                          <div className="flex items-center justify-between">
                            <div>
                              <VintageText
                                variant="caption"
                                className="text-vintage-neutral"
                              >
                                Bắt đầu từ
                              </VintageText>
                              <div className="flex items-center space-x-2">
                                <VintageText
                                  variant="body"
                                  className="font-bold text-vintage-primary"
                                >
                                  {typeof service.price === "number"
                                    ? Math.round(
                                        service.price / (service.sessions || 12)
                                      ).toLocaleString("vi-VN") + " đ"
                                    : "100k đ"}
                                  /buổi
                                </VintageText>
                                <span className="text-vintage-neutral text-sm line-through">
                                  {typeof service.price === "number"
                                    ? Math.round(
                                        (service.price /
                                          (service.sessions || 12)) *
                                          1.5
                                      ).toLocaleString("vi-VN") + " đ"
                                    : "150k đ"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                95% hài lòng
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </VintageCard>
                </div>

                {/* Floating Stats */}
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 space-y-4 hidden lg:block">
                  {[
                    { icon: Users, value: "500+", label: "Thành viên" },
                    { icon: Award, value: "98%", label: "Thành công" },
                    { icon: Zap, value: "24/7", label: "Hỗ trợ" },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-vintage-gold/20 text-center min-w-[100px]"
                    >
                      <stat.icon className="h-6 w-6 text-vintage-primary mx-auto mb-2" />
                      <div className="font-bold text-vintage-dark">
                        {stat.value}
                      </div>
                      <div className="text-xs text-vintage-neutral">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </VintageGrid>
          </VintageContainer>
        </VintageSection>
      </motion.div>

      {/* Enhanced Tabs Section */}
      <motion.div variants={itemVariants}>
        <VintageSection background="transparent">
          <VintageContainer>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-soft border border-vintage-gold/20 mb-12">
              <div className="flex space-x-2 overflow-x-auto">
                {[
                  { id: "overview", label: "Tổng quan", icon: Target },
                  { id: "features", label: "Tính năng", icon: Sparkles },
                  { id: "benefits", label: "Lợi ích", icon: TrendingUp },
                  { id: "schedule", label: "Lịch trình", icon: Calendar },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex-shrink-0 ${
                      activeTab === tab.id
                        ? "bg-gradient-luxury text-white shadow-golden"
                        : "text-vintage-neutral hover:text-vintage-primary hover:bg-vintage-warm"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {activeTab === "overview" && (
                <VintageCard className="p-8 shadow-elegant">
                  <VintageHeading level={3} className="mb-6 text-vintage-dark">
                    Về dịch vụ {service.name}
                  </VintageHeading>
                  <VintageText
                    variant="body"
                    className="text-vintage-neutral leading-relaxed text-lg mb-6"
                  >
                    {service.fullDescription}
                  </VintageText>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <VintageHeading
                        level={5}
                        className="mb-4 text-vintage-primary"
                      >
                        Điểm nổi bật
                      </VintageHeading>
                      <ul className="space-y-3">
                        {(
                          service.features || [
                            "Huấn luyện viên chuyên nghiệp",
                            "Thiết bị hiện đại",
                            "Theo dõi tiến độ",
                            "Hỗ trợ 24/7",
                          ]
                        ).map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-vintage-neutral">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <VintageHeading
                        level={5}
                        className="mb-4 text-vintage-primary"
                      >
                        Thông tin thêm
                      </VintageHeading>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-vintage-warm rounded-lg">
                          <span className="font-medium">Loại hình:</span>
                          <span className="text-vintage-primary">
                            {service.category}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-vintage-warm rounded-lg">
                          <span className="font-medium">Đánh giá:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-vintage-gold fill-current" />
                            <span className="text-vintage-primary font-semibold">
                              {service.rating || "4.8"}/5
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-vintage-warm rounded-lg">
                          <span className="font-medium">Số buổi:</span>
                          <span className="text-vintage-primary">
                            {service.sessions || 12} buổi
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </VintageCard>
              )}

              {activeTab === "features" && (
                <VintageGrid cols={{ sm: 1, md: 2, lg: 3 }} gap={6}>
                  {[
                    {
                      icon: <Dumbbell className="h-8 w-8" />,
                      title: "Thiết bị hiện đại",
                      description:
                        "Máy tập và dụng cụ thể thao được nhập khẩu từ các thương hiệu hàng đầu thế giới.",
                    },
                    {
                      icon: <Users className="h-8 w-8" />,
                      title: "Huấn luyện viên chuyên nghiệp",
                      description:
                        "Đội ngũ HLV giàu kinh nghiệm, được đào tạo bài bản và có chứng chỉ quốc tế.",
                    },
                    {
                      icon: <Shield className="h-8 w-8" />,
                      title: "An toàn tuyệt đối",
                      description:
                        "Quy trình tập luyện an toàn, phù hợp với thể trạng và khả năng của từng cá nhân.",
                    },
                    {
                      icon: <TrendingUp className="h-8 w-8" />,
                      title: "Theo dõi tiến độ",
                      description:
                        "Hệ thống theo dõi và đánh giá tiến độ chi tiết giúp bạn đạt mục tiêu nhanh chóng.",
                    },
                    {
                      icon: <Heart className="h-8 w-8" />,
                      title: "Chăm sóc sức khỏe",
                      description:
                        "Tư vấn dinh dưỡng và chế độ nghỉ ngơi phù hợp với từng giai đoạn tập luyện.",
                    },
                    {
                      icon: <Award className="h-8 w-8" />,
                      title: "Cam kết chất lượng",
                      description:
                        "Đảm bảo dịch vụ chất lượng cao với chính sách hoàn tiền nếu không hài lòng.",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <VintageCard className="p-6 h-full text-center hover:shadow-elegant transition-all duration-300 group">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-vintage-primary/10 rounded-full text-vintage-primary mb-4 group-hover:bg-vintage-primary group-hover:text-white transition-all duration-300">
                          {feature.icon}
                        </div>
                        <VintageHeading
                          level={5}
                          className="mb-3 text-vintage-dark group-hover:text-vintage-primary transition-colors"
                        >
                          {feature.title}
                        </VintageHeading>
                        <VintageText
                          variant="body"
                          className="text-vintage-neutral"
                        >
                          {feature.description}
                        </VintageText>
                      </VintageCard>
                    </motion.div>
                  ))}
                </VintageGrid>
              )}

              {activeTab === "benefits" && (
                <div className="space-y-8">
                  <VintageCard className="p-8 shadow-elegant">
                    <VintageHeading
                      level={3}
                      className="mb-8 text-center text-vintage-dark"
                    >
                      Lợi ích khi tham gia {service.name}
                    </VintageHeading>

                    <VintageGrid cols={{ sm: 1, md: 2 }} gap={8}>
                      {[
                        {
                          category: "Sức khỏe thể chất",
                          benefits: [
                            "Tăng cường sức bền và thể lực",
                            "Cải thiện vóc dáng và tỷ lệ cơ thể",
                            "Giảm nguy cơ bệnh tim mạch",
                            "Tăng cường hệ miễn dịch",
                          ],
                          color: "green",
                        },
                        {
                          category: "Tinh thần & Tâm lý",
                          benefits: [
                            "Giảm stress và căng thẳng",
                            "Tăng cường sự tự tin",
                            "Cải thiện chất lượng giấc ngủ",
                            "Tăng cường khả năng tập trung",
                          ],
                          color: "blue",
                        },
                        {
                          category: "Xã hội & Kết nối",
                          benefits: [
                            "Gặp gỡ những người bạn mới",
                            "Tham gia cộng đồng tích cực",
                            "Chia sẻ kinh nghiệm và động lực",
                            "Xây dựng mối quan hệ lành mạnh",
                          ],
                          color: "purple",
                        },
                        {
                          category: "Nghề nghiệp & Cuộc sống",
                          benefits: [
                            "Tăng năng suất làm việc",
                            "Cải thiện khả năng lãnh đạo",
                            "Phát triển kỷ luật tự giác",
                            "Cân bằng work-life tốt hơn",
                          ],
                          color: "amber",
                        },
                      ].map((section, index) => (
                        <div
                          key={index}
                          className={`bg-${section.color}-50 rounded-xl p-6 border border-${section.color}-200`}
                        >
                          <VintageHeading
                            level={5}
                            className={`mb-4 text-${section.color}-800`}
                          >
                            {section.category}
                          </VintageHeading>
                          <ul className="space-y-3">
                            {section.benefits.map((benefit, idx) => (
                              <li
                                key={idx}
                                className="flex items-start space-x-3"
                              >
                                <CheckCircle
                                  className={`h-5 w-5 text-${section.color}-600 mt-0.5 flex-shrink-0`}
                                />
                                <span className={`text-${section.color}-700`}>
                                  {benefit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </VintageGrid>
                  </VintageCard>
                </div>
              )}

              {activeTab === "schedule" && (
                <VintageCard className="p-8 shadow-elegant">
                  <VintageHeading
                    level={3}
                    className="mb-8 text-center text-vintage-dark"
                  >
                    Lịch trình và thời gian biểu
                  </VintageHeading>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <VintageHeading
                        level={5}
                        className="mb-6 text-vintage-primary"
                      >
                        Lịch tập trong tuần
                      </VintageHeading>
                      <div className="space-y-4">
                        {[
                          {
                            day: "Thứ 2, 4, 6",
                            time: "6:00 - 7:00",
                            type: "Morning Session",
                          },
                          {
                            day: "Thứ 2, 4, 6",
                            time: "18:00 - 19:00",
                            type: "Evening Session",
                          },
                          {
                            day: "Thứ 3, 5, 7",
                            time: "7:00 - 8:00",
                            type: "Premium Session",
                          },
                          {
                            day: "Cuối tuần",
                            time: "9:00 - 11:00",
                            type: "Weekend Special",
                          },
                        ].map((schedule, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-vintage-warm rounded-xl"
                          >
                            <div>
                              <div className="font-semibold text-vintage-dark">
                                {schedule.day}
                              </div>
                              <div className="text-sm text-vintage-neutral">
                                {schedule.type}
                              </div>
                            </div>
                            <div className="text-vintage-primary font-bold">
                              {schedule.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <VintageHeading
                        level={5}
                        className="mb-6 text-vintage-primary"
                      >
                        Quy trình một buổi tập
                      </VintageHeading>
                      <div className="space-y-4">
                        {[
                          {
                            step: "1",
                            activity: "Khởi động",
                            duration: "10 phút",
                            description: "Chuẩn bị cơ thể",
                          },
                          {
                            step: "2",
                            activity: "Tập chính",
                            duration: "40 phút",
                            description: "Bài tập theo chương trình",
                          },
                          {
                            step: "3",
                            activity: "Thư giãn",
                            duration: "10 phút",
                            description: "Phục hồi và giãn cơ",
                          },
                        ].map((step, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-vintage-gold/20"
                          >
                            <div className="w-8 h-8 bg-vintage-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <div className="font-semibold text-vintage-dark">
                                  {step.activity}
                                </div>
                                <div className="text-vintage-primary font-medium">
                                  {step.duration}
                                </div>
                              </div>
                              <div className="text-sm text-vintage-neutral">
                                {step.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </VintageCard>
              )}
            </motion.div>
          </VintageContainer>
        </VintageSection>
      </motion.div>

      {/* Enhanced CTA Section */}
      <motion.div variants={itemVariants}>
        <VintageSection background="primary">
          <VintageContainer>
            <div className="text-center text-white relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <VintageHeading level={2} className="mb-6 text-white">
                  Bạn đã sẵn sàng thay đổi bản thân?
                </VintageHeading>
                <VintageText
                  variant="lead"
                  className="mb-8 text-vintage-cream opacity-90 max-w-3xl mx-auto"
                >
                  Đăng ký ngay hôm nay để trải nghiệm{" "}
                  <strong>{service.name}</strong> và bắt đầu hành trình thay đổi
                  tích cực cho sức khỏe và cuộc sống của bạn.
                </VintageText>

                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                  <Link to="/membership">
                    <VintageButton
                      variant="gold"
                      size="lg"
                      className="group relative overflow-hidden"
                    >
                      <div className="relative z-10 flex items-center">
                        <Crown className="h-5 w-5 mr-2" />
                        <span>Đăng ký thành viên</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </VintageButton>
                  </Link>
                  <Link to="/club">
                    <VintageButton
                      variant="secondary"
                      size="lg"
                      className="group border-white text-white hover:bg-white hover:text-vintage-dark"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      <span>Liên hệ tư vấn</span>
                    </VintageButton>
                  </Link>
                </div>

                {/* Trust Signals */}
                <div className="flex flex-wrap justify-center items-center gap-8 text-vintage-cream/80">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Đảm bảo chất lượng</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Được chứng nhận</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>500+ khách hàng hài lòng</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </VintageContainer>
        </VintageSection>
      </motion.div>
    </motion.div>
  );
}
