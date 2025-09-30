import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  FileText
} from "lucide-react";

export default function ScheduleChangeRequests() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchChangeRequests();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `http://localhost:5000/api/trainers/schedule-change-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setRequests(response.data.requests || []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching change requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "normal":
        return "bg-blue-500 text-white";
      case "low":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getUrgencyText = (urgency) => {
    switch (urgency) {
      case "urgent":
        return "Khẩn cấp";
      case "high":
        return "Cao";
      case "normal":
        return "Bình thường";
      case "low":
        return "Thấp";
      default:
        return "Không xác định";
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filterStatus === "all") return true;
    return request.status === filterStatus;
  });

  const RequestCard = ({ request }) => (
    <div className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-all ${getStatusColor(request.status)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">{request.className}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
              {getUrgencyText(request.urgency)}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{request.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{request.schedule}</span>
            </div>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
          {getStatusText(request.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-red-50 p-3 rounded-lg">
          <h4 className="font-medium text-red-900 mb-1 flex items-center">
            <XCircle className="h-4 w-4 mr-1" />
            Ngày cần thay đổi
          </h4>
          <p className="text-red-700">
            {new Date(request.originalDate).toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <h4 className="font-medium text-green-900 mb-1 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Ngày mong muốn
          </h4>
          <p className="text-green-700">
            {new Date(request.requestedDate).toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-1" />
          Lý do
        </h4>
        <p className="text-gray-700">{request.reason}</p>
      </div>

      {request.adminResponse && (
        <div className={`p-4 rounded-lg mb-4 ${
          request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <h4 className={`font-medium mb-2 flex items-center ${
            request.status === 'approved' ? 'text-green-900' : 'text-red-900'
          }`}>
            <User className="h-4 w-4 mr-1" />
            Phản hồi từ Admin
          </h4>
          <p className={request.status === 'approved' ? 'text-green-700' : 'text-red-700'}>
            {request.adminResponse}
          </p>
          {request.newScheduledDate && (
            <div className="mt-2 p-2 bg-white rounded border">
              <strong>Lịch dạy bù được sắp xếp: </strong>
              {new Date(request.newScheduledDate).toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Gửi lúc: {new Date(request.createdAt).toLocaleString('vi-VN')}</span>
        {request.updatedAt !== request.createdAt && (
          <span>Cập nhật: {new Date(request.updatedAt).toLocaleString('vi-VN')}</span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải yêu cầu thay đổi lịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/trainer/schedule')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yêu cầu thay đổi lịch</h1>
                <p className="text-gray-600">Quản lý các yêu cầu thay đổi lịch dạy của bạn</p>
              </div>
            </div>
            
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả yêu cầu</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Từ chối</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterStatus === "all" ? "Chưa có yêu cầu nào" : `Không có yêu cầu ${getStatusText(filterStatus).toLowerCase()}`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === "all" 
                ? "Bạn chưa tạo yêu cầu thay đổi lịch nào."
                : "Thử thay đổi bộ lọc để xem các yêu cầu khác."
              }
            </p>
            <button
              onClick={() => navigate('/trainer/schedule')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Về trang lịch dạy
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((request) => (
                <RequestCard key={request._id} request={request} />
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}