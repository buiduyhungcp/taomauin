// src/App.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import NavigationMenu from './components/common/NavigationMenu';
import ControlPanel from './components/controlpanel/ControlPanel';
import Canvas from './components/canvas/Canvas';
import LoginPanel from './components/panels/LoginRegister/LoginPanel';
import RegisterPanel from './components/panels/LoginRegister/RegisterPanel';
import NotificationDialog from './components/common/NotificationDialog';
import './App.css';

const socket = io('http://192.168.1.122:5000');

function App() {
  const [activePage, setActivePage] = useState('Home');
  const [user, setUser] = useState(null);
  // Quản lý danh mục được chọn cho phần Tạo mẫu (mặc định là Trang chính)
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState({ id: 0, cat_name: 'Trang chính' });
  // State cho mẫu được chọn khi click vào hyperlink trong ContentCreate
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState('');
  const [showRegisterPanel, setShowRegisterPanel] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [notification, setNotification] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Load user từ localStorage hoặc cookie khi mount
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

  useEffect(() => {
    socket.on('forceLogout', (data) => {
      setNotification(data.message);
      setUser(null);
      localStorage.removeItem('user');
      Cookies.remove('user');
    });
    return () => socket.off('forceLogout');
  }, []);

  const openLogin = (msg) => {
    setLoginErrorMsg(msg);
    setShowLoginPanel(true);
  };

  // Khi người dùng click chọn trang từ NavigationMenu
  const handleNavigationClick = (page) => {
    if (page !== 'Home' && !user) {
      openLogin("Bạn phải đăng nhập để tiếp tục!");
    } else {
      // Nếu chuyển sang Tạo mẫu (hoặc Create) và activePage chưa là Tạo mẫu,
      // reset danh mục về mặc định
      if ((page === 'Tạo mẫu' || page === 'Create') && activePage !== page) {
        setSelectedTemplateCategory({ id: 0, cat_name: 'Trang chính' });
      }
      setActivePage(page);
    }
  };

  // Khi người dùng chọn danh mục ở ControlPanel
  const handleCategorySelect = (cat) => {
    setSelectedTemplateCategory(cat);
    // Nếu danh mục được chọn không phải mặc định, chuyển activePage về "Tạo mẫu"
    if (cat.id !== 0) {
      setActivePage('Tạo mẫu');
    }
  };

  // Khi người dùng click vào hyperlink của mẫu trong ContentCreate
  const handleTemplateSelect = (tpl) => {
    setSelectedTemplate(tpl);
    setActivePage('CreateApp');
  };

  const handleLoginButtonClick = () => openLogin('');
  const handleRegisterButtonClick = () => setShowRegisterPanel(true);
  const toggleControlPanel = () => setShowControlPanel((prev) => !prev);

  const handleLogin = async (data) => {
    try {
      const response = await fetch('http://192.168.1.122:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await response.json();
      if (!response.ok) {
        setLoginErrorMsg(resData.error);
        return;
      }
      setUser(resData.user);
      setShowLoginPanel(false);
      setNotification("Đăng nhập thành công");
      if (data.remember) {
        localStorage.setItem('user', JSON.stringify(resData.user));
        Cookies.remove('user');
      } else {
        Cookies.set('user', JSON.stringify(resData.user));
        localStorage.removeItem('user');
      }
      socket.emit('join', resData.user.id);
    } catch (error) {
      console.error(error);
      setLoginErrorMsg("Lỗi hệ thống: không thể kết nối đến cơ sở dữ liệu");
    }
  };

  const handleRegister = async (data) => {
    try {
      const response = await fetch('http://192.168.1.122:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await response.json();
      if (!response.ok) {
        alert(resData.error);
        return;
      }
      setShowRegisterPanel(false);
      setNotification("Đăng ký thành công, bạn có thể đăng nhập ngay");
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    Cookies.remove('user');
    setNotification("Bạn đã đăng xuất");
    setActivePage("Home");
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
        {!isMobile && (
          <ControlPanel 
            activePage={activePage}
            selectedCategory={selectedTemplateCategory}
            onCategorySelect={handleCategorySelect}
          />
        )}
        <Canvas 
          activePage={activePage}
          user={user}
          isMobile={isMobile}
          onLoginButtonClick={handleLoginButtonClick}
          onRegisterButtonClick={handleRegisterButtonClick}
          onLogout={handleLogout}
          selectedCategory={selectedTemplateCategory}
          onTemplateSelect={handleTemplateSelect}
          selectedTemplate={selectedTemplate}
        />
      </div>
      {isMobile && (
        <div className={`control-panel-overlay ${showControlPanel ? 'open' : ''}`}>
          <ControlPanel 
            activePage={activePage}
            selectedCategory={selectedTemplateCategory}
            onCategorySelect={handleCategorySelect}
          />
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
