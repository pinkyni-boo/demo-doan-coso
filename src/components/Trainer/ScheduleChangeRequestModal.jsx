import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  X,
  Send,
  MessageSquare,
  AlertTriangle
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
  const [maintenanceConflicts, setMaintenanceConflicts] = useState([]);
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize form data when modal opens
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
    
    if (!showModal) {
      hasInitialized.current = false;
      setFormData({
        originalDate: '',
        requestedDate: '',
        reason: '',
        urgency: 'medium'
      });
      setMaintenanceConflicts([]);
    }
  }, [showModal, selectedDate]);

  // Check maintenance conflicts
  const checkMaintenanceConflicts = async (date, classData) => {
    if (!date || !classData) return [];
    
    try {
      setIsCheckingMaintenance(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5000/api/maintenance/check-conflicts`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            date: date,
            roomId: classData.roomId || classData.room?._id
          }
        }
      );
      
      return response.data.conflicts || [];
    } catch (error) {
      console.error('Error checking maintenance conflicts:', error);
      return [];
    } finally {
      setIsCheckingMaintenance(false);
    }
  };

  // Check conflicts when requested date changes
  useEffect(() => {
    if (formData.requestedDate && selectedClass) {
      checkMaintenanceConflicts(formData.requestedDate, selectedClass)
        .then(conflicts => {
          setMaintenanceConflicts(conflicts);
        });
    }
  }, [formData.requestedDate, selectedClass]);

  if (!showModal || !selectedClass) return null;

  // Date constraints
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const maxDateObj = new Date();
  maxDateObj.setFullYear(today.getFullYear() + 1);
  const maxDate = `${maxDateObj.getFullYear()}-${String(maxDateObj.getMonth() + 1).padStart(2, '0')}-${String(maxDateObj.getDate()).padStart(2, '0')}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.originalDate || !formData.requestedDate || !formData.reason.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    
    if (formData.reason.trim().length < 10) {
      alert("Lý do thay đổi phải có ít nhất 10 ký tự!");
      return;
    }
    
    if (formData.requestedDate < minDate) {
      alert("Không thể chọn ngày dạy bù trong quá khứ!");
      return;
    }
    
    // Check maintenance conflicts
    if (maintenanceConflicts.length > 0) {
      const conflictDetails = maintenanceConflicts.map(m => 
        `- ${m.title} (${m.maintenanceType}): ${new Date(m.scheduledDate).toLocaleDateString('vi-VN')}`
      ).join('\n');
      
      alert(`⚠️ KHÔNG THỂ THAY ĐỔI LỊCH\n\nNgày bạn muốn dạy bù có lịch bảo trì:\n${conflictDetails}\n\nVui lòng chọn ngày khác hoặc liên hệ admin để được hỗ trợ.`);
      return;
    }
    
    if (formData.requestedDate === formData.originalDate) {
      alert("Ngày dạy bù phải khác với ngày cần thay đổi!");
      return;
    }
    
    onSubmit({
      classId: selectedClass._id,
      originalDate: formData.originalDate,
      requestedDate: formData.requestedDate,
      reason: formData.reason.trim(),
      urgency: formData.urgency
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Đề xuất thay đổi lịch dạy
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Original Date */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-orange-800 mb-2">
                📅 Ngày cần thay đổi *
              </label>
              <input
                type="date"
                value={formData.originalDate}
                readOnly
                className="w-full px-3 py-2 border border-orange-300 rounded-lg bg-orange-100 text-gray-800 cursor-not-allowed"
              />
            </div>

            {/* Requested Date */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                🔄 Ngày mong muốn dạy bù *
              </label>
              <input
                type="date"
                value={formData.requestedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedDate: e.target.value }))}
                min={minDate}
                max={maxDate}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
              
              {/* Maintenance Conflicts Warning */}
              {isCheckingMaintenance && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">🔍 Đang kiểm tra lịch bảo trì...</p>
                </div>
              )}
              
              {maintenanceConflicts.length > 0 && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">
                        ⚠️ Có lịch bảo trì trong ngày này!
                      </p>
                      <ul className="text-xs text-red-700 space-y-1">
                        {maintenanceConflicts.map((maintenance, index) => (
                          <li key={index}>
                            • {maintenance.title} ({maintenance.maintenanceType})
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        → Không thể thay đổi lịch. Vui lòng chọn ngày khác!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ khẩn cấp
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🟢 Thấp</option>
                <option value="medium">🟡 Trung bình</option>
                <option value="high">🟠 Cao</option>
                <option value="urgent">🔴 Khẩn cấp</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do thay đổi lịch *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                rows={4}
                maxLength={500}
                placeholder="Vui lòng mô tả chi tiết lý do cần thay đổi lịch dạy (tối thiểu 10 ký tự)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Tối thiểu 10 ký tự</span>
                <span>{formData.reason.length}/500</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={maintenanceConflicts.length > 0}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                  maintenanceConflicts.length > 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Send className="h-4 w-4 mr-2" />
                Gửi đề xuất
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleChangeRequestModal;