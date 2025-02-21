// src/components/NotificationDialog.js
import React from 'react';
import './NotificationDialog.css';

const NotificationDialog = ({ message, onClose }) => {
  return (
    <div className="notification-overlay">
      <div className="notification-dialog">
        <span className="close-notification" onClick={onClose}>×</span>
        <p>{message}</p>
        <button onClick={onClose} className="notification-btn">OK</button>
      </div>
    </div>
  );
};

export default NotificationDialog;
