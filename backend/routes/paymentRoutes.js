import express from "express";
import {
  createPayment,
  getPayments,
  getAllPayments,
  approvePayment,
  getPaymentDetails,
  cancelPayment,
  getPendingPayments,
  rejectPayment,
  updatePayment,
  getRejectedPayments,
  deletePayment,
  getCompletedPayments,
  updatePaymentStatus,
  deleteEnrollment,
  deletePaymentEnrollment, // Thêm dòng này
} from "../controllers/paymentController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ========= FIXED ROUTES FIRST (no parameters) =========
// Create a new payment
router.post("/", verifyToken, createPayment);

// Get all admin routes with fixed paths
router.get("/all", verifyToken, verifyAdmin, getAllPayments);
router.get("/pending", verifyToken, verifyAdmin, getPendingPayments);
router.get("/rejected", verifyToken, verifyAdmin, getRejectedPayments);
router.get("/completed", verifyToken, verifyAdmin, getCompletedPayments);

// Get user's payments with fixed paths
router.get("/user", verifyToken, getPayments);
router.get("/my", verifyToken, getPayments);

// ========= PARAMETER ROUTES AFTER =========
// Route cho xóa đăng ký thanh toán (payment context)
router.delete(
  "/enrollment/:enrollmentId",
  verifyToken,
  deletePaymentEnrollment
);

// Admin - Approve/Reject payment (parameter routes)
router.put("/approve/:paymentId", verifyToken, verifyAdmin, approvePayment);
router.put("/reject/:paymentId", verifyToken, verifyAdmin, rejectPayment);
router.put("/cancel/:paymentId", verifyToken, cancelPayment);

// Parameter routes with details
router.get("/:paymentId/details", verifyToken, getPaymentDetails);

// Generic parameter routes
router.put("/:paymentId", verifyToken, updatePayment);
router.delete("/:paymentId", verifyToken, verifyAdmin, deletePayment);
router.put("/:paymentId/status", verifyToken, verifyAdmin, updatePaymentStatus);

// This should be the LAST route, as it's the most generic
router.get("/:paymentId", verifyToken, getPaymentDetails);

export default router;
