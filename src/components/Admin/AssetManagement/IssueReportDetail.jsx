import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  User,
  Calendar,
  AlertTriangle,
  MapPin,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Settings,
  MessageSquare,
  FileText,
  Camera,
  Tag,
  Activity,
} from "lucide-react";

const IssueReportDetail = ({ reportId, onBack }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    if (reportId) {
      fetchReportDetail();
    }
  }, [reportId]);

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/issue-reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(response.data.data);
    } catch (error) {
      console.error("Error fetching report detail:", error);
      toast.error("Lỗi khi tải chi tiết báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/issue-reports/${reportId}/acknowledge`,
        {
          adminNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Đã xác nhận báo cáo thành công");
      setShowAcknowledgeModal(false);
      setAdminNotes("");
      fetchReportDetail();
    } catch (error) {
      toast.error("Lỗi khi xác nhận báo cáo");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/issue-reports/${reportId}/resolve`,
        {
          resolutionNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Đã giải quyết báo cáo thành công");
      setShowResolveModal(false);
      setResolutionNotes("");
      fetchReportDetail();
    } catch (error) {
      toast.error("Lỗi khi giải quyết báo cáo");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "reported":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "acknowledged":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "in_progress":
        return <Settings className="w-5 h-5 text-orange-500" />;
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      reported: "Đã báo cáo",
      acknowledged: "Đã xác nhận",
      in_progress: "Đang xử lý",
      resolved: "Đã giải quyết",
      rejected: "Từ chối",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      reported: "bg-yellow-100 text-yellow-800 border-yellow-200",
      acknowledged: "bg-blue-100 text-blue-800 border-blue-200",
      in_progress: "bg-orange-100 text-orange-800 border-orange-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getSeverityColor = (severity) => {
    const colorMap = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colorMap[severity] || "bg-gray-100 text-gray-800";
  };

  const getSeverityText = (severity) => {
    const severityMap = {
      low: "Thấp",
      medium: "Trung bình",
      high: "Cao",
      critical: "Nghiêm trọng",
    };
    return severityMap[severity] || severity;
  };

  const getIssueTypeText = (issueType) => {
    const typeMap = {
      malfunction: "Hỏng hóc",
      damage: "Hư hại",
      wear: "Mài mòn",
      safety_concern: "Vấn đề an toàn",
      needs_cleaning: "Cần vệ sinh",
      needs_repair: "Cần sửa chữa",
      not_working: "Không hoạt động",
      hygiene_issue: "Vấn đề vệ sinh",
      environmental_issue: "Vấn đề môi trường",
      other: "Khác",
    };
    return typeMap[issueType] || issueType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải chi tiết báo cáo...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Không tìm thấy báo cáo</p>
        <button
          onClick={onBack}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết báo cáo vấn đề
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {report.status === "reported" && (
            <button
              onClick={() => setShowAcknowledgeModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Xác nhận
            </button>
          )}

          {(report.status === "acknowledged" ||
            report.status === "in_progress") && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Giải quyết
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Header Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {report.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(report.createdAt).toLocaleString("vi-VN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {report.reportedBy?.fullName || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    report.status
                  )}`}
                >
                  {getStatusIcon(report.status)}
                  {getStatusText(report.status)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                    report.severity
                  )}`}
                >
                  {getSeverityText(report.severity)}
                </span>
              </div>
            </div>

            {/* Asset Info */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại báo cáo
                  </label>
                  <p className="text-gray-900 capitalize">
                    {report.reportType}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại vấn đề
                  </label>
                  <p className="text-gray-900">
                    {getIssueTypeText(report.issueType)}
                  </p>
                </div>

                {report.equipment && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thiết bị
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Wrench className="w-4 h-4" />
                      <span>
                        {report.equipment.equipmentCode} -{" "}
                        {report.equipment.equipmentName}
                      </span>
                    </div>
                  </div>
                )}

                {report.room && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phòng tập
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {report.room.roomCode} - {report.room.roomName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Mô tả chi tiết
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* Images Card */}
          {report.images && report.images.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Hình ảnh bằng chứng ({report.images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.images.map((image, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <img
                      src={image.url}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-75 transition-opacity"
                      onClick={() => window.open(image.url, "_blank")}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {image.originalName && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg truncate">
                        {image.originalName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {report.adminNotes && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Ghi chú từ Admin
              </h3>
              <p className="text-blue-800">{report.adminNotes}</p>
              {report.acknowledgedAt && (
                <p className="text-sm text-blue-600 mt-2">
                  Ghi chú vào lúc:{" "}
                  {new Date(report.acknowledgedAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          )}

          {/* Resolution Notes */}
          {report.resolutionNotes && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Kết quả giải quyết
              </h3>
              <p className="text-green-800">{report.resolutionNotes}</p>
              {report.resolvedAt && (
                <p className="text-sm text-green-600 mt-2">
                  Giải quyết vào lúc:{" "}
                  {new Date(report.resolvedAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Timeline & Info */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Tiến trình xử lý
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Báo cáo được tạo
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleString("vi-VN")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Bởi: {report.reportedBy?.fullName}
                  </p>
                </div>
              </div>

              {report.acknowledgedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Đã xác nhận
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(report.acknowledgedAt).toLocaleString("vi-VN")}
                    </p>
                    {report.acknowledgedBy && (
                      <p className="text-sm text-gray-600">
                        Bởi: {report.acknowledgedBy.fullName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {report.resolvedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Đã giải quyết
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(report.resolvedAt).toLocaleString("vi-VN")}
                    </p>
                    {report.resolvedBy && (
                      <p className="text-sm text-gray-600">
                        Bởi: {report.resolvedBy.fullName}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Thông tin bổ sung
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mức độ ưu tiên
                </label>
                <p className="text-sm text-gray-900 capitalize">
                  {report.priority}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ID Báo cáo
                </label>
                <p className="text-sm text-gray-900 font-mono">{report._id}</p>
              </div>

              {report.maintenanceSchedule && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lịch bảo trì
                  </label>
                  <p className="text-sm text-blue-600 cursor-pointer hover:underline">
                    Xem chi tiết lịch bảo trì
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledge Modal */}
      {showAcknowledgeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Xác nhận báo cáo</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú cho trainer (tùy chọn)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập ghi chú hoặc hướng dẫn cho trainer..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAcknowledge}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
              <button
                onClick={() => setShowAcknowledgeModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Giải quyết báo cáo</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kết quả giải quyết *
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Mô tả cách đã giải quyết vấn đề..."
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleResolve}
                disabled={actionLoading || !resolutionNotes.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              >
                {actionLoading ? "Đang xử lý..." : "Giải quyết"}
              </button>
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueReportDetail;
