import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Save, AlertCircle, Plus, Trash2 } from "lucide-react";
import {
  createTeacherApi,
  updateTeacherApi,
  getTeacherPositionsApi,
} from "../services/api";

export const TeacherDrawer = ({
  isOpen,
  onClose,
  onSuccess,
  showToast,
  editingTeacher = null,
}) => {
  // Personal Info
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [identity, setIdentity] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState("");
  const fileInputRef = useRef(null);

  // Work Info
  const [selectedPositionIds, setSelectedPositionIds] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isActive, setIsActive] = useState(true);

  // Degrees List (Học vị)
  const [degreesList, setDegreesList] = useState([
    {
      type: "Bachelor",
      school: "",
      major: "",
      year: new Date().getFullYear(),
      isGraduated: true,
    },
  ]);

  // Meta
  const [availablePositions, setAvailablePositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      loadPositions();
      if (editingTeacher) {
        setName(editingTeacher.name || "");
        setDob(
          editingTeacher.dob
            ? new Date(editingTeacher.dob).toISOString().split("T")[0]
            : ""
        );
        setPhoneNumber(editingTeacher.phoneNumber || "");
        setEmail(editingTeacher.email || "");
        setIdentity(editingTeacher.identity || "");
        setAddress(editingTeacher.address || "");
        setAvatar(editingTeacher.avatar || "");
        setStartDate(
          editingTeacher.startDate
            ? new Date(editingTeacher.startDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setIsActive(
          editingTeacher.isActive !== undefined ? editingTeacher.isActive : true
        );
        if (
          editingTeacher.teacherPositions &&
          editingTeacher.teacherPositions.length > 0
        ) {
          setSelectedPositionIds(
            editingTeacher.teacherPositions.map((p) => p._id)
          );
        } else {
          setSelectedPositionIds([]);
        }
        if (editingTeacher.degrees && editingTeacher.degrees.length > 0) {
          setDegreesList(
            editingTeacher.degrees.map((d) => ({
              type: d.type || "Bachelor",
              school: d.school || "",
              major: d.major || "",
              year: d.year || new Date().getFullYear(),
              isGraduated: d.isGraduated !== undefined ? d.isGraduated : true,
            }))
          );
        } else {
          setDegreesList([
            {
              type: "Bachelor",
              school: "",
              major: "",
              year: new Date().getFullYear(),
              isGraduated: true,
            },
          ]);
        }
      } else {
        setName("");
        setDob("");
        setPhoneNumber("");
        setEmail("");
        setIdentity("");
        setAddress("");
        setAvatar("");
        setStartDate(new Date().toISOString().split("T")[0]);
        setIsActive(true);
        setDegreesList([
          {
            type: "Bachelor",
            school: "",
            major: "",
            year: new Date().getFullYear(),
            isGraduated: true,
          },
        ]);
      }
    }
  }, [isOpen, editingTeacher]);

  const loadPositions = async () => {
    try {
      const res = await getTeacherPositionsApi();
      if (res.data?.success) {
        const list = res.data.data || [];
        setAvailablePositions(list);
        if (!editingTeacher && list.length > 0 && selectedPositionIds.length === 0) {
          setSelectedPositionIds([list[0]._id]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePositionId = (id) => {
    setSelectedPositionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddDegree = () => {
    setDegreesList((prev) => [
      ...prev,
      {
        type: "Bachelor",
        school: "",
        major: "",
        year: new Date().getFullYear(),
        isGraduated: true,
      },
    ]);
  };

  const handleRemoveDegree = (index) => {
    setDegreesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDegreeChange = (index, field, value) => {
    setDegreesList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn định dạng file ảnh hợp lệ (JPG, PNG, WEBP...)!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh không được vượt quá 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Họ tên và email là bắt buộc!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const validDegrees = degreesList
        .filter((d) => d.school.trim() || d.major.trim() || d.type)
        .map((d) => ({
          type: d.type,
          school: d.school.trim(),
          major: d.major.trim(),
          year: Number(d.year) || new Date().getFullYear(),
          isGraduated: Boolean(d.isGraduated),
        }));

      const payload = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        identity: identity.trim(),
        dob: dob || null,
        avatar: avatar || "",
        startDate: startDate || null,
        teacherPositionsId: selectedPositionIds,
        isActive,
        degrees: validDegrees,
      };

      if (editingTeacher?._id) {
        await updateTeacherApi(editingTeacher._id, payload);
        showToast(
          `Cập nhật thông tin & chức vụ cho giáo viên "${name.trim()}" thành công!`,
          "success"
        );
      } else {
        const res = await createTeacherApi(payload);
        showToast(
          `Thêm mới giáo viên thành công! Mã GV: ${res.data?.data?.code}`,
          "success"
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Không thể lưu thông tin giáo viên!";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-panel"
        style={{ maxWidth: "860px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div className="drawer-title">
            <span>
              {editingTeacher
                ? `Cập nhật & Thăng chức giáo viên (${editingTeacher.code})`
                : "Tạo thông tin giáo viên"}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div className="drawer-body">
            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Layout 2 cột: Cột trái Avatar Upload, Cột phải Form fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr",
                gap: "24px",
                alignItems: "start",
                marginBottom: "20px",
              }}
            >
              <div className="avatar-upload-box">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  title="Nhấn để chọn ảnh đại diện"
                  style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: "50%",
                    background: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "3px solid #c7d2fe",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={
                      avatar ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher"
                    }
                    alt="avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {avatar ? "Đã tải ảnh lên" : "Upload file"}
                </div>
                <button
                  type="button"
                  className="btn btn-default"
                  style={{ fontSize: "0.75rem", padding: "5px 10px" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={13} />
                  <span>{avatar ? "Đổi ảnh" : "Chọn ảnh"}</span>
                </button>
              </div>

              <div>
                <h3 className="form-section-title">Thông tin cá nhân</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Ngày sinh</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Số điện thoại</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Nhập số điện thoại"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="example@school.edu.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Số CCCD</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập số CCCD"
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Địa chỉ</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Địa chỉ thường trú"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin công tác */}
            <h3 className="form-section-title">Thông tin công tác</h3>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label className="form-label required">
                  Vị trí công tác (Chọn 1 hoặc nhiều chức vụ)
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                    gap: "8px",
                    padding: "10px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    background: "#f8fafc",
                  }}
                >
                  {availablePositions.map((p) => {
                    const checked = selectedPositionIds.includes(p._id);
                    return (
                      <label
                        key={p._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          background: checked ? "#eef2ff" : "#ffffff",
                          border: checked
                            ? "1px solid #4f46e5"
                            : "1px solid #e2e8f0",
                          fontSize: "0.85rem",
                          fontWeight: checked ? "600" : "500",
                          color: checked ? "#4338ca" : "#334155",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePositionId(p._id)}
                        />
                        <span>
                          {p.name} ({p.code})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ngày bắt đầu công tác</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái công tác</label>
                <div>
                  <div className="status-segment-group">
                    <button
                      type="button"
                      className={`segment-btn ${isActive ? "active-blue" : ""}`}
                      onClick={() => setIsActive(true)}
                    >
                      Đang công tác
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${!isActive ? "active-gray" : ""}`}
                      onClick={() => setIsActive(false)}
                    >
                      Ngừng công tác
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin học vị (Bảng thêm nhiều bằng cấp như thiết kế) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <h3 className="form-section-title" style={{ marginBottom: 0, flex: 1 }}>
                Học vị
              </h3>
              <button
                type="button"
                className="btn btn-default"
                style={{ padding: "5px 12px", fontSize: "0.8rem", marginLeft: "12px" }}
                onClick={handleAddDegree}
              >
                <Plus size={14} />
                <span>Thêm</span>
              </button>
            </div>

            <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px" }}>
              <table className="custom-table" style={{ fontSize: "0.82rem" }}>
                <thead>
                  <tr>
                    <th style={{ width: "140px" }}>Bậc</th>
                    <th>Trường</th>
                    <th>Chuyên ngành</th>
                    <th style={{ width: "120px" }}>Trạng thái</th>
                    <th style={{ width: "100px" }}>Tốt nghiệp</th>
                    <th style={{ width: "50px", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {degreesList.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                        Trống — Bấm <b>+ Thêm</b> để khai báo học vị
                      </td>
                    </tr>
                  ) : (
                    degreesList.map((deg, idx) => (
                      <tr key={idx}>
                        <td>
                          <select
                            className="form-control"
                            style={{ padding: "6px 8px", fontSize: "0.8rem", width: "100%" }}
                            value={deg.type}
                            onChange={(e) => handleDegreeChange(idx, "type", e.target.value)}
                          >
                            <option value="Bachelor">Cử nhân (Bachelor)</option>
                            <option value="Master">Thạc sĩ (Master)</option>
                            <option value="Doctorate">Tiến sĩ (Doctorate)</option>
                            <option value="Cử nhân">Cử nhân</option>
                            <option value="Thạc sĩ">Thạc sĩ</option>
                            <option value="Tiến sĩ">Tiến sĩ</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            style={{ padding: "6px 8px", fontSize: "0.8rem", width: "100%" }}
                            placeholder="Tên trường..."
                            value={deg.school}
                            onChange={(e) => handleDegreeChange(idx, "school", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            style={{ padding: "6px 8px", fontSize: "0.8rem", width: "100%" }}
                            placeholder="Chuyên ngành..."
                            value={deg.major}
                            onChange={(e) => handleDegreeChange(idx, "major", e.target.value)}
                          />
                        </td>
                        <td>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={deg.isGraduated}
                              onChange={(e) => handleDegreeChange(idx, "isGraduated", e.target.checked)}
                            />
                            <span>Hoàn thành</span>
                          </label>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            style={{ padding: "6px 8px", fontSize: "0.8rem", width: "85px" }}
                            placeholder="Năm"
                            value={deg.year}
                            onChange={(e) => handleDegreeChange(idx, "year", e.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveDegree(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                            title="Xóa bằng cấp này"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
              style={{ minWidth: "120px", justifyContent: "center" }}
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

export default TeacherDrawer;
