import Payment from "../models/Payment.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Membership from "../models/Membership.js";
import Class from "../models/Class.js";

export const createPayment = async (req, res) => {
  try {
    const { amount, method, registrationIds, paymentType = "class" } = req.body;
    const userId = req.user._id;

    console.log("Creating payment:", {
      amount,
      method,
      registrationIds,
      paymentType,
      userId,
    });

    // Validate registrationIds
    if (!registrationIds || registrationIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có mục nào để thanh toán" });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Số tiền thanh toán không hợp lệ" });
    }

    // Tạo payment record
    const payment = new Payment({
      user: userId,
      amount: parseInt(amount),
      method,
      registrationIds,
      paymentType,
      status: "pending",
      createdAt: new Date(),
    });

    await payment.save();
    console.log("Payment created successfully:", payment._id);

<<<<<<< Updated upstream
=======
    // Gửi thông báo cho admin khi có yêu cầu thanh toán mới
    try {
      const user = req.user;
      await NotificationService.notifyAdminPaymentConfirmation(payment, user);
      console.log("Admin notification sent");
    } catch (notifyError) {
      console.error("Error sending admin notification:", notifyError);
      // Continue even if notification fails
    }

>>>>>>> Stashed changes
    res.status(201).json({
      message: "Tạo yêu cầu thanh toán thành công",
      payment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Lỗi server khi tạo thanh toán" });
  }
};

export const getPayments = async (req, res) => {
  try {
    const userId = req.user._id;
<<<<<<< Updated upstream
=======

    // Admin có thể xem tất cả payments của mình như user bình thường
>>>>>>> Stashed changes
    const payments = await Payment.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate({
        path: "user",
        select: "username email",
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const approvePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { registrationIds } = req.body;

<<<<<<< Updated upstream
    console.log(
      "Approving payment:",
      paymentId,
      "with registrations:",
      registrationIds
    );
=======
    console.log("Approving payment:", paymentId);
    console.log("Registration IDs from request:", registrationIds);

    // Validate payment ID format
    if (!paymentId || !paymentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID thanh toán không hợp lệ" });
    }
>>>>>>> Stashed changes

    // Tìm payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

<<<<<<< Updated upstream
    // Cập nhật trạng thái payment
    payment.status = "completed";
    payment.completedAt = new Date();
    payment.approvedBy = req.user.username || req.user._id;
    await payment.save();
=======
    console.log("Found payment:", payment);
>>>>>>> Stashed changes

    // Cập nhật trạng thái payment
    payment.status = "completed"; // Use "completed" instead of "approved" to match enum
    payment.completedAt = new Date();
    payment.approvedBy = req.user.username || req.user._id;
    await payment.save();

    console.log("Payment updated successfully");

    // Cập nhật paymentStatus cho các ClassEnrollment/Membership
    const registrationIdsToProcess = registrationIds || payment.registrationIds;

    if (registrationIdsToProcess && registrationIdsToProcess.length > 0) {
      for (const regId of registrationIdsToProcess) {
        try {
          console.log("Processing registration ID:", regId);

          // Validate registration ID format
          if (!regId || !regId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log("Invalid registration ID format:", regId);
            continue;
          }

          // Kiểm tra xem regId là ClassEnrollment hay Membership
          const classEnrollment = await ClassEnrollment.findById(regId);

          if (classEnrollment) {
            // Cập nhật trạng thái thanh toán cho ClassEnrollment
            classEnrollment.paymentStatus = true;
            await classEnrollment.save();
<<<<<<< Updated upstream
            console.log("Updated ClassEnrollment:", regId);
=======

            console.log("Updated ClassEnrollment:", regId);

            // Thông báo cho user
            try {
              await NotificationService.notifyUserPaymentApproved(
                payment,
                req.user
              );
              console.log("User notification sent successfully");
            } catch (notifyError) {
              console.error("Error sending notification:", notifyError);
              // Continue even if notification fails - don't throw
            }
>>>>>>> Stashed changes
          } else {
            // Kiểm tra xem có phải Membership không
            const membership = await Membership.findById(regId);
            if (membership) {
              membership.paymentStatus = true;
              membership.status = "active";
              await membership.save();
<<<<<<< Updated upstream
              console.log("Updated Membership:", regId);
=======

              console.log("Updated Membership:", regId);

              // Thông báo cho user
              try {
                await NotificationService.notifyUserPaymentApproved(
                  payment,
                  req.user
                );
                console.log(
                  "User notification sent successfully for membership"
                );
              } catch (notifyError) {
                console.error("Error sending notification:", notifyError);
                // Continue even if notification fails - don't throw
              }
>>>>>>> Stashed changes
            } else {
              console.log("Registration not found:", regId);
            }
          }
        } catch (error) {
          console.error("Error updating registration:", regId, error);
          // Continue with other registrations even if one fails
        }
      }
    }

    console.log("All registrations processed successfully");

    res.json({
      message: "Xác nhận thanh toán thành công",
      payment,
    });
  } catch (error) {
    console.error("Error approving payment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Lỗi server khi xác nhận thanh toán",
      error: error.message,
    });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { rejectionReason } = req.body;

    console.log("Rejecting payment:", paymentId);
    console.log("Rejection reason:", rejectionReason);

    // Validate paymentId format
    if (!paymentId || !paymentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID thanh toán không hợp lệ" });
    }

    const payment = await Payment.findById(paymentId).populate(
      "user",
      "username fullName email"
    );
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

    console.log("Found payment:", payment._id, "Status:", payment.status);

    // Kiểm tra trạng thái payment - chỉ reject những payment đang pending
    if (payment.status !== "pending") {
      return res.status(400).json({
        message: `Không thể từ chối thanh toán có trạng thái ${payment.status}`,
      });
    }

    // Cập nhật trạng thái payment
    payment.status = "cancelled";
    payment.rejectionReason = rejectionReason || "Admin từ chối thanh toán";
    payment.rejectedAt = new Date();
    payment.rejectedBy = req.user._id;
    await payment.save();

    console.log("Payment status updated to cancelled");

    // Xử lý registrationIds nếu có - đảm bảo không tính vào sĩ số
    const registrationIds = payment.registrationIds;
    if (registrationIds && registrationIds.length > 0) {
      console.log("Processing registrations for rejection:", registrationIds);

      for (const regId of registrationIds) {
        try {
          console.log("Processing registration ID:", regId);

          // Validate registration ID format
          if (!regId || !regId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log("Invalid registration ID format:", regId);
            continue;
          }

          // Kiểm tra xem regId là ClassEnrollment hay Membership
          const classEnrollment = await ClassEnrollment.findById(regId);

          if (classEnrollment) {
            // Đảm bảo paymentStatus = false để không tính vào sĩ số
            classEnrollment.paymentStatus = false;
            classEnrollment.status = "cancelled"; // Đánh dấu đăng ký bị hủy
            await classEnrollment.save();

            console.log("ClassEnrollment marked as cancelled:", regId);
          } else {
            // Kiểm tra xem có phải Membership không
            const membership = await Membership.findById(regId);
            if (membership) {
              membership.paymentStatus = false;
              membership.status = "cancelled"; // Đánh dấu membership bị hủy
              await membership.save();

              console.log("Membership marked as cancelled:", regId);
            } else {
              console.log("Registration not found:", regId);
            }
          }
        } catch (error) {
          console.error("Error processing registration:", regId, error);
          // Continue with other registrations even if one fails
        }
      }
    }

    // Gửi thông báo cho user về việc thanh toán bị từ chối
    try {
      await NotificationService.notifyUserPaymentRejected(
        payment,
        req.user,
        rejectionReason
      );
      console.log("User notification sent successfully for payment rejection");
    } catch (notifyError) {
      console.error("Error sending rejection notification:", notifyError);
      // Continue even if notification fails - don't throw
    }

    console.log("Payment rejection processed successfully");

    res.json({
      message: "Từ chối thanh toán thành công",
      payment,
    });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Lỗi server khi từ chối thanh toán",
      error: error.message,
    });
  }
};

export const cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

    // Kiểm tra quyền
    if (
      payment.user.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Không có quyền hủy thanh toán này" });
    }

    // Chỉ có thể hủy thanh toán đang pending
    if (payment.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể hủy thanh toán đang chờ xử lý" });
    }

    payment.status = "cancelled";
    await payment.save();

    res.json({
      message: "Hủy thanh toán thành công",
      payment,
    });
  } catch (error) {
    console.error("Error cancelling payment:", error);
    res.status(500).json({ message: "Lỗi server khi hủy thanh toán" });
  }
};

export const getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "pending" })
      .populate({
        path: "user",
        select: "username email",
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getRejectedPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "cancelled" })
      .populate({
        path: "user",
        select: "username email",
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching rejected payments:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getCompletedPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "completed" })
      .populate({
        path: "user",
        select: "username email",
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching completed payments:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const updateData = req.body;

    const payment = await Payment.findByIdAndUpdate(paymentId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật thanh toán" });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByIdAndDelete(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

    res.json({ message: "Xóa thanh toán thành công" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ message: "Lỗi server khi xóa thanh toán" });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật trạng thái thanh toán" });
  }
};

export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate({
      path: "user",
      select: "username email",
    });

    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

    const items = [];
    let totalAmount = 0;

    // Xử lý từng registrationId
    for (const regId of payment.registrationIds) {
      try {
        // Kiểm tra ClassEnrollment trước
        const classEnrollment = await ClassEnrollment.findById(regId).populate({
          path: "class",
          select: "className serviceName price schedule",
        });

        if (classEnrollment) {
          items.push({
            id: regId,
            type: "class",
            name: classEnrollment.class?.className || "Lớp học",
            price: classEnrollment.class?.price || 0,
            scheduleInfo: classEnrollment.class?.serviceName || "N/A",
          });
          totalAmount += classEnrollment.class?.price || 0;
          continue;
        }

        // Kiểm tra Membership
        const membership = await Membership.findById(regId);
        if (membership) {
          items.push({
            id: regId,
            type: "membership",
            name: `Gói ${membership.type}`,
            price: membership.price || 0,
            duration: membership.duration
              ? `${membership.duration} ngày`
              : "30 ngày",
          });
          totalAmount += membership.price || 0;
          continue;
        }

        // Nếu không tìm thấy
        items.push({
          id: regId,
          type: "error",
          name: "Không tìm thấy",
          price: 0,
        });
      } catch (error) {
        console.error("Error processing registration:", regId, error);
        items.push({
          id: regId,
          type: "error",
          name: "Lỗi khi tải",
          price: 0,
        });
      }
    }

    res.json({
      items,
      totalItems: items.length,
      totalAmount: payment.amount || totalAmount,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Thêm function mới cho xóa đăng ký thanh toán
export const deletePaymentEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user.id;

    // Tìm enrollment
    const enrollment = await ClassEnrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        message: "Không tìm thấy đăng ký",
      });
    }

    // Kiểm tra quyền: chỉ user đăng ký hoặc admin mới có thể xóa
    if (enrollment.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Bạn không có quyền xóa đăng ký này",
      });
    }

    // Kiểm tra trạng thái thanh toán
    if (enrollment.paymentStatus === "paid") {
      return res.status(400).json({
        message:
          "Không thể xóa đăng ký đã thanh toán. Vui lòng liên hệ admin để được hỗ trợ.",
      });
    }

    // Xóa đăng ký (chỉ cho phép xóa khi chưa thanh toán)
    await ClassEnrollment.findByIdAndDelete(enrollmentId);

    return res.status(200).json({
      message: "Đã xóa đăng ký thành công",
    });
  } catch (error) {
    console.error("Error deleting payment enrollment:", error);
    return res.status(500).json({
      message: "Lỗi server khi xóa đăng ký",
      error: error.message,
    });
  }
};

// Giữ nguyên function deleteEnrollment cũ cho việc xóa enrollment dựa trên trạng thái lớp học
export const deleteEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    // Tìm enrollment với populate class để kiểm tra trạng thái
    const enrollment = await ClassEnrollment.findById(enrollmentId).populate({
      path: "class",
      select: "className status startDate endDate schedule",
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Không tìm thấy đăng ký lớp học",
      });
    }

    // Kiểm tra trạng thái lớp học
    const classInfo = enrollment.class;
    const currentDate = new Date();
    const classStartDate = new Date(classInfo.startDate);

    // Nếu lớp đã bắt đầu hoặc đang diễn ra
    if (
      classInfo.status === "ongoing" ||
      (classStartDate <= currentDate && classInfo.status !== "completed")
    ) {
      return res.status(400).json({
        message:
          "Không thể hủy đăng ký khi lớp học đang diễn ra. Vui lòng liên hệ admin để được hỗ trợ.",
      });
    }

    // Nếu lớp chưa bắt đầu, cho phép xóa
    await ClassEnrollment.findByIdAndDelete(enrollmentId);

    return res.status(200).json({
      message: "Đã hủy đăng ký lớp học thành công",
    });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return res.status(500).json({
      message: "Lỗi server khi xóa đăng ký",
      error: error.message,
    });
  }
};
<<<<<<< Updated upstream
=======

// Lấy thống kê thanh toán cho admin dashboard
export const getPaymentStats = async (req, res) => {
  try {
    // Tính tổng doanh thu từ các thanh toán đã được duyệt
    const revenueStats = await Payment.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
        },
      },
    ]);

    // Thống kê theo tháng
    const monthlyStats = await Payment.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    // Thống kê theo trạng thái
    const statusStats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue =
      revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    const totalPayments =
      revenueStats.length > 0 ? revenueStats[0].totalPayments : 0;

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalPayments,
        monthlyStats,
        statusStats,
      },
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê thanh toán",
    });
  }
};
>>>>>>> Stashed changes
