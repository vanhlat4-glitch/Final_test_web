# HỆ THỐNG QUẢN TRỊ TRƯỜNG HỌC EDUCORE SYSTEM (MERN STACK)

## 🚀 Website Hoàn Chỉnh Trọn Gói (1 Cổng Duy Nhất)

Toàn bộ hệ thống (Giao diện Frontend + Toàn bộ API Backend) đã được tích hợp thành **1 website hoàn chỉnh duy nhất** chạy trên cổng:
👉 **`http://localhost:5001`**

### Cách chạy:
```bash
npm install
npm run dev
```
Mở trình duyệt truy cập: **`http://localhost:5001`**

---

## 📂 Cấu trúc thư mục

```
Final_test_Web/
├── config/db.js                     # Kết nối MongoDB Atlas
├── models/                          # User, Teacher, TeacherPosition
├── controllers/                     # Logic xử lý API (CRUD, Tìm kiếm, Phân trang, Thăng chức)
├── routes/                          # Định tuyến /teachers, /teacher-positions
├── seed/                            # Dữ liệu mẫu (mock-data) & script nạp dữ liệu
├── public/                          # Giao diện Web đã build phục vụ trực tiếp
├── frontend/                        # Mã nguồn giao diện React (Vite)
├── Postman_Collection.json          # Bộ API import trực tiếp vào Postman
├── test_api.js                      # Script tự động kiểm thử 10/10 kịch bản API
├── server.js                        # Khởi chạy server Express & phục vụ giao diện Web
└── package.json
```

---

## 📋 Các Chức năng Chính

### 1. Backend API
- `GET /teachers`: Lấy danh sách giáo viên, hỗ trợ phân trang (`page`, `limit`) và tìm kiếm đa năng (`search`).
- `POST /teachers`: Tạo mới giáo viên (hỗ trợ cả `application/json` và `multipart/form-data` kèm upload ảnh đại diện), tự sinh mã 10 chữ số duy nhất, kiểm tra email duy nhất.
- `PUT /teachers/:id`: Cập nhật thông tin giáo viên & thăng chức lên vị trí công tác mới.
- `DELETE /teachers/:id`: Xóa giáo viên (Soft Delete).
- `GET /teacher-positions`: Lấy danh sách vị trí công tác (hỗ trợ tìm kiếm `search`).
- `POST /teacher-positions`: Tạo vị trí công tác mới (kiểm tra mã `code` duy nhất, hỗ trợ bổ nhiệm giáo viên).
- `PUT /teacher-positions/:id`: Cập nhật vị trí công tác & bổ nhiệm giáo viên lên chức vụ mới.
- `DELETE /teacher-positions/:id`: Xóa vị trí công tác.
- `GET / POST / DELETE /students`: Quản lý danh sách học sinh.

### 2. Giao diện Web (EduCore System)
- **Thống kê**: Tổng quan số liệu Giáo viên, Vị trí công tác, Học sinh, Lớp học & biểu đồ phân bổ.
- **Lớp học**: Quản lý danh sách lớp học, giáo viên chủ nhiệm, sĩ số.
- **Học sinh**: Quản lý, tìm kiếm, thêm/xóa học sinh.
- **Giáo viên**: Bảng dữ liệu, tìm kiếm, phân trang, tạo mới kèm upload ảnh, thêm nhiều bằng cấp (Học vị), xem chi tiết, sửa/thăng chức, xóa.
- **Dữ liệu ➔ Vị trí công tác**: Quản lý vị trí công tác, tạo mới, sửa/bổ nhiệm giáo viên cũ lên chức vụ mới, xóa.
