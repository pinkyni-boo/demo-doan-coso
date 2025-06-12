import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
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
  Dumbbell,
  Users,
  Calendar,
  Award,
  Star,
  Play,
  ArrowRight,
  Heart,
  Trophy,
  Target,
  CheckCircle,
} from "lucide-react";
import VintageBanner from "../Club/Banner";

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/services");
        setServices(response.data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        // Fallback data
        setServices([
          {
            id: 1,
            title: "Gym & Fitness",
            image:
              "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
          },
          {
            id: 2,
            title: "Yoga & Pilates",
            image:
              "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800",
          },
          {
            id: 3,
            title: "Personal Training",
            image:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
          },
          {
            id: 4,
            title: "Group Classes",
            image:
              "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
          },
        ]);
      }
    };

    fetchServices();
  }, []);

  const servicesPerPage = 4;

  const handleScroll = (direction) => {
    if (direction === "left") {
      setCurrentIndex((prev) =>
        prev === 0
          ? Math.max(services.length - servicesPerPage, 0)
          : prev - servicesPerPage
      );
    } else {
      setCurrentIndex((prev) =>
        prev + servicesPerPage >= services.length ? 0 : prev + servicesPerPage
      );
    }
  };

  const displayedServices = services.slice(
    currentIndex,
    currentIndex + servicesPerPage
  );

  const features = [
    {
      icon: <Crown className="h-8 w-8" />,
      title: "Dịch vụ cao cấp",
      description:
        "Trải nghiệm dịch vụ fitness đẳng cấp với trang thiết bị hiện đại và không gian sang trọng.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Huấn luyện viên chuyên nghiệp",
      description:
        "Đội ngũ HLV giàu kinh nghiệm, tận tâm hướng dẫn từng bước trên hành trình của bạn.",
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Lịch trình linh hoạt",
      description:
        "Đa dạng thời gian lớp học phù hợp với mọi lịch trình sinh hoạt của bạn.",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Chất lượng được công nhận",
      description:
        "Được đánh giá cao bởi cộng đồng và các chuyên gia trong ngành fitness.",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Thị A",
      role: "Thành viên VIP",
      content:
        "Royal Fitness đã thay đổi hoàn toàn lối sống của tôi. Dịch vụ tuyệt vời!",
      rating: 5,
      image:
        "https://media.gettyimages.com/id/1211977886/photo/portrait-of-young-woman-in-cross-training-gym.jpg?s=612x612&w=0&k=20&c=_E_9GM4GUk-pqgF5bSzzJYfMgXIf0NHsgMsqne_1Yn4=",
    },
    {
      name: "Trần Văn B",
      role: "Thành viên Premium",
      content: "Không gian sang trọng, thiết bị hiện đại. Tôi rất hài lòng!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Phạm Hồng C",
      role: "Thành viên Gold",
      content:
        "Huấn luyện viên nhiệt tình, chương trình tập phù hợp. Hiệu quả rõ rệt!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ];

  const trainers = [
    {
      name: "Nguyễn Thị A",
      specialty: "Strength & Conditioning",
      image:
        "https://media.gettyimages.com/id/1211977886/photo/portrait-of-young-woman-in-cross-training-gym.jpg?s=612x612&w=0&k=20&c=_E_9GM4GUk-pqgF5bSzzJYfMgXIf0NHsgMsqne_1Yn4=",
      experience: "8 năm kinh nghiệm",
    },
    {
      name: "Trần Thị B",
      specialty: "Yoga & Pilates",
      image:
        "https://media.gettyimages.com/id/2208936464/photo/happy-athletic-man-with-crossed-arms-against-the-wall-in-a-gym.jpg?s=612x612&w=0&k=20&c=7XhEzIqJwe-vFXrMPaCUEDTJk0L8lHnCM-kwi5qmxvY=",
      experience: "10 năm kinh nghiệm",
    },
    {
      name: "Lê Minh C",
      specialty: "Personal Training",
      image:
        "https://images.unsplash.com/photo-1522075782449-e45a34f1ddfb?w=400",
      experience: "7 năm kinh nghiệm",
    },
    {
      name: "Phạm Thị D",
      specialty: "Group Fitness",
      image:
        "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=400",
      experience: "6 năm kinh nghiệm",
    },
  ];

  const homeImages = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920",
  ];

  return (
    <div className="bg-vintage-cream">
      {/* Hero Section */}
      <VintageBanner
        images={homeImages}
        title="Royal Fitness Club"
        subtitle="Nơi khởi nguồn cho hành trình hoàn thiện bản thân. Trải nghiệm dịch vụ fitness đẳng cấp hoàng gia với không gian sang trọng và đội ngũ chuyên nghiệp."
        height="h-screen"
        autoPlay={true}
        autoPlayInterval={5000}
      >
        <Link to="/services">
          <VintageButton
            variant="gold"
            size="lg"
            className="group w-full sm:w-auto"
          >
            <span>Khám phá dịch vụ</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </VintageButton>
        </Link>
        <Link to="/membership">
          <VintageButton
            variant="secondary"
            size="lg"
            className="group w-full sm:w-auto border-white text-white hover:bg-white hover:text-vintage-dark"
          >
            <Crown className="h-5 w-5 flex-shrink-0" />
            <span>Đăng ký thành viên</span>
          </VintageButton>
        </Link>
      </VintageBanner>

      {/* Features Section */}
      <VintageSection background="warm">
        <VintageContainer>
          <div className="text-center mb-16">
            <VintageHeading level={2} className="mb-6" ornament>
              Tại sao chọn Royal Fitness?
            </VintageHeading>
            <VintageDivider />
            <VintageText
              variant="lead"
              className="max-w-3xl mx-auto text-vintage-neutral"
            >
              Chúng tôi mang đến trải nghiệm fitness hoàn hảo với tiêu chuẩn
              dịch vụ cao cấp
            </VintageText>
          </div>

          <VintageGrid cols={{ sm: 1, md: 2, lg: 4 }} gap={8}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group h-full"
              >
                <VintageCard className="p-8 text-center h-full group-hover:shadow-elegant transition-all duration-300 luxury">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-luxury rounded-full text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-vintage">
                    {feature.icon}
                  </div>
                  <VintageHeading
                    level={4}
                    className="mb-4 group-hover:text-vintage-primary transition-colors"
                  >
                    {feature.title}
                  </VintageHeading>
                  <VintageText
                    variant="body"
                    className="text-vintage-neutral leading-relaxed"
                  >
                    {feature.description}
                  </VintageText>
                </VintageCard>
              </motion.div>
            ))}
          </VintageGrid>
        </VintageContainer>
      </VintageSection>

      {/* Services Section */}
      <VintageSection background="cream">
        <VintageContainer>
          <div className="text-center mb-16">
            <VintageHeading level={2} className="mb-6" ornament>
              Dịch vụ đa dạng
            </VintageHeading>
            <VintageDivider />
            <VintageText
              variant="lead"
              className="max-w-3xl mx-auto text-vintage-neutral"
            >
              Khám phá các dịch vụ fitness cao cấp được thiết kế riêng cho bạn
            </VintageText>
          </div>

          <div className="relative">
            {/* Navigation Buttons */}
            {services.length > servicesPerPage && (
              <>
                <button
                  onClick={() => handleScroll("left")}
                  className="absolute left-0 md:-left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 vintage-card flex items-center justify-center text-vintage-primary hover:shadow-vintage transition-all duration-300 z-10 hover:bg-vintage-warm"
                >
                  <ArrowRight className="h-5 w-5 rotate-180" />
                </button>

                <button
                  onClick={() => handleScroll("right")}
                  className="absolute right-0 md:-right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 vintage-card flex items-center justify-center text-vintage-primary hover:shadow-vintage transition-all duration-300 z-10 hover:bg-vintage-warm"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Services Grid */}
            <VintageGrid
              cols={{
                sm: 1,
                md: 2,
                lg:
                  displayedServices.length >= 3 ? 3 : displayedServices.length,
              }}
              gap={8}
            >
              {displayedServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ServiceCardEnhanced
                    id={service.id}
                    title={service.title}
                    image={service.image}
                  />
                </motion.div>
              ))}
            </VintageGrid>
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <VintageButton variant="primary" size="lg" className="group">
                <span>Xem tất cả dịch vụ</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </VintageButton>
            </Link>
          </div>
        </VintageContainer>
      </VintageSection>

      {/* About Section - Đã sửa lỗi spacing */}
      <VintageSection background="gradient">
        <VintageContainer>
          <VintageGrid
            cols={{ sm: 1, lg: 2 }}
            gap={20}
            className="items-center"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <VintageCard className="overflow-hidden luxury mr-10">
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800"
                    alt="Royal Fitness Interior"
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6 bg-vintage-warm">
                  <VintageText
                    variant="caption"
                    className="text-center italic text-vintage-neutral"
                  >
                    "Không gian hiện đại, thiết bị đạt chuẩn quốc tế"
                  </VintageText>
                </div>
              </VintageCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12" // Tăng spacing từ space-y-10 lên space-y-12
            >
              <div className="space-y-8">
                <VintageHeading level={2} className="text-white">
                  Về Royal Fitness
                </VintageHeading>
                <VintageText
                  variant="body"
                  className="text-vintage-cream leading-relaxed text-lg mb-8" // Thêm margin-bottom
                >
                  Royal Fitness là hệ thống phòng tập hiện đại ra đời với sứ
                  mệnh giúp cộng đồng nâng cao sức khỏe, cải thiện vóc dáng và
                  rèn luyện tinh thần kỷ luật. Với đội ngũ huấn luyện viên
                  chuyên nghiệp cùng hệ thống trang thiết bị đạt chuẩn quốc tế.
                </VintageText>
              </div>

              {/* Thêm khoảng cách trước stats cards */}
              <div className="pt-8">
                <VintageGrid cols={{ sm: 2 }} gap={6}>
                  <div className="vintage-card p-8 text-center luxury hover:shadow-golden transition-all duration-300">
                    <div className="text-4xl font-bold text-vintage-primary mb-3 vintage-heading">
                      1,500+
                    </div>
                    <VintageText
                      variant="caption"
                      className="text-vintage-neutral font-medium"
                    >
                      Thành viên hài lòng
                    </VintageText>
                  </div>
                  <div className="vintage-card p-8 text-center luxury hover:shadow-golden transition-all duration-300">
                    <div className="text-4xl font-bold text-vintage-primary mb-3 vintage-heading">
                      25+
                    </div>
                    <VintageText
                      variant="caption"
                      className="text-vintage-neutral font-medium"
                    >
                      Huấn luyện viên
                    </VintageText>
                  </div>
                  <div className="vintage-card p-8 text-center luxury hover:shadow-golden transition-all duration-300">
                    <div className="text-4xl font-bold text-vintage-primary mb-3 vintage-heading">
                      150+
                    </div>
                    <VintageText
                      variant="caption"
                      className="text-vintage-neutral font-medium"
                    >
                      Lớp học/tuần
                    </VintageText>
                  </div>
                  <div className="vintage-card p-8 text-center luxury hover:shadow-golden transition-all duration-300">
                    <div className="text-4xl font-bold text-vintage-primary mb-3 vintage-heading">
                      10+
                    </div>
                    <VintageText
                      variant="caption"
                      className="text-vintage-neutral font-medium"
                    >
                      Năm kinh nghiệm
                    </VintageText>
                  </div>
                </VintageGrid>
              </div>

              <div className="pt-6">
                <Link to="/club">
                  <VintageButton
                    variant="secondary"
                    size="lg"
                    className="group border-white text-white hover:bg-white hover:text-vintage-dark"
                  >
                    <span>Tìm hiểu thêm</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </VintageButton>
                </Link>
              </div>
            </motion.div>
          </VintageGrid>
        </VintageContainer>
      </VintageSection>

      {/* Trainers Section */}
      <VintageSection background="warm">
        <VintageContainer>
          <div className="text-center mb-16">
            <VintageHeading level={2} className="mb-6" ornament>
              Huấn luyện viên chuyên nghiệp
            </VintageHeading>
            <VintageDivider />
            <VintageText
              variant="lead"
              className="max-w-3xl mx-auto text-vintage-neutral"
            >
              Đội ngũ HLV giàu kinh nghiệm và đam mê sẽ đồng hành cùng bạn
            </VintageText>
          </div>

          <VintageGrid cols={{ sm: 1, md: 2, lg: 4 }} gap={8}>
            {trainers.map((trainer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TrainerCardEnhanced {...trainer} />
              </motion.div>
            ))}
          </VintageGrid>
        </VintageContainer>
      </VintageSection>
      {/* CTA Section */}
      <VintageSection background="primary">
        <VintageContainer>
          <div className="text-center text-white">
            <VintageHeading level={2} className="mb-6 text-white">
              Sẵn sàng bắt đầu hành trình của bạn?
            </VintageHeading>
            <VintageText
              variant="lead"
              className="mb-8 text-vintage-cream opacity-90 max-w-3xl mx-auto"
            >
              Tham gia cộng đồng Royal Fitness ngay hôm nay và trải nghiệm sự
              khác biệt
            </VintageText>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/sign-up">
                <VintageButton
                  variant="gold"
                  size="lg"
                  className="group w-full sm:w-auto"
                >
                  <Crown className="h-5 w-5 flex-shrink-0" />
                  <span>Đăng ký ngay</span>
                </VintageButton>
              </Link>
              <Link to="/club">
                <VintageButton
                  variant="secondary"
                  size="lg"
                  className="group border-white text-white hover:bg-white hover:text-vintage-dark w-full sm:w-auto"
                >
                  <span>Tìm hiểu CLB</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </VintageButton>
              </Link>
            </div>
          </div>
        </VintageContainer>
      </VintageSection>
      {/* Testimonials Section */}
      <VintageSection background="cream">
        <VintageContainer>
          <div className="text-center mb-16">
            <VintageHeading level={2} className="mb-6" ornament>
              Khách hàng nói gì về chúng tôi
            </VintageHeading>
            <VintageDivider />
            <VintageText
              variant="lead"
              className="max-w-3xl mx-auto text-vintage-neutral"
            >
              Những phản hồi chân thực từ cộng đồng thành viên Royal Fitness
            </VintageText>
          </div>

          <VintageGrid cols={{ sm: 1, md: 3 }} gap={8}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TestimonialCard {...testimonial} />
              </motion.div>
            ))}
          </VintageGrid>
        </VintageContainer>
      </VintageSection>
    </div>
  );
}

