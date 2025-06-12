import User from "../models/User.js";
import Class from "../models/Class.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Service from "../models/Service.js";
import Club from "../models/Club.js";
import Attendance from "../models/Attendance.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Tổng số người dùng
    const totalUsers = await User.countDocuments({ role: "user" });
    
    // Tính người dùng mới trong tháng này
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newUsersThisMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: startOfMonth }
    });

    // Tổng số lớp học đang hoạt động
    const activeClasses = await Class.countDocuments({
      status: { $in: ["ongoing", "upcoming"] }
    });

    // Tính doanh thu tháng này từ các enrollment đã thanh toán
    const revenueEnrollments = await ClassEnrollment.find({
      paymentStatus: true,
      enrollmentDate: { $gte: startOfMonth }
    }).populate('class', 'price');

    const monthlyRevenue = revenueEnrollments.reduce((total, enrollment) => {
      return total + (enrollment.class?.price || 0);
    }, 0);

    // Số thành viên mới đăng ký lớp trong tháng
    const newMembersThisMonth = await ClassEnrollment.countDocuments({
      enrollmentDate: { $gte: startOfMonth }
    });

    // Thống kê theo ngày trong 7 ngày qua để vẽ chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dailyEnrollments = await ClassEnrollment.countDocuments({
        enrollmentDate: { $gte: date, $lt: nextDay }
      });

      const dailyRevenue = await ClassEnrollment.find({
        paymentStatus: true,
        enrollmentDate: { $gte: date, $lt: nextDay }
      }).populate('class', 'price');

      const revenue = dailyRevenue.reduce((total, enrollment) => {
        return total + (enrollment.class?.price || 0);
      }, 0);

      last7Days.push({
        date: date.toISOString().split('T')[0],
        enrollments: dailyEnrollments,
        revenue: revenue
      });
    }

    // Top 5 dịch vụ phổ biến nhất
    const popularServices = await ClassEnrollment.aggregate([
      {
        $lookup: {
          from: "classes",
          localField: "class",
          foreignField: "_id",
          as: "classInfo"
        }
      },
      { $unwind: "$classInfo" },
      {
        $group: {
          _id: "$classInfo.serviceName",
          count: { $sum: 1 },
          revenue: { $sum: "$classInfo.price" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Thống kê điểm danh
    const totalSessions = await Attendance.countDocuments();
    const presentSessions = await Attendance.countDocuments({ isPresent: true });
    const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions * 100).toFixed(1) : 0;

    // Hoạt động gần đây
    const recentActivities = await ClassEnrollment.find()
      .populate('user', 'username')
      .populate('class', 'className price')
      .sort({ enrollmentDate: -1 })
      .limit(10);

    const recentClasses = await Class.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('className serviceName createdAt');

    res.json({
      stats: {
        totalUsers,
        newUsersThisMonth,
        activeClasses,
        monthlyRevenue,
        newMembersThisMonth,
        attendanceRate
      },
      charts: {
        last7Days,
        popularServices
      },
      recentActivities: {
        enrollments: recentActivities,
        classes: recentClasses
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê dashboard" });
  }
};

export const getDetailedStats = async (req, res) => {
  try {
    // Thống kê chi tiết cho trang stats
    const currentYear = new Date().getFullYear();
    
    // Doanh thu theo tháng trong năm
    const monthlyRevenueStats = [];
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(currentYear, month, 1);
      const endOfMonth = new Date(currentYear, month + 1, 0);
      
      const monthlyEnrollments = await ClassEnrollment.find({
        paymentStatus: true,
        enrollmentDate: { $gte: startOfMonth, $lte: endOfMonth }
      }).populate('class', 'price');

      const revenue = monthlyEnrollments.reduce((total, enrollment) => {
        return total + (enrollment.class?.price || 0);
      }, 0);

      monthlyRevenueStats.push({
        month: month + 1,
        revenue,
        enrollments: monthlyEnrollments.length
      });
    }

    // Thống kê theo dịch vụ
    const serviceStats = await ClassEnrollment.aggregate([
      {
        $lookup: {
          from: "classes",
          localField: "class", 
          foreignField: "_id",
          as: "classInfo"
        }
      },
      { $unwind: "$classInfo" },
      {
        $group: {
          _id: "$classInfo.serviceName",
          totalEnrollments: { $sum: 1 },
          paidEnrollments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", true] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", true] }, "$classInfo.price", 0] }
          }
        }
      },
      { $sort: { totalEnrollments: -1 } }
    ]);

    // Thống kê CLB
    const clubStats = await Club.aggregate([
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "clubId", 
          as: "classes"
        }
      },
      {
        $addFields: {
          totalClasses: { $size: "$classes" }
        }
      },
      {
        $project: {
          name: 1,
          address: 1,
          totalClasses: 1
        }
      }
    ]);

    // Thống kê user theo tháng
    const userGrowthStats = [];
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(currentYear, month, 1);
      const endOfMonth = new Date(currentYear, month + 1, 0);
      
      const newUsers = await User.countDocuments({
        role: "user",
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      userGrowthStats.push({
        month: month + 1,
        newUsers
      });
    }

    res.json({
      monthlyRevenue: monthlyRevenueStats,
      serviceStats,
      clubStats,
      userGrowth: userGrowthStats
    });

  } catch (error) {
    console.error("Error fetching detailed stats:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê chi tiết" });
  }
};