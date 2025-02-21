// src/components/CategoryTree.js
import React, { useState } from "react";
import "./CategoryTree.css";

const CategoryItem = ({ category, level = 0, onSelectCategory, selectedId }) => {
  const [expanded, setExpanded] = useState(false);
  const hasSub = category.subcategories && category.subcategories.length > 0;

  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (hasSub) {
      // Toggle expansion when clicking on the name
      setExpanded(!expanded);
    } else {
      onSelectCategory(category);
    }
  };

  // At level 2 (and deeper if needed), apply active style if selected
  const isActive = (!hasSub && level === 2 && category.id === selectedId);
  const headerClass = `category-header${(hasSub && expanded) || isActive ? " active" : ""}`;

  return (
    <div className={`category-item level-${level}`}>
      <div className={headerClass} onClick={handleClick}>
        {hasSub && (
          <span className="toggle-icon" onClick={handleToggle}>
            {expanded ? "\u25BC" : "\u25B6"}
          </span>
        )}
        <span className="category-name">{category.cat_name}</span>
      </div>
      {hasSub && expanded && (
        <div className="subcategory-list">
          {category.subcategories.map((sub) => (
            <CategoryItem
              key={sub.id}
              category={sub}
              level={level + 1}
              onSelectCategory={onSelectCategory}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree = ({ categories, onSelectCategory, selectedId }) => {
  // Sort categories based on level:
  // - For level 0 and level 1, sort by id (ascending)
  // - For level >= 2, sort alphabetically by cat_name
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

  const sortedCategories = sortCategories([...categories], 0);

  return (
    <div className="category-tree">
      {sortedCategories.map((cat) => (
        <CategoryItem
          key={cat.id}
          category={cat}
          onSelectCategory={onSelectCategory}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
};

export default CategoryTree;
