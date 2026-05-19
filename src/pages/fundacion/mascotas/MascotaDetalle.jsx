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
      pequeño: t("nuevaMascota:tamano_pequeño"),
      mediano: t("nuevaMascota:tamano_mediano"),
      grande: t("nuevaMascota:tamano_grande"),
      muy_grande: t("nuevaMascota:tamano_muy_grande"),
    };
    return tamanos[tamano] || tamano;
  };

  const safeGetImageUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    return getImageUrl(url);
  };

  const openImageModal = (imageUrl) => {
    if (imageUrl && typeof imageUrl === "string") {
      setModalImage(imageUrl);
    }
  };

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
        toast.error(t("nuevaMascota:error_cargar"));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("nuevaMascota:error_carga"));
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
        toast.success(t("nuevaMascota:estado_actualizado", { estado: nuevoEstado }));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("nuevaMascota:error_actualizar"));
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleEliminar = async () => {
    if (!mascotaId) return;

    const confirmacion = window.confirm(
      t("nuevaMascota:confirmar_eliminar", { nombre: mascota?.nombre_mascota })
    );

    if (confirmacion) {
      try {
        const response = await api.delete(`/entity/mascotas/${mascotaId}`);
        if (response.data.success) {
          navigate("/fundacion/mascotas");
        } else {
          toast.error(response.data.message || t("nuevaMascota:error_eliminar"));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || t("nuevaMascota:error_eliminar"));
      }
    }
  };

  if (loading) {
    return (
      <div className="mascota-detalle-page-fundacion">
        <LoadingSpinner text={t("mascotas:cargando_detalle")} />
      </div>
    );
  }

  if (!mascota) {
    return (
      <div className="mascota-detalle-page-fundacion">
        <div className="error-container">
          <i className="fas fa-paw"></i>
          <h2>{t("mascotas:no_encontrada")}</h2>
          <Link to="/fundacion/mascotas" className="btn-back-fundacion">
            <i className="fas fa-arrow-left"></i> {t("mascotas:volver")}
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
        return t("mascotas:en_adopcion");
      case "Adoptado":
        return t("mascotas:adoptado");
      case "Rescatada":
        return t("mascotas:rescatada");
      default:
        return t("mascotas:en_acogida");
    }
  };

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

  // Función para obtener el texto del hogar recomendado
  const getHogarRecomendadoTexto = (hogar) => {
    const hogares = {
      casa_con_jardin: t("nuevaMascota:casa_con_jardin"),
      departamento: t("nuevaMascota:departamento"),
      casa_sin_jardin: t("nuevaMascota:casa_sin_jardin"),
      espacio_amplio: t("nuevaMascota:espacio_amplio"),
    };
    return hogares[hogar] || hogar;
  };

  return (
    <div className="mascota-detalle-page-fundacion">
      <div className="detalle-container-fundacion">
        <div className="detalle-header-fundacion">
          <button onClick={() => navigate(-1)} className="btn-back-fundacion">
            <i className="fas fa-arrow-left"></i> {t("mascotas:volver")}
          </button>
        </div>

        <div className="detalle-content-fundacion">
          <div className="imagenes-section-fundacion">
            <div
              className="imagen-principal-fundacion"
              onClick={() => openImageModal(imagenActualUrl)}
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
                <div className="image-placeholder-fundacion">
                  <i className="fas fa-paw fa-4x"></i>
                  <p>{t("mascotas:sin_imagen")}</p>
                </div>
              )}
              <span className={`estado-badge-fundacion ${getEstadoClass()}`}>
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
                      className={`miniatura-item ${imagenActual === idx ? "activa" : ""} ${img.esPrincipal ? "principal" : ""}`}
                      onClick={() => cambiarImagen(idx)}
                    >
                      {imgUrl ? (
                        <>
                          <img
                            src={imgUrl}
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
                  );
                })}
              </div>
            )}
          </div>

          <div className="detalle-info-fundacion">
            <h1 className="mascota-titulo">{mascota.nombre_mascota}</h1>
            <p className="id-mascota-fundacion">ID: #{mascota.id}</p>

            <div className="info-grid-fundacion">
              <div className="info-item-fundacion">
                <i className="fas fa-tag"></i>
                <strong>{t("nuevaMascota:especie")}</strong>
                <span>{mascota.especie || t("mascotas:no_especificada")}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-paw"></i>
                <strong>{t("nuevaMascota:raza")}</strong>
                <span>
                  {razas.length > 0
                    ? razas.map((r) => r.nombre_raza || r.nombre).join(", ")
                    : t("mascotas:mixto")}
                </span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-calendar"></i>
                <strong>{t("nuevaMascota:edad")}</strong>
                <span>{formatEdad(mascota.edad_aprox)}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-venus-mars"></i>
                <strong>{t("nuevaMascota:genero")}</strong>
                <span>{mascota.genero || t("mascotas:no_especificado")}</span>
              </div>

              {(mascota.peso_aprox || mascota.tamano || mascota.color) && (
                <>
                  <div className="info-item-fundacion">
                    <i className="fas fa-weight-hanging"></i>
                    <strong>{t("nuevaMascota:peso_aprox")}</strong>
                    <span>
                      {mascota.peso_aprox
                        ? `${mascota.peso_aprox} kg`
                        : t("mascotas:no_especificado")}
                    </span>
                  </div>
                  <div className="info-item-fundacion">
                    <i className="fas fa-ruler-combined"></i>
                    <strong>{t("nuevaMascota:tamano")}</strong>
                    <span>
                      {mascota.tamano
                        ? getTamanoTexto(mascota.tamano)
                        : t("mascotas:no_especificado")}
                    </span>
                  </div>
                  <div className="info-item-fundacion">
                    <i className="fas fa-palette"></i>
                    <strong>{t("nuevaMascota:color")}</strong>
                    <span>{mascota.color || t("mascotas:no_especificado")}</span>
                  </div>
                </>
              )}

              <div className="info-item-fundacion">
                <i className="fas fa-map-marker-alt"></i>
                <strong>{t("nuevaMascota:lugar_rescate")}</strong>
                <span>{mascota.lugar_rescate || t("mascotas:no_especificado")}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-clock"></i>
                <strong>{t("nuevaMascota:fecha_ingreso")}</strong>
                <span>
                  {mascota.fecha_ingreso
                    ? new Date(mascota.fecha_ingreso).toLocaleDateString()
                    : t("mascotas:no_especificada")}
                </span>
              </div>
            </div>

            <div className="info-section-fundacion">
              <h3>
                <i className="fas fa-file-alt"></i> {t("nuevaMascota:descripcion")}
              </h3>
              <p>{mascota.descripcion || t("mascotas:sin_descripcion")}</p>
            </div>

            {mascota.condiciones_especiales && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-heartbeat"></i> {t("nuevaMascota:condiciones_especiales")}
                </h3>
                <p>{mascota.condiciones_especiales}</p>
              </div>
            )}

            {mascota.salud_general && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-stethoscope"></i> {t("nuevaMascota:salud_general")}
                </h3>
                <p>{mascota.salud_general}</p>
              </div>
            )}

            {(mascota.esterilizado || mascota.desparasitado || mascota.vacunado) && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-check-circle"></i> {t("nuevaMascota:estado_salud")}
                </h3>
                <div className="salud-badges">
                  {mascota.esterilizado && (
                    <span className="salud-badge esterilizado">
                      <i className="fas fa-scissors"></i> {t("nuevaMascota:esterilizado")}
                    </span>
                  )}
                  {mascota.desparasitado && (
                    <span className="salud-badge desparasitado">
                      <i className="fas fa-bug"></i> {t("nuevaMascota:desparasitado")}
                    </span>
                  )}
                  {mascota.vacunado && (
                    <span className="salud-badge vacunado">
                      <i className="fas fa-syringe"></i> {t("nuevaMascota:vacunado")}
                    </span>
                  )}
                </div>
              </div>
            )}

            {enfermedadesArray.length > 0 && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-notes-medical"></i> {t("nuevaMascota:enfermedades_cronicas")}
                </h3>
                <div className="enfermedades-lista">
                  {enfermedadesArray.map((enf, idx) => (
                    <span key={idx} className="enfermedad-tag">
                      <i className="fas fa-exclamation-triangle"></i> {enf}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {medicamentosArray.length > 0 && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-tablets"></i> {t("nuevaMascota:medicamentos")}
                </h3>
                <div className="medicamentos-lista">
                  {medicamentosArray.map((med, idx) => (
                    <span key={idx} className="medicamento-tag">
                      <i className="fas fa-capsules"></i> {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {vacunas.length > 0 && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-syringe"></i> {t("nuevaMascota:vacunas_aplicadas")}
                </h3>
                <div className="vacunas-lista-fundacion">
                  {vacunas.map((vacuna, idx) => (
                    <span key={idx} className="vacuna-tag-fundacion">
                      <i className="fas fa-shield-alt"></i> {vacuna.nombre_vacuna || vacuna.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {requisitosArray.length > 0 && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-clipboard-list"></i> {t("nuevaMascota:requisitos_adopcion")}
                </h3>
                <ul className="requisitos-lista">
                  {requisitosArray.map((req, idx) => (
                    <li key={idx}>
                      <i className="fas fa-check-circle"></i> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mascota.hogar_recomendado && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-home"></i> {t("nuevaMascota:hogar_recomendado")}
                </h3>
                <p className="hogar-recomendado">
                  <i className="fas fa-info-circle"></i> {getHogarRecomendadoTexto(mascota.hogar_recomendado)}
                </p>
              </div>
            )}

            {(mascota.necesita_hogar_temporal !== undefined ||
              mascota.apto_con_ninos !== undefined ||
              mascota.apto_con_otros_animales !== undefined) && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-heart"></i> {t("nuevaMascota:aptitudes")}
                </h3>
                <div className="aptitudes-grid">
                  {mascota.necesita_hogar_temporal && (
                    <span className="aptitud-tag temporal">
                      <i className="fas fa-clock"></i> {t("nuevaMascota:necesita_hogar_temporal")}
                    </span>
                  )}
                  {mascota.apto_con_ninos && (
                    <span className="aptitud-tag ninos">
                      <i className="fas fa-child"></i> {t("nuevaMascota:apto_con_ninos")}
                    </span>
                  )}
                  {!mascota.apto_con_ninos && mascota.apto_con_ninos !== undefined && (
                    <span className="aptitud-tag no-ninos">
                      <i className="fas fa-child"></i> {t("mascotas:no_apto_ninos")}
                    </span>
                  )}
                  {mascota.apto_con_otros_animales && (
                    <span className="aptitud-tag animales">
                      <i className="fas fa-dog"></i> {t("nuevaMascota:apto_con_otros_animales")}
                    </span>
                  )}
                  {!mascota.apto_con_otros_animales && mascota.apto_con_otros_animales !== undefined && (
                    <span className="aptitud-tag no-animales">
                      <i className="fas fa-dog"></i> {t("mascotas:no_apto_animales")}
                    </span>
                  )}
                </div>
              </div>
            )}

            {mascota.video_url && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-video"></i> {t("nuevaMascota:video")}
                </h3>
                <div className="video-container">
                  <a
                    href={mascota.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-link"
                  >
                    <i className="fas fa-play-circle"></i> {t("nuevaMascota:ver_video", { nombre: mascota.nombre_mascota })}
                  </a>
                </div>
              </div>
            )}

            <div className="info-section-fundacion">
              <h3>
                <i className="fas fa-chart-line"></i> {t("nuevaMascota:estado_actual")}
              </h3>
              <select
                value={mascota.estado}
                onChange={(e) => handleEstadoChange(e.target.value)}
                className="estado-select-fundacion"
                disabled={cambiandoEstado}
              >
                <option value="En adopción">{t("mascotas:en_adopcion")}</option>
                <option value="Rescatada">{t("mascotas:rescatada")}</option>
                <option value="En acogida">{t("mascotas:en_acogida")}</option>
                <option value="Adoptado">{t("mascotas:adoptado")}</option>
              </select>
              {cambiandoEstado && (
                <span className="loading-fundacion">{t("nuevaMascota:actualizando")}</span>
              )}
            </div>

            <div className="acciones-finales-fundacion">
              <div className="botones-container">
                <Link
                  to={`/fundacion/mascotas/editar/${mascotaId}`}
                  className="btn-edit-fundacion"
                >
                  <i className="fas fa-edit"></i> {t("nuevaMascota:editar")}
                </Link>
                <button onClick={handleEliminar} className="btn-delete-fundacion">
                  <i className="fas fa-trash"></i> {t("nuevaMascota:eliminar")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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