// src/pages/ContentCreate.js
import React, { useState, useEffect } from 'react';
import './ContentCreate.css';

// Hàm importAll để import tất cả ảnh từ thư mục demo
function importAll(r) {
  let images = {};
  console.log("require.context keys:", r.keys());
  
  r.keys().forEach((item) => {
    const key = item.replace('./', '');
    const moduleData = r(item);
    console.log("Loading image: key =", key, moduleData);
    images[key] = moduleData.default || moduleData; // fallback
  });
  
  console.log("Imported images:", images);
  return images;
}

// Import tất cả ảnh từ thư mục src/images/demo
const demoImages = importAll(require.context('../images/demo', false, /\.(png|jpe?g|svg)$/));

const ContentCreate = ({ category, onTemplateSelect = () => {} }) => {
  // Phần Panel ở trên
  const panelStyle = {
    background: (category && category.blend1 && category.blend2)
      ? `linear-gradient(to right, ${category.blend1}, ${category.blend2})`
      : 'linear-gradient(to right, #AFD788, #489620)'
  };

  const textColor = category && category.color ? category.color : '#fff';
  const description = category && category.description 
    ? category.description 
    : 'Giới thiệu về danh mục.';
  const imageSrc = category && category.images
    ? category.images
    : 'https://placehold.co/300x200@2x.png';

  // State để lưu templates và trạng thái loading
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Pagination
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);

  // Biến state để hiệu ứng fade khi chuyển trang
  const [fade, setFade] = useState(false);

  // Khi category.id khác 0 => fetch templates
  useEffect(() => {
    if (category && category.id && category.id !== 0) {
      setLoadingTemplates(true);
      fetch(`http://192.168.1.122:5000/api/templates?cat_id=${category.id}`)
        .then((res) => res.json())
        .then((data) => {
          setTemplates(data);
          setLoadingTemplates(false);
          setCurrentPage(1); // reset trang khi danh mục thay đổi
        })
        .catch((err) => {
          console.error("Lỗi fetch templates:", err);
          setLoadingTemplates(false);
        });
    }
  }, [category]);

  // Tính toán tổng số trang
  const totalPages = Math.ceil(templates.length / itemsPerPage);

  // Mỗi khi currentPage thay đổi => hiệu ứng fade
  useEffect(() => {
    setFade(true);
    const timer = setTimeout(() => setFade(false), 500);
    return () => clearTimeout(timer);
  }, [currentPage]);

  // Lấy ra danh sách templates của trang hiện tại
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTemplates = templates.slice(indexOfFirst, indexOfLast);

  // Hàm xử lý chuyển trang
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="content-create-container">
      {/* Panel hiển thị thông tin danh mục */}
      <div className="content-create-panel" style={panelStyle}>
        <div className="content-text" style={{ color: textColor }}>
          <h2>{category ? category.cat_name : "Danh mục"}</h2>
          <p
  className="category-description"
  dangerouslySetInnerHTML={{ __html: description }}
></p>
        </div>
        <div className="content-image">
          <img src={imageSrc} alt="Ảnh gốc" />
        </div>
      </div>

      {/* Grid các mẫu với phân trang */}
      <div className="templates-grid-container">
        {loadingTemplates ? (
          <p>Loading templates...</p>
        ) : (
          <>
            <div className={`templates-grid ${fade ? 'fade' : ''}`}>
              {currentTemplates.map((tpl) => {
                console.log("tpl.demo:", tpl.demo);
                console.log("demoImages[tpl.demo]:", demoImages[tpl.demo]);

                return (
                  <div key={tpl.id} className="template-card">
                    <img
                      src={
                        tpl.demo && demoImages[tpl.demo]
                          ? demoImages[tpl.demo]
                          : 'https://placehold.co/300x200@2x.png'
                      }
                      alt={tpl.name}
                      onClick={(e) => {
                        e.preventDefault();
                        onTemplateSelect(tpl);
                      }}
                    />
                    <h3>
                      <a
                        href="#"
                        className="template-title-link"
                        onClick={(e) => {
                          e.preventDefault();
                          onTemplateSelect(tpl);
                        }}
                      >
                        {tpl.name}
                      </a>
                    </h3>
                  </div>
                );
              })}
            </div>
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? 'active' : ''}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContentCreate;
