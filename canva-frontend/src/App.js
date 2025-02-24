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
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './App.css';

const socket = io('http://192.168.1.122:5000');

function App() {
  const [activePage, setActivePage] = useState('Home');
  const [user, setUser] = useState(null);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState({ id: 0, cat_name: 'Trang chính' });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState('');
  const [showRegisterPanel, setShowRegisterPanel] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [notification, setNotification] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // State fonts: danh sách font được lấy động từ backend (database)
  const [fonts, setFonts] = useState([]);

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

  // Fetch danh sách font từ backend qua endpoint /api/fonts
  useEffect(() => {
    fetch('http://192.168.1.122:5000/api/fonts')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFonts(data);
        }
      })
      .catch(err => console.error("Error fetching fonts:", err));
  }, []);

  // Khi fonts được fetch, tạo khai báo @font-face và chèn vào thẻ <style id="dynamic-fonts">
  useEffect(() => {
    if (fonts.length > 0) {
      let styleContent = "";
      fonts.forEach((font) => {
        // Giả sử font.path_font chứa tên file, ví dụ: "TenFont.ttf"
        // Và các file này nằm trong public/fonts
        styleContent += `
          @font-face {
            font-family: '${font.name}';
            src: url('fonts/${font.path_font}') format('truetype');
          }
        `;
      });
      console.log("Dynamic font-face declarations:", styleContent);
      const dynamicFontsEl = document.getElementById("dynamic-fonts");
      if (dynamicFontsEl) {
        dynamicFontsEl.innerHTML = styleContent;
      }
    }
  }, [fonts]);

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

  const handleNavigationClick = (page) => {
    if (page !== 'Home' && !user) {
      openLogin("Bạn phải đăng nhập để tiếp tục!");
    } else {
      if ((page === 'Tạo mẫu' || page === 'Create') && activePage !== page) {
        setSelectedTemplateCategory({ id: 0, cat_name: 'Trang chính' });
      }
      setActivePage(page);
    }
  };

  const handleCategorySelect = (cat) => {
    setSelectedTemplateCategory(cat);
    if (cat.id !== 0) {
      setActivePage('Tạo mẫu');
    }
  };

  const handleTemplateSelect = (tpl) => {
    setSelectedTemplate(tpl);
    setActivePage('CreateApp');
  };

  const handleLoginButtonClick = () => openLogin('');
  const handleRegisterButtonClick = () => setShowRegisterPanel(true);
  const toggleControlPanel = () => setShowControlPanel(prev => !prev);

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
          fonts={fonts}  // Truyền danh sách font xuống Canvas nếu cần
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
