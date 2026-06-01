import React from "react";

const MascotaHero = ({
  nombre,
  imagen,
  estado,
  estadoClass,
  estadoIcon,
  estadoText,
  imagenActual,
  setImagenActual,
  images,
}) => {
  return (
    <div className="mh-hero">
      <div className="mh-imagen-container">
        <div className={`mh-estado-badge md-estado-${estadoClass}`}>
          <i className={`fas ${estadoIcon}`}></i>
          <span>{estadoText}</span>
        </div>
        <img className="mh-imagen" src={imagen} alt={nombre} />
      </div>

      {images && images.length > 1 && (
        <div className="mh-thumbs">
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`mh-thumb ${imagenActual === idx ? "mh-thumb-active" : ""}`}
              onClick={() => setImagenActual(idx)}
              aria-label={`Ver foto ${idx + 1}`}
            >
              <img src={img} alt={`${nombre} ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MascotaHero;
