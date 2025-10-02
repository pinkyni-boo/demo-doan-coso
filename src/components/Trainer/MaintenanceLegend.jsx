import React, { useState } from "react";
import {
  Settings,
  AlertTriangle,
  Wrench,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";

const MaintenanceLegend = () => {
  const [isVisible, setIsVisible] = useState(false);

  const maintenanceTypes = [
    {
      type: "routine",
      label: "Bảo trì định kỳ",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Settings,
      description: "Bảo trì theo lịch trình định sẵn",
    },
    {
      type: "repair",
      label: "Sửa chữa",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: Wrench,
      description: "Sửa chữa hỏng hóc, sự cố",
    },
    {
      type: "replacement",
      label: "Thay thế",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: AlertTriangle,
      description: "Thay thế thiết bị cũ/hỏng",
    },
    {
      type: "inspection",
      label: "Kiểm tra",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: Settings,
      description: "Kiểm tra an toàn, chất lượng",
    },
    {
      type: "emergency",
      label: "Khẩn cấp",
      color: "bg-red-200 text-red-900 border-red-300",
      icon: AlertTriangle,
      description: "Xử lý sự cố khẩn cấp",
    },
    {
      type: "preventive",
      label: "Phòng ngừa",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Settings,
      description: "Bảo trì phòng ngừa sự cố",
    },
  ];

  const priorityLevels = [
    {
      level: "low",
      label: "Thấp",
      color: "bg-gray-100 text-gray-600",
      description: "Không cấp thiết, có thể hoãn",
    },
    {
      level: "medium",
      label: "Trung bình",
      color: "bg-yellow-100 text-yellow-800",
      description: "Quan trọng, nên thực hiện đúng hạn",
    },
    {
      level: "high",
      label: "Cao",
      color: "bg-orange-100 text-orange-800",
      description: "Rất quan trọng, ưu tiên cao",
    },
    {
      level: "urgent",
      label: "Khẩn cấp",
      color: "bg-red-100 text-red-800",
      description: "Cực kỳ khẩn cấp, xử lý ngay",
    },
  ];

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="inline-flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 mt-2"
        title="Xem chú thích màu sắc"
      >
        <Info className="h-3 w-3" />
        <span>Chú thích</span>
      </button>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          Chú thích lịch bảo trì
        </h4>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
          title="Ẩn chú thích"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Loại bảo trì */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2">
            Loại bảo trì:
          </h5>
          <div className="space-y-2">
            {maintenanceTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div key={type.type} className="flex items-center space-x-2">
                  <div
                    className={`
                    p-1 rounded flex items-center justify-center border
                    ${type.color}
                  `}
                  >
                    <IconComponent className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium text-gray-900">
                      {type.label}
                    </span>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mức độ ưu tiên */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2">
            Mức độ ưu tiên:
          </h5>
          <div className="space-y-2">
            {priorityLevels.map((priority) => (
              <div key={priority.level} className="flex items-center space-x-2">
                <span
                  className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${priority.color}
                `}
                >
                  {priority.label}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">
                    {priority.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chú thích đặc biệt */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-700">
              <strong>Cảnh báo tác động:</strong> Các lịch bảo trí có thể ảnh
              hưởng đến lịch dạy sẽ được đánh dấu đặc biệt. Vui lòng kiểm tra và
              điều chỉnh lịch dạy nếu cần thiết.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceLegend;
