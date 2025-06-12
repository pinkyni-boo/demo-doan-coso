import { useState, useEffect } from "react";
import VintageBanner from "./Banner";
import axios from "axios";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PricingPlans from "../PricingPlans";
import Toast from "../common/Toast";
import {
  VintageContainer,
  VintageSection,
  VintageHero,
  VintageCard,
  VintageHeading,
  VintageText,
  VintageButton,
  VintageGrid,
  VintageModal,
} from "../Templates/VintageLayout";
import { MapPin, Star, Crown, ArrowRight, X, CheckCircle } from "lucide-react";

export default function Club() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showMembershipSection, setShowMembershipSection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [membershipMessage, setMembershipMessage] = useState({
    text: "",
    type: "",
  });
  const [filterCategory, setFilterCategory] = useState("all");
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/clubs");
        setClubs(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách CLB:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);
  const openClubDetails = (club) => {
    setSelectedClub(club);
  };

  const closeClubDetails = () => {
    setSelectedClub(null);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const clubImages = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920",
  ];

  return (
    <div className="bg-vintage-cream min-h-screen">
      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />

      {/* Hero Section */}
      <VintageBanner
        images={clubImages}
        title="Hệ Thống Câu Lạc Bộ"
        subtitle="Chinh phục sức khỏe, vươn tới đỉnh cao cùng chúng tôi! Khám phá các câu lạc bộ hiện đại với trang thiết bị đẳng cấp."
        height="h-screen"
        autoPlay={true}
        autoPlayInterval={4000}
      >
        <VintageButton
          variant="gold"
          size="lg"
          onClick={() =>
            document.getElementById("clubs-section").scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          <Crown className="mr-2 h-5 w-5" />
          Khám phá CLB
        </VintageButton>
        <Link to="/membership">
          <VintageButton
            variant="secondary"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-vintage-dark"
          >
            Đăng ký thành viên
          </VintageButton>
        </Link>
      </VintageBanner>

      {/* Club List Section */}
      <VintageSection background="warm" id="clubs-section">
        <VintageContainer>
          <div className="text-center mb-16">
            <VintageHeading level={2} className="mb-6" ornament>
              Khám Phá Các Câu Lạc Bộ
            </VintageHeading>
            <VintageText variant="lead" className="max-w-3xl mx-auto">
              Chúng tôi tự hào mang đến cho bạn hệ thống câu lạc bộ hiện đại,
              trang thiết bị đẳng cấp và đội ngũ HLV chuyên nghiệp
            </VintageText>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-vintage-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <VintageText variant="body" className="text-vintage-neutral">
                  Đang tải danh sách CLB...
                </VintageText>
              </div>
            </div>
          ) : (
            <VintageGrid cols={{ sm: 1, md: 2, lg: 3 }} gap={8}>
              {clubs.map((club, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <VintageCard className="club-card-container overflow-hidden group hover:shadow-elegant transition-all duration-500">
                    <div className="club-card-image">
                      <img
                        src={club.image}
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg"></div>
                      </div>
                    </div>

                    <div className="club-card-content">
                      <div className="club-card-body">
                        <div className="flex items-start justify-between mb-3">
                          <VintageHeading
                            level={4}
                            className="group-hover:text-vintage-primary transition-colors flex-1"
                          >
                            {club.name}
                          </VintageHeading>
                          <div className="flex ml-4">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 text-vintage-gold fill-current"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center text-vintage-neutral mb-3">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <VintageText variant="caption" className="text-sm">
                            {club.address}
                          </VintageText>
                        </div>

                        <div className="club-card-description">
                          <VintageText
                            variant="body"
                            className="line-clamp-3 text-sm leading-relaxed"
                          >
                            {club.description}
                          </VintageText>
                        </div>

                        <div className="club-card-action space-y-3">
                          <button
                            className="btn-club-register group w-full"
                            onClick={() => openClubDetails(club)}
                          >
                            <span>Xem Chi Tiết</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </button>

                          <Link to="/membership" className="block">
                            <VintageButton
                              variant="secondary"
                              className="w-full text-sm border-vintage-primary text-vintage-primary hover:bg-vintage-primary hover:text-white"
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              <span>Đăng Ký Thành Viên</span>
                            </VintageButton>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </VintageCard>
                </motion.div>
              ))}
            </VintageGrid>
          )}
        </VintageContainer>
      </VintageSection>

      {/* Membership Section - Cập nhật background */}
      <VintageSection className="membership-section-enhanced">
        <VintageContainer>
          <div className="text-center mb-12">
            <VintageHeading level={2} className="mb-6 text-vintage" ornament>
              Đăng Ký Gói Tập
            </VintageHeading>
            <VintageText
              variant="lead"
              className="max-w-3xl mx-auto text-vintage-accent opacity-90"
            >
              Chọn gói tập phù hợp với lịch trình và nhu cầu của bạn. Chúng tôi
              cung cấp nhiều gói tập đa dạng từ cơ bản đến VIP.
            </VintageText>

            {!showMembershipSection ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8"
              >
                <VintageButton
                  variant="gold"
                  size="lg"
                  onClick={() => setShowMembershipSection(true)}
                  className="group"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  <span>Xem Các Gói Tập</span>
                </VintageButton>
              </motion.div>
            ) : null}
          </div>

          {showMembershipSection && (
            <div className="bg-vintage-warm rounded-2xl p-8 shadow-elegant border border-vintage-gold/20">
              <PricingPlans
                selectedPlan={selectedPlan}
                onSelectPlan={handleSelectPlan}
                filterCategory={filterCategory}
                onFilterChange={setFilterCategory}
                message={membershipMessage}
                readOnly={true}
              />

              <div className="text-center mt-12">
                <Link to="/membership">
                  <VintageButton variant="primary" size="lg" className="group">
                    <Crown className="mr-2 h-5 w-5" />
                    <span>Đăng ký ngay</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </VintageButton>
                </Link>
              </div>
            </div>
          )}
        </VintageContainer>
      </VintageSection>

      {/* Club Details Modal */}
      <VintageModal
        isOpen={!!selectedClub}
        onClose={closeClubDetails}
        title={selectedClub?.name || "Chi tiết CLB"}
        size="lg"
      >
        {selectedClub && (
          <div className="space-y-6">
            <img
              src={selectedClub.image}
              alt={selectedClub.name}
              className="w-full h-64 object-cover rounded-lg"
            />

            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-vintage-primary mr-2" />
              <VintageText variant="body">{selectedClub.address}</VintageText>
            </div>

            <VintageText variant="body">{selectedClub.description}</VintageText>

            <VintageGrid cols={{ sm: 1, md: 2 }} gap={6}>
              <VintageCard type="luxury" className="p-6">
                <VintageHeading level={5} className="mb-4 text-vintage-primary">
                  Trang Thiết Bị
                </VintageHeading>
                <div className="space-y-3">
                  {[
                    "Máy tập hiện đại nhập khẩu từ Mỹ",
                    "Phòng tập rộng rãi, thoáng mát",
                    "Khu vực cardio riêng biệt",
                    "Phòng tập yoga chuyên biệt",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-vintage-primary mr-3 mt-0.5 flex-shrink-0" />
                      <VintageText variant="body">{item}</VintageText>
                    </div>
                  ))}
                </div>
              </VintageCard>

              <VintageCard type="luxury" className="p-6">
                <VintageHeading level={5} className="mb-4 text-vintage-primary">
                  Dịch Vụ
                </VintageHeading>
                <div className="space-y-3">
                  {[
                    "Huấn luyện viên cá nhân",
                    "Các lớp học nhóm đa dạng",
                    "Tư vấn dinh dưỡng",
                    "Spa & massage thư giãn",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-vintage-primary mr-3 mt-0.5 flex-shrink-0" />
                      <VintageText variant="body">{item}</VintageText>
                    </div>
                  ))}
                </div>
              </VintageCard>
            </VintageGrid>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <VintageButton
                variant="secondary"
                onClick={closeClubDetails}
                className="flex-1"
              >
                Đóng
              </VintageButton>
              <Link to="/membership" className="flex-1">
                <VintageButton variant="primary" className="w-full group">
                  <Crown className="mr-2 h-4 w-4" />
                  <span>Đăng Ký Thành Viên</span>
                </VintageButton>
              </Link>
            </div>
          </div>
        )}
      </VintageModal>
    </div>
  );
}
