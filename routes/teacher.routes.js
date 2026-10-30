import express from "express";
import multer from "multer";
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1.1 + 1.2: GET /teachers (có phân trang page & limit & search)
router.get("/", getTeachers);

// 1.3: POST /teachers (hỗ trợ cả raw JSON và multipart/form-data trên Postman)
router.post("/", upload.any(), createTeacher);

// Cập nhật thông tin & thăng chức giáo viên theo ID (hỗ trợ cả JSON và form-data)
router.put("/:id", upload.any(), updateTeacher);

// Xóa giáo viên theo ID
router.delete("/:id", deleteTeacher);

export default router;