// Enhanced Service Card Component
function ServiceCardEnhanced({ id, title, image }) {
  return (
    <Link to={`/services/detail/${id}`} className="block group">
      <VintageCard
        type="luxury"
        className="overflow-hidden group-hover:shadow-elegant transition-all duration-500 h-full"
      >
        <div className="relative aspect-w-16 aspect-h-12 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-vintage-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-16 h-16 bg-vintage-gold rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 shadow-golden">
              <Play className="h-6 w-6 text-vintage-dark ml-1" />
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <VintageHeading
            level={4}
            className="mb-3 group-hover:text-vintage-primary transition-colors"
          >
            {title}
          </VintageHeading>
          <VintageText
            variant="body"
            className="mb-4 flex-1 text-vintage-neutral"
          >
            Khám phá dịch vụ {title} tại Royal Fitness với chương trình tập
            luyện chuyên biệt
          </VintageText>
          <div className="flex items-center text-vintage-primary group-hover:text-vintage-gold transition-colors pt-4 border-t border-vintage-primary/20">
            <span className="vintage-sans font-medium mr-2">Tìm hiểu thêm</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </VintageCard>
    </Link>
  );
}

// Enhanced Trainer Card Component
function TrainerCardEnhanced({ name, specialty, image, experience }) {
  return (
    <VintageCard className="overflow-hidden group hover:shadow-elegant transition-all duration-300 luxury h-full">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vintage-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6 text-center">
        <VintageHeading
          level={5}
          className="mb-2 group-hover:text-vintage-primary transition-colors"
        >
          {name}
        </VintageHeading>
        <VintageText
          variant="subtitle"
          className="mb-2 text-vintage-primary font-medium"
        >
          {specialty}
        </VintageText>
        <VintageText variant="caption" className="text-vintage-neutral">
          {experience}
        </VintageText>
      </div>
    </VintageCard>
  );
}

// Enhanced Testimonial Card Component
function TestimonialCard({ name, role, content, rating, image }) {
  return (
    <VintageCard className="p-6 h-full luxury">
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-vintage-gold fill-current" />
        ))}
      </div>

      <VintageText
        variant="body"
        className="mb-6 italic text-vintage-neutral leading-relaxed"
      >
        "{content}"
      </VintageText>

      <div className="flex items-center mt-auto">
        <img
          src={image}
          alt={name}
          className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-vintage-primary/20"
        />
        <div>
          <VintageHeading level={6} className="mb-1">
            {name}
          </VintageHeading>
          <VintageText variant="caption" className="text-vintage-primary">
            {role}
          </VintageText>
        </div>
      </div>
    </VintageCard>
  );
}
