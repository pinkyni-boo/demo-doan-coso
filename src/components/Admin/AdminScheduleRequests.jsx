import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Plus,
  CalendarDays
} from 'lucide-react';

const AdminScheduleRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showMakeupScheduleModal, setShowMakeupScheduleModal] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5000/api/admin/schedule-change-requests',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setRequests(response.data.requests);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (requestId, action, adminResponse = '') => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:5000/api/admin/schedule-change-requests/${requestId}/${action}`,
        { adminResponse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert(`Đã ${action === 'approve' ? 'phê duyệt' : 'từ chối'} yêu cầu thành công!`);
        fetchRequests();
        setShowApprovalModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const handleAddMakeupSchedule = async (requestId, makeupData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:5000/api/admin/schedule-change-requests/${requestId}/makeup-schedule`,
        makeupData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert('Đã thêm lịch dạy bù thành công!');
        fetchRequests();
        setShowMakeupScheduleModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error adding makeup schedule:', error);
      
      // Hiển thị thông báo lỗi chi tiết từ server
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!';
      alert(errorMessage);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="h-4 w-4" />, text: 'Chờ xử lý' },
      approved: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" />, text: 'Đã phê duyệt' },
      rejected: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" />, text: 'Đã từ chối' }
    };
    
    const badge = badges[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      low: { color: 'bg-blue-100 text-blue-800', text: 'Thấp' },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: 'Trung bình' },
      high: { color: 'bg-red-100 text-red-800', text: 'Cao' }
    };
    
    const badge = badges[urgency];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản lý yêu cầu thay đổi lịch
        </h1>
        <p className="text-gray-600">
          Xử lý yêu cầu thay đổi lịch dạy từ huấn luyện viên
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã phê duyệt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã từ chối</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng yêu cầu</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Tất cả' },
            { value: 'pending', label: 'Chờ xử lý' },
            { value: 'approved', label: 'Đã phê duyệt' },
            { value: 'rejected', label: 'Đã từ chối' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === filter.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có yêu cầu nào
            </h3>
            <p className="text-gray-500">
              {filterStatus === 'all' 
                ? 'Chưa có yêu cầu thay đổi lịch nào từ huấn luyện viên.'
                : `Không có yêu cầu nào với trạng thái "${filterStatus}".`
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onApprove={() => {
                setSelectedRequest(request);
                setShowApprovalModal(true);
              }}
              onReject={() => {
                setSelectedRequest(request);
                setShowApprovalModal(true);
              }}
              onAddMakeup={() => {
                setSelectedRequest(request);
                setShowMakeupScheduleModal(true);
              }}
              getStatusBadge={getStatusBadge}
              getUrgencyBadge={getUrgencyBadge}
            />
          ))
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <ApprovalModal
          request={selectedRequest}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedRequest(null);
          }}
          onApprove={(response) => handleApproveReject(selectedRequest._id, 'approve', response)}
          onReject={(response) => handleApproveReject(selectedRequest._id, 'reject', response)}
        />
      )}

      {/* Makeup Schedule Modal */}
      {showMakeupScheduleModal && selectedRequest && (
        <MakeupScheduleModal
          request={selectedRequest}
          onClose={() => {
            setShowMakeupScheduleModal(false);
            setSelectedRequest(null);
          }}
          onSubmit={(makeupData) => handleAddMakeupSchedule(selectedRequest._id, makeupData)}
        />
      )}
    </div>
  );
};

// Request Card Component
const RequestCard = ({ 
  request, 
  onApprove, 
  onReject, 
  onAddMakeup, 
  getStatusBadge, 
  getUrgencyBadge 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {request.class?.className || 'Lớp học không xác định'}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{request.trainer?.fullName || 'HLV không xác định'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(request.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(request.status)}
          {getUrgencyBadge(request.urgency)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Thông tin lịch dạy</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Ngày gốc:</span>
              <span>{new Date(request.originalDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Ngày yêu cầu:</span>
              <span>{new Date(request.requestedDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Phòng:</span>
              <span>{request.class?.location || 'Chưa xác định'}</span>
            </div>
            {request.class?.startDate && request.class?.endDate && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Thời gian lớp:</span>
                <span className="text-blue-600">
                  {new Date(request.class.startDate).toLocaleDateString('vi-VN')} - {new Date(request.class.endDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Lý do thay đổi</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {request.reason}
          </p>
        </div>
      </div>

      {request.adminResponse && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Phản hồi từ Admin</h4>
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            {request.adminResponse}
          </p>
        </div>
      )}

      {request.makeupSchedule && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Lịch dạy bù</h4>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span>{new Date(request.makeupSchedule.date).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>{request.makeupSchedule.startTime} - {request.makeupSchedule.endTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span>{request.makeupSchedule.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {request.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Phê duyệt
          </button>
          <button
            onClick={onReject}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            Từ chối
          </button>
        </div>
      )}

      {request.status === 'approved' && !request.makeupSchedule && (
        <button
          onClick={onAddMakeup}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm lịch dạy bù
        </button>
      )}
    </div>
  );
};

// Approval Modal Component
const ApprovalModal = ({ request, onClose, onApprove, onReject }) => {
  const [action, setAction] = useState('approve');
  const [adminResponse, setAdminResponse] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (action === 'approve') {
      onApprove(adminResponse);
    } else {
      onReject(adminResponse);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Xử lý yêu cầu thay đổi lịch
          </h3>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Lớp:</strong> {request.class?.className}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>HLV:</strong> {request.trainer?.fullName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Lý do:</strong> {request.reason}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quyết định
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="approve"
                    checked={action === 'approve'}
                    onChange={(e) => setAction(e.target.value)}
                    className="mr-2"
                  />
                  Phê duyệt yêu cầu
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="reject"
                    checked={action === 'reject'}
                    onChange={(e) => setAction(e.target.value)}
                    className="mr-2"
                  />
                  Từ chối yêu cầu
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập ghi chú cho huấn luyện viên..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  action === 'approve'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {action === 'approve' ? 'Phê duyệt' : 'Từ chối'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Makeup Schedule Modal Component
const MakeupScheduleModal = ({ request, onClose, onSubmit }) => {
  const [makeupData, setMakeupData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    location: request.class?.location || ''
  });

  // Tính toán ràng buộc thời gian
  const classStartDate = request.class?.startDate ? new Date(request.class.startDate).toISOString().split('T')[0] : null;
  const classEndDate = request.class?.endDate ? new Date(request.class.endDate).toISOString().split('T')[0] : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation cơ bản
    if (!makeupData.date || !makeupData.startTime || !makeupData.endTime || !makeupData.location) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Validation thời gian
    if (makeupData.startTime >= makeupData.endTime) {
      alert('Giờ kết thúc phải sau giờ bắt đầu!');
      return;
    }

    // Validation ngày trong khoảng thời gian lớp học
    if (classStartDate && classEndDate) {
      if (makeupData.date < classStartDate || makeupData.date > classEndDate) {
        alert(`Ngày dạy bù phải trong khoảng thời gian lớp học (${new Date(classStartDate).toLocaleDateString('vi-VN')} - ${new Date(classEndDate).toLocaleDateString('vi-VN')})!`);
        return;
      }
    }

    onSubmit(makeupData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thêm lịch dạy bù
          </h3>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Lớp:</strong> {request.class?.className}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>HLV:</strong> {request.trainer?.fullName}
            </p>
            {classStartDate && classEndDate && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Ràng buộc thời gian:</strong>
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Lịch bù chỉ có thể tạo trong khoảng thời gian lớp học đang hoạt động:
                </p>
                <p className="text-sm font-medium text-yellow-800 mt-1">
                  📅 Từ {new Date(classStartDate).toLocaleDateString('vi-VN')} đến {new Date(classEndDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày dạy bù *
                </label>
                <input
                  type="date"
                  value={makeupData.date}
                  onChange={(e) => setMakeupData({...makeupData, date: e.target.value})}
                  min={classStartDate}
                  max={classEndDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ bắt đầu *
                  </label>
                  <input
                    type="time"
                    value={makeupData.startTime}
                    onChange={(e) => setMakeupData({...makeupData, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ kết thúc *
                  </label>
                  <input
                    type="time"
                    value={makeupData.endTime}
                    onChange={(e) => setMakeupData({...makeupData, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm *
                </label>
                <input
                  type="text"
                  value={makeupData.location}
                  onChange={(e) => setMakeupData({...makeupData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa điểm dạy bù..."
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Thêm lịch bù
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminScheduleRequests;