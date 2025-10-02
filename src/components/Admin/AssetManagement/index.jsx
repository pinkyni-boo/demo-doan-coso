import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Wrench,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Settings,
  Eye,
  Cog,
  Trash2,
  Edit3,
} from "lucide-react";
import IssueReportDetail from "./IssueReportDetail";
import EditMaintenanceModal from "./EditMaintenanceModal";

const AdminAssetManagement = () => {
  const [issueReports, setIssueReports] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [stats, setStats] = useState({});

  // Edit maintenance states
  const [showEditMaintenanceModal, setShowEditMaintenanceModal] =
    useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  const [maintenanceForm, setMaintenanceForm] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    estimatedDuration: 2,
    maintenanceType: "repair",
    priority: "medium",
    estimatedCost: 0,
    technician: {
      name: "",
      phone: "",
      email: "",
      company: "",
    },
  });

  useEffect(() => {
    fetchIssueReports();
    fetchMaintenanceSchedules();
  }, []);

  const fetchIssueReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/issue-reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssueReports(response.data.data.reports);
      setStats(response.data.data.stats);
    } catch (error) {
      console.error("Error fetching issue reports:", error);
    }
  };

  const fetchMaintenanceSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/maintenance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaintenanceSchedules(response.data.data.schedules);
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error);
    }
  };

  const handleDelete = async (reportId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa báo cáo này không?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/issue-reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Đã xóa báo cáo thành công");
      fetchIssueReports();
    } catch (error) {
      toast.error("Lỗi khi xóa báo cáo");
    }
  };

  const handleAcknowledge = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/issue-reports/${reportId}/acknowledge`,
        {
          adminNotes: "Đã xác nhận báo cáo và sẽ xử lý sớm",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Đã xác nhận báo cáo");
      fetchIssueReports();
    } catch (error) {
      toast.error("Lỗi khi xác nhận báo cáo");
    }
  };

  const handleCreateMaintenance = async (reportId) => {
    setSelectedReport(reportId);
    // Pre-fill form with report data
    const report = issueReports.find((r) => r._id === reportId);
    if (report) {
      setMaintenanceForm({
        title: `Bảo trì: ${report.title}`,
        description: report.description,
        scheduledDate: "",
        estimatedDuration: 2, // Default value
        maintenanceType:
          report.issueType === "malfunction" ? "repair" : "routine",
        priority: report.severity || "medium",
        estimatedCost: 0, // Default value
        technician: {
          name: "",
          phone: "",
          email: "",
          company: "",
        },
      });
    }
    setShowMaintenanceModal(true);
  };

  const handleCloseMaintenanceModal = () => {
    setShowMaintenanceModal(false);
    setSelectedReport(null);
    // Reset form
    setMaintenanceForm({
      title: "",
      description: "",
      scheduledDate: "",
      estimatedDuration: 2,
      maintenanceType: "repair",
      priority: "medium",
      estimatedCost: 0,
      technician: {
        name: "",
        phone: "",
        email: "",
        company: "",
      },
    });
  };

  const handleSubmitMaintenance = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Validate and sanitize form data
      const sanitizedForm = {
        ...maintenanceForm,
        estimatedDuration:
          maintenanceForm.estimatedDuration &&
          !isNaN(Number(maintenanceForm.estimatedDuration))
            ? Number(maintenanceForm.estimatedDuration)
            : 2,
        estimatedCost:
          maintenanceForm.estimatedCost &&
          !isNaN(Number(maintenanceForm.estimatedCost))
            ? Number(maintenanceForm.estimatedCost)
            : 0,
      };

      console.log("Sending maintenance form:", sanitizedForm);

      await axios.post(
        `/api/issue-reports/${selectedReport}/create-maintenance`,
        sanitizedForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Đã tạo lịch bảo trì thành công");
      handleCloseMaintenanceModal();
      fetchIssueReports();
      fetchMaintenanceSchedules();
    } catch (error) {
      console.error("Error creating maintenance:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo lịch bảo trì");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (reportId) => {
    setSelectedReportId(reportId);
    setShowReportDetail(true);
  };

  const handleBackFromDetail = () => {
    setShowReportDetail(false);
    setSelectedReportId(null);
    // Refresh data when coming back
    fetchIssueReports();
  };

  const handleResolve = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/issue-reports/${reportId}/resolve`,
        {
          resolutionNotes: "Đã xử lý xong vấn đề",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Đã đánh dấu báo cáo là đã giải quyết");
      fetchIssueReports();
    } catch (error) {
      toast.error("Lỗi khi giải quyết báo cáo");
    }
  };

  const updateMaintenanceStatus = async (maintenanceId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/maintenance/${maintenanceId}/status`,
        {
          status,
          completedAt: status === "completed" ? new Date() : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Đã cập nhật trạng thái thành ${status}`);
      fetchMaintenanceSchedules();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  // Handle edit maintenance
  const handleEditMaintenance = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowEditMaintenanceModal(true);
  };

  const handleUpdateMaintenance = async (maintenanceId, updateData) => {
    try {
      const token = localStorage.getItem("token");

      console.log("Updating maintenance:", maintenanceId, updateData);

      const response = await axios.put(
        `/api/maintenance/${maintenanceId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Đã cập nhật lịch bảo trì thành công");
        setShowEditMaintenanceModal(false);
        setSelectedMaintenance(null);
        fetchMaintenanceSchedules();
      }
    } catch (error) {
      console.error("Error updating maintenance:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật lịch bảo trì"
      );
      throw error; // Re-throw để modal có thể handle
    }
  };

  const handleCloseEditMaintenanceModal = () => {
    setShowEditMaintenanceModal(false);
    setSelectedMaintenance(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "reported":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "acknowledged":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "in_progress":
        return <Wrench className="w-4 h-4 text-orange-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      reported: "Đã báo cáo",
      acknowledged: "Đã xác nhận",
      in_progress: "Đang xử lý",
      resolved: "Đã giải quyết",
      scheduled: "Đã lên lịch",
      completed: "Đã hoàn thành",
    };
    return statusMap[status] || status;
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Conditional Rendering */}
      {showReportDetail ? (
        <IssueReportDetail
          reportId={selectedReportId}
          onBack={handleBackFromDetail}
        />
      ) : (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý tài sản & bảo trì
            </h1>
            <p className="text-gray-600">
              Xử lý báo cáo từ trainer và quản lý lịch bảo trì
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Báo cáo chờ xử lý
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.pendingReports || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Báo cáo nghiêm trọng
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.criticalReports || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Đã giải quyết
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.resolvedReports || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng báo cáo
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalReports || 0}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("reports")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "reports"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Báo cáo vấn đề
                </button>
                <button
                  onClick={() => setActiveTab("maintenance")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "maintenance"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Lịch bảo trì
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "reports" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">
                    Báo cáo vấn đề từ trainer
                  </h2>

                  {issueReports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Chưa có báo cáo nào</p>
                    </div>
                  ) : (
                    issueReports.map((report) => (
                      <div
                        key={report._id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {report.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                Trainer: {report.reportedBy?.fullName}
                              </span>
                              {report.equipment && (
                                <span className="flex items-center gap-1">
                                  <Cog className="w-4 h-4" />
                                  {report.equipment.equipmentCode} -{" "}
                                  {report.equipment.equipmentName}
                                </span>
                              )}
                              {report.room && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {report.room.roomCode} -{" "}
                                  {report.room.roomName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                                report.severity
                              )}`}
                            >
                              {report.severity}
                            </span>
                            <div className="flex items-center gap-1 text-sm">
                              {getStatusIcon(report.status)}
                              {getStatusText(report.status)}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3">
                          {report.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Báo cáo lúc:{" "}
                            {new Date(report.createdAt).toLocaleString("vi-VN")}
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(report._id)}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Chi tiết
                            </button>

                            <button
                              onClick={() => handleDelete(report._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </button>

                            {(report.status === "acknowledged" ||
                              report.status === "reported") && (
                              <button
                                onClick={() =>
                                  handleCreateMaintenance(report._id)
                                }
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                              >
                                <Cog className="w-4 h-4" />
                                Tạo lịch bảo trì
                              </button>
                            )}

                            {report.status !== "resolved" && (
                              <button
                                onClick={() => handleResolve(report._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Đã giải quyết
                              </button>
                            )}
                          </div>
                        </div>

                        {report.adminNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Ghi chú admin:</strong>{" "}
                              {report.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "maintenance" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Lịch bảo trì</h2>

                  {maintenanceSchedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Chưa có lịch bảo trì nào</p>
                    </div>
                  ) : (
                    maintenanceSchedules.map((schedule) => (
                      <div
                        key={schedule._id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {schedule.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(
                                  schedule.scheduledDate
                                ).toLocaleString("vi-VN")}
                              </span>
                              <span>
                                Thời lượng: {schedule.estimatedDuration}h
                              </span>
                              {schedule.equipment && (
                                <span>{schedule.equipment.equipmentCode}</span>
                              )}
                              {schedule.room && (
                                <span>{schedule.room.roomCode}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                                schedule.priority
                              )}`}
                            >
                              {schedule.priority}
                            </span>
                            <div className="flex items-center gap-1 text-sm">
                              {getStatusIcon(schedule.status)}
                              {getStatusText(schedule.status)}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3">
                          {schedule.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            <p>
                              Chi phí dự kiến:{" "}
                              {schedule.estimatedCost?.toLocaleString("vi-VN")}đ
                            </p>
                            {schedule.assignedTo?.technician?.name && (
                              <p>
                                Kỹ thuật viên:{" "}
                                {schedule.assignedTo.technician.name}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {/* Edit button - only for scheduled and in_progress */}
                            {(schedule.status === "scheduled" ||
                              schedule.status === "in_progress") && (
                              <button
                                onClick={() => handleEditMaintenance(schedule)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                title="Chỉnh sửa lịch bảo trì"
                              >
                                <Edit3 className="h-3 w-3" />
                                Sửa
                              </button>
                            )}

                            {schedule.status === "scheduled" && (
                              <button
                                onClick={() =>
                                  updateMaintenanceStatus(
                                    schedule._id,
                                    "in_progress"
                                  )
                                }
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Bắt đầu
                              </button>
                            )}

                            {schedule.status === "in_progress" && (
                              <button
                                onClick={() =>
                                  updateMaintenanceStatus(
                                    schedule._id,
                                    "completed"
                                  )
                                }
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Hoàn thành
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Modal */}
          {showMaintenanceModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-50">
                <h2 className="text-xl font-semibold mb-4">Tạo lịch bảo trì</h2>

                <form onSubmit={handleSubmitMaintenance} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề
                    </label>
                    <input
                      type="text"
                      value={maintenanceForm.title}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          title: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={maintenanceForm.description}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày thực hiện
                    </label>
                    <input
                      type="datetime-local"
                      value={maintenanceForm.scheduledDate}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          scheduledDate: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời lượng dự kiến (giờ)
                    </label>
                    <input
                      type="number"
                      value={maintenanceForm.estimatedDuration || ""}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          estimatedDuration: e.target.value
                            ? parseInt(e.target.value)
                            : "",
                        })
                      }
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chi phí dự kiến (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={maintenanceForm.estimatedCost || ""}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          estimatedCost: e.target.value
                            ? parseInt(e.target.value)
                            : "",
                        })
                      }
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên kỹ thuật viên
                    </label>
                    <input
                      type="text"
                      value={maintenanceForm.technician.name}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          technician: {
                            ...maintenanceForm.technician,
                            name: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại kỹ thuật viên
                    </label>
                    <input
                      type="tel"
                      value={maintenanceForm.technician.phone}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          technician: {
                            ...maintenanceForm.technician,
                            phone: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition-colors"
                    >
                      {loading ? "Đang tạo..." : "Tạo lịch bảo trì"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseMaintenanceModal}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Maintenance Modal */}
          <EditMaintenanceModal
            isOpen={showEditMaintenanceModal}
            onClose={handleCloseEditMaintenanceModal}
            maintenance={selectedMaintenance}
            onUpdate={handleUpdateMaintenance}
          />
        </>
      )}
    </div>
  );
};

export default AdminAssetManagement;
