// src/components/ControlPanel.js
import React, { useState, useEffect } from "react";
import "./ControlPanel.css";
import CategoryTree from "./CategoryTree";
import Logo from "./../assets/icons/logo.png";

const ControlPanel = ({ activePage }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(0);

  useEffect(() => {
    fetch('http://192.168.1.122:5000/api/categories')
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
  }, []);

  // Build tree from flat list based on cat_home value
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

  // Sort categories: 
  // - Level 0 and level 1 by id (ascending)
  // - Level 2 and deeper by cat_name (alphabetically)
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
    console.log("Chọn danh mục:", cat);
    setSelectedCategory(cat.id);
    // Thêm logic để load danh sách mẫu cho danh mục được chọn
  };

  // "Trang chính" button (cấp 0)
  const renderTrangChinhButton = () => {
    const isActive = selectedCategory === 0;
    return (
      <div
        className={`trang-chinh-button ${isActive ? "active" : ""}`}
        onClick={() => {
          setSelectedCategory(0);
          handleSelectCategory({ id: 0, cat_name: "Trang chính" });
        }}
      >
        <span className="category-name">Trang chính</span>
      </div>
    );
  };

  const renderContent = () => {
    if (activePage === "Tạo mẫu" || activePage === "Create") {
      return loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {renderTrangChinhButton()}
          <CategoryTree
            categories={categories}
            onSelectCategory={handleSelectCategory}
            selectedId={selectedCategory}
          />
        </>
      );
    } else {
      return (
        <div style={{ padding: "10px" }}>
          <p>Danh mục chỉ áp dụng cho trang tạo mẫu.</p>
        </div>
      );
    }
  };

  return (
    <div className="control-panel">
      <div className="cp-header">
        <img src={Logo} alt="Logo" className="cp-logo" />
      </div>
      <div className="cp-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ControlPanel;
