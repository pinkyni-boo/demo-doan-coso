import React from "react";
import {
  Settings,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Eye,
  Activity,
} from "lucide-react";

const MaintenanceLegend = ({ className = "" }) => {
  const maintenanceTypes = [
    {
      type: "routine",
      name: "Bảo trì định kỳ",
      icon: Settings,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      type: "repair", 
      name: "Sửa chữa",
      icon: Wrench,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      type: "replacement",
      name: "Thay thế thiết bị",
      icon: Activity,
      color: "text-orange-600", 
      bgColor: "bg-orange-100",
    },
    {
      type: "inspection",
      name: "Kiểm tra",
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      type: "emergency",
      name: "Khẩn cấp",
      icon: AlertTriangle,
      color: "text-red-700",
      bgColor: "bg-red-200",
    },
    {
      type: "preventive",
      name: "Phòng ngừa",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <Settings className="h-4 w-4 mr-2" />
        Chú thích lịch bảo trì
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {maintenanceTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <div
              key={type.type}
              className="flex items-center text-xs"
            >
              <div className={`p-1 rounded-full ${type.bgColor} mr-2`}>
                <IconComponent className={`h-3 w-3 ${type.color}`} />
              </div>
              <span className="text-gray-700 truncate">{type.name}</span>
            </div>
          );
        })}
      </div>
      
      {/* Priority Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <h5 className="text-xs font-medium text-gray-700 mb-2">Mức độ ưu tiên:</h5>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">Thấp</span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Trung bình</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">Cao</span>
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Khẩn cấp</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceLegend;