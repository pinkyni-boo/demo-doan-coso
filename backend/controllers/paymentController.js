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

    console.log(
      "Approving payment:",
      paymentId,
      "with registrations:",
      registrationIds
    );

    // Tìm payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

    // Cập nhật trạng thái payment
    payment.status = "completed";
    payment.completedAt = new Date();
    payment.approvedBy = req.user.username || req.user._id;
    await payment.save();

    // Cập nhật paymentStatus cho các ClassEnrollment
    if (registrationIds && registrationIds.length > 0) {
      for (const regId of registrationIds) {
        try {
          // Kiểm tra xem regId là ClassEnrollment hay Membership
          const classEnrollment = await ClassEnrollment.findById(regId);

          if (classEnrollment) {
            // Cập nhật trạng thái thanh toán cho ClassEnrollment
            classEnrollment.paymentStatus = true;
            await classEnrollment.save();
            console.log("Updated ClassEnrollment:", regId);
          } else {
            // Kiểm tra xem có phải Membership không
            const membership = await Membership.findById(regId);
            if (membership) {
              membership.paymentStatus = true;
              membership.status = "active";
              await membership.save();
              console.log("Updated Membership:", regId);
            } else {
              console.log("Registration not found:", regId);
            }
          }
        } catch (error) {
          console.error("Error updating registration:", regId, error);
        }
      }
    }

    res.json({
      message: "Xác nhận thanh toán thành công",
      payment,
    });
  } catch (error) {
    console.error("Error approving payment:", error);
    res.status(500).json({ message: "Lỗi server khi xác nhận thanh toán" });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { rejectionReason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

    payment.status = "cancelled";
    payment.rejectionReason = rejectionReason || "Admin từ chối thanh toán";
    await payment.save();

    res.json({
      message: "Từ chối thanh toán thành công",
      payment,
    });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({ message: "Lỗi server khi từ chối thanh toán" });
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
