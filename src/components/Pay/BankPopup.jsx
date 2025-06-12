import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Copy, CreditCard, ArrowRight, X } from "lucide-react";

export default function BankPopup({
  show,
  onClose,
  amount,
  userData,
  registeredClasses,
  selectedClasses,
  membershipPayment,
  includeMembership,
}) {
  const [step, setStep] = useState(1); // 1: Thông tin chuyển khoản, 2: Xác nhận thanh toán
  const [processing, setProcessing] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  if (!show) return null;

  const bankInfo = {
    bankName: "VCB",
    accountNumber: "06368888880636888888",
    accountName: "PHAM NGOC MAN MAN",
    content: `GYM-${userData.phone || "PAYMENT"}`,
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    // Có thể thêm toast notification ở đây
  };

  const handleConfirmPayment = async () => {
    try {
      setProcessing(true);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Cần đăng nhập lại!");
        setProcessing(false);
        return;
      }

      const selectedClassIds = registeredClasses
        .filter((cls) => selectedClasses[cls.id])
        .map((cls) => cls.id);

      const registrationIds = [...selectedClassIds];
      if (membershipPayment && includeMembership) {
        registrationIds.push(membershipPayment.id);
      }

      const response = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          method: "Thẻ ngân hàng",
          registrationIds,
          status: "pending",
          paymentType:
            registrationIds.length > 1 && membershipPayment
              ? "membership_and_class"
              : membershipPayment
              ? "membership"
              : "class",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment creation failed");
      }

      if (membershipPayment && includeMembership) {
        localStorage.removeItem("pendingMembership");
        localStorage.removeItem("pendingPayment");
      }

      setPaymentConfirmed(true);
      setProcessing(false);

      // Tự động đóng sau 2 giây và chuyển đến trang thành công
      setTimeout(() => {
        onClose(true);
      }, 2000);
    } catch (error) {
      console.error("Bank payment error:", error);
      setProcessing(false);
      alert("Lỗi xử lý thanh toán: " + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-xl mr-3">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white vintage-heading">
                  {step === 1
                    ? "Thông tin chuyển khoản"
                    : paymentConfirmed
                    ? "Hoàn tất thanh toán"
                    : "Xác nhận thanh toán"}
                </h3>
                <p className="text-amber-100 text-sm vintage-serif">
                  {step === 1
                    ? "Vui lòng chuyển khoản theo thông tin bên dưới"
                    : paymentConfirmed
                    ? "Đã gửi yêu cầu thanh toán thành công"
                    : "Xác nhận bạn đã hoàn tất chuyển khoản"}
                </p>
              </div>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              disabled={processing}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content với scroll */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {step === 1 && !paymentConfirmed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Thông tin ngân hàng */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-amber-700">
                      Ngân hàng
                    </p>
                  </div>
                  <p className="font-bold text-lg text-stone-800">
                    {bankInfo.bankName}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-amber-700">
                      Số tài khoản
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(bankInfo.accountNumber, "Số tài khoản")
                      }
                      className="bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded-lg transition-colors group"
                      title="Sao chép số tài khoản"
                    >
                      <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <p className="font-bold text-lg text-stone-800 font-mono">
                    {bankInfo.accountNumber}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-amber-700">
                      Chủ tài khoản
                    </p>
                  </div>
                  <p className="font-bold text-lg text-stone-800">
                    {bankInfo.accountName}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-300">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-amber-700">
                      Số tiền cần chuyển
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(amount.toString(), "Số tiền")
                      }
                      className="bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded-lg transition-colors group"
                      title="Sao chép số tiền"
                    >
                      <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <p className="font-bold text-2xl text-amber-700">
                    {amount.toLocaleString()}đ
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-amber-700">
                      Nội dung chuyển khoản
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(bankInfo.content, "Nội dung")
                      }
                      className="bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded-lg transition-colors group"
                      title="Sao chép nội dung"
                    >
                      <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <p className="font-bold text-lg text-stone-800 font-mono">
                    {bankInfo.content}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white border-2 border-amber-200 rounded-xl p-4 text-center">
                <p className="text-sm text-amber-700 mb-3 font-medium">
                  Quét mã QR để chuyển khoản nhanh
                </p>
                <div className="flex justify-center">
                  <img
                    src={`https://img.vietqr.io/image/${bankInfo.bankName}-${bankInfo.accountNumber}-compact2.png?amount=${amount}&addInfo=${bankInfo.content}`}
                    alt="QR Code thanh toán"
                    className="h-48 w-48 object-contain border border-amber-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Lưu ý */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  📌 Lưu ý quan trọng:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Vui lòng chuyển khoản đúng số tiền và nội dung</li>
                  <li>
                    • Sau khi chuyển khoản, nhấn "Đã chuyển khoản" để xác nhận
                  </li>
                  <li>
                    • Admin sẽ xác minh và kích hoạt dịch vụ trong vòng 5-10
                    phút
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {step === 2 && !paymentConfirmed && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center py-8"
            >
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-4 vintage-heading">
                Xác nhận thanh toán
              </h3>
              <p className="text-stone-600 mb-6 vintage-serif">
                Vui lòng xác nhận rằng bạn đã hoàn tất việc chuyển khoản <br />
                <span className="font-bold text-amber-600">
                  {amount.toLocaleString()}đ
                </span>
                <br />
                theo thông tin đã cung cấp
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
                <h4 className="font-semibold text-amber-800 mb-2">
                  Thông tin đã chuyển khoản:
                </h4>
                <div className="space-y-1 text-sm text-amber-700">
                  <p>
                    • Ngân hàng:{" "}
                    <span className="font-semibold">{bankInfo.bankName}</span>
                  </p>
                  <p>
                    • Số tài khoản:{" "}
                    <span className="font-mono font-semibold">
                      {bankInfo.accountNumber}
                    </span>
                  </p>
                  <p>
                    • Số tiền:{" "}
                    <span className="font-semibold">
                      {amount.toLocaleString()}đ
                    </span>
                  </p>
                  <p>
                    • Nội dung:{" "}
                    <span className="font-mono font-semibold">
                      {bankInfo.content}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {paymentConfirmed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800 mb-4 vintage-heading">
                Đã gửi yêu cầu thanh toán!
              </h3>
              <p className="text-stone-600 vintage-serif">
                Cảm ơn bạn đã thanh toán. <br />
                Admin sẽ xác minh và kích hoạt dịch vụ sớm nhất.
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 bg-amber-50 border-t border-amber-200 flex-shrink-0">
          {step === 1 && !paymentConfirmed && (
            <div className="flex flex-col space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-yellow-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <span>Đã chuyển khoản</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </motion.button>

              <button
                onClick={() => onClose(false)}
                className="w-full py-3 px-6 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-medium transition-colors"
              >
                Quay lại
              </button>
            </div>
          )}

          {step === 2 && !paymentConfirmed && (
            <div className="flex flex-col space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmPayment}
                disabled={processing}
                className={`w-full py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center ${
                  processing
                    ? "bg-stone-400 text-stone-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-600 text-white hover:shadow-xl"
                }`}
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Xác nhận thanh toán</span>
                  </>
                )}
              </motion.button>

              <button
                onClick={() => setStep(1)}
                disabled={processing}
                className={`w-full py-3 px-6 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-medium transition-colors ${
                  processing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Quay lại thông tin chuyển khoản
              </button>
            </div>
          )}

          {paymentConfirmed && (
            <div className="text-center">
              <p className="text-sm text-stone-500 vintage-serif">
                Tự động đóng sau 2 giây...
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d97706 #f3f4f6;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d97706;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b45309;
        }
      `}</style>
    </motion.div>
  );
}
