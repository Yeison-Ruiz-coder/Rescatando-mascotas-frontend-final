// src/components/common/Accordion/Accordion.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Accordion.css';

// Item individual del accordion
export const AccordionItem = ({
  title,
  children,
  isOpen: controlledIsOpen,
  onToggle,
  defaultOpen = false,
  icon = 'fas fa-chevron-down',
  iconOpen = null,
  showIcon = true
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!isOpen);
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const chevronIcon = (isOpen && iconOpen) ? iconOpen : icon;

  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={handleToggle}>
        <span className="accordion-title">{title}</span>
        {showIcon && (
          <i className={`accordion-icon ${chevronIcon} ${isOpen ? 'open' : ''}`}></i>
        )}
      </div>
      <div
        ref={contentRef}
        className={`accordion-content ${isOpen ? 'open' : ''}`}
        style={{ maxHeight: isOpen ? contentHeight : 0 }}
      >
        <div className="accordion-content-inner">{children}</div>
      </div>
    </div>
  );
};

// Grupo de accordion (permite múltiples abiertos o solo uno)
const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultOpenIndexes = [],
  className = ''
}) => {
  const [openIndexes, setOpenIndexes] = useState(defaultOpenIndexes);

  const handleToggle = (index) => {
    if (allowMultiple) {
      setOpenIndexes(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenIndexes(prev => prev.includes(index) ? [] : [index]);
    }
  };

  return (
    <div className={`accordion-collage ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={openIndexes.includes(index)}
          onToggle={() => handleToggle(index)}
          icon={item.icon}
          iconOpen={item.iconOpen}
          showIcon={item.showIcon !== false}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;