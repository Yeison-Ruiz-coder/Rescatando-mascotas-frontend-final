// src/pages/fundacion/mascotas/MascotaDetalle.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { getImageUrl } from "../../../utils/imageUtils";
import "./MascotaDetalle.css";

const MascotaDetalleFundacion = () => {
  const params = useParams();
  const mascotaId = params.id;
  const navigate = useNavigate();
  const { t } = useTranslation(["nuevaMascota", "mascotas"]);

  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [vacunas, setVacunas] = useState([]);
  const [razas, setRazas] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [imagenActual, setImagenActual] = useState(0);

  // Función para formatear edad
  const formatEdad = (edad) => {
    if (!edad && edad !== 0) return t("mascotas:edad_no_especificada", "No especificada");
    const edadNum = parseFloat(edad);
    if (isNaN(edadNum)) return t("mascotas:edad_no_especificada", "No especificada");

    if (edadNum < 1) {
      const meses = Math.round(edadNum * 12);
      return `${meses} ${meses === 1 ? t("mascotas:mes", "mes") : t("mascotas:meses", "meses")}`;
    }
    if (Number.isInteger(edadNum)) {
      return `${edadNum} ${edadNum === 1 ? t("mascotas:año", "año") : t("mascotas:años", "años")}`;
    }
    return `${edadNum.toFixed(1)} ${t("mascotas:años", "años")}`;
  };

  // Función para obtener array de galería
  const getGaleriaArray = (galeria) => {
    if (!galeria) return [];
    if (Array.isArray(galeria)) return galeria;
    if (typeof galeria === "string") {
      try {
        const parsed = JSON.parse(galeria);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // Abrir modal de imagen
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  // Cambiar imagen principal
  const cambiarImagen = (index) => {
    setImagenActual(index);
  };

  useEffect(() => {
    if (mascotaId) {
      cargarMascota();
    }
  }, [mascotaId]);

  const cargarMascota = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/entity/mascotas/${mascotaId}`);

      if (response.data.success) {
        const data = response.data.data;
        setMascota(data);
        setVacunas(data.vacunas || []);
        setRazas(data.razas || []);
      } else {
        toast.error(t("nuevaMascota:error_cargar", "No se pudo cargar la mascota"));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("nuevaMascota:error_carga", "Error al cargar la mascota"));
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (nuevoEstado) => {
    if (!mascotaId) return;

    setCambiandoEstado(true);
    try {
      const response = await api.put(`/entity/mascotas/${mascotaId}`, {
        estado: nuevoEstado,
      });
      if (response.data.success) {
        setMascota((prev) => ({ ...prev, estado: nuevoEstado }));
        toast.success(`${t("nuevaMascota:estado_actualizado", "Estado actualizado a")} ${nuevoEstado}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("nuevaMascota:error_actualizar", "Error al actualizar estado"));
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleEliminar = async () => {
    if (!mascotaId) return;

    if (window.confirm(t("nuevaMascota:confirmar_eliminar", "¿Eliminar a {{nombre}}?", { nombre: mascota?.nombre_mascota }))) {
      try {
        const response = await api.delete(`/entity/mascotas/${mascotaId}`);
        if (response.data.success) {
          toast.success(t("nuevaMascota:mascota_eliminada", "Mascota eliminada"));
          navigate("/fundacion/mascotas");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(t("nuevaMascota:error_eliminar", "Error al eliminar"));
      }
    }
  };

  if (loading) {
    return (
      <div className="mascota-detalle-page-fundacion">
        <LoadingSpinner text={t("mascotas:cargando_detalle", "Cargando...")} />
      </div>
    );
  }

  if (!mascota) {
    return (
      <div className="mascota-detalle-page-fundacion">
        <div className="error-container">
          <i className="fas fa-paw"></i>
          <h2>{t("mascotas:no_encontrada", "Mascota no encontrada")}</h2>
          <Link to="/fundacion/mascotas" className="btn-back-fundacion">
            <i className="fas fa-arrow-left"></i> {t("mascotas:volver", "Volver")}
          </Link>
        </div>
      </div>
    );
  }

  const getEstadoClass = () => {
    switch (mascota.estado) {
      case "En adopcion":
        return "estado-adopcion";
      case "Adoptado":
        return "estado-adoptado";
      case "Rescatada":
        return "estado-rescatada";
      default:
        return "estado-acogida";
    }
  };

  const getEstadoTexto = () => {
    switch (mascota.estado) {
      case "En adopcion":
        return t("mascotas:en_adopcion", "En adopción");
      case "Adoptado":
        return t("mascotas:adoptado", "Adoptado");
      case "Rescatada":
        return t("mascotas:rescatada", "Rescatada");
      default:
        return t("mascotas:en_acogida", "En acogida");
    }
  };

  const galeriaArray = getGaleriaArray(mascota.galeria_fotos);

  // Array de todas las imágenes (principal + galería)
  const todasLasImagenes = [
    mascota.foto_principal && {
      url: mascota.foto_principal,
      esPrincipal: true,
      alt: `${mascota.nombre_mascota} - Foto principal`,
    },
    ...galeriaArray.map((foto, idx) => ({
      url: foto,
      esPrincipal: false,
      alt: `${mascota.nombre_mascota} - Foto ${idx + 1}`,
    })),
  ].filter(Boolean);

  const imagenActualData = todasLasImagenes[imagenActual] || todasLasImagenes[0];

  return (
    <div className="mascota-detalle-page-fundacion">
      <div className="detalle-container-fundacion">
        {/* Header solo con botón volver */}
        <div className="detalle-header-fundacion">
          <button onClick={() => navigate(-1)} className="btn-back-fundacion">
            <i className="fas fa-arrow-left"></i> {t("mascotas:volver", "Volver")}
          </button>
        </div>

        <div className="detalle-content-fundacion">
          {/* Sección de Imágenes - Carrusel lateral */}
          <div className="imagenes-section-fundacion">
            {/* Imagen Principal Grande */}
            <div 
              className="imagen-principal-fundacion" 
              onClick={() => openImageModal(getImageUrl(imagenActualData.url))}
            >
              {imagenActualData?.url ? (
                <img
                  src={getImageUrl(imagenActualData.url)}
                  alt={imagenActualData.alt || mascota.nombre_mascota}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/800x800?text=Sin+Imagen";
                  }}
                />
              ) : (
                <div className="image-placeholder-fundacion">
                  <i className="fas fa-paw fa-4x"></i>
                  <p>{t("mascotas:sin_imagen", "Sin imagen")}</p>
                </div>
              )}
              <span className={`estado-badge-fundacion ${getEstadoClass()}`}>
                {getEstadoTexto()}
              </span>
            </div>

            {/* Miniaturas - Carrusel horizontal */}
            {todasLasImagenes.length > 1 && (
              <div className="miniaturas-container">
                {todasLasImagenes.map((img, idx) => (
                  <div
                    key={idx}
                    className={`miniatura-item ${imagenActual === idx ? "activa" : ""} ${img.esPrincipal ? "principal" : ""}`}
                    onClick={() => cambiarImagen(idx)}
                  >
                    {img.url ? (
                      <>
                        <img
                          src={getImageUrl(img.url)}
                          alt={`Miniatura ${idx + 1}`}
                          onError={(e) => {
                            e.target.src = "https://placehold.co/80x80?text=Error";
                          }}
                        />
                        {img.esPrincipal && (
                          <span className="principal-badge-miniatura">
                            <i className="fas fa-star"></i>
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="miniatura-placeholder">
                        <i className="fas fa-paw"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información de la mascota */}
          <div className="detalle-info-fundacion">
            <h1 className="mascota-titulo">{mascota.nombre_mascota}</h1>
            <p className="id-mascota-fundacion">ID: #{mascota.id}</p>

            {/* Grid de información básica */}
            <div className="info-grid-fundacion">
              <div className="info-item-fundacion">
                <i className="fas fa-tag"></i>
                <strong>{t("nuevaMascota:especie", "Especie")}</strong>
                <span>{mascota.especie || t("mascotas:no_especificada", "No especificada")}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-paw"></i>
                <strong>{t("nuevaMascota:raza", "Raza(s)")}</strong>
                <span>
                  {razas.length > 0
                    ? razas.map((r) => r.nombre_raza || r.nombre).join(", ")
                    : t("mascotas:mixto", "Mixto")}
                </span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-calendar"></i>
                <strong>{t("nuevaMascota:edad", "Edad")}</strong>
                <span>{formatEdad(mascota.edad_aprox)}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-venus-mars"></i>
                <strong>{t("nuevaMascota:genero", "Género")}</strong>
                <span>{mascota.genero || t("mascotas:no_especificado", "No especificado")}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-map-marker-alt"></i>
                <strong>{t("nuevaMascota:lugar_rescate", "Lugar de rescate")}</strong>
                <span>{mascota.lugar_rescate || t("mascotas:no_especificado", "No especificado")}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-clock"></i>
                <strong>{t("nuevaMascota:fecha_ingreso", "Fecha ingreso")}</strong>
                <span>
                  {mascota.fecha_ingreso ? new Date(mascota.fecha_ingreso).toLocaleDateString() : t("mascotas:no_especificada", "No especificada")}
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div className="info-section-fundacion">
              <h3>
                <i className="fas fa-file-alt"></i> {t("nuevaMascota:descripcion", "Descripción")}
              </h3>
              <p>{mascota.descripcion || t("mascotas:sin_descripcion", "Sin descripción")}</p>
            </div>

            {/* Condiciones especiales */}
            {mascota.condiciones_especiales && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-heartbeat"></i> {t("nuevaMascota:condiciones_especiales", "Condiciones especiales")}
                </h3>
                <p>{mascota.condiciones_especiales}</p>
              </div>
            )}

            {/* Vacunas */}
            {vacunas.length > 0 && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-syringe"></i> {t("nuevaMascota:vacunas", "Vacunas aplicadas")}
                </h3>
                <div className="vacunas-lista-fundacion">
                  {vacunas.map((vacuna, idx) => (
                    <span key={idx} className="vacuna-tag-fundacion">
                      {vacuna.nombre_vacuna || vacuna.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Estado actual */}
            <div className="info-section-fundacion">
              <h3>
                <i className="fas fa-chart-line"></i> {t("nuevaMascota:estado_actual", "Estado actual")}
              </h3>
              <select
                value={mascota.estado}
                onChange={(e) => handleEstadoChange(e.target.value)}
                className="estado-select-fundacion"
                disabled={cambiandoEstado}
              >
                <option value="En adopcion">{t("mascotas:en_adopcion", "En adopción")}</option>
                <option value="Rescatada">{t("mascotas:rescatada", "Rescatada")}</option>
                <option value="En acogida">{t("mascotas:en_acogida", "En acogida")}</option>
                <option value="Adoptado">{t("mascotas:adoptado", "Adoptado")}</option>
              </select>
              {cambiandoEstado && (
                <span className="loading-fundacion">{t("nuevaMascota:actualizando", "Actualizando...")}</span>
              )}
            </div>

            {/* Botones de acción al final */}
            <div className="acciones-finales-fundacion">
              <div className="botones-container">
                <Link
                  to={`/fundacion/mascotas/editar/${mascotaId}`}
                  className="btn-edit-fundacion"
                >
                  <i className="fas fa-edit"></i> {t("nuevaMascota:editar", "Editar")}
                </Link>
                <button onClick={handleEliminar} className="btn-delete-fundacion">
                  <i className="fas fa-trash"></i> {t("nuevaMascota:eliminar", "Eliminar")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para ver imagen en grande */}
      {modalImage && (
        <div className="modal-imagen-fundacion" onClick={() => setModalImage(null)}>
          <button className="modal-close-fundacion" onClick={() => setModalImage(null)}>
            <i className="fas fa-times"></i>
          </button>
          <img src={modalImage} alt="Vista ampliada" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default MascotaDetalleFundacion;