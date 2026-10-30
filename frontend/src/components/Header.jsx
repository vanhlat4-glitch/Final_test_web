import React, { useState, useEffect } from "react";
import { GraduationCap, ShieldCheck, Clock, Sun, Moon, LogOut } from "lucide-react";

export const Header = ({ currentUser, onLogout, darkMode, onToggleDarkMode }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    const d = pad(date.getDate());
    const m = pad(date.getMonth() + 1);
    const y = date.getFullYear();
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <div className="brand-block">
          <div className="brand-icon-wrap">
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <div className="brand-text-wrap">
            <span className="brand-name">EduCore System</span>
          </div>
        </div>

        <div className="navbar-meta">
          <span className="datetime-badge">
            <Clock size={14} />
            <span>{formatDateTime(now)}</span>
          </span>
          <span className="system-tag">Hệ thống Quản trị Trường học</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Nút chuyển đổi Chế độ Sáng / Tối */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleDarkMode}
          title={darkMode ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
        >
          {darkMode ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#4f46e5" />}
          <span>{darkMode ? "Chế độ Sáng" : "Chế độ Tối"}</span>
        </button>

        {/* Thông tin người dùng đang đăng nhập */}
        {currentUser && (
          <div className="admin-profile">
            <div className="admin-avatar">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <ShieldCheck size={18} color="#4f46e5" />
              )}
            </div>
            <div className="admin-info">
              <span className="admin-name">{currentUser.name || "Quản trị viên"}</span>
              <span className="admin-role-badge">{currentUser.role || "ADMIN"}</span>
            </div>
          </div>
        )}

        {/* Nút Đăng xuất */}
        {currentUser && (
          <button
            type="button"
            className="logout-btn"
            onClick={onLogout}
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
