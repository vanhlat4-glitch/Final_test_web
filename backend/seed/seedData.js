import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import TeacherPositionModel from "../models/teacherPosition.model.js";
import TeacherModel from "../models/teacher.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseMongoJSON = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => parseMongoJSON(item));
  } else if (data !== null && typeof data === "object") {
    if ("$oid" in data) {
      return new mongoose.Types.ObjectId(data.$oid);
    }
    if ("$date" in data) {
      return new Date(data.$date);
    }
    const res = {};
    for (const key of Object.keys(data)) {
      res[key] = parseMongoJSON(data[key]);
    }
    return res;
  }
  return data;
};

const loadLocalMockFile = (fileName) => {
  const downloadPath = path.join(
    "C:\\Users\\legion\\Downloads\\WEB-mock-data-fullstack\\WEB-mock-data-fullstack",
    fileName
  );
  const backupPath = path.join(__dirname, "mock-data", fileName);

  const targetPath = fs.existsSync(downloadPath) ? downloadPath : backupPath;
  const raw = fs.readFileSync(targetPath, "utf-8");
  return parseMongoJSON(JSON.parse(raw));
};

export const seedDatabase = async () => {
  try {
    console.log("⏳ Đang kết nối MongoDB để nạp dữ liệu mẫu...");
    await mongoose.connect(process.env.URI_MONGO);
    console.log("✅ Kết nối MongoDB thành công!");

    console.log("📥 Đang đọc dữ liệu từ thư mục WEB-mock-data-fullstack...");
    const positions = loadLocalMockFile("school.teacherpositions.json");
    const teachers = loadLocalMockFile("school.teachers.json");
    const users = loadLocalMockFile("school.users.json");

    console.log(`- Vị trí công tác: ${positions.length}`);
    console.log(`- Giáo viên: ${teachers.length}`);
    console.log(`- Người dùng: ${users.length}`);

    // Xóa dữ liệu cũ nếu có
    await Promise.all([
      TeacherPositionModel.deleteMany({}),
      TeacherModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
    console.log("🧹 Đã làm sạch các collection cũ.");

    // Trong file dump gốc, isDeleted đang để true, chuyển về false để hiển thị lên giao diện
    const cleanPositions = positions.map((p) => ({
      ...p,
      isDeleted: false,
      isActive: p.isActive !== undefined ? p.isActive : true,
    }));

    const cleanUsers = users.map((u) => ({
      ...u,
      isDeleted: false,
    }));

    // Kiểm tra các teacher có userId bị thiếu trong file school.users.json gốc
    const existingUserIds = new Set(cleanUsers.map((u) => u._id.toString()));
    const fallbackNames = [
      {
        name: "Nguyễn Quốc Việt",
        email: "quocviet@school.edu.vn",
        phoneNumber: "0912345678",
        address: "Cầu Giấy, Hà Nội",
        identity: "001085012345",
        dob: new Date("1978-05-15"),
      },
      {
        name: "Đỗ Thị Mai Hương",
        email: "maihuong@school.edu.vn",
        phoneNumber: "0987654321",
        address: "Đống Đa, Hà Nội",
        identity: "001182054321",
        dob: new Date("1982-09-20"),
      },
    ];
    let fallbackIdx = 0;

    for (const t of teachers) {
      const uidStr = t.userId ? t.userId.toString() : null;
      if (uidStr && !existingUserIds.has(uidStr)) {
        const fb = fallbackNames[fallbackIdx % fallbackNames.length];
        fallbackIdx++;
        cleanUsers.push({
          _id: t.userId,
          name: fb.name,
          email: fb.email,
          phoneNumber: fb.phoneNumber,
          address: fb.address,
          identity: fb.identity,
          dob: fb.dob,
          role: "TEACHER",
          isDeleted: false,
        });
        existingUserIds.add(uidStr);
      }
    }

    const cleanTeachers = teachers.map((t) => ({
      ...t,
      isDeleted: false,
      isActive: t.isActive !== undefined ? t.isActive : true,
    }));

    await TeacherPositionModel.insertMany(cleanPositions);
    await UserModel.insertMany(cleanUsers);
    await TeacherModel.insertMany(cleanTeachers);

    console.log("🎉 ĐÃ IMPORT THÀNH CÔNG DỮ LIỆU TỪ WEB-mock-data-fullstack VÀO MONGODB!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi seed dữ liệu:", error);
    process.exit(1);
  }
};

seedDatabase();
