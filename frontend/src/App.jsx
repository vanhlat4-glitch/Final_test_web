import React, { useState, useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  Users,
  UserCheck,
  Database,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
  Search,
  RotateCcw,
  X,
  Lock,
  Mail,
  LogIn,
  Sun,
  Moon,
} from "lucide-react";
import Header from "./components/Header";
import TeacherList from "./components/TeacherList";
import PositionList from "./components/PositionList";
import {
  getTeachersApi,
  getTeacherPositionsApi,
  getStudentsApi,
  createStudentApi,
  deleteStudentApi,
  loginApi,
} from "./services/api";

// --- Màn hình Đăng nhập (Login View) ---
const LoginView = ({ onLoginSuccess, darkMode, onToggleDarkMode, showToast }) => {
  const [email, setEmail] = useState("admin@educore.edu.vn");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginApi({ email, password });
      if (res.data?.success) {
        onLoginSuccess(res.data.data);
        showToast(res.data.message || "Đăng nhập thành công!", "success");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại!";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div style={{ position: "fixed", top: "20px", right: "24px" }}>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleDarkMode}
        >
          {darkMode ? (
            <Sun size={17} color="#fbbf24" />
          ) : (
            <Moon size={17} color="#4f46e5" />
          )}
          <span>{darkMode ? "Chế độ Sáng" : "Chế độ Tối"}</span>
        </button>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="brand-icon-wrap" style={{ width: "48px", height: "48px", margin: "0 auto 12px" }}>
            <GraduationCap size={28} color="#ffffff" />
          </div>
          <h1 className="login-title">EduCore System</h1>
          <p className="login-subtitle">
            Đăng nhập Hệ thống Quản trị Trường học
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "0.84rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label required">Email hoặc Số điện thoại</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                className="form-control"
                style={{ width: "100%", paddingLeft: "36px" }}
                placeholder="admin@educore.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Mật khẩu</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="password"
                className="form-control"
                style={{ width: "100%", paddingLeft: "36px" }}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "11px",
              fontSize: "0.92rem",
              marginTop: "4px",
            }}
          >
            <LogIn size={17} />
            <span>{loading ? "Đang đăng nhập..." : "Đăng nhập hệ thống"}</span>
          </button>
        </form>

        <div className="login-quick-accounts">
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "8px" }}>
            Chọn nhanh tài khoản mẫu (Mật khẩu: <b>123456</b>):
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-default"
              style={{ fontSize: "0.75rem", padding: "5px 10px", flex: 1, justifyContent: "center" }}
              onClick={() => {
                setEmail("admin@educore.edu.vn");
                setPassword("123456");
              }}
            >
              👑 Admin Hệ thống
            </button>
            <button
              type="button"
              className="btn btn-default"
              style={{ fontSize: "0.75rem", padding: "5px 10px", flex: 1, justifyContent: "center" }}
              onClick={() => {
                setEmail("trantrungtruc@school.edu.vn");
                setPassword("123456");
              }}
            >
              👨‍🏫 GV: Trần Trung Trực
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 1. View Thống kê (Dashboard) ---
const DashboardView = ({ onNavigate }) => {
  const [teachers, setTeachers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [tRes, pRes, sRes] = await Promise.all([
          getTeachersApi({ page: 1, limit: 200 }),
          getTeacherPositionsApi(),
          getStudentsApi(),
        ]);
        if (tRes.data?.success) setTeachers(tRes.data.data || []);
        if (pRes.data?.success) setPositions(pRes.data.data || []);
        if (sRes.data?.success) setStudents(sRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const activeTeachers = teachers.filter((t) => t.isActive).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate("teachers")}>
          <div className="stat-icon" style={{ background: "#eef2ff", color: "#4f46e5" }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="stat-label">Tổng số Giáo viên</div>
            <div className="stat-value">{loading ? "..." : teachers.length}</div>
            <div className="stat-sub">Đang công tác: {activeTeachers}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate("positions")}>
          <div className="stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-label">Vị trí công tác</div>
            <div className="stat-value">{loading ? "..." : positions.length}</div>
            <div className="stat-sub">Đang hoạt động: {positions.filter((p) => p.isActive).length}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate("students")}>
          <div className="stat-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="stat-label">Học sinh hệ thống</div>
            <div className="stat-value">{loading ? "..." : students.length}</div>
            <div className="stat-sub">Quản lý hồ sơ học sinh</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate("classes")}>
          <div className="stat-icon" style={{ background: "#fdf2f8", color: "#db2777" }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-label">Lớp học đang mở</div>
            <div className="stat-value">6</div>
            <div className="stat-sub">Khối 10, 11, 12</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px", color: "#1e293b" }}>
            Phân bổ Giáo viên theo Vị trí công tác
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {positions.map((pos) => {
              const count = teachers.filter((t) =>
                (t.teacherPositions || []).some((p) => p._id === pos._id)
              ).length;
              const pct = teachers.length > 0 ? Math.round((count / teachers.length) * 100) : 0;
              return (
                <div key={pos._id} style={{ fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600 }}>
                      {pos.name} <span style={{ color: "#64748b" }}>({pos.code})</span>
                    </span>
                    <span style={{ fontWeight: 700, color: "#4f46e5" }}>{count} GV</span>
                  </div>
                  <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.max(pct, count > 0 ? 8 : 0)}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px", color: "#1e293b" }}>
            Giáo viên mới cập nhật gần đây
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {teachers.slice(0, 5).map((t) => (
              <div
                key={t._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{t.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Mã: {t.code} • {t.email}
                  </div>
                </div>
                <span className="badge badge-success">{t.positionNames || "GVBM"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. View Lớp học (Classes) ---
const ClassView = ({ showToast }) => {
  const [classes, setClasses] = useState([
    { id: "L01", code: "10A1", name: "Lớp 10A1 - Chuyên Toán Tin", grade: "Khối 10", homeroom: "Trần Trung Trực", count: 38, room: "P.201 - Khu A" },
    { id: "L02", code: "10A2", name: "Lớp 10A2 - Khoa Học Tự Nhiên", grade: "Khối 10", homeroom: "Nguyễn Phương Anh", count: 40, room: "P.202 - Khu A" },
    { id: "L03", code: "11B1", name: "Lớp 11B1 - Chuyên Ngoại Ngữ", grade: "Khối 11", homeroom: "Lê Thu Hải An", count: 35, room: "P.301 - Khu B" },
    { id: "L04", code: "11B2", name: "Lớp 11B2 - Khoa Học Xã Hội", grade: "Khối 11", homeroom: "Phạm Lan Ngọc", count: 39, room: "P.302 - Khu B" },
    { id: "L05", code: "12C1", name: "Lớp 12C1 - Luyện Thi Đại Học KHTN", grade: "Khối 12", homeroom: "Ngô Minh Hiếu", count: 42, room: "P.401 - Khu C" },
    { id: "L06", code: "12C2", name: "Lớp 12C2 - Luyện Thi Đại Học KHXH", grade: "Khối 12", homeroom: "Trần Bích Ngọc", count: 37, room: "P.402 - Khu C" },
  ]);
  const [search, setSearch] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [newHomeroom, setNewHomeroom] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = classes.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.homeroom.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClassCode.trim() || !newClassName.trim()) return;
    setClasses((prev) => [
      ...prev,
      {
        id: `L${Date.now()}`,
        code: newClassCode.trim().toUpperCase(),
        name: newClassName.trim(),
        grade: "Khối 10",
        homeroom: newHomeroom.trim() || "Chưa phân công",
        count: 35,
        room: "P.101",
      },
    ]);
    setNewClassCode("");
    setNewClassName("");
    setNewHomeroom("");
    setShowAdd(false);
    showToast("Thêm lớp học mới thành công!", "success");
  };

  return (
    <div className="card">
      <div className="table-toolbar">
        <div className="search-input-group">
          <Search />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm mã lớp, tên lớp, GVCN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={15} />
            <span>Thêm lớp học</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAddClass}
          style={{
            padding: "16px 20px",
            background: "#f8fafc",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Mã lớp (VD: 10A3)"
            value={newClassCode}
            onChange={(e) => setNewClassCode(e.target.value)}
            required
          />
          <input
            type="text"
            className="form-control"
            placeholder="Tên lớp học..."
            style={{ minWidth: "240px" }}
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            required
          />
          <input
            type="text"
            className="form-control"
            placeholder="Giáo viên chủ nhiệm..."
            value={newHomeroom}
            onChange={(e) => setNewHomeroom(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Lưu lớp</button>
          <button type="button" className="btn btn-default" onClick={() => setShowAdd(false)}>Hủy</button>
        </form>
      )}

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>STT</th>
              <th>Mã lớp</th>
              <th>Tên lớp học</th>
              <th>Khối</th>
              <th>GV Chủ nhiệm</th>
              <th>Sĩ số</th>
              <th>Phòng học</th>
              <th style={{ width: "90px", textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ textAlign: "center", fontWeight: 600, color: "#64748b" }}>{idx + 1}</td>
                <td><b>{item.code}</b></td>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>{item.grade}</td>
                <td style={{ color: "#4f46e5", fontWeight: 600 }}>{item.homeroom}</td>
                <td>{item.count} HS</td>
                <td>{item.room}</td>
                <td style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    className="btn btn-default"
                    style={{ padding: "5px 8px", color: "#dc2626", borderColor: "#fecaca", background: "#fef2f2" }}
                    onClick={() => {
                      setClasses((prev) => prev.filter((c) => c.id !== item.id));
                      showToast(`Đã xóa lớp ${item.code}`, "success");
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 3. View Học sinh (Students - kết nối CSDL Users role STUDENT) ---
const StudentView = ({ showToast }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");

  const fetchStudents = async (q = search) => {
    setLoading(true);
    try {
      const res = await getStudentsApi({ search: q });
      if (res.data?.success) setStudents(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchStudents(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createStudentApi({ name, email, phoneNumber, address, dob });
      setName("");
      setEmail("");
      setPhoneNumber("");
      setAddress("");
      setDob("");
      setShowAdd(false);
      showToast("Thêm học sinh mới thành công!", "success");
      fetchStudents(search);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi thêm học sinh", "error");
    }
  };

  const handleDelete = async (st) => {
    if (!window.confirm(`Xóa học sinh "${st.name}"?`)) return;
    try {
      await deleteStudentApi(st._id);
      showToast("Đã xóa học sinh!", "success");
      fetchStudents(search);
    } catch (err) {
      showToast("Không thể xóa học sinh", "error");
    }
  };

  return (
    <div className="card">
      <div className="table-toolbar">
        <div className="search-input-group" style={{ position: "relative" }}>
          <Search />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm học sinh theo tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#94a3b8",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-default" onClick={() => fetchStudents(search)}>
            <RotateCcw size={15} />
            <span>Làm mới</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={15} />
            <span>Thêm học sinh</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAddStudent}
          style={{
            padding: "16px 20px",
            background: "#f8fafc",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Họ và tên học sinh *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="tel"
            className="form-control"
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Lưu</button>
          <button type="button" className="btn btn-default" onClick={() => setShowAdd(false)}>Hủy</button>
        </form>
      )}

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>STT</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Ngày sinh</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th style={{ width: "90px", textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "32px" }}>Đang tải danh sách học sinh...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                  Chưa có học sinh nào.
                </td>
              </tr>
            ) : (
              students.map((st, idx) => (
                <tr key={st._id}>
                  <td style={{ textAlign: "center", fontWeight: 600, color: "#64748b" }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>{st.name}</td>
                  <td>{st.email || "—"}</td>
                  <td>{st.phoneNumber || "—"}</td>
                  <td>{st.dob ? new Date(st.dob).toLocaleDateString("vi-VN") : "—"}</td>
                  <td>{st.address || "—"}</td>
                  <td><span className="badge badge-success">Đang học</span></td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className="btn btn-default"
                      style={{ padding: "5px 8px", color: "#dc2626", borderColor: "#fecaca", background: "#fef2f2" }}
                      onClick={() => handleDelete(st)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export function App() {
  const [activeMenu, setActiveMenu] = useState("teachers"); // 'dashboard' | 'classes' | 'students' | 'teachers' | 'positions'
  const [openDataSubmenu, setOpenDataSubmenu] = useState(true);
  const [openClassSubmenu, setOpenClassSubmenu] = useState(false);
  const [openStudentSubmenu, setOpenStudentSubmenu] = useState(false);
  const [toast, setToast] = useState(null);

  // Chế độ Sáng / Tối (lưu vào localStorage)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("educore_theme") === "dark";
  });

  // Trạng thái Đăng nhập / Đăng xuất (lưu vào localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("educore_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return {
      name: "Quản trị viên",
      email: "admin@educore.edu.vn",
      role: "ADMIN",
    };
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("educore_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("educore_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("educore_user");
    showToast("Đã đăng xuất khỏi hệ thống!", "success");
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const renderBreadcrumb = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <div className="breadcrumb-bar">
            <span className="breadcrumb-parent">Hệ thống</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Thống kê tổng quan</span>
          </div>
        );
      case "classes":
        return (
          <div className="breadcrumb-bar">
            <span className="breadcrumb-parent">Đào tạo</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Lớp học</span>
          </div>
        );
      case "students":
        return (
          <div className="breadcrumb-bar">
            <span className="breadcrumb-parent">Hồ sơ</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Học sinh</span>
          </div>
        );
      case "positions":
        return (
          <div className="breadcrumb-bar">
            <span className="breadcrumb-parent">Dữ liệu</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Vị trí công tác</span>
          </div>
        );
      case "teachers":
      default:
        return (
          <div className="breadcrumb-bar">
            <span className="breadcrumb-parent">Nhân sự</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Giáo viên</span>
          </div>
        );
    }
  };

  if (!currentUser) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          showToast={showToast}
        />
        {toast && (
          <div className="toast-container">
            <div className={`toast toast-${toast.type}`}>
              {toast.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="app-container">
      {/* 1. Top Navbar (EduCore System) */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* 2. Body Layout: Left Sidebar + Right Workspace */}
      <div className="workspace-layout">
        <aside className="left-sidebar">
          <nav className="sidebar-nav">
            {/* Thống kê */}
            <div
              className={`sidebar-item ${activeMenu === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveMenu("dashboard")}
            >
              <div className="sidebar-item-left">
                <BarChart3 size={18} />
                <span>Thống kê</span>
              </div>
            </div>

            {/* Lớp học */}
            <div
              className={`sidebar-item ${activeMenu === "classes" ? "active" : ""}`}
              onClick={() => {
                setOpenClassSubmenu(!openClassSubmenu);
                setActiveMenu("classes");
              }}
            >
              <div className="sidebar-item-left">
                <BookOpen size={18} />
                <span>Lớp học</span>
              </div>
              {openClassSubmenu ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </div>

            {/* Học sinh */}
            <div
              className={`sidebar-item ${activeMenu === "students" ? "active" : ""}`}
              onClick={() => {
                setOpenStudentSubmenu(!openStudentSubmenu);
                setActiveMenu("students");
              }}
            >
              <div className="sidebar-item-left">
                <Users size={18} />
                <span>Học sinh</span>
              </div>
              {openStudentSubmenu ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </div>

            {/* Giáo viên */}
            <div
              className={`sidebar-item ${activeMenu === "teachers" ? "active" : ""}`}
              onClick={() => setActiveMenu("teachers")}
            >
              <div className="sidebar-item-left">
                <UserCheck size={18} />
                <span>Giáo viên</span>
              </div>
            </div>

            {/* Dữ liệu -> Vị trí công tác */}
            <div
              className={`sidebar-item parent-active ${
                activeMenu === "positions" ? "parent-highlight" : ""
              }`}
              onClick={() => setOpenDataSubmenu(!openDataSubmenu)}
            >
              <div className="sidebar-item-left">
                <Database size={18} />
                <span>Dữ liệu</span>
              </div>
              {openDataSubmenu ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </div>

            {openDataSubmenu && (
              <div className="sidebar-submenu">
                <div
                  className={`sidebar-subitem ${
                    activeMenu === "positions" ? "active" : ""
                  }`}
                  onClick={() => setActiveMenu("positions")}
                >
                  <span>Vị trí công tác</span>
                </div>
              </div>
            )}
          </nav>
        </aside>

        {/* 3. Main Content Area */}
        <main className="main-content">
          {renderBreadcrumb()}

          {activeMenu === "dashboard" && (
            <DashboardView onNavigate={(tab) => setActiveMenu(tab)} />
          )}
          {activeMenu === "classes" && <ClassView showToast={showToast} />}
          {activeMenu === "students" && <StudentView showToast={showToast} />}
          {activeMenu === "teachers" && <TeacherList showToast={showToast} />}
          {activeMenu === "positions" && <PositionList showToast={showToast} />}
        </main>
      </div>

      {/* 4. Global Toast System */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
