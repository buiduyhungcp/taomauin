// src/App.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import NavigationMenu from './components/common/NavigationMenu';
import ControlPanel from './components/ControlPanel/ControlPanel';
import Canvas from './components/Canvas';
import LoginPanel from './components/LoginPanel';
import RegisterPanel from './components/RegisterPanel';
import NotificationDialog from './components/common/NotificationDialog';
import './App.css';

const socket = io('http://192.168.1.122:5000');

function App() {
  const [activePage, setActivePage] = useState('Home');
  const [user, setUser] = useState(null);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState('');
  const [showRegisterPanel, setShowRegisterPanel] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [notification, setNotification] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Load user from localStorage or cookie on mount
  useEffect(() => {
    const storedUserLocal = localStorage.getItem('user');
    const storedUserCookie = Cookies.get('user');
    if (storedUserLocal) {
      const usr = JSON.parse(storedUserLocal);
      setUser(usr);
      socket.emit('join', usr.id);
    } else if (storedUserCookie) {
      const usr = JSON.parse(storedUserCookie);
      setUser(usr);
      socket.emit('join', usr.id);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowControlPanel(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for forceLogout event from server
  useEffect(() => {
    socket.on('forceLogout', (data) => {
      setNotification(data.message);
      setUser(null);
      localStorage.removeItem('user');
      Cookies.remove('user');
    });
    return () => {
      socket.off('forceLogout');
    };
  }, []);

  const openLogin = (errorMessage) => {
    setLoginErrorMsg(errorMessage);
    setShowLoginPanel(true);
  };

  const handleNavigationClick = (page) => {
    if (page !== 'Home' && !user) {
      openLogin("Bạn phải đăng nhập để tiếp tục!");
    } else {
      setActivePage(page);
    }
  };

  const handleLoginButtonClick = () => {
    openLogin('');
  };

  const handleRegisterButtonClick = () => {
    setShowRegisterPanel(true);
  };

  const toggleControlPanel = () => {
    setShowControlPanel(prev => !prev);
  };

  const handleLogin = async (loginData) => {
    try {
      const response = await fetch('http://192.168.1.122:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      if (!response.ok) {
        setLoginErrorMsg(data.error);
        return;
      }
      setUser(data.user);
      setShowLoginPanel(false);
      setNotification("Đăng nhập thành công");
      // Save login state based on remember flag
      if (loginData.remember) {
        localStorage.setItem('user', JSON.stringify(data.user));
        Cookies.remove('user');
      } else {
        Cookies.set('user', JSON.stringify(data.user));
        localStorage.removeItem('user');
      }
      // Join user room via socket for real-time force logout
      socket.emit('join', data.user.id);
    } catch (error) {
      console.error(error);
      setLoginErrorMsg("Lỗi hệ thống: không thể kết nối đến cơ sở dữ liệu");
    }
  };

  const handleRegister = async (registrationData) => {
    try {
      const response = await fetch('http://192.168.1.122:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
        return;
      }
      setShowRegisterPanel(false);
      setNotification("Đăng ký thành công, bạn có thể đăng nhập ngay");
    } catch (error) {
      console.error(error);
    }
  };

  // Phần handleLogout trong App.js
const handleLogout = () => {
  setUser(null);
  localStorage.removeItem('user');
  Cookies.remove('user');
  setNotification("Bạn đã đăng xuất");
  setActivePage("Home"); // Chuyển về trang Home khi đăng xuất
};


  return (
    <div className="app-container">
      <NavigationMenu 
        activePage={activePage}
        setActivePage={handleNavigationClick}
        isMobile={isMobile}
        onControlPanelToggle={toggleControlPanel}
        user={user}
      />
      <div className="main-content">
        {!isMobile && <ControlPanel activePage={activePage} />}
        <Canvas 
          activePage={activePage}
          onLoginButtonClick={handleLoginButtonClick}
          onRegisterButtonClick={handleRegisterButtonClick}
          isMobile={isMobile}
          onLogout={handleLogout}
          user={user}
        />
      </div>
      {isMobile && (
        <div className={`control-panel-overlay ${showControlPanel ? 'open' : ''}`}>
          <ControlPanel activePage={activePage} />
        </div>
      )}
      {showLoginPanel && (
        <LoginPanel 
          onClose={() => setShowLoginPanel(false)}
          onLogin={handleLogin}
          onRegisterLinkClick={() => setShowRegisterPanel(true)}
          errorMsg={loginErrorMsg}
        />
      )}
      {showRegisterPanel && (
        <RegisterPanel 
          onClose={() => setShowRegisterPanel(false)}
          onRegister={handleRegister}
        />
      )}
      {notification && (
        <NotificationDialog 
          message={notification}
          onClose={() => setNotification('')}
        />
      )}
    </div>
  );
}

export default App;
