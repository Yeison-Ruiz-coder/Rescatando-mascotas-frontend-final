// PawBackground.jsx - Con opacidad ajustada para combinar con las capas
import React from 'react';

const PawBackground = () => {
  const paws = [
    // Fila superior
    { id: 1, x: 5, y: 8, size: 45, rotate: 15, type: 'pata1', opacity: 0.04 },
    { id: 2, x: 18, y: 10, size: 35, rotate: -20, type: 'pata2', opacity: 0.04 },
    { id: 3, x: 32, y: 6, size: 50, rotate: 30, type: 'pata3', opacity: 0.04 },
    { id: 4, x: 48, y: 12, size: 38, rotate: -10, type: 'pata4', opacity: 0.04 },
    { id: 5, x: 62, y: 5, size: 42, rotate: 45, type: 'pata2', opacity: 0.04 },
    { id: 6, x: 75, y: 9, size: 48, rotate: -35, type: 'pata6', opacity: 0.04 },
    { id: 7, x: 88, y: 7, size: 36, rotate: 20, type: 'pata1', opacity: 0.04 },
    { id: 8, x: 95, y: 14, size: 40, rotate: -15, type: 'pata2', opacity: 0.04 },
    { id: 9, x: 12, y: 18, size: 32, rotate: 50, type: 'pata3', opacity: 0.04 },
    { id: 10, x: 85, y: 20, size: 44, rotate: -25, type: 'pata4', opacity: 0.04 },
    
    // Fila media superior
    { id: 11, x: 8, y: 30, size: 50, rotate: 10, type: 'pata1', opacity: 0.04 },
    { id: 12, x: 22, y: 35, size: 38, rotate: -40, type: 'pata6', opacity: 0.04 },
    { id: 13, x: 38, y: 28, size: 42, rotate: 25, type: 'pata1', opacity: 0.04 },
    { id: 14, x: 52, y: 32, size: 48, rotate: -15, type: 'pata2', opacity: 0.04 },
    { id: 15, x: 68, y: 26, size: 36, rotate: 35, type: 'pata3', opacity: 0.04 },
    { id: 16, x: 82, y: 34, size: 52, rotate: -20, type: 'pata4', opacity: 0.04 },
    { id: 17, x: 92, y: 29, size: 34, rotate: 15, type: 'pata2', opacity: 0.04 },
    { id: 18, x: 15, y: 42, size: 44, rotate: -30, type: 'pata6', opacity: 0.04 },
    { id: 19, x: 45, y: 40, size: 38, rotate: 55, type: 'pata1', opacity: 0.04 },
    { id: 20, x: 75, y: 45, size: 46, rotate: -5, type: 'pata2', opacity: 0.04 },
    
    // Fila media inferior
    { id: 21, x: 5, y: 55, size: 40, rotate: 20, type: 'pata3', opacity: 0.04 },
    { id: 22, x: 18, y: 60, size: 48, rotate: -25, type: 'pata4', opacity: 0.04 },
    { id: 23, x: 35, y: 52, size: 36, rotate: 40, type: 'pata2', opacity: 0.04 },
    { id: 24, x: 50, y: 58, size: 52, rotate: -10, type: 'pata6', opacity: 0.04 },
    { id: 25, x: 65, y: 55, size: 42, rotate: 30, type: 'pata1', opacity: 0.04 },
    { id: 26, x: 80, y: 62, size: 38, rotate: -35, type: 'pata2', opacity: 0.04 },
    { id: 27, x: 92, y: 50, size: 45, rotate: 15, type: 'pata3', opacity: 0.04 },
    { id: 28, x: 10, y: 68, size: 35, rotate: -45, type: 'pata4', opacity: 0.04 },
    { id: 29, x: 58, y: 70, size: 48, rotate: 25, type: 'pata1', opacity: 0.04 },
    { id: 30, x: 88, y: 72, size: 40, rotate: -15, type: 'pata6', opacity: 0.04 },
    
    // Fila inferior
    { id: 31, x: 5, y: 82, size: 44, rotate: 35, type: 'pata1', opacity: 0.04 },
    { id: 32, x: 20, y: 85, size: 36, rotate: -20, type: 'pata2', opacity: 0.04 },
    { id: 33, x: 35, y: 80, size: 50, rotate: 10, type: 'pata3', opacity: 0.04 },
    { id: 34, x: 50, y: 88, size: 42, rotate: -30, type: 'pata4', opacity: 0.04 },
    { id: 35, x: 65, y: 82, size: 38, rotate: 45, type: 'pata2', opacity: 0.04 },
    { id: 36, x: 80, y: 86, size: 48, rotate: -10, type: 'pata6', opacity: 0.04 },
    { id: 37, x: 92, y: 80, size: 35, rotate: 25, type: 'pata1', opacity: 0.04 },
    { id: 38, x: 12, y: 92, size: 40, rotate: -40, type: 'pata2', opacity: 0.04 },
    { id: 39, x: 45, y: 95, size: 46, rotate: 15, type: 'pata3', opacity: 0.04 },
    { id: 40, x: 75, y: 94, size: 38, rotate: -25, type: 'pata4', opacity: 0.04 },
  ];

  const getPawImage = (type) => {
    switch(type) {
      case 'pata1': return '/img/pata/pata1.png';
      case 'pata2': return '/img/pata/pata2.png';
      case 'pata3': return '/img/pata/pata3.png';
      case 'pata4': return '/img/pata/pata4.png';
      case 'pata5': return '/img/pata/pata5.png';
      case 'pata6': return '/img/pata/pata6.png';
      default: return '/img/pata/pata1.png';
    }
  };

  return (
    <div className="paw-background-fixed">
      {paws.map((paw) => (
        <img
          key={paw.id}
          src={getPawImage(paw.type)}
          className="paw-fixed"
          alt=""
          style={{
            left: `${paw.x}%`,
            top: `${paw.y}%`,
            width: `${paw.size}px`,
            transform: `rotate(${paw.rotate}deg)`,
            opacity: paw.opacity,
            position: 'absolute',
          }}
        />
      ))}
    </div>
  );
};

export default PawBackground;