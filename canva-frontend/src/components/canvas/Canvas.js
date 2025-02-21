// src/components/canvas/Canvas.js 
import React from 'react';
import './Canvas.css';
import CanvasTopNav from './CanvasTopNav';
import HomepageCreate from '../../pages/HomepageCreate';
import ContentCreate from '../../pages/ContentCreate';
import CreateApp from '../../pages/CreateApp';
import HomePage from '../controlpanel/pages/homePage';
import DesignPage from '../controlpanel/pages/designPage';
import OtherPage from '../controlpanel/pages/otherPage';

const Canvas = ({
  activePage,
  onLoginButtonClick,
  onRegisterButtonClick,
  user,
  onLogout,
  selectedCategory,
  onTemplateSelect,
  selectedTemplate,
}) => {
  const renderContent = () => {
    if (activePage === 'Tạo mẫu' || activePage === 'Create') {
      return selectedCategory && selectedCategory.id !== 0
        ? <ContentCreate category={selectedCategory} onTemplateSelect={onTemplateSelect} />
        : <HomepageCreate />;
    } else if (activePage === 'CreateApp') {
      return <CreateApp selectedTemplate={selectedTemplate} />;
    } else if (activePage === 'Trang chủ' || activePage === 'Home') {
      return <HomePage />;
    } else if (activePage === 'Thiết kế' || activePage === 'Design') {
      return <DesignPage />;
    } else if (activePage === 'Khác' || activePage === 'Other') {
      return <OtherPage />;
    } else {
      return <div style={{ padding: '20px' }}>Không có nội dung.</div>;
    }
  };

  return (
    <div className="canvas">
      <CanvasTopNav
        user={user}
        onLoginButtonClick={onLoginButtonClick}
        onRegisterButtonClick={onRegisterButtonClick}
        onLogout={onLogout}
        activePage={activePage}
      />
      <div className="canvas-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Canvas;
