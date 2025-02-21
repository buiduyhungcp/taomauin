// src/components/ContentCreate.js
import React from 'react';
import './ContentCreate.css';

const ContentCreate = ({ category }) => {
  return (
    <div className="content-create">
      <h2>Danh mục: {category}</h2>
      <p>
        Đây là trang ContentCreate, nơi hiển thị mẫu thư khen dựa trên danh mục được chọn.
        Dữ liệu đầu vào sẽ được tải theo danh mục, và các chức năng tùy chỉnh mẫu sẽ được bổ sung dần.
      </p>
    </div>
  );
};

export default ContentCreate;
