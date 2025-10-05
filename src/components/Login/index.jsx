import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default React.memo(function Login({ setUser }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [fieldTouched, setFieldTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Real-time form validation
  useEffect(() => {
    const isValid = identifier.trim().length > 0 && password.length >= 6;
    setIsFormValid(isValid);
  }, [identifier, password]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFieldFocus = useCallback((fieldName) => {
    setFocusedField(fieldName);
    setError(""); // Clear error when user starts typing
  }, []);

  const handleFieldBlur = useCallback((fieldName) => {
    setFocusedField("");
    setFieldTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

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

      // Show success message briefly
      setSuccessMessage("Đăng nhập thành công!");

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

      // Delay navigation for smooth transition
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
<<<<<<< Updated upstream
      setError(
        error.response?.data?.message ||
          "Đăng nhập thất bại, vui lòng thử lại sau."
      );
=======

      // Kiểm tra nếu tài khoản bị khóa
      if (error.response?.status === 403 && error.response?.data?.isLocked) {
        setError(
          `Tài khoản đã bị khóa: ${
            error.response.data.reason || "Tài khoản bị khóa bởi admin"
          }`
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Đăng nhập thất bại, vui lòng thử lại sau."
        );
      }
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/google-login",
        {
          tokenId: credentialResponse.credential,
        }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      setError("Đăng nhập Google thất bại");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    blur: {
      scale: 1,
      transition: { duration: 0.2 },
    },
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
            {/* Enhanced background with multiple layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-vintage-gold/30 via-vintage-accent/20 to-vintage-primary/30 rounded-3xl blur-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-vintage-cream/50 to-vintage-warm/30 rounded-3xl blur-xl"></div>

            {/* Main container with improved backdrop */}
            <div className="relative bg-gradient-to-br from-white/90 via-vintage-warm/20 to-white/85 backdrop-blur-xl rounded-3xl p-8 border-2 border-vintage-gold/40 shadow-2xl">
              {/* Decorative corner elements */}
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-vintage-gold/30 rounded-tl-lg"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-vintage-gold/30 rounded-tr-lg"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-vintage-gold/30 rounded-bl-lg"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-vintage-gold/30 rounded-br-lg"></div>

              {/* Enhanced Logo Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="relative w-28 h-28 mx-auto mb-6"
              >
                {/* Multi-layered glow effects */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-vintage-gold to-vintage-accent rounded-full blur-2xl opacity-30"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-2 bg-gradient-to-br from-vintage-accent to-vintage-primary rounded-full blur-xl opacity-40"
                  animate={{ scale: [1.1, 1, 1.1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />

                {/* Premium logo container with depth */}
                <div className="relative w-full h-full bg-gradient-to-br from-vintage-gold via-vintage-accent to-vintage-primary rounded-full flex items-center justify-center shadow-2xl border-4 border-white/40 overflow-hidden">
                  {/* Inner gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full"></div>

                  {/* Multiple decorative rings */}
                  <div className="absolute inset-2 border-2 border-white/40 rounded-full"></div>
                  <div className="absolute inset-4 border border-white/20 rounded-full"></div>

                  {/* Crown icon with enhanced styling */}
                  <Crown className="h-14 w-14 text-vintage-dark drop-shadow-2xl relative z-10 filter brightness-110" />

                  {/* Enhanced sparkle effects */}
                  <motion.div
                    className="absolute top-1 right-3 w-2.5 h-2.5 bg-vintage-dark rounded-full opacity-90"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute bottom-3 left-2 w-2 h-2 bg-vintage-dark rounded-full opacity-70"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div
                    className="absolute top-1/2 right-1 w-1.5 h-1.5 bg-vintage-dark rounded-full opacity-80"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: 1 }}
                  />
                </div>

                {/* Enhanced rotating decorative elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0"
                >
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3.5 h-3.5 bg-gradient-to-r from-vintage-gold to-vintage-accent rounded-full opacity-70 shadow-lg"></div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-gradient-to-r from-vintage-accent to-vintage-primary rounded-full opacity-50 shadow-md"></div>
                  <div className="absolute top-1/2 -left-1.5 transform -translate-y-1/2 w-3 h-3 bg-gradient-to-b from-vintage-primary to-vintage-gold rounded-full opacity-60 shadow-lg"></div>
                  <div className="absolute top-1/2 -right-1.5 transform -translate-y-1/2 w-2.5 h-2.5 bg-gradient-to-t from-vintage-gold to-vintage-accent rounded-full opacity-40 shadow-md"></div>
                </motion.div>

                {/* Additional floating particles */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-2 left-4 w-1 h-1 bg-vintage-gold rounded-full opacity-50"></div>
                  <div className="absolute bottom-4 right-3 w-1.5 h-1.5 bg-vintage-accent rounded-full opacity-40"></div>
                  <div className="absolute top-6 right-6 w-1 h-1 bg-vintage-primary rounded-full opacity-60"></div>
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
                  <motion.div
                    className="relative"
                    variants={inputVariants}
                    animate={focusedField === "identifier" ? "focus" : "blur"}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Mail
                        className={`h-5 w-5 transition-colors duration-300 ${
                          focusedField === "identifier"
                            ? "text-vintage-gold"
                            : "text-vintage-neutral"
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onFocus={() => handleFieldFocus("identifier")}
                      onBlur={() => handleFieldBlur("identifier")}
                      className={`pl-12 w-full p-4 bg-vintage-warm/50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:border-vintage-gold transition-all duration-300 vintage-serif placeholder-vintage-neutral/60 backdrop-blur-sm ${
                        fieldTouched.identifier &&
                        identifier.trim().length === 0
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-vintage-accent/30"
                      }`}
                      placeholder="Nhập email, username hoặc số điện thoại"
                      required
                    />
                    {fieldTouched.identifier &&
                      identifier.trim().length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </motion.div>
                      )}
                  </motion.div>
                  {fieldTouched.identifier &&
                    identifier.trim().length === 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 text-sm mt-2 flex items-center vintage-serif"
                      >
                        <AlertCircle size={16} className="mr-1" />
                        Vui lòng nhập email, username hoặc số điện thoại
                      </motion.p>
                    )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="flex items-center text-sm font-medium text-vintage-dark mb-2 vintage-serif">
                    <Lock size={16} className="mr-2 text-vintage-gold" />
                    Mật khẩu
                  </label>
                  <motion.div
                    className="relative"
                    variants={inputVariants}
                    animate={focusedField === "password" ? "focus" : "blur"}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Lock
                        className={`h-5 w-5 transition-colors duration-300 ${
                          focusedField === "password"
                            ? "text-vintage-gold"
                            : "text-vintage-neutral"
                        }`}
                      />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => handleFieldFocus("password")}
                      onBlur={() => handleFieldBlur("password")}
                      className={`pl-12 pr-12 w-full p-4 bg-vintage-warm/50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:border-vintage-gold transition-all duration-300 vintage-serif placeholder-vintage-neutral/60 backdrop-blur-sm ${
                        fieldTouched.password &&
                        password.length < 6 &&
                        password.length > 0
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-vintage-accent/30"
                      }`}
                      placeholder="••••••••"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
                      {fieldTouched.password && password.length >= 6 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </motion.div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-vintage-neutral hover:text-vintage-gold focus:outline-none transition-colors"
                      >
                        <motion.div
                          initial={false}
                          animate={{ rotate: showPassword ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </motion.div>
                      </button>
                    </div>
                  </motion.div>
                  {fieldTouched.password &&
                    password.length < 6 &&
                    password.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 text-sm mt-2 flex items-center vintage-serif"
                      >
                        <AlertCircle size={16} className="mr-1" />
                        Mật khẩu phải có ít nhất 6 ký tự
                      </motion.p>
                    )}
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

                {/* Success Message */}
                <AnimatePresence mode="wait">
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="p-4 bg-green-50 text-green-700 text-sm rounded-2xl border-2 border-green-200 flex items-center vintage-serif shadow-lg"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      </motion.div>
                      <span>{successMessage}</span>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="ml-auto"
                      >
                        <Sparkles className="h-4 w-4 text-green-500" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border-2 border-red-200 flex items-start vintage-serif shadow-lg"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Shield className="h-5 w-5 mr-2 flex-shrink-0" />
                      </motion.div>
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={loading || !isFormValid}
                    whileHover={!loading && isFormValid ? { scale: 1.02 } : {}}
                    whileTap={!loading && isFormValid ? { scale: 0.98 } : {}}
                    className={`w-full py-4 px-6 flex justify-center items-center rounded-2xl transition-all duration-300 font-semibold shadow-lg vintage-heading text-lg group relative overflow-hidden ${
                      loading || !isFormValid
                        ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
                        : "bg-gradient-to-r from-vintage-gold to-vintage-accent hover:from-vintage-accent hover:to-vintage-gold text-vintage-dark hover:shadow-xl"
                    }`}
                  >
                    {/* Background gradient animation */}
                    {!loading && isFormValid && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-vintage-accent to-vintage-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                    )}

                    <div className="relative z-10 flex items-center">
                      {loading ? (
                        <>
                          <motion.div
                            className="w-5 h-5 border-2 border-vintage-dark border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          <span>Đang đăng nhập...</span>
                        </>
                      ) : successMessage ? (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <CheckCircle className="mr-2 h-5 w-5" />
                          </motion.div>
                          <span>Thành công!</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-5 w-5" />
                          <span>Đăng nhập</span>
                          <motion.div
                            animate={{ x: isFormValid ? [0, 5, 0] : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </motion.div>
                        </>
                      )}
                    </div>
                  </motion.button>

                  {/* Form validation hint */}
                  {!isFormValid &&
                    (identifier.length > 0 || password.length > 0) && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-vintage-neutral text-sm mt-2 text-center vintage-serif"
                      >
                        Vui lòng nhập đầy đủ thông tin để đăng nhập
                      </motion.p>
                    )}
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

                <div className="flex justify-center">
                  {import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === "true" ? (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Đăng nhập Google thất bại")}
                      size="large"
                      theme="outline"
                      text="signin_with"
                      shape="rectangular"
                      locale="vi"
                      auto_select={false}
                    />
                  ) : (
                    /* Google OAuth disabled - show placeholder */
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full max-w-sm px-6 py-3 bg-white border-2 border-gray-300 rounded-2xl flex items-center justify-center space-x-3 cursor-not-allowed opacity-50 transition-all duration-300"
                      title="Google Sign In hiện tại không khả dụng"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                      <span className="text-gray-500 font-medium">
                        Google Sign In (Tạm thời không khả dụng)
                      </span>
                    </motion.div>
                  )}
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
});
