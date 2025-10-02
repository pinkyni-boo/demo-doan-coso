import React from "react";
import {
  Settings,
  AlertTriangle,
  Clock,
  MapPin,
  Wrench,
  Calendar,
} from "lucide-react";

const MaintenanceScheduleCard = ({ maintenance }) => {
  // Hàm format thời gian
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Hàm format ngày
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Hàm lấy màu theo loại bảo trì
  const getMaintenanceTypeColor = (type) => {
    const colors = {
      routine: "bg-blue-100 text-blue-800 border-blue-200",
      repair: "bg-red-100 text-red-800 border-red-200",
      replacement: "bg-orange-100 text-orange-800 border-orange-200",
      inspection: "bg-green-100 text-green-800 border-green-200",
      emergency: "bg-red-200 text-red-900 border-red-300",
      preventive: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Hàm lấy màu theo mức độ ưu tiên
  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-600";
  };

  // Hàm lấy icon theo loại bảo trì
  const getMaintenanceIcon = (type) => {
    const icons = {
      routine: Settings,
      repair: Wrench,
      replacement: AlertTriangle,
      inspection: Settings,
      emergency: AlertTriangle,
      preventive: Settings,
    };
    const IconComponent = icons[type] || Settings;
    return <IconComponent className="h-4 w-4" />;
  };

  // Hàm translate loại bảo trì
  const translateMaintenanceType = (type) => {
    const translations = {
      routine: "Bảo trì định kỳ",
      repair: "Sửa chữa",
      replacement: "Thay thế",
      inspection: "Kiểm tra",
      emergency: "Khẩn cấp",
      preventive: "Phòng ngừa",
    };
    return translations[type] || type;
  };

  // Hàm translate mức độ ưu tiên
  const translatePriority = (priority) => {
    const translations = {
      low: "Thấp",
      medium: "Trung bình",
      high: "Cao",
      urgent: "Khẩn cấp",
    };
    return translations[priority] || priority;
  };

  // Hàm xác định xem có ảnh hưởng đến lịch dạy không
  const isScheduleImpacted = () => {
    const maintenanceDate = new Date(maintenance.scheduledDate);
    const today = new Date();
    const timeDiff = maintenanceDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Nếu bảo trì trong vòng 3 ngày tới và có ảnh hưởng đến phòng
    return daysDiff <= 3 && daysDiff >= 0 && maintenance.room;
  };

  return (
    <div
      className={`
      bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow duration-200 p-3
      ${
        maintenance.priority === "urgent"
          ? "border-l-red-500"
          : maintenance.priority === "high"
          ? "border-l-orange-500"
          : "border-l-blue-500"
      }
    `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div
            className={`
            p-1.5 rounded-lg flex items-center justify-center
            ${
              getMaintenanceTypeColor(maintenance.maintenanceType)
                .replace("text-", "text-")
                .replace("bg-", "bg-")
                .split(" ")[0]
            }
          `}
          >
            {getMaintenanceIcon(maintenance.maintenanceType)}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm leading-tight">
              {maintenance.title}
            </h4>
            <p className="text-xs text-gray-600 mt-0.5">
              {translateMaintenanceType(maintenance.maintenanceType)}
            </p>
          </div>
        </div>

        <span
          className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
          ${getPriorityColor(maintenance.priority)}
        `}
        >
          {translatePriority(maintenance.priority)}
        </span>
      </div>

      {/* Thông tin thời gian và địa điểm */}
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(maintenance.scheduledDate)}</span>
          <Clock className="h-3 w-3 ml-2" />
          <span>{formatTime(maintenance.scheduledDate)}</span>
          <span className="text-gray-500">
            ({maintenance.estimatedDuration}h)
          </span>
        </div>

        {maintenance.room && (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>Phòng: {maintenance.room.roomName}</span>
          </div>
        )}

        {maintenance.equipment && (
          <div className="flex items-center space-x-1">
            <Settings className="h-3 w-3" />
            <span>Thiết bị: {maintenance.equipment.equipmentName}</span>
          </div>
        )}
      </div>

      {/* Mô tả */}
      {maintenance.description && (
        <p className="text-xs text-gray-700 mt-2 bg-gray-50 p-2 rounded">
          {maintenance.description}
        </p>
      )}

      {/* Cảnh báo ảnh hưởng lịch dạy */}
      {isScheduleImpacted() && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3 text-yellow-600" />
            <span className="text-xs text-yellow-800 font-medium">
              Có thể ảnh hưởng đến lịch dạy
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceScheduleCard;
