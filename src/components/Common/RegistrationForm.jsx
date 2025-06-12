import React, { useState } from "react";
import { motion } from "framer-motion";

/**
 * Form đăng ký chung có thể tái sử dụng cho nhiều mục đích (dịch vụ, câu lạc bộ, tư vấn)
 * @param {Array} services - Danh sách dịch vụ (nếu có)
 * @param {Array} clubs - Danh sách câu lạc bộ (nếu có)
 * @param {String} selectedService - Dịch vụ được chọn trước (nếu có)
 * @param {String} selectedClub - Câu lạc bộ được chọn trước (nếu có)
 * @param {String} formType - Loại form ('service', 'club', 'consultation')
 */
const RegistrationForm = ({
  services = [],
  clubs = [],
  selectedService = "",
  selectedClub = "",
  formType = "consultation",
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceName: selectedService,
    clubName: selectedClub,
    startDate: "",
    notes: "",
  });

  const [formStatus, setFormStatus] = useState(null); // success, error, submitting

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("submitting");

    try {
      // Endpoint tương ứng với loại form
      let endpoint = "consultation";
      if (formType === "service") endpoint = "service-registration";
      if (formType === "club") endpoint = "club-registration";

      // Giả lập gửi form - thay thế bằng API thật
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Gọi API thực tế (đã comment lại)
      /*
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Có lỗi xảy ra khi gửi form');
      }
      
      await response.json();
      */

      console.log("Form submitted:", formData);

      // Hiển thị thành công
      setFormStatus("success");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        serviceName: "",
        clubName: "",
        startDate: "",
        notes: "",
      });

      // Reset status sau 3 giây
      setTimeout(() => setFormStatus(null), 3000);
    } catch (error) {
      console.error("Lỗi khi gửi form:", error);
      setFormStatus("error");
      setTimeout(() => setFormStatus(null), 3000);
    }
  };

  // Labels và Placeholders tùy thuộc vào loại form
  const getFormTitle = () => {
    if (formType === "service") return "Đăng Ký Dịch Vụ";
    if (formType === "club") return "Đăng Ký Câu Lạc Bộ";
    return "Đăng Ký Tư Vấn";
  };

  const getServiceFieldLabel = () => {
    if (formType === "service") return "Chọn Dịch Vụ";
    if (formType === "club") return "Chọn Câu Lạc Bộ";
    return "Dịch Vụ Quan Tâm";
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
        <h3 className="text-2xl font-bold">{getFormTitle()}</h3>
        <p className="text-white/80 mt-1">
          Điền thông tin để nhận tư vấn và ưu đãi đặc biệt
        </p>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và Tên
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="0912345678"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getServiceFieldLabel()}
              </label>
              {formType === "service" && services.length > 0 ? (
                <select
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {services.map((service, index) => (
                    <option key={index} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              ) : formType === "club" && clubs.length > 0 ? (
                <select
                  name="clubName"
                  value={formData.clubName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">-- Chọn câu lạc bộ --</option>
                  {clubs.map((club, index) => (
                    <option key={index} value={club.name}>
                      {club.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="serviceName"
                  placeholder="Nhập dịch vụ bạn quan tâm"
                  value={formData.serviceName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú thêm
            </label>
            <textarea
              name="notes"
              placeholder="Vui lòng cho chúng tôi biết nếu bạn có yêu cầu đặc biệt..."
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={formStatus === "submitting"}
            className={`w-full py-4 rounded-lg text-white font-semibold text-lg transition duration-300 ${
              formStatus === "submitting"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            }`}
          >
            {formStatus === "submitting" ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang gửi...
              </span>
            ) : (
              "Đăng Ký Ngay"
            )}
          </button>

          {formStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong thời
                    gian sớm nhất.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {formStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Có lỗi xảy ra! Vui lòng thử lại sau.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </form>

        <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              ></path>
            </svg>
            Bảo mật thông tin
          </span>
          <span>•</span>
          <span className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
            </svg>
            Hỗ trợ 24/7
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
