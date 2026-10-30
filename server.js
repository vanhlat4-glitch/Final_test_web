import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import teacherRouter from "./routes/teacher.routes.js";
import teacherPositionRouter from "./routes/teacherPosition.routes.js";
import UserModel from "./models/user.model.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Gắn các routers API theo đúng yêu cầu đề thi
app.use("/teachers", teacherRouter);
app.use("/teacher-positions", teacherPositionRouter);

// API hỗ trợ quản lý Học sinh (từ collection Users với role STUDENT)
app.get("/students", async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim() : "";
    const query = { role: "STUDENT", isDeleted: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }
    const students = await UserModel.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/students", async (req, res) => {
  try {
    const { name, email, phoneNumber, address, dob, identity } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Họ tên học sinh là bắt buộc!" });
    }
    const student = await UserModel.create({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      phoneNumber: phoneNumber ? phoneNumber.trim() : "",
      address: address ? address.trim() : "",
      identity: identity ? identity.trim() : "",
      dob: dob ? new Date(dob) : null,
      role: "STUDENT",
      isDeleted: false,
    });
    return res.status(201).json({ success: true, message: "Thêm học sinh thành công!", data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    await UserModel.findByIdAndUpdate(req.params.id, { isDeleted: true });
    return res.status(200).json({ success: true, message: "Đã xóa học sinh thành công!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Phục vụ giao diện Web Frontend trọn gói trên cùng 1 server
const frontendDistPath = path.join(__dirname, "public");
app.use(express.static(frontendDistPath));

// Tất cả các route giao diện khác đều load index.html của Frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// Kết nối CSDL và khởi chạy server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 WEBSITE HOÀN CHỈNH ĐANG CHẠY TẠI: http://localhost:${PORT}`);
    console.log(`   (Gồm cả Giao diện Web + Toàn bộ API Backend)`);
    console.log(`======================================================\n`);
  });
});
