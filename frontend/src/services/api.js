import axios from "axios";

// Tự động kết nối tới Backend cổng 5001 khi chạy Frontend riêng (Vite cổng 5173)
// và vẫn hoạt động bình thường khi chạy chung trên cổng 5001
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.port === "5001" ? "" : "http://localhost:5001");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// APIs cho Giáo viên
export const getTeachersApi = (params) => api.get("/teachers", { params });
export const createTeacherApi = (data) => api.post("/teachers", data);
export const updateTeacherApi = (id, data) => api.put(`/teachers/${id}`, data);
export const deleteTeacherApi = (id) => api.delete(`/teachers/${id}`);

// APIs cho Vị trí công tác
export const getTeacherPositionsApi = (params) =>
  api.get("/teacher-positions", { params });
export const createTeacherPositionApi = (data) =>
  api.post("/teacher-positions", data);
export const updateTeacherPositionApi = (id, data) =>
  api.put(`/teacher-positions/${id}`, data);
export const deleteTeacherPositionApi = (id) =>
  api.delete(`/teacher-positions/${id}`);

// APIs cho Học sinh
export const getStudentsApi = (params) => api.get("/students", { params });
export const createStudentApi = (data) => api.post("/students", data);
export const deleteStudentApi = (id) => api.delete(`/students/${id}`);

// API Đăng nhập
export const loginApi = (data) => api.post("/auth/login", data);
