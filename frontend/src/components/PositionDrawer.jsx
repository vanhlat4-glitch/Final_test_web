import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, UserCheck } from "lucide-react";
import {
  createTeacherPositionApi,
  updateTeacherPositionApi,
  getTeachersApi,
} from "../services/api";

export const PositionDrawer = ({
  isOpen,
  onClose,
  onSuccess,
  showToast,
  editingPosition = null,
}) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [des, setDes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [replaceOldPositions, setReplaceOldPositions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      if (editingPosition) {
        setCode(editingPosition.code || "");
        setName(editingPosition.name || "");
        setDes(editingPosition.des || "");
        setIsActive(
          editingPosition.isActive !== undefined
            ? editingPosition.isActive
            : true
        );
      } else {
        setCode("");
        setName("");
        setDes("");
        setIsActive(true);
      }
      setSelectedTeacherIds([]);
      loadTeachers(editingPosition?._id);
    }
  }, [isOpen, editingPosition]);

  const loadTeachers = async (posId) => {
    try {
      const res = await getTeachersApi({ page: 1, limit: 100 });
      if (res.data?.success) {
        const list = res.data.data || [];
        setTeachers(list);
        if (posId) {
          const alreadyInPos = list
            .filter((t) =>
              (t.teacherPositions || []).some((p) => p._id === posId)
            )
            .map((t) => t._id);
          setSelectedTeacherIds(alreadyInPos);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const toggleTeacherSelection = (id) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError("Vui lòng nhập đầy đủ Mã và Tên vị trí!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        des: des.trim(),
        isActive,
        teacherIds: selectedTeacherIds,
        replaceOldPositions,
      };

      if (editingPosition?._id) {
        await updateTeacherPositionApi(editingPosition._id, payload);
        showToast(
          "Cập nhật vị trí công tác & bổ nhiệm giáo viên thành công!",
          "success"
        );
      } else {
        await createTeacherPositionApi(payload);
        showToast(
          selectedTeacherIds.length > 0
            ? `Tạo vị trí mới & thăng chức cho ${selectedTeacherIds.length} giáo viên thành công!`
            : "Tạo vị trí công tác mới thành công!",
          "success"
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Không thể lưu vị trí công tác!";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">
            <span>
              {editingPosition
                ? `Cập nhật vị trí: ${editingPosition.name}`
                : "Vị trí công tác"}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div className="drawer-body">
            {error && (
              <div style={{
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label required">Mã</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập mã vị trí (VD: GVBM, HT, TT...)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label required">Tên</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên vị trí công tác"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label required">Mô tả</label>
              <textarea
                className="form-control"
                placeholder="Nhập mô tả về vị trí công tác..."
                value={des}
                onChange={(e) => setDes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label required">Trạng thái</label>
              <div>
                <div className="status-segment-group">
                  <button
                    type="button"
                    className={`segment-btn ${isActive ? "active-blue" : ""}`}
                    onClick={() => setIsActive(true)}
                  >
                    Hoạt động
                  </button>
                  <button
                    type="button"
                    className={`segment-btn ${!isActive ? "active-gray" : ""}`}
                    onClick={() => setIsActive(false)}
                  >
                    Ngừng
                  </button>
                </div>
              </div>
            </div>

            {/* Bổ nhiệm nhân viên / giáo viên cũ lên chức mới */}
            <div
              style={{
                borderTop: "1px solid var(--border-color)",
                paddingTop: "16px",
                marginTop: "8px",
              }}
            >
              <label
                className="form-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#1e293b",
                  fontSize: "0.9rem",
                  marginBottom: "6px",
                }}
              >
                <UserCheck size={16} color="var(--brand-blue)" />
                <span>Bổ nhiệm nhân viên / giáo viên cũ lên chức vụ này (Tuỳ chọn)</span>
              </label>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginBottom: "10px",
                }}
              >
                Chọn giáo viên hiện có trong danh sách bên dưới để thăng chức / chuyển lên vị trí công tác này:
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "10px",
                  fontSize: "0.8rem",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="promoteMode"
                    checked={replaceOldPositions}
                    onChange={() => setReplaceOldPositions(true)}
                  />
                  <span>Chuyển sang chức vụ mới này</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="promoteMode"
                    checked={!replaceOldPositions}
                    onChange={() => setReplaceOldPositions(false)}
                  />
                  <span>Kiêm nhiệm thêm chức vụ này</span>
                </label>
              </div>

              <div
                style={{
                  maxHeight: "180px",
                  overflowY: "auto",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "6px",
                  background: "#f8fafc",
                }}
              >
                {teachers.length === 0 ? (
                  <div style={{ padding: "12px", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Chưa có giáo viên nào trong hệ thống.
                  </div>
                ) : (
                  teachers.map((t) => {
                    const checked = selectedTeacherIds.includes(t._id);
                    return (
                      <label
                        key={t._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          background: checked ? "#eff6ff" : "transparent",
                          border: checked ? "1px solid #bfdbfe" : "1px solid transparent",
                          marginBottom: "4px",
                          fontSize: "0.82rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTeacherSelection(t._id)}
                          />
                          <div>
                            <div style={{ fontWeight: "600", color: "#1e293b" }}>
                              {t.name} <span style={{ color: "#64748b", fontWeight: "400" }}>({t.code})</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              Chức vụ hiện tại: <b>{t.positionNames || "Chưa có"}</b>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="drawer-footer">
            <button
              type="button"
              className="btn btn-default"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: "100px", justifyContent: "center" }}
            >
              <Save size={16} />
              <span>{loading ? "Đang lưu..." : "Lưu"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PositionDrawer;
