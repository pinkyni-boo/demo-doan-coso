import React, { useState, useEffect } from "react";
import { X, Save, BookOpen, Target, Dumbbell, FileText } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function SessionContentModal({ 
  classId, 
  sessionNumber, 
  onClose, 
  onSave,
  existingContent 
}) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    objectives: "",
    exercises: "",
    notes: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingContent) {
      setFormData({
        title: existingContent.title || "",
        content: existingContent.content || "",
        objectives: existingContent.objectives || "",
        exercises: existingContent.exercises || "",
        notes: existingContent.notes || ""
      });
    }
  }, [existingContent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung buổi học");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/session-content",
        {
          classId,
          sessionNumber,
          ...formData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Lưu nội dung buổi học thành công!");
        onSave(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error("Error saving session content:", error);
      toast.error(error.response?.data?.message || "Không thể lưu nội dung buổi học");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {existingContent ? "Sửa" : "Thêm"} Nội Dung Buổi {sessionNumber}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-5">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-red-500">*</span> Tiêu đề buổi học
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: Kỹ thuật cơ bản - Động tác Squat"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/200 ký tự
              </p>
            </div>

            {/* Nội dung chính */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-red-500">*</span> Nội dung buổi học
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Mô tả chi tiết nội dung buổi học..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-40"
                maxLength={5000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length}/5000 ký tự
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Đang lưu..." : "Lưu nội dung"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
