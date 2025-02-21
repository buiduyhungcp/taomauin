// src/components/NavigationMenu.js
import React from 'react';
import './NavigationMenu.css';
import HomeIcon from './../../assets/icons/home.png';
import DesignIcon from './../../assets//icons/design.png';
import CreateIcon from './../../assets//icons/create.png';
import OtherIcon from './../../assets//icons/other.png';

import MenuIcon from './../../assets//icons/menu.png'; 

const menuItems = [
  { id: 'Home', label: 'Trang chủ', icon: HomeIcon },
  { id: 'Create', label: 'Tạo mẫu', icon: CreateIcon },
  { id: 'Design', label: 'Thiết kế mẫu', icon: DesignIcon },
  { id: 'Other', label: 'Khác', icon: OtherIcon },
];

const NavigationMenu = ({ activePage, setActivePage, isMobile, onControlPanelToggle, user }) => {
  return (
    <div className="navigation-menu">
      {isMobile && (
        <button className="cp-toggle-btn" onClick={onControlPanelToggle}>
          <img src={MenuIcon} alt="Menu" className="menu-icon" />
        </button>
      )}
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`nav-button ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
        >
          <img src={item.icon} alt={item.label} className="nav-icon" />
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default NavigationMenu;
