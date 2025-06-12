import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Building } from "lucide-react";

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("revenue");

  useEffect(() => {
    fetchDetailedStats();
  }, []);

  const fetchDetailedStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/stats/detailed", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching detailed stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const monthNames = [
    'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
    'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: "revenue", label: "Doanh thu", icon: <DollarSign className="h-5 w-5" /> },
    { id: "services", label: "Dịch vụ", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "users", label: "Người dùng", icon: <Users className="h-5 w-5" /> },
    { id: "clubs", label: "CLB", icon: <Building className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Thống kê chi tiết</h1>
          <p className="text-gray-600">Phân tích dữ liệu hoạt động hệ thống</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Năm {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "revenue" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Doanh thu theo tháng
              </h3>
              <div className="space-y-4">
                {stats?.monthlyRevenue?.map((month, index) => {
                  const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                  const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex items-center">
                      <div className="w-8 text-sm font-medium text-gray-600">
                        {monthNames[month.month - 1]}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2" 
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="text-xs text-white font-medium">
                              {month.enrollments}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-32 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(month.revenue)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(stats?.monthlyRevenue?.reduce((sum, m) => sum + m.revenue, 0) || 0)}
                    </div>
                    <div className="text-sm text-gray-500">Tổng doanh thu</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.monthlyRevenue?.reduce((sum, m) => sum + m.enrollments, 0) || 0}
                    </div>
                    <div className="text-sm text-gray-500">Tổng đăng ký</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.monthlyRevenue?.length > 0 
                        ? Math.round(stats.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) / stats.monthlyRevenue.length)
                        : 0
                      }đ
                    </div>
                    <div className="text-sm text-gray-500">TB/tháng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Thống kê theo dịch vụ
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dịch vụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng đăng ký
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã thanh toán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tỷ lệ thanh toán
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.serviceStats?.map((service, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.totalEnrollments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.paidEnrollments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(service.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ 
                                width: `${service.totalEnrollments > 0 ? (service.paidEnrollments / service.totalEnrollments) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {service.totalEnrollments > 0 
                              ? Math.round((service.paidEnrollments / service.totalEnrollments) * 100)
                              : 0
                            }%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tăng trưởng người dùng
            </h3>
            <div className="space-y-4">
              {stats?.userGrowth?.map((month, index) => {
                const maxUsers = Math.max(...stats.userGrowth.map(m => m.newUsers));
                const percentage = maxUsers > 0 ? (month.newUsers / maxUsers) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center">
                    <div className="w-8 text-sm font-medium text-gray-600">
                      {monthNames[month.month - 1]}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-4 rounded-full" 
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-semibold text-gray-900">
                      {month.newUsers}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "clubs" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Thống kê CLB
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats?.clubStats?.map((club, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{club.name}</h4>
                  <p className="text-sm text-gray-500 mb-3">{club.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Số lớp học:</span>
                    <span className="font-semibold text-blue-600">{club.totalClasses}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;