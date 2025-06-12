import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  VintageContainer,
  VintageSection,
  VintageHero,
  VintageCard,
  VintageHeading,
  VintageText,
  VintageButton,
  VintageGrid,
  VintageDivider,
} from "../Templates/VintageLayout";
import {
  Crown,
  ArrowRight,
  Shield,
  Clock,
  Users,
  Star,
  Sparkles,
  Target,
  Heart,
  Award,
  CheckCircle,
  MapPin, // Thêm MapPin vào import
  Dumbbell,
  Activity,
  Zap,
} from "lucide-react";
import VintageBanner from "../Club/Banner";

export default function ServicePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/services");
        setServices(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ:", error);
        // Fallback data nếu API lỗi
        setServices([
          {
            id: 1,
            name: "Personal Training",
            description:
              "Huấn luyện cá nhân với chương trình tập luyện được thiết kế riêng cho bạn",
            image:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
            price: "500000",
          },
          {
            id: 2,
            name: "Group Classes",
            description:
              "Các lớp học nhóm đa dạng: Yoga, Zumba, Cardio và nhiều hơn nữa",
            image:
              "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
            price: "200000",
          },
          {
            id: 3,
            name: "Nutrition Consulting",
            description:
              "Tư vấn dinh dưỡng chuyên nghiệp để tối ưu hóa kết quả tập luyện",
            image:
              "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
            price: "300000",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Chất lượng hàng đầu",
      description:
        "Cam kết mang đến dịch vụ tốt nhất với đội ngũ chuyên gia hàng đầu trong ngành thể hình và chăm sóc sức khỏe",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Tiết kiệm thời gian",
      description:
        "Quy trình đơn giản, hiệu quả giúp bạn tiết kiệm thời gian tối đa và tập trung vào mục tiêu sức khỏe của mình",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Hỗ trợ chuyên nghiệp",
      description:
        "Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ bạn 24/7, giải đáp mọi thắc mắc và đồng hành cùng bạn trên hành trình",
    },
  ];

  const premiumFeatures = [
    {
      icon: <Dumbbell className="h-6 w-6" />,
      title: "Trang thiết bị hiện đại",
      description: "Máy tập nhập khẩu từ các thương hiệu hàng đầu thế giới",
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Chương trình cá nhân hóa",
      description: "Lộ trình tập luyện được thiết kế riêng cho từng cá nhân",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Kết quả nhanh chóng",
      description:
        "Phương pháp khoa học giúp đạt mục tiêu trong thời gian ngắn",
    },
  ];

  const serviceImages = [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920",
  ];

  return (
    <div className="bg-vintage-cream min-h-screen">
      {/* Replace VintageHero with VintageBanner */}
      <VintageBanner
        images={serviceImages}
        title="Dịch Vụ Hàng Đầu"
        subtitle="Chăm Sóc Bạn Từ Tâm - Thay Đổi Từ Hình Thể Đến Cuộc Sống! Khám phá các dịch vụ cao cấp được thiết kế đặc biệt cho sức khỏe và vóc dáng của bạn."
        height="h-screen"
        autoPlay={true}
        autoPlayInterval={6000}
      >
        <VintageButton
          variant="gold"
          size="lg"
          onClick={() =>
            document
              .getElementById("services-section")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="group"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          <span>Khám phá ngay</span>
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </VintageButton>
        <Link to="/membership">
          <VintageButton
            variant="secondary"
            size="lg"
            className="group border-white text-white hover:bg-white hover:text-vintage-dark"
          >
            <Crown className="mr-2 h-5 w-5" />
            <span>Đăng ký thành viên</span>
          </VintageButton>
        </Link>
      </VintageBanner>

      {/* Services Section */}
      <VintageSection background="warm" id="services-section">
        <VintageContainer>
          <div className="text-center mb-16">
            <VintageHeading level={2} className="mb-6" ornament>
              Khám Phá Các Dịch Vụ Của Chúng Tôi
            </VintageHeading>
            <VintageDivider />
            <VintageText variant="lead" className="max-w-3xl mx-auto">
              Chúng tôi cung cấp các dịch vụ chất lượng cao, được thiết kế riêng
              để đáp ứng mọi nhu cầu về thể hình và sức khỏe của bạn
            </VintageText>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <VintageCard className="p-8 text-center">
                <div className="w-12 h-12 border-4 border-vintage-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <VintageText
                  variant="body"
                  className="text-vintage-neutral font-medium"
                >
                  Đang tải dịch vụ...
                </VintageText>
              </VintageCard>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <VintageGrid cols={{ sm: 1, md: 2, lg: 3 }} gap={8}>
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    className="h-full group"
                  >
                    <Link
                      to={`/services/detail/${service.id || service._id}`}
                      className="hover:no-underline block h-full"
                    >
                      <VintageCard className="h-full flex flex-col overflow-hidden group-hover:shadow-elegant transition-all duration-500">
                        <div className="relative overflow-hidden h-64">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />

                          {/* Overlay với gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-vintage-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Hot Badge */}
                          <div className="absolute top-4 right-4">
                            <div className="bg-vintage-gold text-vintage-dark px-3 py-1 rounded-full text-xs font-bold vintage-sans flex items-center shadow-golden">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Hot
                            </div>
                          </div>

                          {/* Hover Icon */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="w-16 h-16 bg-vintage-gold rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 shadow-golden">
                              <ArrowRight className="h-6 w-6 text-vintage-dark" />
                            </div>
                          </div>
                        </div>

                        <div className="p-6 space-y-4 flex-grow flex flex-col">
                          <div className="flex items-center justify-between">
                            <VintageHeading
                              level={4}
                              className="group-hover:text-vintage-primary transition-colors"
                            >
                              {service.name}
                            </VintageHeading>
                          </div>

                          <VintageText
                            variant="body"
                            className="flex-grow line-clamp-3"
                          >
                            {service.description}
                          </VintageText>

                          <div className="flex justify-between items-center pt-4 border-t border-vintage-primary/20">
                            <div className="text-vintage-primary font-bold group-hover:text-vintage-gold transition-colors flex items-center vintage-sans">
                              <span>Chi tiết</span>
                              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>

                            {service.price && (
                              <div className="bg-vintage-warm text-vintage-primary px-3 py-1 rounded-lg font-medium vintage-sans text-sm">
                                {typeof service.price === "number"
                                  ? service.price.toLocaleString("vi-VN") + " đ"
                                  : service.price}
                              </div>
                            )}
                          </div>
                        </div>
                      </VintageCard>
                    </Link>
                  </motion.div>
                ))}
              </VintageGrid>
            </motion.div>
          )}
        </VintageContainer>
      </VintageSection>

      {/* Features Section - Tại sao chọn chúng tôi */}
      <VintageSection className="why-choose-section">
        <VintageContainer>
          <div className="why-choose-content">
            <div className="text-center mb-16">
              <VintageHeading
                level={2}
                className="mb-6 text-vintage-dark"
                ornament
              >
                Tại Sao Chọn Dịch Vụ Của Chúng Tôi?
              </VintageHeading>
              <VintageText
                variant="lead"
                className="max-w-3xl mx-auto text-vintage-neutral"
              >
                Chúng tôi cam kết mang đến trải nghiệm tuyệt vời nhất cho khách
                hàng với những ưu điểm vượt trội
              </VintageText>
            </div>

            <VintageGrid cols={{ sm: 1, md: 3 }} gap={8}>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="feature-card-enhanced"
                >
                  <div className="feature-icon text-4xl mb-4">
                    {feature.icon}
                  </div>
                  <VintageHeading level={4} className="feature-title">
                    {feature.title}
                  </VintageHeading>
                  <VintageText className="feature-description">
                    {feature.description}
                  </VintageText>
                </motion.div>
              ))}
            </VintageGrid>
          </div>
        </VintageContainer>
      </VintageSection>

      {/* Premium Experience Section - Trải nghiệm đẳng cấp */}
      <VintageSection className="premium-experience-section">
        <VintageContainer>
          <div className="premium-experience-content">
            <div className="premium-text-content">
              <VintageHeading
                level={2}
                className="mb-6 text-vintage-dark"
                ornament
              >
                Trải Nghiệm Dịch Vụ Đẳng Cấp
              </VintageHeading>
              <VintageText variant="lead" className="mb-8 text-vintage-neutral">
                Khám phá không gian sang trọng với trang thiết bị hiện đại và
                dịch vụ chăm sóc khách hàng tận tình
              </VintageText>

              <div className="space-y-6">
                {premiumFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-vintage-gold rounded-lg flex items-center justify-center text-vintage-dark">
                      {feature.icon}
                    </div>
                    <div>
                      <VintageHeading
                        level={5}
                        className="mb-2 text-vintage-dark"
                      >
                        {feature.title}
                      </VintageHeading>
                      <VintageText
                        variant="body"
                        className="text-vintage-neutral"
                      >
                        {feature.description}
                      </VintageText>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/club">
                  <VintageButton variant="primary" size="lg" className="group">
                    <span>Tham quan cơ sở</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </VintageButton>
                </Link>
              </div>
            </div>

            <div className="premium-image-container">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
                alt="Premium Experience"
                className="premium-image"
              />
              <div className="premium-image-overlay"></div>
            </div>
          </div>
        </VintageContainer>
      </VintageSection>

      {/* Stats Section - Những con số ấn tượng */}
      <VintageSection className="stats-section">
        <VintageContainer>
          <div className="stats-content text-center">
            <VintageHeading level={2} className="stats-title mb-6" ornament>
              Những Con Số Ấn Tượng
            </VintageHeading>
            <VintageText
              variant="lead"
              className="stats-subtitle max-w-3xl mx-auto"
            >
              Minh chứng cho chất lượng dịch vụ và sự tin tưởng của khách hàng
            </VintageText>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <VintageGrid cols={{ sm: 2, md: 4 }} gap={6}>
                {[
                  {
                    number: "50K+",
                    label: "Thành viên",
                    icon: <Users className="h-8 w-8" />,
                  },
                  {
                    number: "15+",
                    label: "Chi nhánh",
                    icon: <MapPin className="h-8 w-8" />,
                  },
                  {
                    number: "100+",
                    label: "HLV chuyên nghiệp",
                    icon: <Award className="h-8 w-8" />,
                  },
                  {
                    number: "5★",
                    label: "Đánh giá trung bình",
                    icon: <Star className="h-8 w-8" />,
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="stat-card"
                  >
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </motion.div>
                ))}
              </VintageGrid>
            </motion.div>
          </div>
        </VintageContainer>
      </VintageSection>

      {/* CTA Section */}
      <VintageSection background="warm">
        <VintageContainer>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <VintageHeading level={2} className="mb-6">
              Sẵn sàng khám phá dịch vụ tuyệt vời?
            </VintageHeading>
            <VintageText variant="lead" className="mb-8 max-w-3xl mx-auto">
              Hãy để chúng tôi đồng hành cùng bạn trong hành trình chinh phục
              sức khỏe và vóc dáng lý tưởng
            </VintageText>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/membership">
                <VintageButton variant="gold" size="lg" className="group">
                  <Crown className="mr-2 h-5 w-5" />
                  <span>Đăng ký ngay</span>
                  <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </VintageButton>
              </Link>
              <Link to="/club">
                <VintageButton variant="secondary" size="lg" className="group">
                  <span>Tham quan CLB</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </VintageButton>
              </Link>
            </div>
          </motion.div>
        </VintageContainer>
      </VintageSection>
    </div>
  );
}
