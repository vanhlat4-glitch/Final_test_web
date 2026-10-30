import React, { useState, useEffect } from "react";
import { Plus, RotateCcw, Search, Trash2, Settings, X } from "lucide-react";
import {
  getTeacherPositionsApi,
  deleteTeacherPositionApi,
} from "../services/api";
import PositionDrawer from "./PositionDrawer";

export const PositionList = ({ showToast }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);

  const fetchPositions = async (keyword = searchTerm) => {
    setLoading(true);
    try {
      const res = await getTeacherPositionsApi({ search: keyword });
      if (res.data?.success) {
        setPositions(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể tải danh sách vị trí công tác", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPositions(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPositions(searchTerm);
  };

  const handleDeletePosition = async (item) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa vị trí "${item.name}" (${item.code}) không?`
    );
    if (!confirmDelete) return;

    try {
      const res = await deleteTeacherPositionApi(item._id);
      if (res.data?.success) {
        showToast(
          res.data.message || "Đã xóa vị trí công tác thành công!",
          "success"
        );
        fetchPositions(searchTerm);
      }
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || "Không thể xóa vị trí công tác!",
        "error"
      );
    }
  };

  return (
    <div className="card">
      <div className="table-toolbar" style={{ flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div className="search-input-group" style={{ position: "relative" }}>
              <Search />
              <input
                type="text"
                className="search-input"
                placeholder="Tìm theo mã, tên, mô tả..."
                style={{ width: "260px", paddingRight: searchTerm ? "28px" : "12px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
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
          </form>
        </div>

        <div className="toolbar-actions">
          <button
            className="btn btn-default"
            onClick={() => {
              setEditingPosition(null);
              setIsDrawerOpen(true);
            }}
          >
            <Plus size={15} />
            <span>Tạo</span>
          </button>
          <button
            className="btn btn-default"
            onClick={() => {
              setSearchTerm("");
              fetchPositions("");
            }}
            disabled={loading}
          >
            <RotateCcw size={15} className={loading ? "spin" : ""} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>STT</th>
              <th style={{ width: "120px" }}>Mã</th>
              <th style={{ width: "220px" }}>Tên</th>
              <th style={{ width: "140px" }}>Trạng thái</th>
              <th>Mô tả</th>
              <th style={{ width: "130px", textAlign: "center" }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                  Đang tải dữ liệu vị trí công tác...
                </td>
              </tr>
            ) : positions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Không tìm thấy vị trí công tác nào. Bấm <b>+ Tạo</b> để thêm mới.
                </td>
              </tr>
            ) : (
              positions.map((item, index) => (
                <tr key={item._id || index}>
                  <td style={{ textAlign: "center", color: "var(--text-muted)", fontWeight: "600" }}>
                    {index + 1}
                  </td>
                  <td>
                    <span style={{ fontWeight: "700", color: "#1e293b" }}>
                      {item.code}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: "600" }}>{item.name}</span>
                  </td>
                  <td>
                    {item.isActive ? (
                      <span className="badge badge-success">Hoạt động</span>
                    ) : (
                      <span className="badge badge-secondary">Ngừng</span>
                    )}
                  </td>
                  <td style={{ color: "#475569" }}>{item.des || "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        className="btn btn-default"
                        style={{ padding: "6px 8px", fontSize: "0.78rem" }}
                        onClick={() => {
                          setEditingPosition(item);
                          setIsDrawerOpen(true);
                        }}
                        title="Cài đặt / Bổ nhiệm giáo viên lên vị trí này"
                      >
                        <Settings size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-default"
                        style={{
                          padding: "6px 8px",
                          fontSize: "0.78rem",
                          color: "#dc2626",
                          borderColor: "#fecaca",
                          background: "#fef2f2",
                        }}
                        onClick={() => handleDeletePosition(item)}
                        title="Xóa vị trí công tác"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer tạo mới / cập nhật vị trí */}
      <PositionDrawer
        isOpen={isDrawerOpen}
        editingPosition={editingPosition}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingPosition(null);
        }}
        onSuccess={() => fetchPositions(searchTerm)}
        showToast={showToast}
      />
    </div>
  );
};

export default PositionList;
