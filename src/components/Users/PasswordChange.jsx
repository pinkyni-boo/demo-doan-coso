import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Eye, EyeOff, Shield, Lock } from "lucide-react";
import axios from "axios";

const PasswordChange = ({
  passwordForm,
  handlePasswordChange,
  handlePasswordSubmit,
  cardVariants,
}) => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotification({
        message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/users/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotification({
        message: "Đổi mật khẩu thành công!",
        type: "success",
      });

      // Reset form
      handlePasswordChange({ target: { name: "currentPassword", value: "" } });
      handlePasswordChange({ target: { name: "newPassword", value: "" } });
      handlePasswordChange({ target: { name: "confirmPassword", value: "" } });
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu";
      setNotification({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }

    // Auto hide notification
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 5000);
  };

  return (
    <motion.div
      key="password"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardVariants}
      className="bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/30 shadow-elegant rounded-3xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-8 py-6 bg-gradient-to-r from-vintage-warm to-vintage-cream border-b border-vintage-accent/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-luxury rounded-xl flex items-center justify-center shadow-golden">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-vintage-dark vintage-heading">
              Đổi mật khẩu
            </h2>
            <p className="text-vintage-neutral vintage-body text-sm">
              Cập nhật mật khẩu để bảo vệ tài khoản của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Security Notice */}
        <div className="mb-6 p-4 bg-gradient-to-r from-vintage-warm to-vintage-cream rounded-xl border border-vintage-accent/30">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-vintage-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-vintage-dark vintage-body">
                Bảo mật tài khoản
              </h4>
              <p className="text-sm text-vintage-neutral vintage-body mt-1">
                Mật khẩu mạnh nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
                thường, số và ký tự đặc biệt.
              </p>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border-2 ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-vintage-dark mb-2 vintage-body">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="currentPassword"
                type={showPassword.current ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full rounded-xl border-2 border-vintage-accent bg-white/90 backdrop-blur-sm px-4 py-3 pr-12 text-vintage-dark focus:border-vintage-gold focus:ring-4 focus:ring-vintage-gold/30 transition-all duration-300 vintage-body"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-vintage-neutral hover:text-vintage-primary transition-colors"
              >
                {showPassword.current ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-vintage-dark mb-2 vintage-body">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="newPassword"
                type={showPassword.new ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
                className="w-full rounded-xl border-2 border-vintage-accent bg-white/90 backdrop-blur-sm px-4 py-3 pr-12 text-vintage-dark focus:border-vintage-gold focus:ring-4 focus:ring-vintage-gold/30 transition-all duration-300 vintage-body"
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-vintage-neutral hover:text-vintage-primary transition-colors"
              >
                {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-semibold text-vintage-dark mb-2 vintage-body">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showPassword.confirm ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full rounded-xl border-2 border-vintage-accent bg-white/90 backdrop-blur-sm px-4 py-3 pr-12 text-vintage-dark focus:border-vintage-gold focus:ring-4 focus:ring-vintage-gold/30 transition-all duration-300 vintage-body"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-vintage-neutral hover:text-vintage-primary transition-colors"
              >
                {showPassword.confirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-gradient-luxury hover:shadow-golden text-white"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Lưu mật khẩu mới</span>
              </>
            )}
          </button>
        </form>

        {/* Password Requirements */}
        <div className="mt-6 p-4 bg-vintage-warm rounded-xl border border-vintage-accent/30">
          <h4 className="font-semibold text-vintage-dark mb-2 vintage-body">
            Yêu cầu mật khẩu:
          </h4>
          <ul className="space-y-1 text-sm text-vintage-neutral vintage-body">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-vintage-gold rounded-full"></div>
              Ít nhất 6 ký tự
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-vintage-gold rounded-full"></div>
              Nên bao gồm chữ hoa và chữ thường
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-vintage-gold rounded-full"></div>
              Nên có ít nhất một số hoặc ký tự đặc biệt
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default PasswordChange;
