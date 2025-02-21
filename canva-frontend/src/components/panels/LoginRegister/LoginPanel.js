// src/components/LoginPanel.js
import React, { useState } from 'react';
import './LoginPanel.css';

const LoginPanel = ({ onClose, onLogin, onRegisterLinkClick, errorMsg }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleLogin = () => {
    if (account && password) {
      onLogin({ username: account, password, remember });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  const handleRegisterLinkClick = (e) => {
    e.preventDefault();
    onClose();
    onRegisterLinkClick();
  };

  return (
    <div className="login-panel-overlay">
      <div className="login-panel">
        <button className="close-icon" onClick={onClose}>×</button>
        <h2>Đăng nhập</h2>
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Tài khoản:
            <input 
              type="text" 
              value={account} 
              onChange={(e) => setAccount(e.target.value)} 
            />
          </label>
          <label>
            Mật khẩu:
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </label>
          <div className="remember-register">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={remember} 
                onChange={(e) => setRemember(e.target.checked)} 
              />
              Ghi nhớ
            </label>
            <a href="#register" onClick={handleRegisterLinkClick} className="register-link">
              Bạn chưa có tài khoản? Đăng ký ngay!
            </a>
          </div>
          <div className="login-buttons">
            <button type="submit" className="login-btn">Đăng nhập</button>
            <button type="button" onClick={onClose} className="close-btn">Đóng</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPanel;
