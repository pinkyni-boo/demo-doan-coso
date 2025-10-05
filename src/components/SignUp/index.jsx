import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  Users,
  Crown,
  ChevronRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  Shield,
} from "lucide-react";

// Enhanced VintageInput component với real-time validation
const VintageInput = React.memo(
  ({
    icon: Icon,
    label,
    error,
    type = "text",
    required = false,
    showPassword,
    onTogglePassword,
    itemVariants,
    value,
    onFocus,
    onBlur,
    focused,
    touched,
    isValid,
    ...props
  }) => (
    <motion.div variants={itemVariants} className="mb-6">
      <label className="flex items-center text-sm font-semibold text-vintage-dark mb-3 vintage-heading">
        <Icon size={18} className="mr-2 text-vintage-gold" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <motion.div
        className="relative"
        animate={focused ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <input
          {...props}
          value={value}
          type={type}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`w-full p-4 pr-12 border-2 rounded-2xl bg-vintage-warm/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:border-vintage-gold transition-all duration-300 vintage-serif placeholder-vintage-neutral/60 text-vintage-dark font-medium ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : touched && isValid
              ? "border-green-300 focus:border-green-500 focus:ring-green-200"
              : "border-vintage-accent/30 hover:border-vintage-gold/50"
          }`}
        />

        {/* Right side icons */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
          {touched && isValid && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <CheckCircle className="h-5 w-5 text-green-500" />
            </motion.div>
          )}

          {type === "password" && onTogglePassword && (
            <motion.button
              type="button"
              onClick={onTogglePassword}
              className="text-vintage-neutral hover:text-vintage-gold transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: showPassword ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </motion.div>
            </motion.button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-600 text-sm mt-2 flex items-center vintage-serif"
          >
            <AlertCircle size={16} className="mr-1" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
);

// Enhanced VintageSelect component
const VintageSelect = React.memo(
  ({
    icon: Icon,
    label,
    error,
    options = [],
    placeholder = "Chọn...",
    required = false,
    itemVariants,
    value,
    onFocus,
    onBlur,
    focused,
    touched,
    isValid,
    ...props
  }) => (
    <motion.div variants={itemVariants} className="mb-6">
      <label className="flex items-center text-sm font-semibold text-vintage-dark mb-3 vintage-heading">
        <Icon size={18} className="mr-2 text-vintage-gold" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <motion.div
        className="relative"
        animate={focused ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <select
          {...props}
          value={value}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`w-full p-4 pr-12 border-2 rounded-2xl bg-vintage-warm/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:border-vintage-gold transition-all duration-300 vintage-serif text-vintage-dark font-medium appearance-none cursor-pointer ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : touched && isValid && value
              ? "border-green-300 focus:border-green-500 focus:ring-green-200"
              : "border-vintage-accent/30 hover:border-vintage-gold/50"
          }`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d4af37' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 1rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.25rem 1.25rem",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Validation icon */}
        {touched && isValid && value && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-12 top-1/2 transform -translate-y-1/2"
          >
            <CheckCircle className="h-5 w-5 text-green-500" />
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-600 text-sm mt-2 flex items-center vintage-serif"
          >
            <AlertCircle size={16} className="mr-1" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
);

const SignUp = React.memo(() => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [fieldTouched, setFieldTouched] = useState({});

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Real-time validation states
  const [fieldValidation, setFieldValidation] = useState({});

  // Auto-clear error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle field focus/blur for better UX
  const handleFieldFocus = useCallback((fieldName) => {
    setFocusedField(fieldName);
    setError(""); // Clear error when user starts interacting
  }, []);

  const handleFieldBlur = useCallback(
    (fieldName) => {
      setFocusedField("");
      setFieldTouched((prev) => ({ ...prev, [fieldName]: true }));

      // Validate field on blur without dependency
      const currentValue = formData[fieldName];
      const currentPassword = formData.password; // Get current password value

      let isValid = false;
      let error = "";

      switch (fieldName) {
        case "username":
          isValid =
            currentValue.length >= 3 && /^[a-zA-Z0-9_]+$/.test(currentValue);
          if (!isValid && currentValue.length > 0) {
            error =
              "Username phải có ít nhất 3 ký tự và chỉ chứa chữ, số, dấu gạch dưới";
          }
          break;
        case "email":
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentValue);
          if (!isValid && currentValue.length > 0) {
            error = "Email không hợp lệ";
          }
          break;
        case "password":
          isValid = currentValue.length >= 6;
          if (!isValid && currentValue.length > 0) {
            error = "Mật khẩu phải có ít nhất 6 ký tự";
          }
          break;
        case "confirmPassword":
          isValid = currentValue === currentPassword && currentValue.length > 0;
          if (!isValid && currentValue.length > 0) {
            error = "Mật khẩu xác nhận không khớp";
          }
          break;
        case "phone":
          isValid = /^(\+84|0)[0-9]{9,10}$/.test(currentValue);
          if (!isValid && currentValue.length > 0) {
            error = "Số điện thoại không hợp lệ";
          }
          break;
        case "fullName":
          isValid = currentValue.trim().length >= 2;
          if (!isValid && currentValue.length > 0) {
            error = "Họ và tên phải có ít nhất 2 ký tự";
          }
          break;
        default:
          isValid = currentValue.trim().length > 0;
      }

      setFieldValidation((prev) => ({
        ...prev,
        [fieldName]: { isValid, error },
      }));
    },
    [formData]
  );

  // Real-time field validation - simplified to avoid circular deps
  const validateField = useCallback((fieldName, value, passwordValue) => {
    // Use current password if not provided
    const currentPassword =
      passwordValue !== undefined ? passwordValue : formData.password;

    let isValid = false;
    let error = "";

    switch (fieldName) {
      case "username":
        isValid = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
        if (!isValid && value.length > 0) {
          error =
            "Username phải có ít nhất 3 ký tự và chỉ chứa chữ, số, dấu gạch dưới";
        }
        break;
      case "email":
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!isValid && value.length > 0) {
          error = "Email không hợp lệ";
        }
        break;
      case "password":
        isValid = value.length >= 6;
        if (!isValid && value.length > 0) {
          error = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        break;
      case "confirmPassword":
        isValid = value === currentPassword && value.length > 0;
        if (!isValid && value.length > 0) {
          error = "Mật khẩu xác nhận không khớp";
        }
        break;
      case "phone":
        isValid = /^(\+84|0)[0-9]{9,10}$/.test(value);
        if (!isValid && value.length > 0) {
          error = "Số điện thoại không hợp lệ";
        }
        break;
      case "fullName":
        isValid = value.trim().length >= 2;
        if (!isValid && value.length > 0) {
          error = "Họ và tên phải có ít nhất 2 ký tự";
        }
        break;
      default:
        isValid = value.trim().length > 0;
    }

    setFieldValidation((prev) => ({
      ...prev,
      [fieldName]: { isValid, error },
    }));

    return { isValid, error };
  }, []); // Remove formData.password dependency to avoid circular deps

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Enhanced input change handler
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: value,
        };

        // Real-time validation with current password context
        const passwordForValidation =
          name === "password" ? value : prev.password;

        // Validate current field
        const validation = validateField(name, value, passwordForValidation);

        // If this is password change, also validate confirmPassword if it exists
        if (name === "password" && prev.confirmPassword) {
          validateField("confirmPassword", prev.confirmPassword, value);
        }

        return newData;
      });

      // Clear validation error for this field
      setValidationErrors((prev) => {
        if (prev[name]) {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
        return prev;
      });

      // Clear general error
      if (error) {
        setError("");
      }
    },
    [error, validateField]
  );

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const validateStep1 = useCallback(() => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Tên đăng nhập là bắt buộc";
    } else if (formData.username.length < 3) {
      errors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    if (!formData.email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "Họ và tên là bắt buộc";
    }

    if (!formData.password) {
      errors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu không khớp";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Check if step 1 is valid for real-time button state
  const isStep1Valid = useCallback(() => {
    return (
      formData.username.trim().length >= 3 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.fullName.trim().length >= 2 &&
      formData.password.length >= 6 &&
      formData.confirmPassword === formData.password &&
      formData.confirmPassword.length > 0
    );
  }, [formData]);

  // Check if step 2 is valid for real-time button state
  const isStep2Valid = useCallback(() => {
    return (
      /^(\+84|0)[0-9]{9,10}$/.test(formData.phone) &&
      formData.address.trim().length >= 5 &&
      formData.dob &&
      formData.gender
    );
  }, [formData]);

  const validateStep2 = useCallback(() => {
    const errors = {};

    if (!formData.phone.trim()) {
      errors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.dob) {
      errors.dob = "Ngày sinh là bắt buộc";
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16) {
        errors.dob = "Bạn phải ít nhất 16 tuổi để đăng ký";
      }
    }

    if (!formData.gender) {
      errors.gender = "Giới tính là bắt buộc";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const nextStep = useCallback(
    (e) => {
      e.preventDefault();
      if (validateStep1()) {
        setStep(2);
      }
    },
    [validateStep1]
  );

  const prevStep = useCallback((e) => {
    e.preventDefault();
    setStep(1);
    setError("");
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (step === 1) {
        nextStep(e);
        return;
      }

      if (!validateStep2()) {
        return;
      }

      setLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/signup",
          {
            username: formData.username.trim(),
            email: formData.email.trim().toLowerCase(),
            fullName: formData.fullName.trim(),
            password: formData.password,
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            dob: new Date(formData.dob).toISOString(),
            gender: formData.gender,
          }
        );

        if (response.status === 201) {
          setSuccessMessage("Tài khoản đã được tạo thành công!");
          setTimeout(() => {
            setStep(3);
            setTimeout(() => {
              navigate("/login");
            }, 2000);
          }, 1000);
        }
      } catch (error) {
        console.error("Error during signup:", error);
        setError(
          error.response?.data?.message ||
            "Đã xảy ra lỗi. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    },
    [step, validateStep2, formData, navigate, nextStep]
  );

  // Step 1: Account Information
  const renderStep1 = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-vintage-gold to-vintage-accent rounded-2xl mb-4 shadow-golden"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Crown className="h-8 w-8 text-vintage-dark drop-shadow-lg" />
        </motion.div>
        <h2 className="text-3xl font-bold text-vintage-dark vintage-heading mb-2">
          Tạo Tài Khoản
        </h2>
        <p className="text-vintage-neutral vintage-serif">
          Bước 1: Thông tin đăng nhập
        </p>
      </motion.div>

      {/* Enhanced Progress Indicator */}
      <motion.div variants={itemVariants} className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <motion.div
            className="flex items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <motion.div
              className="w-10 h-10 bg-vintage-accent rounded-full flex items-center justify-center font-bold shadow-lg relative"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <span
                className="text-gray-800 font-bold text-lg z-20 relative"
                style={{ fontSize: "16px", fontWeight: "700" }}
              >
                1
              </span>
            </motion.div>

            <motion.span
              className="ml-2 text-sm font-medium text-vintage-gold vintage-heading"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{
                scale: 1.05,
                color: "#d4af37",
              }}
            >
              Tài khoản
            </motion.span>
          </motion.div>

          {/* Enhanced connecting line */}
          <motion.div
            className="w-12 h-1 bg-vintage-accent/30 rounded relative overflow-hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 48, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Animated fill effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-vintage-gold to-vintage-accent rounded"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 1,
              }}
              style={{ width: "50%" }}
            />
          </motion.div>

          <motion.div
            className="flex items-center"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.8,
              type: "spring",
              stiffness: 150,
            }}
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.3 },
            }}
          >
            <motion.div
              className="w-10 h-10 bg-white border-2 border-vintage-accent/40 rounded-full flex items-center justify-center font-bold relative"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <span
                className="text-vintage-dark font-bold text-lg z-20 relative"
                style={{ fontSize: "16px", fontWeight: "700" }}
              >
                2
              </span>
            </motion.div>

            <motion.span
              className="ml-2 text-sm font-medium text-vintage-neutral vintage-heading"
              initial={{ x: -10, opacity: 0.7 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              whileHover={{
                scale: 1.05,
                color: "#8b4513",
              }}
            >
              Cá nhân
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Form Fields */}
      <VintageInput
        icon={User}
        label="Tên đăng nhập"
        name="username"
        value={formData.username}
        onChange={handleInputChange}
        onFocus={() => handleFieldFocus("username")}
        onBlur={() => handleFieldBlur("username")}
        focused={focusedField === "username"}
        touched={fieldTouched.username}
        isValid={fieldValidation.username?.isValid}
        placeholder="Nhập tên đăng nhập"
        error={fieldValidation.username?.error || validationErrors.username}
        required
        autoComplete="username"
        itemVariants={itemVariants}
      />

      <VintageInput
        icon={Mail}
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        onFocus={() => handleFieldFocus("email")}
        onBlur={() => handleFieldBlur("email")}
        focused={focusedField === "email"}
        touched={fieldTouched.email}
        isValid={fieldValidation.email?.isValid}
        placeholder="Nhập địa chỉ email"
        error={fieldValidation.email?.error || validationErrors.email}
        required
        autoComplete="email"
        itemVariants={itemVariants}
      />

      <VintageInput
        icon={User}
        label="Họ và tên"
        name="fullName"
        value={formData.fullName}
        onChange={handleInputChange}
        onFocus={() => handleFieldFocus("fullName")}
        onBlur={() => handleFieldBlur("fullName")}
        focused={focusedField === "fullName"}
        touched={fieldTouched.fullName}
        isValid={fieldValidation.fullName?.isValid}
        placeholder="Nhập họ và tên đầy đủ"
        error={fieldValidation.fullName?.error || validationErrors.fullName}
        required
        autoComplete="name"
        itemVariants={itemVariants}
      />

      <VintageInput
        icon={Lock}
        label="Mật khẩu"
        type={showPassword ? "text" : "password"}
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        onFocus={() => handleFieldFocus("password")}
        onBlur={() => handleFieldBlur("password")}
        focused={focusedField === "password"}
        touched={fieldTouched.password}
        isValid={fieldValidation.password?.isValid}
        placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
        error={fieldValidation.password?.error || validationErrors.password}
        required
        autoComplete="new-password"
        showPassword={showPassword}
        onTogglePassword={togglePassword}
        itemVariants={itemVariants}
      />

      <VintageInput
        icon={Lock}
        label="Xác nhận mật khẩu"
        type={showConfirmPassword ? "text" : "password"}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        onFocus={() => handleFieldFocus("confirmPassword")}
        onBlur={() => handleFieldBlur("confirmPassword")}
        focused={focusedField === "confirmPassword"}
        touched={fieldTouched.confirmPassword}
        isValid={fieldValidation.confirmPassword?.isValid}
        placeholder="Nhập lại mật khẩu"
        error={
          fieldValidation.confirmPassword?.error ||
          validationErrors.confirmPassword
        }
        required
        autoComplete="new-password"
        showPassword={showConfirmPassword}
        onTogglePassword={toggleConfirmPassword}
        itemVariants={itemVariants}
      />

      {/* Enhanced Continue Button */}
      <motion.div variants={itemVariants} className="mt-8">
        <motion.button
          type="button"
          onClick={nextStep}
          disabled={loading || !isStep1Valid()}
          whileHover={!loading && isStep1Valid() ? { scale: 1.02 } : {}}
          whileTap={!loading && isStep1Valid() ? { scale: 0.98 } : {}}
          className={`w-full py-4 px-6 rounded-2xl font-bold shadow-golden transition-all duration-300 flex items-center justify-center text-lg vintage-heading group relative overflow-hidden ${
            loading || !isStep1Valid()
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-gradient-to-r from-vintage-gold to-vintage-accent hover:from-vintage-accent hover:to-vintage-gold text-vintage-dark hover:shadow-xl"
          }`}
        >
          {/* Background animation */}
          {!loading && isStep1Valid() && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-vintage-accent to-vintage-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />
          )}

          <div className="relative z-10 flex items-center">
            <span>Tiếp tục</span>
            <motion.div
              animate={{ x: isStep1Valid() ? [0, 5, 0] : 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronRight
                size={24}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </motion.div>
          </div>
        </motion.button>

        {/* Step validation hint */}
        {!isStep1Valid() && Object.keys(fieldTouched).length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-vintage-neutral text-sm mt-2 text-center vintage-serif"
          >
            Vui lòng điền đầy đủ thông tin hợp lệ để tiếp tục
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );

  // Step 2: Personal Information
  const renderStep2 = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {/* Header with Back Button */}
      <motion.div variants={itemVariants} className="flex items-center mb-8">
        <button
          type="button"
          onClick={prevStep}
          className="text-vintage-neutral hover:text-vintage-gold transition-colors p-2 rounded-full hover:bg-vintage-warm mr-4"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-vintage-gold to-vintage-accent rounded-2xl mb-4 shadow-golden">
            <Users className="h-8 w-8 text-vintage-dark drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold text-vintage-dark vintage-heading mb-2">
            Thông Tin Cá Nhân
          </h2>
          <p className="text-vintage-neutral vintage-serif">
            Bước 2: Hoàn thiện hồ sơ
          </p>
        </div>
      </motion.div>

      {/* Enhanced Progress Indicator Step 2 */}
      <motion.div variants={itemVariants} className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <motion.div
            className="flex items-center"
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
            }}
          >
            <motion.div
              className="w-10 h-10 bg-white border-2 border-vintage-accent/40 rounded-full flex items-center justify-center shadow-lg relative"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <span
                className="text-vintage-dark font-bold text-lg z-20 relative"
                style={{ fontSize: "16px", fontWeight: "700" }}
              >
                1
              </span>
            </motion.div>

            <motion.span
              className="ml-2 text-sm font-medium text-vintage-accent vintage-heading"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{
                scale: 1.05,
                color: "#8b4513",
              }}
            >
              Tài khoản
            </motion.span>
          </motion.div>

          {/* Completed connecting line */}
          <motion.div
            className="w-12 h-1 bg-vintage-gold rounded relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Flowing completion effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-vintage-gold to-vintage-accent rounded"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <motion.div
            className="flex items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 200,
            }}
          >
            <motion.div
              className="w-10 h-10 bg-vintage-accent rounded-full flex items-center justify-center font-bold shadow-lg relative"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <span
                className="text-gray-800 font-bold text-lg z-20 relative"
                style={{ fontSize: "16px", fontWeight: "700" }}
              >
                2
              </span>
            </motion.div>

            <motion.span
              className="ml-2 text-sm font-medium text-vintage-gold vintage-heading"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              whileHover={{
                scale: 1.05,
                color: "#d4af37",
              }}
            >
              Cá nhân
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      {/* Form Fields */}
      <VintageInput
        icon={Phone}
        label="Số điện thoại"
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleInputChange}
        placeholder="Nhập số điện thoại"
        error={validationErrors.phone}
        required
        autoComplete="tel"
        itemVariants={itemVariants}
      />

      <VintageInput
        icon={MapPin}
        label="Địa chỉ"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        placeholder="Nhập địa chỉ (tùy chọn)"
        error={validationErrors.address}
        autoComplete="address-line1"
        itemVariants={itemVariants}
      />

      <VintageInput
        icon={Calendar}
        label="Ngày sinh"
        type="date"
        name="dob"
        value={formData.dob}
        onChange={handleInputChange}
        error={validationErrors.dob}
        required
        max={
          new Date(new Date().setFullYear(new Date().getFullYear() - 16))
            .toISOString()
            .split("T")[0]
        }
        itemVariants={itemVariants}
      />

      <VintageSelect
        icon={Users}
        label="Giới tính"
        name="gender"
        value={formData.gender}
        onChange={handleInputChange}
        error={validationErrors.gender}
        required
        options={[
          { value: "male", label: "Nam" },
          { value: "female", label: "Nữ" },
          { value: "other", label: "Khác" },
        ]}
        placeholder="Chọn giới tính"
        itemVariants={itemVariants}
      />

      {/* Enhanced Error Display */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center text-red-800 vintage-serif shadow-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            </motion.div>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence mode="wait">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center text-green-800 vintage-serif shadow-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle size={20} className="mr-3 flex-shrink-0" />
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

      {/* Enhanced Submit Button */}
      <motion.div variants={itemVariants} className="mt-8">
        <motion.button
          type="submit"
          disabled={loading || !isStep2Valid()}
          whileHover={!loading && isStep2Valid() ? { scale: 1.02 } : {}}
          whileTap={!loading && isStep2Valid() ? { scale: 0.98 } : {}}
          className={`w-full py-4 px-6 rounded-2xl font-bold shadow-golden transition-all duration-300 flex items-center justify-center text-lg vintage-heading group relative overflow-hidden ${
            loading || !isStep2Valid()
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-gradient-to-r from-vintage-gold to-vintage-accent hover:from-vintage-accent hover:to-vintage-gold text-vintage-dark hover:shadow-xl"
          }`}
        >
          {/* Background animation */}
          {!loading && isStep2Valid() && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-vintage-accent to-vintage-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />
          )}

          <div className="relative z-10 flex items-center">
            {loading ? (
              <>
                <motion.div
                  className="rounded-full h-6 w-6 border-b-2 border-vintage-dark mr-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Đang tạo tài khoản...</span>
              </>
            ) : successMessage ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="mr-3 h-6 w-6" />
                </motion.div>
                <span>Tạo tài khoản thành công!</span>
              </>
            ) : (
              <>
                <Crown className="mr-3 h-6 w-6" />
                <span>Tạo tài khoản</span>
                <motion.div
                  animate={{ x: isStep2Valid() ? [0, 5, 0] : 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Check
                    size={24}
                    className="ml-2 group-hover:scale-110 transition-transform"
                  />
                </motion.div>
              </>
            )}
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // Step 3: Success
  const renderSuccess = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center py-8"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-xl">
          <Check className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-vintage-dark vintage-heading mb-4">
          Chúc Mừng! 🎉
        </h2>
        <p className="text-xl text-vintage-neutral vintage-serif mb-6 max-w-md mx-auto leading-relaxed">
          Tài khoản của bạn đã được tạo thành công. Chào mừng bạn đến với{" "}
          <span className="text-vintage-gold font-semibold">
            Royal Fitness Club
          </span>
          !
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <div className="bg-vintage-warm/50 backdrop-blur-sm border-2 border-vintage-gold/30 rounded-2xl p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-vintage-dark vintage-heading mb-3">
            Thông tin tài khoản
          </h3>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-vintage-neutral vintage-sans">
                Tên đăng nhập:
              </span>
              <span className="font-medium text-vintage-dark">
                {formData.username}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-vintage-neutral vintage-sans">Email:</span>
              <span className="font-medium text-vintage-dark">
                {formData.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-vintage-neutral vintage-sans">Họ tên:</span>
              <span className="font-medium text-vintage-dark">
                {formData.fullName}
              </span>
            </div>
          </div>
        </div>

        <p className="text-vintage-neutral vintage-sans">
          Bạn sẽ được chuyển đến trang đăng nhập sau{" "}
          <span className="font-semibold text-vintage-gold">3 giây</span>...
        </p>

        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-vintage-gold to-vintage-accent hover:from-vintage-accent hover:to-vintage-gold text-vintage-dark rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 vintage-heading"
        >
          <span>Đăng Nhập Ngay</span>
          <ChevronRight size={20} className="ml-2" />
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-warm to-vintage-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-vintage-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-vintage-accent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-vintage-primary rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-vintage-gold to-vintage-accent rounded-3xl blur-2xl opacity-30"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-vintage-gold/30 shadow-golden">
              <Crown className="h-12 w-12 text-vintage-primary mx-auto mb-4 drop-shadow-lg" />
              <h1 className="text-4xl font-bold text-vintage-primary vintage-heading">
                Royal Fitness Club
              </h1>
              <p className="mt-3 text-vintage-neutral vintage-serif text-lg">
                Tham gia cộng đồng fitness đẳng cấp hoàng gia
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Form Container */}
        <motion.div
          className="relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-vintage-gold/20 to-vintage-accent/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border-2 border-vintage-gold/20">
            {/* Step 1 - Account Info */}
            {step === 1 && renderStep1()}

            {/* Step 2 - Personal Info */}
            {step === 2 && <form onSubmit={handleSubmit}>{renderStep2()}</form>}

            {/* Step 3 - Success */}
            {step === 3 && renderSuccess()}

            {/* Login Link */}
            {step !== 3 && (
              <div className="mt-8 text-center">
                <p className="text-vintage-neutral vintage-serif">
                  Đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    className="text-vintage-gold font-semibold hover:text-vintage-accent transition-colors vintage-heading underline decoration-vintage-gold/30 hover:decoration-vintage-accent"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Terms & Privacy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-vintage-neutral vintage-serif"
        >
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <a
            href="#"
            className="text-vintage-gold hover:text-vintage-accent transition-colors underline"
          >
            Điều khoản dịch vụ
          </a>{" "}
          và{" "}
          <a
            href="#"
            className="text-vintage-gold hover:text-vintage-accent transition-colors underline"
          >
            Chính sách bảo mật
          </a>{" "}
          của chúng tôi.
        </motion.div>
      </div>
    </div>
  );
});

SignUp.displayName = "SignUp";

export default SignUp;
