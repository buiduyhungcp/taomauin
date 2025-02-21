import React from 'react';

const CreateApp = ({ selectedTemplate }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Create App Page</h1>
      {selectedTemplate ? (
        <>
          <h2>{selectedTemplate.title}</h2>
          <p>{selectedTemplate.author}</p>
          <img src={selectedTemplate.image} alt={selectedTemplate.title} />
        </>
      ) : (
        <p>No template selected</p>
      )}
    </div>
  );
};

export default CreateApp;
