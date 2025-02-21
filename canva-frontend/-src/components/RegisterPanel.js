// src/components/RegisterPanel.js
import React, { useState, useEffect } from 'react';
import './RegisterPanel.css';

const generateCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let captcha = '';
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

const RegisterPanel = ({ onClose, onRegister }) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState(''); // New field: Họ và tên
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  };

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu không khớp');
      return;
    }
    if (captchaInput !== captcha) {
      setErrorMsg('Mã xác nhận không đúng');
      return;
    }
    const registrationData = {
      username,
      fullName, // Include fullName in registration data
      password,
      phone,
      email,
      address,
    };
    onRegister(registrationData);
    onClose();
  };

  return (
    <div className="register-panel-overlay">
      <div className="register-panel">
        <button className="close-icon" onClick={onClose}>×</button>
        <h2>Đăng ký</h2>
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
        <label>
          Tài khoản:
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
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
        <label>
          Nhập lại mật khẩu:
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
        </label>
        <label>
          Họ và tên:
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
          />
        </label>
        <label>
          Số điện thoại:
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
          />
        </label>
        <label>
          Email:
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </label>
        <label>
          Địa chỉ:
          <input 
            type="text" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
          />
        </label>
        <label>
          Mã xác nhận:
          <div className="captcha-container">
            <input 
              type="text" 
              value={captchaInput} 
              onChange={(e) => setCaptchaInput(e.target.value)} 
              placeholder="Nhập mã" 
            />
            <div className="captcha-display" onClick={refreshCaptcha}>
              {captcha}
            </div>
          </div>
        </label>
        <div className="register-buttons">
          <button onClick={handleRegister} className="register-btn">Đăng ký</button>
          <button onClick={onClose} className="close-btn">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPanel;
