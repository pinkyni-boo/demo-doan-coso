import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import BankPopup from "./BankPopup";
import ConfirmationModal from "./ConfirmationModal";
import { motion } from "framer-motion";
import {
  CreditCard,
  Shield,
  CheckCircle,
  X,
  Clock,
  Star,
  Gift,
  Trash2,
  Copy,
  Sparkles,
  Crown,
  Receipt,
  ArrowRight,
  Zap,
  Heart,
  Award,
} from "lucide-react";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [registeredClasses, setRegisteredClasses] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showBankPopup, setShowBankPopup] = useState(false);
  const [membershipPayment, setMembershipPayment] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState({});
  const [includeMembership, setIncludeMembership] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // Add custom styling cho navbar khi vào trang Payment
  useEffect(() => {
    document.body.classList.add("payment-page");
    return () => {
      document.body.classList.remove("payment-page");
    };
  }, []);

  // Decode token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const payload = jwtDecode(token);
      setUserId(payload.userId);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Check if we have a pending membership payment
  useEffect(() => {
    const pendingMembershipString = localStorage.getItem("pendingMembership");
    if (pendingMembershipString) {
      try {
        const pendingMembership = JSON.parse(pendingMembershipString);
        setMembershipPayment(pendingMembership);
      } catch (error) {
        console.error("Error parsing pending membership:", error);
      }
    } else {
      if (location.state?.fromMembership && location.state?.membershipId) {
        const fetchMembershipDetails = async () => {
          try {
            const token = localStorage.getItem("token");
            if (!token || !userId) return;

            const response = await fetch(
              `http://localhost:5000/api/memberships/${location.state.membershipId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const membershipData = await response.json();
              setMembershipPayment({
                id: membershipData._id,
                type: membershipData.type,
                price: membershipData.price,
                duration: membershipData.endDate
                  ? Math.round(
                      (new Date(membershipData.endDate) -
                        new Date(membershipData.startDate)) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 30,
              });
            }
          } catch (error) {
            console.error("Error fetching membership details:", error);
          }
        };

        fetchMembershipDetails();
      }
    }
  }, [location, userId]);

  // Fetch user info + unpaid class enrollments
  const fetchUnpaidRegistrations = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const [userRes, enrollmentRes] = await Promise.all([
        fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/classes/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const userInfo = await userRes.json();
      const enrollments = await enrollmentRes.json();

      if (!userRes.ok) throw new Error("User API error");
      if (!enrollmentRes.ok) throw new Error("Enrollments API error");

      setUserData({
        name: userInfo.username,
        email: userInfo.email,
        phone: userInfo.phone || "",
      });

      const unpaidEnrollments = enrollments.filter(
        (enrollment) => !enrollment.paymentStatus
      );

      setRegisteredClasses(
        unpaidEnrollments.map((enrollment) => ({
          id: enrollment._id,
          classId: enrollment.class._id,
          name: enrollment.class.className,
          price: enrollment.class.price,
          serviceName: enrollment.class.serviceName,
          instructorName: enrollment.class.instructorName,
          schedule: enrollment.class.schedule,
        }))
      );
    } catch (e) {
      console.error("Load error:", e);
      setRegisteredClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidRegistrations();
  }, [userId]);

  // Hàm xóa đăng ký lớp học
  const handleDeleteRegistration = async (enrollmentId) => {
    setDeletingClassId(enrollmentId);
    setDeleteError("");
    setShowDeleteConfirm(true);
  };

  // Add new function for actual deletion
  const confirmDeleteRegistration = async () => {
    if (!deletingClassId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setDeleteError("Bạn cần đăng nhập lại!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/payments/enrollment/${deletingClassId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Không thể xóa đăng ký");
      }

      // Success - remove from list
      setRegisteredClasses(
        registeredClasses.filter((cls) => cls.id !== deletingClassId)
      );

      const newSelectedClasses = { ...selectedClasses };
      delete newSelectedClasses[deletingClassId];
      setSelectedClasses(newSelectedClasses);

      // Đóng modal
      setShowDeleteConfirm(false);
      setDeletingClassId(null);
      setDeleteError("");

      // Thông báo thành công (có thể thêm toast)
      console.log("Đã xóa đăng ký lớp học thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa đăng ký:", error);
      setDeleteError(error.message);
    }
  };

  // Add function to close modal
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingClassId(null);
    setDeleteError("");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Initialize selected classes
  useEffect(() => {
    if (registeredClasses.length > 0) {
      const initialSelectedState = {};
      registeredClasses.forEach((cls) => {
        initialSelectedState[cls.id] = true;
      });
      setSelectedClasses(initialSelectedState);
    }
  }, [registeredClasses]);

  // Toggle class selection
  const toggleClassSelection = (classId) => {
    const newState = {
      ...selectedClasses,
      [classId]: !selectedClasses[classId],
    };
    setSelectedClasses(newState);
  };

  // Calculate total
  const calculateTotal = (selectedState) => {
    let sum = 0;
    Object.keys(selectedState).forEach((clsId) => {
      if (selectedState[clsId]) {
        const cls = registeredClasses.find((c) => c.id === clsId);
        if (cls) {
          sum += cls.price;
        }
      }
    });

    if (membershipPayment && includeMembership) {
      sum += membershipPayment.price;
    }

    return sum;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-vintage-cream via-vintage-warm to-amber-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-vintage-gold border-t-transparent rounded-full mb-4"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-vintage-dark text-lg font-medium vintage-serif"
        >
          Đang tải dữ liệu thanh toán...
        </motion.p>
      </div>
    );
  }

  const total = calculateTotal(selectedClasses);

  // Handle payment
  const handlePayment = () => {
    if (!selectedMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    if (selectedMethod === "Thẻ ngân hàng") {
      setShowBankPopup(true);
    } else {
      handleDirectPayment();
    }
  };

  // Handle direct payment
  const handleDirectPayment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập lại!");
        navigate("/login");
        return;
      }

      const selectedClassIds = registeredClasses
        .filter((cls) => selectedClasses[cls.id])
        .map((cls) => cls.id);

      if (
        selectedClassIds.length === 0 &&
        (!membershipPayment || !includeMembership)
      ) {
        alert("Vui lòng chọn ít nhất một dịch vụ để thanh toán");
        return;
      }

      const registrationIds = [...selectedClassIds];
      if (membershipPayment && includeMembership) {
        registrationIds.push(membershipPayment.id);
      }

      let paymentType = "class";
      if (
        membershipPayment &&
        includeMembership &&
        selectedClassIds.length > 0
      ) {
        paymentType = "membership_and_class";
      } else if (membershipPayment && includeMembership) {
        paymentType = membershipPayment.isUpgrade
          ? "membership_upgrade"
          : "membership";
      }

      const response = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: total,
          method: selectedMethod,
          registrationIds: registrationIds,
          status: "pending",
          paymentType: paymentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Thanh toán lỗi");
      }

      if (membershipPayment && includeMembership) {
        localStorage.removeItem("pendingMembership");
        localStorage.removeItem("pendingPayment");
      }

      setShowReceipt(true);
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      alert("Không thể thanh toán. Vui lòng thử lại sau: " + error.message);
    }
  };

  // Enhanced Payment method configurations with vintage luxury colors
  const paymentMethods = [
    {
      id: "Thẻ ngân hàng",
      name: "Chuyển khoản ngân hàng",
      icon: <CreditCard className="w-6 h-6" />,
      description: "Chuyển khoản qua ngân hàng an toàn",
      color: "from-amber-600 to-yellow-700", // Vintage gold
      recommended: true,
    },
    {
      id: "VNPay",
      name: "VNPay",
      icon: <Zap className="w-6 h-6" />,
      description: "Ví điện tử VNPay",
      color: "from-rose-600 to-pink-700", // Vintage rose
    },
    {
      id: "Momo",
      name: "Momo",
      icon: <Heart className="w-6 h-6" />,
      description: "Ví điện tử Momo",
      color: "from-emerald-600 to-teal-700", // Vintage emerald
    },
    {
      id: "ZaloPay",
      name: "ZaloPay",
      icon: <Award className="w-6 h-6" />,
      description: "Ví điện tử ZaloPay",
      color: "from-indigo-600 to-purple-700", // Vintage indigo
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 pt-20 pb-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-500/20 to-orange-500/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-amber-200/50">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-3 rounded-2xl shadow-lg">
                <Receipt className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent mb-4 vintage-heading">
              Thanh toán đơn hàng
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto vintage-serif">
              Hoàn tất thanh toán để bắt đầu hành trình fitness tuyệt vời của
              bạn
            </p>
          </div>
        </motion.div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Order Details */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-200/30 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-yellow-700 p-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-xl mr-4">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white vintage-heading">
                      Chi tiết đơn hàng
                    </h2>
                    <p className="text-amber-100 vintage-serif">
                      Xem lại thông tin trước khi thanh toán
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {registeredClasses.length === 0 && !membershipPayment ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="bg-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Gift className="h-12 w-12 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-stone-800 mb-4 vintage-heading">
                      Chưa có mục nào cần thanh toán
                    </h3>
                    <p className="text-stone-600 mb-8 vintage-serif">
                      Hãy đăng ký lớp học hoặc gói tập để bắt đầu
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/classes")}
                        className="btn-vintage-primary"
                      >
                        Khám phá lớp học
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/membership")}
                        className="btn-vintage-gold"
                      >
                        Xem gói tập
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {/* Classes Section */}
                    {registeredClasses.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="bg-amber-200 p-2 rounded-xl mr-3">
                              <Star className="h-5 w-5 text-amber-700" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-800 vintage-heading">
                              Lớp học đã đăng ký ({registeredClasses.length})
                            </h3>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const newSelectedState = {};
                              const allSelected = registeredClasses.every(
                                (cls) => selectedClasses[cls.id]
                              );
                              registeredClasses.forEach((cls) => {
                                newSelectedState[cls.id] = !allSelected;
                              });
                              setSelectedClasses(newSelectedState);
                            }}
                            className="btn-vintage-secondary btn-sm"
                          >
                            {registeredClasses.every(
                              (cls) => selectedClasses[cls.id]
                            )
                              ? "Bỏ chọn tất cả"
                              : "Chọn tất cả"}
                          </motion.button>
                        </div>

                        <div className="space-y-4">
                          {registeredClasses.map((cls) => (
                            <motion.div
                              key={cls.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                selectedClasses[cls.id]
                                  ? "border-amber-300 bg-amber-50"
                                  : "border-stone-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-grow">
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      id={`class-${cls.id}`}
                                      checked={selectedClasses[cls.id] || false}
                                      onChange={() =>
                                        toggleClassSelection(cls.id)
                                      }
                                      className="w-5 h-5 text-amber-600 border-2 border-stone-300 rounded focus:ring-amber-500 focus:ring-2"
                                    />
                                    {selectedClasses[cls.id] && (
                                      <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-amber-600" />
                                    )}
                                  </div>
                                  <div className="flex-grow">
                                    <label
                                      htmlFor={`class-${cls.id}`}
                                      className="font-bold text-lg text-stone-800 cursor-pointer block vintage-heading"
                                    >
                                      {cls.name}
                                    </label>
                                    <p className="text-stone-600 mt-1 vintage-serif">
                                      <span className="font-medium">
                                        {cls.serviceName}
                                      </span>
                                      {cls.instructorName && (
                                        <> • HLV: {cls.instructorName}</>
                                      )}
                                    </p>
                                    <p className="text-sm text-stone-500 mt-1">
                                      Mã: {cls.id.slice(-8).toUpperCase()}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-amber-600">
                                      {cls.price.toLocaleString()}đ
                                    </p>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleDeleteRegistration(cls.id)
                                    }
                                    className="bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-600 p-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Membership Section */}
                    {membershipPayment && (
                      <div>
                        <div className="flex items-center mb-6">
                          <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-2 rounded-xl mr-3">
                            <Crown className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-stone-800 vintage-heading">
                            Gói thành viên Premium
                          </h3>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <input
                                type="checkbox"
                                id="membership-checkbox"
                                checked={includeMembership}
                                onChange={() =>
                                  setIncludeMembership(!includeMembership)
                                }
                                className="w-5 h-5 text-amber-600 border-2 border-stone-300 rounded focus:ring-amber-500 focus:ring-2"
                              />
                              <div>
                                <label
                                  htmlFor="membership-checkbox"
                                  className="font-bold text-xl text-stone-800 cursor-pointer block vintage-heading"
                                >
                                  {membershipPayment.name ||
                                    `Gói ${membershipPayment.type}`}
                                </label>
                                <p className="text-amber-700 mt-1 vintage-serif">
                                  Thời hạn:{" "}
                                  {membershipPayment.duration === 30
                                    ? "1 tháng"
                                    : membershipPayment.duration === 90
                                    ? "3 tháng"
                                    : membershipPayment.duration === 180
                                    ? "6 tháng"
                                    : membershipPayment.duration === 365
                                    ? "12 tháng"
                                    : `${membershipPayment.duration} ngày`}
                                </p>
                                <p className="text-sm text-amber-600 mt-1">
                                  Mã:{" "}
                                  {membershipPayment.id
                                    .substring(membershipPayment.id.length - 8)
                                    .toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-amber-600">
                                {new Intl.NumberFormat("vi-VN").format(
                                  membershipPayment.price
                                )}
                                đ
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Total Section */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-lg">
                          <span className="text-stone-600 vintage-serif">
                            Tạm tính
                          </span>
                          <span className="font-semibold text-stone-800">
                            {total.toLocaleString()}đ
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                          <span className="text-stone-600 vintage-serif">
                            Phí dịch vụ
                          </span>
                          <span className="font-semibold text-emerald-600">
                            Miễn phí
                          </span>
                        </div>
                        <div className="border-t border-amber-300 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-stone-800 vintage-heading">
                              Tổng thanh toán
                            </span>
                            <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                              {total.toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div variants={itemVariants} className="xl:col-span-1 m-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-200/30 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-yellow-700 to-amber-700 p-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-xl mr-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white vintage-heading">
                      Phương thức thanh toán
                    </h2>
                    <p className="text-amber-100 text-sm vintage-serif">
                      Chọn cách thanh toán phù hợp
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 ">
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <motion.label
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative block cursor-pointer transition-all duration-200 ${
                        selectedMethod === method.id
                          ? "ring-2 ring-amber-400 shadow-lg"
                          : "hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                          selectedMethod === method.id
                            ? "border-amber-300 bg-amber-50"
                            : "border-stone-200 bg-white hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={() => setSelectedMethod(method.id)}
                            className="w-5 h-5 text-amber-600 border-2 border-stone-300 focus:ring-amber-500"
                          />
                          <div
                            className={`p-2 rounded-xl bg-gradient-to-r ${method.color}`}
                          >
                            <div className="text-white">{method.icon}</div>
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center">
                              <span className="font-semibold text-stone-800 vintage-heading">
                                {method.name}
                              </span>
                              {method.recommended && (
                                <span className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                  Khuyến nghị
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-stone-600 mt-1 vintage-serif">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.label>
                  ))}
                </div>

                {/* Payment Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  disabled={
                    (registeredClasses.length === 0 && !membershipPayment) ||
                    !selectedMethod ||
                    total === 0
                  }
                  className={`w-full mt-6 py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 ${
                    (registeredClasses.length === 0 && !membershipPayment) ||
                    !selectedMethod ||
                    total === 0
                      ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                      : "btn-vintage-gold hover:shadow-golden"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>
                      Thanh toán {total > 0 ? `${total.toLocaleString()}đ` : ""}
                    </span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </motion.button>

                {/* Security Info */}
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-stone-600">
                    <Shield className="h-4 w-4" />
                    <span className="vintage-serif">
                      Thanh toán được bảo mật bởi SSL 256-bit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Bank Payment Popup */}
        {showBankPopup && (
          <BankPopup
            show={showBankPopup}
            onClose={(success) => {
              setShowBankPopup(false);
              if (success) {
                setShowReceipt(true);
              }
            }}
            amount={total}
            userData={userData}
            registeredClasses={registeredClasses}
            selectedClasses={selectedClasses}
            membershipPayment={membershipPayment}
            includeMembership={includeMembership}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={closeDeleteConfirm}
          onConfirm={
            deleteError ? closeDeleteConfirm : confirmDeleteRegistration
          }
          title={deleteError ? "Lỗi xóa đăng ký" : "Xác nhận xóa đăng ký"}
          message={
            deleteError
              ? deleteError
              : "Bạn có chắc chắn muốn xóa đăng ký lớp học này? Hành động này không thể hoàn tác."
          }
          confirmText={deleteError ? "Đóng" : "Xóa đăng ký"}
          cancelText="Hủy"
          isError={!!deleteError}
        />
      </div>
    </motion.div>
  );
}
