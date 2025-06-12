import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { User, Crown, Shield, Star } from "lucide-react";

// Import components
import ProfileSidebar from "./ProfileSidebar";
import ProfileInfo from "./ProfileInfo";
import PasswordChange from "./PasswordChange";
import MembershipCard from "./MembershipCard";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [section, setSection] = useState("profile");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const decoded = jwtDecode(token);
        const res = await axios.get(
          `http://localhost:5000/api/users/${decoded.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Fetched user data:", res.data);

        // Chỉ lấy membership thực từ API, không tạo giả
        let userData = res.data;

        try {
          const membershipResponse = await axios.get(
            `http://localhost:5000/api/memberships/user/${decoded.userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (
            membershipResponse.data &&
            membershipResponse.data.status === "active"
          ) {
            console.log(
              "Real active membership found:",
              membershipResponse.data
            );
            userData = {
              ...userData,
              membership: {
                id: membershipResponse.data._id || membershipResponse.data.id,
                type: membershipResponse.data.type,
                startDate: membershipResponse.data.startDate,
                endDate: membershipResponse.data.endDate,
                status: membershipResponse.data.status,
                price: membershipResponse.data.price,
              },
            };
          } else {
            // Không tạo membership giả, để null hoặc undefined
            console.log("No active membership found");
            userData.membership = null;
          }
        } catch (membershipError) {
          console.log("No membership found for user:", membershipError.message);
          // Không tạo membership giả
          userData.membership = null;
        }

        console.log("Final user data:", userData);

        setUser(userData);
        setForm({
          ...userData,
          dob: userData.dob ? userData.dob.split("T")[0] : "",
        });

        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("Lỗi khi lấy thông tin:", err);
        toast.error("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        {
          username: form.username,
          email: form.email,
          phone: form.phone,
          dob: form.dob,
          gender: form.gender,
          fullName: form.fullName,
          address: form.address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let updatedUser = response.data;

      if (!avatar && user.avatar) {
        updatedUser.avatar = user.avatar;
      }

      if (avatar) {
        const formData = new FormData();
        formData.append("avatar", avatar);

        try {
          const avatarResponse = await axios.post(
            `http://localhost:5000/api/images/avatar/${user._id}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          updatedUser = {
            ...updatedUser,
            avatar: avatarResponse.data.avatar,
          };
        } catch (avatarError) {
          console.error("Error uploading avatar:", avatarError);
          toast.error("Cập nhật ảnh đại diện thất bại");
        }
      }

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditMode(false);
      setAvatar(null);
      setPreviewUrl("");

      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || "Cập nhật thông tin thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/users/${user._id}/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Cập nhật mật khẩu thành công!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Lỗi cập nhật mật khẩu:", err);
      alert("Cập nhật mật khẩu thất bại.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center items-center py-20"
          >
            <div className="p-12 text-center bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/50 shadow-elegant rounded-3xl">
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-vintage-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-vintage-accent rounded-full mx-auto animate-pulse"></div>
              </div>
              <h4 className="mb-3 text-vintage-dark text-xl font-bold vintage-heading">
                Đang tải thông tin người dùng
              </h4>
              <p className="text-vintage-neutral vintage-body">
                Vui lòng đợi trong giây lát...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream pt-24 pb-16"
    >
      {/* Luxury Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/30 shadow-elegant rounded-3xl p-12 relative overflow-hidden">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="vintage-pattern h-full w-full"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 bg-gradient-luxury rounded-2xl flex items-center justify-center mr-6 shadow-golden">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl md:text-5xl font-bold text-vintage-dark mb-3 vintage-heading">
                    Hồ Sơ Cá Nhân
                  </h1>
                  <div className="w-32 h-2 bg-gradient-golden rounded-full shadow-md"></div>
                </div>
              </div>

              <p className="text-vintage-neutral text-xl leading-relaxed max-w-3xl mx-auto vintage-body mb-8">
                Quản lý thông tin cá nhân, bảo mật tài khoản và theo dõi thành
                tích của bạn tại phòng tập luxury.
              </p>

              {/* Trust Indicators */}
              <div className="flex justify-center items-center space-x-12 pt-8 border-t-2 border-vintage-accent/30">
                {[
                  {
                    icon: Shield,
                    text: "Bảo mật cao",
                    color: "text-vintage-primary",
                  },
                  {
                    icon: Crown,
                    text: "Thành viên VIP",
                    color: "text-vintage-gold",
                  },
                  {
                    icon: Star,
                    text: "Dịch vụ 5 sao",
                    color: "text-vintage-primary",
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
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <span className="text-vintage-dark font-semibold vintage-body">
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-1/3"
          >
            <ProfileSidebar
              user={user}
              previewUrl={previewUrl}
              section={section}
              setSection={setSection}
              editMode={editMode}
              handleAvatarChange={handleAvatarChange}
              cardVariants={cardVariants}
            />
          </motion.div>

          {/* Enhanced Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-2/3"
          >
            <AnimatePresence mode="wait">
              {section === "profile" ? (
                <ProfileInfo
                  user={user}
                  form={form}
                  editMode={editMode}
                  setEditMode={setEditMode}
                  handleChange={handleChange}
                  handleSave={handleSave}
                  setForm={setForm}
                  setPreviewUrl={setPreviewUrl}
                  previewUrl={previewUrl}
                  setAvatar={setAvatar}
                  avatar={avatar}
                  cardVariants={cardVariants}
                />
              ) : section === "membership" ? (
                <MembershipCard user={user} cardVariants={cardVariants} />
              ) : (
                <PasswordChange
                  passwordForm={passwordForm}
                  handlePasswordChange={handlePasswordChange}
                  handlePasswordSubmit={handlePasswordSubmit}
                  cardVariants={cardVariants}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Enhanced Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <div className="bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/30 shadow-elegant rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-vintage-dark mb-4 vintage-heading">
                Thành Tích Của Bạn
              </h2>
              <div className="w-24 h-1 bg-gradient-golden rounded-full mx-auto"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  value: "24",
                  label: "Lớp đã tham gia",
                  icon: "🏆",
                  color: "from-vintage-warm to-vintage-cream",
                },
                {
                  value: "5",
                  label: "Lớp đang học",
                  icon: "📚",
                  color: "from-vintage-accent to-vintage-warm",
                },
                {
                  value: "92%",
                  label: "Tỷ lệ hoàn thành",
                  icon: "⭐",
                  color: "from-vintage-gold/20 to-vintage-warm",
                },
                {
                  value: "6",
                  label: "Tháng thành viên",
                  icon: "👑",
                  color: "from-vintage-primary/10 to-vintage-cream",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className={`text-center p-6 bg-gradient-to-br ${stat.color} rounded-2xl border-2 border-vintage-accent/20 hover:shadow-golden transition-all duration-300`}
                >
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-bold text-vintage-dark mb-2 vintage-heading">
                    {stat.value}
                  </div>
                  <div className="text-vintage-neutral font-medium vintage-body">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
