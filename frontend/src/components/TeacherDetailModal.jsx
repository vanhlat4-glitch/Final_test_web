import React from "react";
import { X, User, Briefcase, GraduationCap, Calendar, MapPin, Phone, Mail, Edit, Trash2 } from "lucide-react";

export const TeacherDetailModal = ({ teacher, onClose, onEdit, onDelete }) => {
  if (!teacher) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="card"
        style={{
          width: "90%",
          maxWidth: "600px",
          margin: "auto",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div className="drawer-title">
            <User size={20} color="var(--brand-blue)" />
            <span>Chi tiết giáo viên: {teacher.name}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body" style={{ overflowY: "auto" }}>
          {/* Top Profile Summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--border-color)",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#dbeafe",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "1.25rem",
                overflow: "hidden",
              }}
            >
              {teacher.avatar ? (
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : teacher.name ? (
                teacher.name.charAt(0).toUpperCase()
              ) : (
                "G"
              )}
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a" }}>
                {teacher.name}
              </h2>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Mã GV: <b>{teacher.code}</b>
                </span>
                {teacher.isActive ? (
                  <span className="badge badge-success">Đang công tác</span>
                ) : (
                  <span className="badge badge-secondary">Ngừng công tác</span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Mail size={16} color="var(--text-muted)" />
              <span style={{ color: "var(--text-muted)", width: "100px" }}>Email:</span>
              <span style={{ fontWeight: "600" }}>{teacher.email || "—"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Phone size={16} color="var(--text-muted)" />
              <span style={{ color: "var(--text-muted)", width: "100px" }}>Số điện thoại:</span>
              <span style={{ fontWeight: "600" }}>{teacher.phoneNumber || "—"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <MapPin size={16} color="var(--text-muted)" />
              <span style={{ color: "var(--text-muted)", width: "100px" }}>Địa chỉ:</span>
              <span>{teacher.address || "—"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Briefcase size={16} color="var(--text-muted)" />
              <span style={{ color: "var(--text-muted)", width: "100px" }}>Vị trí công tác:</span>
              <span style={{ fontWeight: "600", color: "#0284c7" }}>
                {teacher.positionNames || "Chưa phân vị trí"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Calendar size={16} color="var(--text-muted)" />
              <span style={{ color: "var(--text-muted)", width: "100px" }}>Ngày vào:</span>
              <span>{teacher.startDate ? new Date(teacher.startDate).toLocaleDateString("vi-VN") : "—"}</span>
            </div>
          </div>

          {/* Degrees */}
          <h4
            style={{
              fontSize: "0.95rem",
              fontWeight: "700",
              marginTop: "20px",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <GraduationCap size={18} color="var(--brand-blue)" />
            <span>Học vị & Bằng cấp</span>
          </h4>

          {teacher.degrees && teacher.degrees.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {teacher.degrees.map((deg, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "10px",
                    background: "#f8fafc",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ fontWeight: "700", color: "#1e293b" }}>
                    {deg.type}: {deg.major || "Chuyên ngành chung"}
                  </div>
                  <div style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                    Trường: {deg.school || "—"} | Năm tốt nghiệp: {deg.year || "—"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Chưa cập nhật thông tin bằng cấp.
            </div>
          )}
        </div>

        <div className="drawer-footer">
          {onDelete && (
            <button
              type="button"
              className="btn btn-default"
              style={{
                color: "#dc2626",
                borderColor: "#fecaca",
                background: "#fef2f2",
                marginRight: "auto",
              }}
              onClick={() => onDelete(teacher)}
            >
              <Trash2 size={15} />
              <span>Xóa giáo viên</span>
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onEdit(teacher)}
            >
              <Edit size={15} />
              <span>Cập nhật / Thăng chức</span>
            </button>
          )}
          <button className="btn btn-default" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailModal;
