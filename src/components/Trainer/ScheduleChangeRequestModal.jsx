import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  Clock,
  Users,
  Send,
  MessageSquare
} from 'lucide-react';

const ScheduleChangeRequestModal = ({
  showModal,
  selectedClass,
  selectedDate,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    originalDate: '',
    requestedDate: '',
    reason: '',
    urgency: 'medium'
  });
  const hasInitialized = useRef(false);
  const modalRef = useRef(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showModal, onClose]);

  // Initialize form data only once when modal opens
  useEffect(() => {
    if (showModal && selectedDate && !hasInitialized.current) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setFormData({
        originalDate: `${year}-${month}-${day}`,
        requestedDate: '',
        reason: '',
        urgency: 'medium'
      });
      hasInitialized.current = true;
    }
    
    // Reset when modal closes
    if (!showModal) {
      hasInitialized.current = false;
      setFormData({
        originalDate: '',
        requestedDate: '',
        reason: '',
        urgency: 'medium'
      });
    }
  }, [showModal, selectedDate]);

  if (!showModal || !selectedClass) return null;

  // Date constraints
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const maxDateObj = new Date();
  maxDateObj.setFullYear(today.getFullYear() + 1);
  const maxDate = `${maxDateObj.getFullYear()}-${String(maxDateObj.getMonth() + 1).padStart(2, '0')}-${String(maxDateObj.getDate()).padStart(2, '0')}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.originalDate || !formData.requestedDate || !formData.reason.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    
    if (formData.reason.trim().length < 10) {
      alert("Lý do thay đổi phải có ít nhất 10 ký tự!");
      return;
    }
    
    if (formData.reason.trim().length > 500) {
      alert("Lý do thay đổi không được vượt quá 500 ký tự!");
      return;
    }
    
    if (formData.requestedDate < minDate) {
      alert("Không thể chọn ngày dạy bù trong quá khứ!");
      return;
    }
    
    if (formData.originalDate === formData.requestedDate) {
      alert("Ngày dạy bù phải khác với ngày cần thay đổi!");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 100000 }}>
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col"
      >
        <div className="p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Yêu cầu thay đổi lịch dạy
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              aria-label="Đóng modal"
            >
              <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Class Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{selectedClass.className}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {selectedClass.location}
              </p>
              <p className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {selectedClass.schedule}
              </p>
              <p className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {selectedClass.currentStudents || 0} học viên
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Original Date */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <label htmlFor="originalDate" className="block text-sm font-medium text-orange-800 mb-2">
                📅 Ngày cần thay đổi *
              </label>
              <input
                type="date"
                id="originalDate"
                name="originalDate"
                value={formData.originalDate}
                readOnly
                className="w-full px-3 py-2 border border-orange-300 rounded-lg bg-orange-100 text-gray-800 cursor-not-allowed"
                style={{ colorScheme: 'light', minHeight: '40px' }}
              />
              {selectedDate && (
                <p className="text-xs text-orange-600 mt-1">
                  💡 Ngày được chọn tự động: {selectedDate.toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })} - {selectedClass.schedule}
                </p>
              )}
            </div>

            {/* Requested Date */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label htmlFor="requestedDate" className="block text-sm font-medium text-blue-800 mb-2">
                🔄 Ngày mong muốn dạy bù *
              </label>
              <input
                type="date"
                id="requestedDate"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedDate: e.target.value }))}
                min={minDate}
                max={maxDate}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                required
                autoComplete="off"
                style={{ colorScheme: 'light', minHeight: '40px' }}
              />
              <p className="text-xs text-blue-600 mt-1">
                ⚠️ Chọn ngày từ hôm nay trở đi trong vòng 1 năm
              </p>
            </div>

            {/* Urgency */}
            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ khẩn cấp
              </label>
              <select
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Thấp - Có thể linh hoạt</option>
                <option value="medium">Bình thường</option>
                <option value="high">Cao - Cần xử lý sớm</option>
              </select>
            </div>

            {/* Reason */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label htmlFor="reason" className="block text-sm font-medium text-yellow-800 mb-2">
                📝 Lý do thay đổi *
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Ví dụ: Có việc đột xuất, bệnh, lịch cá nhân, họp phụ huynh..."
                rows={4}
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white resize-none"
                required
                minLength={10}
                maxLength={500}
                autoComplete="off"
              />
              <div className="flex justify-between text-xs text-yellow-600 mt-1">
                <span>⚠️ Tối thiểu 10 ký tự, tối đa 500 ký tự</span>
                <span className={formData.reason.length > 500 ? 'text-red-600 font-medium' : ''}>
                  {formData.reason.length}/500
                </span>
              </div>
            </div>

            {/* Footer hint */}
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500">
                💬 Nhấp ra ngoài hoặc phím ESC để hủy
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={formData.reason.length < 10 || formData.reason.length > 500}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-2" />
                Gửi yêu cầu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleChangeRequestModal;