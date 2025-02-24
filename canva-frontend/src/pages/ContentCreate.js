// src/pages/ContentCreate.js
import React, { useState, useEffect } from 'react';
import './ContentCreate.css';

// Hàm importAll để import tất cả ảnh từ thư mục demo
function importAll(r) {
  let images = {};
  r.keys().forEach((item) => {
    const key = item.replace('./', '');
    const moduleData = r(item);
    images[key] = moduleData.default || moduleData;
  });
  return images;
}

// Import tất cả ảnh từ thư mục src/images/demo
const demoImages = importAll(require.context('../images/demo', false, /\.(png|jpe?g|svg)$/));

const ContentCreate = ({ category, onTemplateSelect = () => {} }) => {
  // Panel hiển thị thông tin danh mục
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

  // State quản lý danh sách templates và trạng thái loading
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Phân trang
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [fade, setFade] = useState(false);

  // Fetch danh sách templates khi category thay đổi (và category.id khác 0)
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

  // Hiệu ứng fade khi chuyển trang
  useEffect(() => {
    setFade(true);
    const timer = setTimeout(() => setFade(false), 500);
    return () => clearTimeout(timer);
  }, [currentPage]);

  // Tính tổng số trang và xác định danh sách templates của trang hiện tại
  const totalPages = Math.ceil(templates.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTemplates = templates.slice(indexOfFirst, indexOfLast);

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
          <p className="category-description" dangerouslySetInnerHTML={{ __html: description }}></p>
        </div>
        <div className="content-image">
          <img src={imageSrc} alt="Ảnh gốc" />
        </div>
      </div>

      {/* Grid hiển thị templates với phân trang */}
      <div className="templates-grid-container">
        {loadingTemplates ? (
          <p>Loading templates...</p>
        ) : (
          <>
            <div className={`templates-grid ${fade ? 'fade' : ''}`}>
              {currentTemplates.map((tpl) => (
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
                      // Gọi callback truyền đối tượng mẫu đã chọn để ControlPanel xử lý điều hướng
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
              ))}
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
