// src/components/controlpanel/ControlPanel.js
import React, { useState, useEffect } from "react";
import "./ControlPanel.css";
import CategoryTree from "./CategoryTree";
import Logo from "./../../assets/icons/logo.png";

// Import các trang con từ controlpanel/pages
import HomePage from "./pages/homePage";
import DesignPage from "./pages/designPage";
import OtherPage from "./pages/otherPage";

const ControlPanel = ({
  activePage,
  selectedCategory = { id: 0, cat_name: "Trang chính" },
  onCategorySelect,
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch danh mục khi activePage thuộc nhóm Tạo mẫu (Create, Tạo mẫu, CreateApp)
  useEffect(() => {
    if (
      activePage === "Tạo mẫu" ||
      activePage === "Create" ||
      activePage === "CreateApp"
    ) {
      fetch("http://192.168.1.122:5000/api/categories")
        .then((res) => res.json())
        .then((data) => {
          const tree = buildCategoryTree(data);
          const sortedTree = sortCategories(tree, 0);
          setCategories(sortedTree);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Lỗi tải danh mục:", error);
          setLoading(false);
        });
    }
  }, [activePage]);

  const buildCategoryTree = (data) => {
    let tree = [];
    let lookup = {};
    data.forEach((cat) => {
      lookup[cat.id] = { ...cat, subcategories: [] };
    });
    data.forEach((cat) => {
      if (cat.cat_home === 0) {
        tree.push(lookup[cat.id]);
      } else if (lookup[cat.cat_home]) {
        lookup[cat.cat_home].subcategories.push(lookup[cat.id]);
      }
    });
    return tree;
  };

  const sortCategories = (cats, level = 0) => {
    if (level < 2) {
      cats.sort((a, b) => a.id - b.id);
    } else {
      cats.sort((a, b) => a.cat_name.localeCompare(b.cat_name));
    }
    cats.forEach((cat) => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        sortCategories(cat.subcategories, level + 1);
      }
    });
    return cats;
  };

  const handleSelectCategory = (cat) => {
    if (onCategorySelect) {
      onCategorySelect(cat);
    }
  };

  // Xác định active của nút "Trang chính" dựa trên selectedCategory.id === 0
  const isTrangChinhActive = selectedCategory.id === 0;

  return (
    <div className="control-panel">
      <div className="cp-header">
        <img src={Logo} alt="Logo" className="cp-logo" />
      </div>
      <div className="cp-content">
        {activePage === "Tạo mẫu" ||
        activePage === "Create" ||
        activePage === "CreateApp" ? (
          <>
            <div
              className={`trang-chinh-button ${isTrangChinhActive ? "active" : ""}`}
              onClick={() =>
                handleSelectCategory({ id: 0, cat_name: "Trang chính" })
              }
            >
              <span className="category-name">Trang chính</span>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <CategoryTree
                categories={categories}
                onSelectCategory={handleSelectCategory}
                selectedId={selectedCategory.id}
              />
            )}
          </>
        ) : activePage === "Trang chủ" || activePage === "Home" ? (
          <HomePage />
        ) : activePage === "Thiết kế" || activePage === "Design" ? (
          <DesignPage />
        ) : activePage === "Khác" || activePage === "Other" ? (
          <OtherPage />
        ) : (
          <div style={{ padding: "10px" }}>
            <p>Không có nội dung hiển thị.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
