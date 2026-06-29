// src/pages/admin/mascotas/MascotaDetalle.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { getImageUrl } from "../../../utils/imageUtils";
import "./MascotaDetalle.css"; // ✅ CSS PROPIO

const AdminMascotaDetalle = () => {
  const { id: mascotaId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["admin", "mascotas"]);

  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [vacunas, setVacunas] = useState([]);
  const [razas, setRazas] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [imagenActual, setImagenActual] = useState(0);

  // ============================================
  // 🎯 CARGAR MASCOTA - ADMIN
  // ============================================
  const cargarMascota = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/admin/mascotas/${mascotaId}`, {
        params: {
          fields: 'id,nombre_mascota,especie,genero,edad_aprox,tamano,estado,esterilizado,desparasitado,vacunado,apto_con_ninos,apto_con_otros_animales,lugar_rescate,necesita_hogar_temporal,foto_principal,galeria_fotos,descripcion,condiciones_especiales,salud_general,peso_aprox,color,fecha_ingreso,video_url,hogar_recomendado,enfermedades_cronicas,medicamentos,requisitos_adopcion,created_at,updated_at,fundacion_id',
          include: 'fundacion,razas,vacunas'
        }
      });

      if (response.data.success) {
        const data = response.data.data;
        setMascota(data);
        setVacunas(data.vacunas || []);
        setRazas(data.razas || []);
      } else {
        toast.error(t("admin:error_cargar"));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("admin:error_carga"));
    } finally {
      setLoading(false);
    }
  }, [mascotaId, t]);

  // ============================================
  // 🎯 CAMBIAR ESTADO - ADMIN
  // ============================================
  const handleEstadoChange = async (nuevoEstado) => {
    if (!mascotaId) return;

    setCambiandoEstado(true);
    try {
      const response = await api.patch(`/admin/mascotas/${mascotaId}/estado`, {
        estado: nuevoEstado,
      });
      
      if (response.data.success) {
        setMascota((prev) => ({ ...prev, estado: nuevoEstado }));
        toast.success(t("admin:estado_actualizado", { estado: nuevoEstado }));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("admin:error_actualizar"));
    } finally {
      setCambiandoEstado(false);
    }
  };

  // ============================================
  // ELIMINAR - ADMIN
  // ============================================
  const handleEliminar = async () => {
    if (!mascotaId) return;

    const confirmacion = window.confirm(
      t("admin:confirmar_eliminar", { nombre: mascota?.nombre_mascota })
    );

    if (confirmacion) {
      try {
        const response = await api.delete(`/admin/mascotas/${mascotaId}`);
        if (response.data.success) {
          toast.success(t("admin:mascota_eliminada"));
          navigate("/admin/mascotas");
        } else {
          toast.error(response.data.message || t("admin:error_eliminar"));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || t("admin:error_eliminar"));
      }
    }
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const formatEdad = (edad) => {
    if (!edad && edad !== 0) return t("mascotas:edad_no_especificada");
    const edadNum = parseFloat(edad);
    if (isNaN(edadNum)) return t("mascotas:edad_no_especificada");

    if (edadNum < 1) {
      const meses = Math.round(edadNum * 12);
      return `${meses} ${meses === 1 ? t("mascotas:mes") : t("mascotas:meses")}`;
    }
    if (Number.isInteger(edadNum)) {
      return `${edadNum} ${edadNum === 1 ? t("mascotas:año") : t("mascotas:años")}`;
    }
    return `${edadNum.toFixed(1)} ${t("mascotas:años")}`;
  };

  const getGaleriaArray = (galeria) => {
    if (!galeria) return [];
    if (Array.isArray(galeria)) {
      return galeria.filter((item) => item && typeof item === "string");
    }
    if (typeof galeria === "string") {
      try {
        const parsed = JSON.parse(galeria);
        return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === "string") : [];
      } catch (e) {
        return galeria ? [galeria] : [];
      }
    }
    return [];
  };

  const getArrayFromJson = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const getTamanoTexto = (tamano) => {
    const tamanos = {
      pequeño: t("mascotas:tamano_pequeño"),
      mediano: t("mascotas:tamano_mediano"),
      grande: t("mascotas:tamano_grande"),
      muy_grande: t("mascotas:tamano_muy_grande"),
    };
    return tamanos[tamano] || tamano;
  };

  const safeGetImageUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    return getImageUrl(url);
  };

  const getEstadoClass = () => {
    switch (mascota?.estado) {
      case "En adopcion": return "estado-adopcion";
      case "Adoptado": return "estado-adoptado";
      case "Rescatada": return "estado-rescatada";
      default: return "estado-acogida";
    }
  };

  const getEstadoTexto = () => {
    switch (mascota?.estado) {
      case "En adopcion": return t("mascotas:en_adopcion");
      case "Adoptado": return t("mascotas:adoptado");
      case "Rescatada": return t("mascotas:rescatada");
      default: return t("mascotas:en_acogida");
    }
  };

  // ============================================
  // CARGA INICIAL
  // ============================================
  useEffect(() => {
    if (mascotaId) {
      cargarMascota();
    }
  }, [mascotaId, cargarMascota]);

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="admin-mascota-detalle">
        <LoadingSpinner text={t("mascotas:cargando_detalle")} />
      </div>
    );
  }

  if (!mascota) {
    return (
      <div className="admin-mascota-detalle">
        <div className="error-container">
          <i className="fas fa-paw"></i>
          <h2>{t("mascotas:no_encontrada")}</h2>
          <Link to="/admin/mascotas" className="btn-back">
            <i className="fas fa-arrow-left"></i> {t("mascotas:volver")}
          </Link>
        </div>
      </div>
    );
  }

  const galeriaArray = getGaleriaArray(mascota.galeria_fotos);
  const enfermedadesArray = getArrayFromJson(mascota.enfermedades_cronicas);
  const medicamentosArray = getArrayFromJson(mascota.medicamentos);
  const requisitosArray = getArrayFromJson(mascota.requisitos_adopcion);

  const todasLasImagenes = [];
  if (mascota.foto_principal && typeof mascota.foto_principal === "string") {
    todasLasImagenes.push({
      url: mascota.foto_principal,
      esPrincipal: true,
      alt: `${mascota.nombre_mascota} - Foto principal`,
    });
  }
  galeriaArray.forEach((foto, idx) => {
    if (foto && typeof foto === "string") {
      todasLasImagenes.push({
        url: foto,
        esPrincipal: false,
        alt: `${mascota.nombre_mascota} - Foto ${idx + 1}`,
      });
    }
  });

  const imagenActualData = todasLasImagenes[imagenActual] || todasLasImagenes[0] || null;
  const imagenActualUrl = imagenActualData?.url ? safeGetImageUrl(imagenActualData.url) : null;

  return (
    <div className="admin-mascota-detalle">
      <div className="detalle-container">
        {/* HEADER */}
        <div className="detalle-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <i className="fas fa-arrow-left"></i> {t("mascotas:volver")}
          </button>
        </div>

        {/* CONTENT */}
        <div className="detalle-content">
          {/* Imágenes */}
          <div className="imagenes-section">
            <div
              className="imagen-principal"
              onClick={() => imagenActualUrl && setModalImage(imagenActualUrl)}
            >
              {imagenActualUrl ? (
                <img
                  src={imagenActualUrl}
                  alt={imagenActualData?.alt || mascota.nombre_mascota}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/800x800?text=Sin+Imagen";
                  }}
                />
              ) : (
                <div className="image-placeholder">
                  <i className="fas fa-paw fa-4x"></i>
                  <p>{t("mascotas:sin_imagen")}</p>
                </div>
              )}
              <span className={`estado-badge ${getEstadoClass()}`}>
                {getEstadoTexto()}
              </span>
            </div>

            {todasLasImagenes.length > 1 && (
              <div className="miniaturas-container">
                {todasLasImagenes.map((img, idx) => {
                  const imgUrl = safeGetImageUrl(img.url);
                  return (
                    <div
                      key={idx}
                      className={`miniatura-item ${imagenActual === idx ? "activa" : ""}`}
                      onClick={() => setImagenActual(idx)}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={`Miniatura ${idx + 1}`}
                          onError={(e) => {
                            e.target.src = "https://placehold.co/80x80?text=Error";
                          }}
                        />
                      ) : (
                        <div className="miniatura-placeholder">
                          <i className="fas fa-paw"></i>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detalle-info">
            <h1 className="mascota-titulo">{mascota.nombre_mascota}</h1>
            <p className="id-mascota">ID: #{mascota.id}</p>
            {mascota.fundacion && (
              <p className="fundacion-info">
                <i className="fas fa-building"></i> Fundación: {mascota.fundacion.nombre || mascota.fundacion.Nombre_1}
              </p>
            )}

            {/* Grid de info */}
            <div className="info-grid">
              <div className="info-item">
                <i className="fas fa-tag"></i>
                <strong>{t("mascotas:especie")}</strong>
                <span>{mascota.especie || t("mascotas:no_especificada")}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-paw"></i>
                <strong>{t("mascotas:raza")}</strong>
                <span>
                  {razas.length > 0
                    ? razas.map((r) => r.nombre_raza || r.nombre).join(", ")
                    : t("mascotas:mixto")}
                </span>
              </div>
              <div className="info-item">
                <i className="fas fa-calendar"></i>
                <strong>{t("mascotas:edad")}</strong>
                <span>{formatEdad(mascota.edad_aprox)}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-venus-mars"></i>
                <strong>{t("mascotas:genero")}</strong>
                <span>{mascota.genero || t("mascotas:no_especificado")}</span>
              </div>

              {mascota.peso_aprox && (
                <div className="info-item">
                  <i className="fas fa-weight-hanging"></i>
                  <strong>{t("mascotas:peso_aprox")}</strong>
                  <span>{`${mascota.peso_aprox} kg`}</span>
                </div>
              )}
              {mascota.tamano && (
                <div className="info-item">
                  <i className="fas fa-ruler-combined"></i>
                  <strong>{t("mascotas:tamano")}</strong>
                  <span>{getTamanoTexto(mascota.tamano)}</span>
                </div>
              )}
              {mascota.color && (
                <div className="info-item">
                  <i className="fas fa-palette"></i>
                  <strong>{t("mascotas:color")}</strong>
                  <span>{mascota.color}</span>
                </div>
              )}
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <strong>{t("mascotas:lugar_rescate")}</strong>
                <span>{mascota.lugar_rescate || t("mascotas:no_especificado")}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-clock"></i>
                <strong>{t("mascotas:fecha_ingreso")}</strong>
                <span>
                  {mascota.fecha_ingreso
                    ? new Date(mascota.fecha_ingreso).toLocaleDateString()
                    : t("mascotas:no_especificada")}
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div className="info-section">
              <h3><i className="fas fa-file-alt"></i> {t("mascotas:descripcion")}</h3>
              <p>{mascota.descripcion || t("mascotas:sin_descripcion")}</p>
            </div>

            {/* Condiciones especiales */}
            {mascota.condiciones_especiales && (
              <div className="info-section">
                <h3><i className="fas fa-heartbeat"></i> {t("mascotas:condiciones_especiales")}</h3>
                <p>{mascota.condiciones_especiales}</p>
              </div>
            )}

            {/* Salud */}
            {mascota.salud_general && (
              <div className="info-section">
                <h3><i className="fas fa-stethoscope"></i> {t("mascotas:salud_general")}</h3>
                <p>{mascota.salud_general}</p>
              </div>
            )}

            {/* Badges salud */}
            {(mascota.esterilizado || mascota.desparasitado || mascota.vacunado) && (
              <div className="info-section">
                <h3><i className="fas fa-check-circle"></i> {t("mascotas:estado_salud")}</h3>
                <div className="salud-badges">
                  {mascota.esterilizado && (
                    <span className="salud-badge esterilizado">
                      <i className="fas fa-scissors"></i> {t("mascotas:esterilizado")}
                    </span>
                  )}
                  {mascota.desparasitado && (
                    <span className="salud-badge desparasitado">
                      <i className="fas fa-bug"></i> {t("mascotas:desparasitado")}
                    </span>
                  )}
                  {mascota.vacunado && (
                    <span className="salud-badge vacunado">
                      <i className="fas fa-syringe"></i> {t("mascotas:vacunado")}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Enfermedades */}
            {enfermedadesArray.length > 0 && (
              <div className="info-section">
                <h3><i className="fas fa-notes-medical"></i> {t("mascotas:enfermedades_cronicas")}</h3>
                <div className="enfermedades-lista">
                  {enfermedadesArray.map((enf, idx) => (
                    <span key={idx} className="enfermedad-tag">
                      <i className="fas fa-exclamation-triangle"></i> {enf}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Medicamentos */}
            {medicamentosArray.length > 0 && (
              <div className="info-section">
                <h3><i className="fas fa-tablets"></i> {t("mascotas:medicamentos")}</h3>
                <div className="medicamentos-lista">
                  {medicamentosArray.map((med, idx) => (
                    <span key={idx} className="medicamento-tag">
                      <i className="fas fa-capsules"></i> {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Vacunas */}
            {vacunas.length > 0 && (
              <div className="info-section">
                <h3><i className="fas fa-syringe"></i> {t("mascotas:vacunas_aplicadas")}</h3>
                <div className="vacunas-lista">
                  {vacunas.map((vacuna, idx) => (
                    <span key={idx} className="vacuna-tag">
                      <i className="fas fa-shield-alt"></i> {vacuna.nombre_vacuna || vacuna.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requisitos */}
            {requisitosArray.length > 0 && (
              <div className="info-section">
                <h3><i className="fas fa-clipboard-list"></i> {t("mascotas:requisitos_adopcion")}</h3>
                <ul className="requisitos-lista">
                  {requisitosArray.map((req, idx) => (
                    <li key={idx}>
                      <i className="fas fa-check-circle"></i> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hogar recomendado */}
            {mascota.hogar_recomendado && (
              <div className="info-section">
                <h3><i className="fas fa-home"></i> {t("mascotas:hogar_recomendado")}</h3>
                <p className="hogar-recomendado">
                  <i className="fas fa-info-circle"></i> 
                  {t(`mascotas:${mascota.hogar_recomendado}`) || mascota.hogar_recomendado}
                </p>
              </div>
            )}

            {/* Aptitudes */}
            <div className="info-section">
              <h3><i className="fas fa-heart"></i> {t("mascotas:aptitudes")}</h3>
              <div className="aptitudes-grid">
                {mascota.necesita_hogar_temporal && (
                  <span className="aptitud-tag temporal">
                    <i className="fas fa-clock"></i> {t("mascotas:necesita_hogar_temporal")}
                  </span>
                )}
                {mascota.apto_con_ninos && (
                  <span className="aptitud-tag ninos">
                    <i className="fas fa-child"></i> {t("mascotas:apto_con_ninos")}
                  </span>
                )}
                {!mascota.apto_con_ninos && mascota.apto_con_ninos !== undefined && (
                  <span className="aptitud-tag no-ninos">
                    <i className="fas fa-child"></i> {t("mascotas:no_apto_ninos")}
                  </span>
                )}
                {mascota.apto_con_otros_animales && (
                  <span className="aptitud-tag animales">
                    <i className="fas fa-dog"></i> {t("mascotas:apto_con_otros_animales")}
                  </span>
                )}
                {!mascota.apto_con_otros_animales && mascota.apto_con_otros_animales !== undefined && (
                  <span className="aptitud-tag no-animales">
                    <i className="fas fa-dog"></i> {t("mascotas:no_apto_animales")}
                  </span>
                )}
              </div>
            </div>

            {/* Video */}
            {mascota.video_url && (
              <div className="info-section">
                <h3><i className="fas fa-video"></i> {t("mascotas:video")}</h3>
                <div className="video-container">
                  <a href={mascota.video_url} target="_blank" rel="noopener noreferrer" className="video-link">
                    <i className="fas fa-play-circle"></i> 
                    {t("mascotas:ver_video", { nombre: mascota.nombre_mascota })}
                  </a>
                </div>
              </div>
            )}

            {/* ESTADO - SELECTOR */}
            <div className="info-section">
              <h3><i className="fas fa-chart-line"></i> {t("mascotas:estado_actual")}</h3>
              <select
                value={mascota.estado}
                onChange={(e) => handleEstadoChange(e.target.value)}
                className="estado-select"
                disabled={cambiandoEstado}
              >
                <option value="En adopcion">{t("mascotas:en_adopcion")}</option>
                <option value="Rescatada">{t("mascotas:rescatada")}</option>
                <option value="En acogida">{t("mascotas:en_acogida")}</option>
                <option value="Adoptado">{t("mascotas:adoptado")}</option>
              </select>
              {cambiandoEstado && (
                <span className="loading-text">{t("mascotas:actualizando")}</span>
              )}
            </div>

            {/* ACCIONES ADMIN */}
            <div className="acciones-finales">
              <div className="botones-container">
                <button onClick={handleEliminar} className="btn-eliminar">
                  <i className="fas fa-trash"></i> {t("admin:eliminar_mascota")}
                </button>
                <button 
                  onClick={() => navigate(-1)} 
                  className="btn-volver"
                >
                  <i className="fas fa-arrow-left"></i> {t("mascotas:volver")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL IMAGEN */}
      {modalImage && (
        <div className="modal-imagen" onClick={() => setModalImage(null)}>
          <button className="modal-close" onClick={() => setModalImage(null)}>
            <i className="fas fa-times"></i>
          </button>
          <img src={modalImage} alt="Vista ampliada" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default AdminMascotaDetalle;