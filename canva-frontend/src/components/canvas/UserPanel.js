// src/components/UserPanel.js
import React, { useState } from 'react';
import './UserPanel.css';

const UserPanel = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(prev => !prev);
  };

  return (
    <div className="user-panel" onClick={toggleDropdown}>
      <div className="user-info">
        <div className="greeting">Xin chào</div>
        <div className="fullname">{user.fullName}</div>
      </div>
      <div className="arrow-container">
        <span className="dropdown-arrow">▼</span>
      </div>
      {showDropdown && (
        <div className="dropdown-menu">
          <div className="dropdown-item">Thông tin tài khoản</div>
          <div className="dropdown-item">Cài đặt</div>
          <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); onLogout(); }}>Thoát</div>
        </div>
      )}
    </div>
  );
};

export default UserPanel;
