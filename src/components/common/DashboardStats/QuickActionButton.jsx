import React from 'react';

const QuickActionButton = ({ label, onClick }) => {
  return (
    <button className="quick-action-btn" onClick={onClick}>
      {label}
    </button>
  );
};

export default QuickActionButton;