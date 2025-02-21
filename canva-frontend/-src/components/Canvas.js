// src/components/Canvas.js
import React from 'react';
import './Canvas.css';
import CanvasTopNav from './CanvasTopNav';
import HomepageCreate from './HomepageCreate';
import ContentCreate from './ContentCreate';

const Canvas = ({ activePage, onLoginButtonClick, onRegisterButtonClick, isMobile, onLogout, user }) => {
  let content;
  // Khi activePage là "Trang chính", hiển thị HomepageCreate,
  // nếu không thì hiển thị ContentCreate với dữ liệu là activePage (danh mục con)
  if (activePage === "Trang chính") {
    content = <HomepageCreate />;
  } else {
    content = <ContentCreate category={activePage} />;
  }

  return (
    <div className="canvas">
      <CanvasTopNav 
        user={user}
        onLoginButtonClick={onLoginButtonClick}
        onRegisterButtonClick={onRegisterButtonClick}
        isMobile={isMobile}
        onLogout={onLogout}
      />
      <div className="canvas-content">
        {content}
      </div>
    </div>
  );
};

export default Canvas;
