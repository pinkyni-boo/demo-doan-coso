import React, { useState } from 'react';
import { Crown, Shield, User, ChevronDown } from 'lucide-react';

const AdminRoleSwitcher = ({ currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const roles = [
    {
      name: 'Admin',
      icon: Crown,
      description: 'Toàn quyền quản lý hệ thống',
      color: 'bg-red-100 text-red-700 border-red-200',
      features: ['Dashboard Admin', 'Quản lý Users', 'Quản lý Trainers', 'Quản lý Hệ thống']
    },
    {
      name: 'Trainer',
      icon: Shield,
      description: 'Vai trò huấn luyện viên',
      color: 'bg-green-100 text-green-700 border-green-200',
      features: ['Lịch dạy', 'Lớp học', 'Báo cáo vấn đề', 'Hiển thị trong danh sách trainer']
    },
    {
      name: 'User',
      icon: User,
      description: 'Vai trò người dùng',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      features: ['Đăng ký lớp', 'Lịch tập', 'Thanh toán', 'Thẻ thành viên', 'Hiển thị trong danh sách user']
    }
  ];

  return (
    <div className="fixed top-16 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
       
        
        {isExpanded && (
          <div className="p-4 space-y-3 max-w-sm">
            <div className="text-sm text-gray-600 mb-3">
              <strong>{currentUser.fullName}</strong> có thể test với 3 vai trò:
            </div>
            
            {roles.map((role, index) => {
              const IconComponent = role.icon;
              return (
                <div key={index} className={`p-3 rounded-lg border-2 ${role.color}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent className="h-4 w-4" />
                    <span className="font-semibold">{role.name}</span>
                  </div>
                  <p className="text-xs mb-2">{role.description}</p>
                  <ul className="text-xs space-y-1">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-1">
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            
            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              💡 Admin xuất hiện trong cả 3 danh sách để test dễ dàng
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRoleSwitcher;