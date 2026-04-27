// src/pages/public/MascotaDetalle/MascotaDetalle.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import GaleriaImagenes from "../../../components/common/Mascotas/GaleriaImagenes";
import InfoBasica from "../../../components/common/Mascotas/InfoBasica";
import SaludCuidados from "../../../components/common/Mascotas/SaludCuidados";
import RescateFundacionCard from "../../../components/common/Mascotas/RescateFundacionCard";
import ModalFundacion from "../../../components/common/Mascotas/ModalFundacion";
import "./MascotaDetalle.css";

const MascotaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("mascotas");

  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fundacion, setFundacion] = useState(null);
  const [vacunas, setVacunas] = useState([]);
  const [razas, setRazas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagenActual, setImagenActual] = useState(0);

  useEffect(() => {
    fetchMascotaDetalle();
  }, [id]);

  const fetchMascotaDetalle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/mascotas/${id}`);
      
      if (response.data.success) {
        const data = response.data.data;
        setMascota(data);
        setVacunas(data.vacunas || []);
        setFundacion(data.fundacion || null);
        setRazas(data.razas || []);
      } else {
        setError(t("no_encontrada"));
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || t("error_carga"));
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${import.meta.env.VITE_STORAGE_URL || "http://rescatando-mascotas-forever.test/storage"}/${path}`;
  };

  const getAllImages = () => {
    const images = [];
    if (mascota?.foto_principal) {
      images.push(getImageUrl(mascota.foto_principal));
    }
    if (mascota?.galeria_fotos) {
      try {
        let galeria = mascota.galeria_fotos;
        if (typeof galeria === "string") {
          galeria = JSON.parse(galeria);
        }
        if (Array.isArray(galeria)) {
          galeria.forEach((foto) => {
            if (foto) images.push(getImageUrl(foto));
          });
        }
      } catch (e) {
        console.error("Error parsing galeria:", e);
      }
    }
    return images;
  };

  const getEstadoClass = () => {
    if (!mascota) return '';
    switch(mascota.estado) {
      case 'En adopcion': return 'adopcion';
      case 'En acogida': return 'acogida';
      case 'Adoptado': return 'adoptado';
      default: return '';
    }
  };

  const getEstadoIcon = () => {
    if (!mascota) return 'fa-heart';
    switch(mascota.estado) {
      case 'En adopcion': return 'fa-heart';
      case 'En acogida': return 'fa-home';
      case 'Adoptado': return 'fa-check-circle';
      default: return 'fa-heart';
    }
  };

  const getEstadoText = () => {
    if (!mascota) return '';
    switch(mascota.estado) {
      case 'En adopcion': return t('en_adopcion');
      case 'En acogida': return t('en_acogida');
      case 'Adoptado': return t('adoptado');
      default: return mascota.estado;
    }
  };

  const handleAdoptar = () => {
    navigate(`/solicitar-adopcion/${id}`);
  };

  const handleSolicitarAcogida = () => {
    navigate(`/solicitar-acogida/${id}`);
  };

  const openFundacionModal = () => {
    setIsModalOpen(true);
  };

  const closeFundacionModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="mascota-detalle-page">
        <LoadingSpinner text={t("cargando_detalle")} />
      </div>
    );
  }

  if (error || !mascota) {
    return (
      <div className="mascota-detalle-page">
        <div className="error-container-detalle">
          <i className="fas fa-paw"></i>
          <h2>{t("error_titulo")}</h2>
          <p>{error || t("no_encontrada")}</p>
          <button onClick={() => navigate("/mascotas")} className="btn-volver">
            <i className="fas fa-arrow-left"></i> {t("volver_lista")}
          </button>
        </div>
      </div>
    );
  }

  const images = getAllImages();

  return (
    <div className="mascota-detalle-page">
      <div className="detalle-container">
        <button onClick={() => navigate("/mascotas")} className="btn-back">
          <i className="fas fa-arrow-left"></i> {t("volver")}
        </button>

        <div className="detalle-grid">
          {/* Columna izquierda */}
          <div className="detalle-gallery">
            {/* Badge de estado encima de la foto */}
            <div className="mascota-estado-badge-wrapper">
              <div className={`mascota-estado-badge-custom ${getEstadoClass()}`}>
                <i className={`fas ${getEstadoIcon()}`}></i>
                <span>{getEstadoText()}</span>
              </div>
            </div>

            <GaleriaImagenes
              images={images}
              nombre={mascota.nombre_mascota}
              imagenActual={imagenActual}
              setImagenActual={setImagenActual}
            />

            <RescateFundacionCard
              fundacion={fundacion}
              onContactClick={openFundacionModal}
              t={t}
            />

            <div className="botones-accion">
              {(mascota.estado === "En adopcion" || mascota.estado === "En acogida") && (
                <>
                  <button onClick={handleAdoptar} className="btn-adoptar">
                    <i className="fas fa-heart"></i> {t("solicitar_adopcion")}
                  </button>
                  {mascota.necesita_hogar_temporal && (
                    <button onClick={handleSolicitarAcogida} className="btn-acogida">
                      <i className="fas fa-home"></i> {t("solicitar_acogida")}
                    </button>
                  )}
                </>
              )}
              {mascota.estado === "Adoptado" && (
                <div className="mensaje-adoptado">
                  <i className="fas fa-check-circle"></i>
                  <p>{t("ya_fue_adoptado")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha */}
          <div className="detalle-info">
            <InfoBasica mascota={mascota} t={t} />
            {razas.length > 0 && (
              <div className="razas-section">
                <h3><i className="fas fa-dna"></i> {t("razas")}</h3>
                <div className="razas-lista">
                  {razas.map((raza, idx) => (
                    <span key={idx} className="raza-tag">
                      {raza.nombre_raza || raza.nombre || "Raza"}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <SaludCuidados mascota={mascota} vacunas={vacunas} t={t} />
          </div>
        </div>
      </div>

      <ModalFundacion
        isOpen={isModalOpen}
        onClose={closeFundacionModal}
        fundacion={fundacion}
        t={t}
      />
    </div>
  );
};

export default MascotaDetalle;