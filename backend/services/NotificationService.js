import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

class NotificationService {
  // Tạo thông báo mới
  static async createNotification({
    title,
    message,
    type,
    recipient,
    sender = null,
    relatedId = null
  }) {
    try {
      const notification = new Notification({
        title,
        message,
        type,
        recipient,
        sender,
        relatedId
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Thông báo admin xác nhận lịch bù cho HLV
  static async notifyTrainerScheduleApproved(scheduleRequest, admin) {
    const title = "Lịch bù đã được phê duyệt";
    const message = `Admin đã xác nhận lịch dạy bù cho ngày ${new Date(scheduleRequest.originalDate).toLocaleDateString('vi-VN')}`;
    
    return await this.createNotification({
      title,
      message,
      type: "schedule",
      recipient: scheduleRequest.trainer,
      sender: admin._id,
      relatedId: scheduleRequest._id
    });
  }

  // Thông báo admin xác nhận lịch bù bị từ chối
  static async notifyTrainerScheduleRejected(scheduleRequest, admin) {
    const title = "Lịch bù bị từ chối";
    const message = `Admin đã từ chối yêu cầu thay đổi lịch dạy cho ngày ${new Date(scheduleRequest.originalDate).toLocaleDateString('vi-VN')}`;
    
    return await this.createNotification({
      title,
      message,
      type: "schedule",
      recipient: scheduleRequest.trainer,
      sender: admin._id,
      relatedId: scheduleRequest._id
    });
  }

  // Thông báo admin có yêu cầu bù lịch mới
  static async notifyAdminNewScheduleRequest(scheduleRequest, trainer) {
    const title = "Yêu cầu bù lịch mới";
    const message = `HLV ${trainer.fullName || trainer.username} đã gửi yêu cầu thay đổi lịch dạy`;
    
    // Lấy tất cả admin
    const admins = await User.find({ role: "admin" });
    
    const notifications = [];
    for (const admin of admins) {
      const notification = await this.createNotification({
        title,
        message,
        type: "schedule",
        recipient: admin._id,
        sender: trainer._id,
        relatedId: scheduleRequest._id
      });
      notifications.push(notification);
    }
    
    return notifications;
  }

  // Thông báo admin có thanh toán cần xác nhận
  static async notifyAdminPaymentConfirmation(payment, user) {
    const title = "Thanh toán cần xác nhận";
    const message = `Học viên ${user.fullName || user.username} đã thanh toán và cần xác nhận`;
    
    const admins = await User.find({ role: "admin" });
    
    const notifications = [];
    for (const admin of admins) {
      const notification = await this.createNotification({
        title,
        message,
        type: "payment",
        recipient: admin._id,
        sender: user._id,
        relatedId: payment._id
      });
      notifications.push(notification);
    }
    
    return notifications;
  }

  // Thông báo học viên thanh toán được xác nhận
  static async notifyUserPaymentApproved(payment, admin) {
    const title = "Thanh toán đã được xác nhận";
    const message = "Admin đã xác nhận thanh toán của bạn. Cảm ơn bạn đã sử dụng dịch vụ!";
    
    return await this.createNotification({
      title,
      message,
      type: "payment",
      recipient: payment.userId,
      sender: admin._id,
      relatedId: payment._id
    });
  }

  // Thông báo học viên về điểm danh
  static async notifyStudentsAttendance(classData, sessionNumber, trainer, presentStudents, absentStudents) {
    const notifications = [];
    
    // Thông báo cho học viên có mặt
    for (const student of presentStudents) {
      const notification = await this.createNotification({
        title: "Điểm danh đã được ghi nhận",
        message: `Bạn đã được điểm danh có mặt trong buổi học ${sessionNumber} lớp ${classData.className}`,
        type: "attendance",
        recipient: student._id,
        sender: trainer._id,
        relatedId: classData._id
      });
      notifications.push(notification);
    }

    // Thông báo cho học viên vắng mặt
    for (const student of absentStudents) {
      const notification = await this.createNotification({
        title: "Thông báo vắng mặt",
        message: `Bạn đã vắng mặt trong buổi học ${sessionNumber} lớp ${classData.className}. Vui lòng liên hệ HLV nếu có vấn đề.`,
        type: "attendance",
        recipient: student._id,
        sender: trainer._id,
        relatedId: classData._id
      });
      notifications.push(notification);
    }

    return notifications;
  }

  // Lấy thông báo của user
  static async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find({ recipient: userId })
        .populate("sender", "fullName username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments({ recipient: userId });
      const unreadCount = await Notification.countDocuments({ 
        recipient: userId, 
        isRead: false 
      });

      return {
        notifications,
        total,
        unreadCount,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }

  // Đánh dấu đã đọc
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { 
          isRead: true, 
          readAt: new Date() 
        },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Đánh dấu tất cả đã đọc
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { 
          isRead: true, 
          readAt: new Date() 
        }
      );
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }
}

export default NotificationService;