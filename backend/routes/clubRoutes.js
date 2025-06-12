import express from "express";
import {
  getAllClubs,
  createClub,
  updateClub,
  deleteClub,
} from "../controllers/clubController.js";

const router = express.Router();

// Các route cho CLB
router.get("/", getAllClubs); // Lấy danh sách tất cả CLB
router.post("/", createClub); // Thêm CLB mới
router.put("/:id", updateClub); // Cập nhật CLB
router.delete("/:id", deleteClub); // Xóa CLB

export default router;
