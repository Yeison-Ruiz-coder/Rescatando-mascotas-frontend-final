// src/pages/public/MascotaDetalle/components/GaleriaImagenes.jsx
import React from 'react';
import './GaleriaImagenes.css';

const GaleriaImagenes = ({ images, nombre, imagenActual, setImagenActual }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const defaultImage = '/img/mascota-placeholder.png';

  const mainImage = images.length > 0 ? images[imagenActual] : defaultImage;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const prevImage = () => {
    setImagenActual(prev => Math.max(0, prev - 1));
  };

  const nextImage = () => {
    setImagenActual(prev => Math.min(images.length - 1, prev + 1));
  };

  return (
    <div className="galeria-container">
      <div className="imagen-principal" onClick={openModal}>
        <img src={mainImage} alt={nombre} />
        {images.length > 1 && (
          <div className="indicador-galeria">
            <i className="fas fa-images"></i> {imagenActual + 1} / {images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="miniaturas">
          {images.map((img, index) => (
            <div
              key={index}
              className={`miniatura ${imagenActual === index ? 'active' : ''}`}
              onClick={() => setImagenActual(index)}
            >
              <img src={img} alt={`${nombre} ${index + 1}`} />
            </div>
          ))}
        </div>
      )}

      {/* Modal para galería */}
      {isModalOpen && (
        <div className="modal-galeria" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
            <img src={mainImage} alt={nombre} />
            
            {images.length > 1 && (
              <div className="modal-nav">
                <button 
                  onClick={prevImage}
                  disabled={imagenActual === 0}
                  className="nav-btn"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span>{imagenActual + 1} / {images.length}</span>
                <button 
                  onClick={nextImage}
                  disabled={imagenActual === images.length - 1}
                  className="nav-btn"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaImagenes;