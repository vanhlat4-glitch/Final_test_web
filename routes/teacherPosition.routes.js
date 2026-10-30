import express from "express";
import {
  getTeacherPositions,
  createTeacherPosition,
  updateTeacherPosition,
  deleteTeacherPosition,
} from "../controllers/teacherPosition.controller.js";

const router = express.Router();

// 1.4: GET /teacher-positions (lấy toàn bộ vị trí công tác)
router.get("/", getTeacherPositions);

// 1.5: POST /teacher-positions (tạo vị trí công tác mới, code duy nhất)
router.post("/", createTeacherPosition);

// Cập nhật vị trí công tác & bổ nhiệm giáo viên
router.put("/:id", updateTeacherPosition);

// Xóa vị trí công tác theo ID
router.delete("/:id", deleteTeacherPosition);

export default router;
