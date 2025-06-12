import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  Crown,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";

export default function Login({ setUser }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: identifier,
          password,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      try {
        const userResponse = await axios.get(
          `http://localhost:5000/api/users/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const fullUserData = userResponse.data;
        localStorage.setItem("user", JSON.stringify(fullUserData));
        setUser(fullUserData);
      } catch (profileError) {
        console.error("Error fetching complete profile:", profileError);
        setUser(user);
      }

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message ||
          "Đăng nhập thất bại, vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-vintage-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-vintage-accent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-vintage-primary rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-vintage-gold to-vintage-accent rounded-3xl blur-2xl opacity-30"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-vintage-gold/30 shadow-elegant">
              {/* Logo Icon with enhanced styling */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="relative w-24 h-24 mx-auto mb-6"
              >
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-vintage-gold to-vintage-accent rounded-full blur-lg opacity-40 animate-pulse"></div>

                {/* Main logo container */}
                <div className="relative w-full h-full bg-gradient-to-br from-vintage-gold via-vintage-accent to-vintage-primary rounded-full flex items-center justify-center shadow-golden border-4 border-white/20">
                  {/* Inner decorative ring */}
                  <div className="absolute inset-2 border-2 border-white/30 rounded-full"></div>

                  {/* Crown icon */}
                  <Crown className="h-12 w-12 text-white drop-shadow-lg relative z-10" />

                  {/* Sparkle effects */}
                  <div className="absolute top-1 right-2 w-2 h-2 bg-white rounded-full opacity-80 animate-ping"></div>
                  <div className="absolute bottom-2 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-pulse"></div>
                </div>

                {/* Rotating decorative elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0"
                >
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-vintage-gold rounded-full opacity-60"></div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-vintage-accent rounded-full opacity-40"></div>
                  <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2.5 h-2.5 bg-vintage-primary rounded-full opacity-50"></div>
                  <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-vintage-gold rounded-full opacity-30"></div>
                </motion.div>
              </motion.div>

              {/* Brand Name with enhanced typography */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-vintage-primary vintage-heading mb-2 relative">
                  <span className="relative z-10">Royal Fitness</span>
                  {/* Text shadow effect */}
                  <div className="absolute inset-0 text-vintage-gold/20 blur-sm">
                    Royal Fitness
                  </div>
                </h1>

                {/* Decorative line under title */}
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-px bg-vintage-gold"></div>
                  <div className="w-2 h-2 bg-vintage-gold rotate-45 mx-3"></div>
                  <div className="w-8 h-px bg-vintage-gold"></div>
                </div>

                <p className="text-lg text-vintage-primary/80 vintage-serif font-medium">
                  Club
                </p>
              </motion.div>

              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-6"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-vintage-dark vintage-heading mb-2">
                  Chào Mừng Trở Lại
                </h2>
                <p className="text-vintage-neutral vintage-serif text-base leading-relaxed">
                  Đăng nhập để tiếp tục hành trình fitness đẳng cấp hoàng gia
                  của bạn
                </p>
              </motion.div>

              {/* Decorative bottom ornament */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-6 flex items-center justify-center"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-vintage-gold rounded-full"></div>
                  <div className="w-2 h-2 bg-vintage-accent rounded-full"></div>
                  <div className="w-3 h-3 bg-vintage-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-vintage-accent rounded-full"></div>
                  <div className="w-1 h-1 bg-vintage-gold rounded-full"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-vintage-gold/20 to-vintage-accent/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border-2 border-vintage-gold/20">
            {/* Login Form */}
            <div className="p-8">
              <motion.form
                onSubmit={handleLogin}
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <label className="flex items-center text-sm font-medium text-vintage-dark mb-2 vintage-serif vintage-input-label">
                    <User size={16} className="mr-2 text-vintage-gold" />
                    Email / Username / Số điện thoại
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-vintage-neutral" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-12 w-full p-4 bg-vintage-warm/50 border-2 border-vintage-accent/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:border-vintage-gold transition-all duration-300 vintage-serif placeholder-vintage-neutral/60 backdrop-blur-sm"
                      placeholder="Nhập email, username hoặc số điện thoại"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="flex items-center text-sm font-medium text-vintage-dark mb-2 vintage-serif">
                    <Lock size={16} className="mr-2 text-vintage-gold" />
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-vintage-neutral" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 w-full p-4 bg-vintage-warm/50 border-2 border-vintage-accent/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:border-vintage-gold transition-all duration-300 vintage-serif placeholder-vintage-neutral/60 backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-vintage-neutral hover:text-vintage-gold focus:outline-none transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center justify-between"
                  variants={itemVariants}
                >
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-vintage-gold focus:ring-vintage-gold border-vintage-accent rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-vintage-neutral vintage-serif"
                    >
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  <div>
                    <Link
                      to="/forgot-password"
                      className="font-medium link-vintage vintage-serif transition-colors"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border-2 border-red-200 flex items-start vintage-serif"
                  >
                    <Shield className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 flex justify-center items-center bg-gradient-to-r from-vintage-gold to-vintage-accent hover:from-vintage-accent hover:to-vintage-gold text-vintage-dark rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl vintage-heading text-lg group ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-vintage-dark border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Đang đăng nhập...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-5 w-5" />
                        <span>Đăng nhập</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.form>

              {/* Social Login */}
              <motion.div
                className="mt-8 border-t-2 border-vintage-accent/20 pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-center mb-4">
                  <span className="text-vintage-neutral vintage-serif">
                    Hoặc đăng nhập với
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Google */}
                  <button
                    type="button"
                    className="w-full py-3 px-4 border-2 border-vintage-accent/30 rounded-xl shadow-sm bg-white/80 backdrop-blur-sm hover:bg-vintage-warm/50 transition-all duration-300 flex items-center justify-center group hover:shadow-lg hover:border-vintage-gold/40"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    className="w-full py-3 px-4 border-2 border-vintage-accent/30 rounded-xl shadow-sm bg-white/80 backdrop-blur-sm hover:bg-vintage-warm/50 transition-all duration-300 flex items-center justify-center group hover:shadow-lg hover:border-vintage-gold/40"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#1877F2"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                      <path
                        fill="#FFF"
                        d="M16.671 15.543l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.642H7.078v3.47h3.047v8.385a12.118 12.118 0 003.75 0v-8.385h2.796z"
                      />
                    </svg>
                  </button>

                  {/* Zalo */}
                  <button
                    type="button"
                    className="w-full py-3 px-4 border-2 border-vintage-accent/30 rounded-xl shadow-sm bg-white/80 backdrop-blur-sm hover:bg-vintage-warm/50 transition-all duration-300 flex items-center justify-center group hover:shadow-lg hover:border-vintage-gold/40"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      viewBox="0 0 24 24"
                    >
                      <defs>
                        <linearGradient
                          id="zaloGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#0068FF" />
                          <stop offset="100%" stopColor="#0084FF" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="12"
                        cy="12"
                        r="12"
                        fill="url(#zaloGradient)"
                      />
                      <path
                        fill="#FFF"
                        d="M12 3C7.037 3 3 7.037 3 12s4.037 9 9 9 9-4.037 9-9-4.037-9-9-9zm4.5 10.5c0 1.5-1.5 3-3 3h-3c-1.5 0-3-1.5-3-3v-3c0-1.5 1.5-3 3-3h3c1.5 0 3 1.5 3 3v3z"
                      />
                      <path
                        fill="url(#zaloGradient)"
                        d="M15 9.5h-1.5v1h1.5v-1zm-3 0H10.5v1H12v-1zm3 2h-1.5v1h1.5v-1zm-3 0H10.5v1H12v-1zm-1.5 2H9v1h1.5v-1zm3 0H12v1h1.5v-1z"
                      />
                      <path
                        fill="#FFF"
                        d="M9.5 8.5h5c.275 0 .5.225.5.5v6c0 .275-.225.5-.5.5h-5c-.275 0-.5-.225-.5-.5V9c0-.275.225-.5.5-.5zm.5 1v5h4V9.5H10z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Enhanced social login text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 text-center"
                >
                  <p className="text-xs text-vintage-neutral vintage-serif opacity-70">
                    Đăng nhập nhanh chóng và an toàn
                  </p>
                </motion.div>
              </motion.div>
            </div>

            {/* Sign Up Link */}
            <motion.div
              className="bg-vintage-warm/30 px-8 py-6 border-t-2 border-vintage-accent/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-center text-vintage-neutral vintage-serif">
                Chưa có tài khoản?{" "}
                <Link
                  to="/sign-up"
                  className="font-semibold link-vintage vintage-heading transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center text-sm text-vintage-neutral vintage-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <a href="#" className="link-vintage">
            Điều khoản dịch vụ
          </a>{" "}
          và{" "}
          <a href="#" className="link-vintage">
            Chính sách bảo mật
          </a>{" "}
          của chúng tôi.
        </motion.div>
      </div>
    </div>
  );
}
