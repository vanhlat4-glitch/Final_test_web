import React, { useState, useEffect } from "react";
import { GraduationCap, ShieldCheck, Clock } from "lucide-react";

export const Header = () => {
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
        <div className="admin-profile">
          <div className="admin-avatar">
            <ShieldCheck size={18} color="#4f46e5" />
          </div>
          <div className="admin-info">
            <span className="admin-name">Quản trị viên</span>
            <span className="admin-role-badge">ADMIN</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
