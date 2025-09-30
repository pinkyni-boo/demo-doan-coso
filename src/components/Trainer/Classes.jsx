import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Global/Nav";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  MapPin,
  Eye,
  CheckCircle,
  Filter,
  Search,
  Plus
} from "lucide-react";

export default function TrainerClasses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    fetchClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm, statusFilter]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5000/api/trainers/assigned-classes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setClasses(response.data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = classes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(cls => cls.status === statusFilter);
    }

    setFilteredClasses(filtered);
  };

  const ClassCard = ({ classItem }) => {
    const progressPercent = (classItem.currentSession / classItem.totalSessions) * 100;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-lg mb-1">{classItem.className}</h4>
            <p className="text-sm text-gray-600">{classItem.service}</p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span>{classItem.schedule}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            classItem.status === 'ongoing' 
              ? 'bg-green-100 text-green-800'
              : classItem.status === 'completed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {classItem.status === 'ongoing' ? 'Đang diễn ra' :
             classItem.status === 'completed' ? 'Đã hoàn thành' : 'Chưa bắt đầu'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              <span>{classItem.enrolledStudents}/{classItem.maxStudents} học viên</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{classItem.location}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tiến độ buổi học</span>
              <span className="font-medium">{classItem.currentSession}/{classItem.totalSessions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              onClick={() => navigate(`/trainer/class/${classItem._id}`)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Eye className="h-4 w-4" />
              Xem chi tiết
            </button>
            
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav user={user} setUser={setUser} />
        <div className="pt-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Nav user={user} setUser={setUser} />
      
      {/* Main Content */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý lớp học</h1>
            <p className="text-gray-600 mt-2">
              Danh sách tất cả lớp học được gán cho bạn
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm lớp học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="pending">Chưa bắt đầu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Classes Grid */}
          {filteredClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((classItem) => (
                <ClassCard key={classItem._id} classItem={classItem} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== "all" ? "Không tìm thấy lớp học" : "Chưa có lớp học được gán"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc" 
                    : "Liên hệ admin để được gán lớp học"}
                </p>
                {(searchTerm || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}