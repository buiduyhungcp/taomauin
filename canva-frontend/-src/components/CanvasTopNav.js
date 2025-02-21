// src/components/CanvasTopNav.js
import React from 'react';
import './CanvasTopNav.css';
import UserPanel from './UserPanel';

const CanvasTopNav = ({ user, onLoginButtonClick, onRegisterButtonClick, isMobile, onLogout }) => {
  return (
    <div className="canvas-top-nav">
      <div className="left-section">
        <input type="text" placeholder="Tìm kiếm..." className="search-box" />
      </div>
      <div className="right-section">
        {user ? (
          <UserPanel user={user} onLogout={onLogout} />
        ) : (
          <div className="auth-buttons">
            <button onClick={onLoginButtonClick} className="login-btn">Đăng nhập</button>
            <button onClick={onRegisterButtonClick} className="register-btn">Đăng ký</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasTopNav;
