import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminServiceManager() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh sách dịch vụ từ DB
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/services");
      setServices(res.data);
    } catch (err) {
      console.error("Lỗi khi tải dịch vụ:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/services/${editId}`,
          formData
        );
        showNotification("Cập nhật dịch vụ thành công!");
      } else {
        await axios.post("http://localhost:5000/api/services", formData);
        showNotification("Thêm dịch vụ mới thành công!");
      }
      setFormData({ name: "", image: "", description: "" });
      setIsEditing(false);
      setEditId(null);
      fetchServices();
    } catch (err) {
      console.error("Lỗi khi thêm/cập nhật dịch vụ:", err);
      showNotification("Đã xảy ra lỗi, vui lòng thử lại!", "error");
    }
  };

  const handleEdit = (service) => {
    setFormData(service);
    setIsEditing(true);
    setEditId(service._id);

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc muốn xóa dịch vụ này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${id}`);
        fetchServices();
        showNotification("Xóa dịch vụ thành công!");
      } catch (err) {
        console.error("Lỗi khi xóa dịch vụ:", err);
        showNotification("Không thể xóa dịch vụ, vui lòng thử lại!", "error");
      }
    }
  };

  // Function to show notification
  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out z-50 ${
      type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Quản lý dịch vụ
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Thêm, chỉnh sửa và quản lý các dịch vụ của phòng gym
          </p>
        </div>

        {/* Form Thêm/Sửa */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-10">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            {isEditing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
          </h2>
          <form onSubmit={handleAddOrUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên dịch vụ
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập tên dịch vụ"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL hình ảnh
                </label>
                <input
                  type="text"
                  name="image"
                  placeholder="Nhập đường dẫn hình ảnh"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả dịch vụ
              </label>
              <textarea
                name="description"
                placeholder="Nhập mô tả chi tiết về dịch vụ"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                {isEditing ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditId(null);
                    setFormData({ name: "", image: "", description: "" });
                  }}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Danh sách dịch vụ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {service.name}
                </h3>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {service.description}
                </p>
                <div className="flex justify-between pt-4 mt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="text-red-600 hover:text-red-800 transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="mt-4 text-xl font-medium text-gray-500">
              Chưa có dịch vụ nào được thêm vào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
