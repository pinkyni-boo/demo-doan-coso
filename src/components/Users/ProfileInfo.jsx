import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Upload, X, Edit3, Save, RotateCcw } from "lucide-react";

function ProfileInfo({
  user,
  form,
  editMode,
  setEditMode,
  handleChange,
  handleSave,
  setForm,
  setPreviewUrl,
  previewUrl,
  setAvatar,
  avatar,
  cardVariants,
}) {
  const fileInputRef = useRef(null);

  // Add debug logging to track avatar data
  useEffect(() => {
    if (user?.avatar) {
      console.log("ProfileInfo received user avatar:", user.avatar);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file.name);
      setAvatar(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl("");
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <motion.div
      key="profile-info"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white/95 backdrop-blur-sm border-2 border-vintage-accent/30 shadow-elegant rounded-3xl overflow-hidden"
    >
      {/* Header section */}
      <div className="px-8 py-6 bg-gradient-to-r from-vintage-warm to-vintage-cream border-b border-vintage-accent/30">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-vintage-dark vintage-heading">
              Thông tin cá nhân
            </h3>
            <p className="text-vintage-neutral vintage-body text-sm mt-1">
              Quản lý và cập nhật thông tin cá nhân của bạn
            </p>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-luxury text-white rounded-xl hover:shadow-golden transition-all duration-300 font-medium"
            >
              <Edit3 size={16} />
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditMode(false);
                  setForm({
                    ...user,
                    dob: user.dob ? user.dob.split("T")[0] : "",
                  });
                  setPreviewUrl("");
                  setAvatar(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-vintage-warm border-2 border-vintage-accent text-vintage-dark rounded-xl hover:bg-vintage-accent transition-all duration-300 font-medium"
              >
                <RotateCcw size={16} />
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-golden text-vintage-dark rounded-xl hover:shadow-golden transition-all duration-300 font-medium"
              >
                <Save size={16} />
                Lưu
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* Avatar upload section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-vintage-warm border-4 border-vintage-accent/30 shadow-elegant mb-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Failed to load avatar:", user.avatar.url);
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.username || "User"
                    )}&background=8b5a2b&color=fff&size=200`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-vintage-warm text-vintage-primary">
                  <User size={48} />
                </div>
              )}
            </div>

            {editMode && (
              <div className="absolute bottom-4 right-0 flex space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="bg-gradient-luxury text-white p-2 rounded-full shadow-golden hover:shadow-elegant transition-all duration-300"
                  title="Tải ảnh lên"
                >
                  <Upload size={16} />
                </button>

                {(previewUrl || user.avatar?.url) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all duration-300"
                    title="Xóa ảnh"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {editMode && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          )}

          <div className="text-center">
            <h4 className="text-lg font-semibold text-vintage-dark vintage-heading">
              {user.fullName || user.username}
            </h4>
            <p className="text-vintage-neutral vintage-body text-sm">
              {user.email}
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Full Name Field */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-vintage-dark mb-2 vintage-body">
              Họ và tên
            </label>
            {editMode ? (
              <input
                type="text"
                name="fullName"
                value={form.fullName || ""}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-vintage-accent bg-white/90 backdrop-blur-sm px-4 py-3 text-vintage-dark focus:border-vintage-gold focus:ring-4 focus:ring-vintage-gold/30 transition-all duration-300 vintage-body"
                placeholder="Nhập họ và tên của bạn"
              />
            ) : (
              <div className="p-4 bg-vintage-warm rounded-xl border border-vintage-accent/30 text-vintage-dark vintage-body">
                {user.fullName || "Chưa cập nhật"}
              </div>
            )}
          </div>

          {/* Username field */}
          <div>
            <label className="block text-sm font-semibold text-vintage-dark mb-2 vintage-body">
              Tên người dùng
            </label>
            {editMode ? (
              <input
                type="text"
                name="username"
                value={form.username || ""}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-vintage-accent bg-white/90 backdrop-blur-sm px-4 py-3 text-vintage-dark focus:border-vintage-gold focus:ring-4 focus:ring-vintage-gold/30 transition-all duration-300 vintage-body"
                placeholder="Tên người dùng"
              />
            ) : (
              <div className="p-4 bg-vintage-warm rounded-xl border border-vintage-accent/30 text-vintage-dark vintage-body">
                {user.username}
              </div>
            )}
          </div>

          {/* Email field */}
          <div>
            <label className="block text-sm font-semibold text-vintage-dark mb-2 vintage-body">
              Email
            </label>
            {editMode ? (
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-vintage-accent bg-white/90 backdrop-blur-sm px-4 py-3 text-vintage-dark focus:border-vintage-gold focus:ring-4 focus:ring-vintage-gold/30 transition-all duration-300 vintage-body"
                placeholder="Email của bạn"
              />
            ) : (
              <div className="p-4 bg-vintage-warm rounded-xl border border-vintage-accent/30 text-vintage-dark vintage-body">
                {user.email}
              </div>
            )}
          </div>

          {/* Phone number field */}
          <div>
            <label className="block text-sm font-semibold text-vintage-dark mb-2 vintage-body">
              Số điện thoại
            </label>
            {editMode ? (
              <input
                type="text"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-vintage-accent bg-white/90 backdrop-blur-sm px-4 py-3 text-vintage-dark focus:border-vintage-gold focus:ring-4 focus:ring-vintage-gold/30 transition-all duration-300 vintage-body"
                placeholder="Số điện thoại"
              />
            ) : (
              <div className="p-4 bg-vintage-warm rounded-xl border border-vintage-accent/30 text-vintage-dark vintage-body">
                {user.phone || "Chưa cập nhật"}
              </div>
            )}
          </div>

          {/* Date of birth field */}
          <div>
            <label className="block text-sm font-semibold text-vintage-dark mb-2 vintage-body">
              Ngày sinh
            </label>
            {editMode ? (
              <input
                type="date"
                name="dob"
                value={form.dob || ""}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-vintage-accent bg-white/90 backdrop-blur-sm px-4 py-3 text-vintage-dark focus:border-vintage-gold focus:ring-4 focus:ring-vintage-gold/30 transition-all duration-300 vintage-body"
              />
            ) : (
              <div className="p-4 bg-vintage-warm rounded-xl border border-vintage-accent/30 text-vintage-dark vintage-body">
                {user.dob?.split("T")[0] || "Chưa cập nhật"}
              </div>
            )}
          </div>

          {/* Gender field */}
          <div>
            <label className="block text-sm font-semibold text-vintage-dark mb-2 vintage-body">
              Giới tính
            </label>
            {editMode ? (
              <select
                name="gender"
                value={form.gender || "other"}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-vintage-accent bg-white/90 backdrop-blur-sm px-4 py-3 text-vintage-dark focus:border-vintage-gold focus:ring-4 focus:ring-vintage-gold/30 transition-all duration-300 vintage-body"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            ) : (
              <div className="p-4 bg-vintage-warm rounded-xl border border-vintage-accent/30 text-vintage-dark vintage-body">
                {user.gender === "male"
                  ? "Nam"
                  : user.gender === "female"
                  ? "Nữ"
                  : "Khác"}
              </div>
            )}
          </div>

          {/* Address Field */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-vintage-dark mb-2 vintage-body">
              Địa chỉ
            </label>
            {editMode ? (
              <input
                type="text"
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-vintage-accent bg-white/90 backdrop-blur-sm px-4 py-3 text-vintage-dark focus:border-vintage-gold focus:ring-4 focus:ring-vintage-gold/30 transition-all duration-300 vintage-body"
                placeholder="Địa chỉ của bạn"
              />
            ) : (
              <div className="p-4 bg-vintage-warm rounded-xl border border-vintage-accent/30 text-vintage-dark vintage-body">
                {user.address || "Chưa cập nhật"}
              </div>
            )}
          </div>
        </div>

        {/* Account Statistics */}
        <div className="mt-8 pt-6 border-t border-vintage-accent/30">
          <h4 className="text-lg font-semibold text-vintage-dark mb-4 vintage-heading">
            Thống kê tài khoản
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-vintage-warm to-vintage-cream rounded-xl border border-vintage-accent/30">
              <div className="text-2xl font-bold text-vintage-primary vintage-heading">
                12
              </div>
              <div className="text-sm text-vintage-neutral vintage-body">
                Lớp đã tham gia
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-vintage-warm to-vintage-cream rounded-xl border border-vintage-accent/30">
              <div className="text-2xl font-bold text-vintage-primary vintage-heading">
                3
              </div>
              <div className="text-sm text-vintage-neutral vintage-body">
                Lớp đang học
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-vintage-warm to-vintage-cream rounded-xl border border-vintage-accent/30">
              <div className="text-2xl font-bold text-vintage-primary vintage-heading">
                85%
              </div>
              <div className="text-sm text-vintage-neutral vintage-body">
                Tỷ lệ hoàn thành
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-vintage-warm to-vintage-cream rounded-xl border border-vintage-accent/30">
              <div className="text-2xl font-bold text-vintage-primary vintage-heading">
                2
              </div>
              <div className="text-sm text-vintage-neutral vintage-body">
                Tháng tham gia
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProfileInfo;
