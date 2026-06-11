// src/components/common/Toggle/Toggle.jsx
import React from 'react';
import './Toggle.css';

const Toggle = ({
  label,
  checked,
  onChange,
  name,
  disabled = false,
  className = '',
  size = 'md', // sm, md, lg
  labelPosition = 'right' // left, right
}) => {
  const toggleId = `toggle-${name}-${Math.random().toString(36).substr(2, 9)}`;

  const sizes = {
    sm: { width: 40, height: 22, circleSize: 18 },
    md: { width: 52, height: 28, circleSize: 22 },
    lg: { width: 64, height: 34, circleSize: 28 }
  };

  const currentSize = sizes[size];

  const Wrapper = label ? 'label' : 'div';
  const wrapperClassName = `toggle-wrapper ${labelPosition === 'left' ? 'toggle-wrapper-reverse' : ''}`;

  const toggleElement = (
    <div className={`toggle-collage ${className}`} style={{ width: currentSize.width, height: currentSize.height }}>
      <input
        type="checkbox"
        id={toggleId}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="toggle-slider"></span>
    </div>
  );

  if (!label) return toggleElement;

  return (
    <Wrapper className={wrapperClassName} htmlFor={toggleId}>
      {labelPosition === 'left' && <span className="toggle-label">{label}</span>}
      {toggleElement}
      {labelPosition === 'right' && <span className="toggle-label">{label}</span>}
    </Wrapper>
  );
};

export default Toggle;