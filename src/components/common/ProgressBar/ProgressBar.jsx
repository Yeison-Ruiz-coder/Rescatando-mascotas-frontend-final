// src/components/common/ProgressBar/ProgressBar.jsx
import React, { useEffect, useState } from 'react';
import './ProgressBar.css';

const ProgressBar = ({ 
  progress = 0,
  height = '6px',
  animated = true,
  variant = 'primary'
}) => {
  const [internalProgress, setInternalProgress] = useState(progress);

  useEffect(() => {
    setInternalProgress(Math.min(100, Math.max(0, progress)));
  }, [progress]);

  return (
    <div className="progress-bar-container">
      <div 
        className={`progress-bar-track ${variant}`}
        style={{ height }}
      >
        <div 
          className={`progress-bar-fill ${animated ? 'animated' : ''} ${variant}`}
          style={{ width: `${internalProgress}%` }}
        />
      </div>
    </div>
  );
};

// Componente de carga simple y grande
export const SimpleLoadingBar = ({ 
  progress, 
  height = '12px',
  variant = 'gradient'
}) => {
  return (
    <div className="simple-loading-container">
      <div className="simple-loading-card">
        <ProgressBar 
          progress={progress}
          variant={variant}
          animated={true}
          height={height}
        />
      </div>
    </div>
  );
};

export default ProgressBar;