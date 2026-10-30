import React, { useState, useEffect } from "react";
import { Search, RotateCcw, Plus, Eye, Edit, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getTeachersApi, deleteTeacherApi } from "../services/api";
import TeacherDrawer from "./TeacherDrawer";
import TeacherDetailModal from "./TeacherDetailModal";

// Danh sách avatar mẫu để giao diện sống động như demo
const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
];

export const TeacherList = ({ showToast }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const fetchTeachers = async (currentPage = page, currentLimit = limit, keyword = searchTerm) => {
    setLoading(true);
    try {
      const res = await getTeachersApi({
        page: currentPage,
        limit: currentLimit,
        search: keyword,
      });

      if (res.data?.success) {
        setTeachers(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setPage(res.data.pagination?.page || 1);
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể tải danh sách giáo viên", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeachers(page, limit, searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [page, limit, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers(1, limit, searchTerm);
  };

  const handleReset = () => {
    setSearchTerm("");
    setPage(1);
    fetchTeachers(1, limit, "");
  };

  const handleDeleteTeacher = async (teacher) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa giáo viên "${teacher.name}" (Mã GV: ${teacher.code}) không?`
    );
    if (!confirmDelete) return;

    try {
      const res = await deleteTeacherApi(teacher._id);
      if (res.data?.success) {
        showToast(res.data.message || "Đã xóa giáo viên thành công!", "success");
        if (selectedTeacher && selectedTeacher._id === teacher._id) {
          setSelectedTeacher(null);
        }
        fetchTeachers(page, limit, searchTerm);
      }
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || "Không thể xóa giáo viên!",
        "error"
      );
    }
  };

  return (
    <div className="card">
      {/* Table Toolbar */}
      <div className="table-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="search-input-group" style={{ position: "relative" }}>
              <Search />
              <input
                type="text"
                className="search-input"
                placeholder="Tìm theo mã, tên, email, SĐT, vị trí..."
                style={{ width: "280px", paddingRight: searchTerm ? "28px" : "12px" }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setPage(1);
                  }}
                  style={{
                    position: "absolute",
                    right: "8px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                  title="Xóa từ khóa"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={15} />
              <span>Tìm kiếm</span>
            </button>
          </form>
        </div>

        <div className="toolbar-actions">
          <button className="btn btn-default" onClick={handleReset} disabled={loading}>
            <RotateCcw size={16} className={loading ? "spin" : ""} />
            <span>Tải lại</span>
          </button>
          <button
            className="btn btn-default"
            onClick={() => {
              setEditingTeacher(null);
              setIsDrawerOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Tạo mới</span>
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: "120px" }}>Mã</th>
              <th style={{ width: "260px" }}>Giáo viên</th>
              <th style={{ width: "240px" }}>Trình độ (cao nhất)</th>
              <th style={{ width: "100px" }}>Bộ môn</th>
              <th style={{ width: "160px" }}>TT Công tác</th>
              <th style={{ width: "140px" }}>Địa chỉ</th>
              <th style={{ width: "130px" }}>Trạng thái</th>
              <th style={{ width: "230px", textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  Đang tải danh sách giáo viên...
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Không tìm thấy giáo viên nào. Bấm <b>+ Tạo mới</b> để thêm giáo viên.
                </td>
              </tr>
            ) : (
              teachers.map((teacher, index) => {
                const avatarUrl = teacher.avatar || AVATARS[index % AVATARS.length];
                const highestDegree = teacher.highestDegree;

                return (
                  <tr key={teacher._id || index}>
                    {/* Mã GV */}
                    <td>
                      <span style={{ fontWeight: "700", color: "#1e293b", fontFamily: "monospace", fontSize: "0.9rem" }}>
                        {teacher.code}
                      </span>
                    </td>

                    {/* Giáo viên */}
                    <td>
                      <div className="teacher-profile-cell">
                        <img
                          src={avatarUrl}
                          alt={teacher.name}
                          className="teacher-avatar"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="teacher-info">
                          <div className="teacher-name">{teacher.name || "Chưa đặt tên"}</div>
                          <div className="teacher-sub">{teacher.email}</div>
                          <div className="teacher-sub">{teacher.phoneNumber}</div>
                        </div>
                      </div>
                    </td>

                    {/* Trình độ (cao nhất) */}
                    <td>
                      <div className="degree-cell">
                        {highestDegree ? (
                          <>
                            <div className="degree-level">
                              Bậc: <b>{highestDegree.type}</b>
                            </div>
                            <div className="degree-major">
                              Chuyên ngành: {highestDegree.major || "Chung"}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>Chưa cập nhật</span>
                        )}
                      </div>
                    </td>

                    {/* Bộ môn */}
                    <td>
                      <span style={{ color: "var(--text-muted)" }}>N/A</span>
                    </td>

                    {/* TT Công tác */}
                    <td>
                      <span style={{ fontWeight: "500", color: "#334155" }}>
                        {teacher.positionNames || "N/A"}
                      </span>
                    </td>

                    {/* Địa chỉ */}
                    <td>
                      <span style={{ color: "#475569" }}>
                        {teacher.address ? teacher.address.split(",").pop().trim() : "—"}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td>
                      {teacher.isActive ? (
                        <span className="badge badge-success">Đang công tác</span>
                      ) : (
                        <span className="badge badge-secondary">Ngừng công tác</span>
                      )}
                    </td>

                    {/* Hành động */}
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <button
                          type="button"
                          className="btn btn-default"
                          style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                          onClick={() => setSelectedTeacher(teacher)}
                        >
                          <Eye size={14} />
                          <span>Chi tiết</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-default"
                          style={{
                            padding: "6px 10px",
                            fontSize: "0.8rem",
                            color: "#2563eb",
                            borderColor: "#bfdbfe",
                            background: "#eff6ff",
                          }}
                          onClick={() => {
                            setEditingTeacher(teacher);
                            setIsDrawerOpen(true);
                          }}
                          title="Cập nhật thông tin / Thăng chức giáo viên"
                        >
                          <Edit size={14} />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-default"
                          style={{
                            padding: "6px 10px",
                            fontSize: "0.8rem",
                            color: "#dc2626",
                            borderColor: "#fecaca",
                            background: "#fef2f2",
                          }}
                          onClick={() => handleDeleteTeacher(teacher)}
                          title="Xóa giáo viên"
                        >
                          <Trash2 size={14} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pagination-container">
        <div>
          Tổng: <b>{total}</b>
        </div>

        <div className="pagination-pages">
          <button
            className="page-btn"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn ${page === p ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            className="page-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div>
          <select
            className="form-control"
            style={{ padding: "4px 8px", fontSize: "0.8rem", width: "auto" }}
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
          </select>
        </div>
      </div>

      {/* Drawer Tạo / Cập nhật Giáo viên */}
      <TeacherDrawer
        isOpen={isDrawerOpen}
        editingTeacher={editingTeacher}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingTeacher(null);
        }}
        onSuccess={() => fetchTeachers(page, limit, searchTerm)}
        showToast={showToast}
      />

      {/* Modal Chi tiết Giáo viên */}
      <TeacherDetailModal
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        onEdit={(teacher) => {
          setSelectedTeacher(null);
          setEditingTeacher(teacher);
          setIsDrawerOpen(true);
        }}
        onDelete={handleDeleteTeacher}
      />
    </div>
  );
};

export default TeacherList;
