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

  // Función para obtener array de galería - CORREGIDA para manejar diferentes formatos
  const getGaleriaArray = (galeria) => {
    if (!galeria) return [];
    if (Array.isArray(galeria)) {
      // Filtrar solo strings válidos
      return galeria.filter(item => item && typeof item === 'string');
    }
    if (typeof galeria === "string") {
      try {
        const parsed = JSON.parse(galeria);
        return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'string') : [];
      } catch (e) {
        // Si no es JSON válido, podría ser una sola URL
        return galeria ? [galeria] : [];
      }
    }
    return [];
  };

  // Función para obtener array de strings (enfermedades, medicamentos, requisitos)
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

  // Función para obtener el texto del tamaño
  const getTamanoTexto = (tamano) => {
    const tamanos = {
      pequeño: "Pequeño",
      mediano: "Mediano",
      grande: "Grande",
      muy_grande: "Muy grande"
    };
    return tamanos[tamano] || tamano;
  };

  // Función segura para obtener URL de imagen
  const safeGetImageUrl = (url) => {
    if (!url) return null;
    if (typeof url !== 'string') return null;
    return getImageUrl(url);
  };

  // Abrir modal de imagen
  const openImageModal = (imageUrl) => {
    if (imageUrl && typeof imageUrl === 'string') {
      setModalImage(imageUrl);
    }
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
    console.log('Intentando eliminar mascota con ID:', mascotaId);
    console.log('Datos de la mascota:', mascota);

    if (!mascotaId) {
      console.error('No hay mascotaId para eliminar');
      return;
    }

    const confirmacion = window.confirm(t("nuevaMascota:confirmar_eliminar", "¿Eliminar a {{nombre}}?", { nombre: mascota?.nombre_mascota }));
    console.log('Confirmación del usuario:', confirmacion);

    if (confirmacion) {
      try {
        console.log('Enviando petición DELETE a:', `/entity/mascotas/${mascotaId}`);
        const response = await api.delete(`/entity/mascotas/${mascotaId}`);
        console.log('Respuesta del servidor:', response);

        if (response.data.success) {
          console.log('Mascota eliminada exitosamente');
          toast.success(t("nuevaMascota:mascota_eliminada", "Mascota eliminada"));
          navigate("/fundacion/mascotas");
        } else {
          console.error('Error en la respuesta:', response.data);
          toast.error(response.data.message || t("nuevaMascota:error_eliminar", "Error al eliminar"));
        }
      } catch (error) {
        console.error("Error al eliminar mascota:", error);
        console.error("Detalles del error:", error.response?.data);
        toast.error(error.response?.data?.message || t("nuevaMascota:error_eliminar", "Error al eliminar"));
      }
    } else {
      console.log('Usuario canceló la eliminación');
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
  const enfermedadesArray = getArrayFromJson(mascota.enfermedades_cronicas);
  const medicamentosArray = getArrayFromJson(mascota.medicamentos);
  const requisitosArray = getArrayFromJson(mascota.requisitos_adopcion);

  // Array de todas las imágenes (principal + galería) - CORREGIDO para validar strings
  const todasLasImagenes = [];
  
  // Agregar foto principal si existe y es string
  if (mascota.foto_principal && typeof mascota.foto_principal === 'string') {
    todasLasImagenes.push({
      url: mascota.foto_principal,
      esPrincipal: true,
      alt: `${mascota.nombre_mascota} - Foto principal`,
    });
  }
  
  // Agregar imágenes de galería
  galeriaArray.forEach((foto, idx) => {
    if (foto && typeof foto === 'string') {
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

          {/* Información de la mascota - el resto del código se mantiene igual */}
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
              
              {/* Características Físicas */}
              {(mascota.peso_aprox || mascota.tamano || mascota.color) && (
                <>
                  <div className="info-item-fundacion">
                    <i className="fas fa-weight-hanging"></i>
                    <strong>{t("nuevaMascota:peso_aprox", "Peso")}</strong>
                    <span>{mascota.peso_aprox ? `${mascota.peso_aprox} kg` : t("mascotas:no_especificado", "No especificado")}</span>
                  </div>
                  <div className="info-item-fundacion">
                    <i className="fas fa-ruler-combined"></i>
                    <strong>{t("nuevaMascota:tamano", "Tamaño")}</strong>
                    <span>{mascota.tamano ? getTamanoTexto(mascota.tamano) : t("mascotas:no_especificado", "No especificado")}</span>
                  </div>
                  <div className="info-item-fundacion">
                    <i className="fas fa-palette"></i>
                    <strong>{t("nuevaMascota:color", "Color")}</strong>
                    <span>{mascota.color || t("mascotas:no_especificado", "No especificado")}</span>
                  </div>
                </>
              )}

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

            {/* Salud General */}
            {mascota.salud_general && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-stethoscope"></i> {t("nuevaMascota:salud_general", "Salud general")}
                </h3>
                <p>{mascota.salud_general}</p>
              </div>
            )}

            {/* Estado de salud (booleanos) */}
            {(mascota.esterilizado || mascota.desparasitado || mascota.vacunado) && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-check-circle"></i> {t("nuevaMascota:estado_salud", "Estado de salud")}
                </h3>
                <div className="salud-badges">
                  {mascota.esterilizado && (
                    <span className="salud-badge esterilizado">
                      <i className="fas fa-scissors"></i> {t("nuevaMascota:esterilizado", "Esterilizado/a")}
                    </span>
                  )}
                  {mascota.desparasitado && (
                    <span className="salud-badge desparasitado">
                      <i className="fas fa-bug"></i> {t("nuevaMascota:desparasitado", "Desparasitado/a")}
                    </span>
                  )}
                  {mascota.vacunado && (
                    <span className="salud-badge vacunado">
                      <i className="fas fa-syringe"></i> {t("nuevaMascota:vacunado", "Vacunado/a")}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Enfermedades crónicas */}
            {enfermedadesArray.length > 0 && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-notes-medical"></i> {t("nuevaMascota:enfermedades_cronicas", "Enfermedades crónicas")}
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

            {/* Medicamentos */}
            {medicamentosArray.length > 0 && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-tablets"></i> {t("nuevaMascota:medicamentos", "Medicamentos")}
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

            {/* Vacunas */}
            {vacunas.length > 0 && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-syringe"></i> {t("nuevaMascota:vacunas", "Vacunas aplicadas")}
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

            {/* Requisitos de adopción */}
            {requisitosArray.length > 0 && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-clipboard-list"></i> {t("nuevaMascota:requisitos_adopcion", "Requisitos de adopción")}
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

            {/* Hogar recomendado */}
            {mascota.hogar_recomendado && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-home"></i> {t("nuevaMascota:hogar_recomendado", "Hogar recomendado")}
                </h3>
                <p className="hogar-recomendado">
                  <i className="fas fa-info-circle"></i> {mascota.hogar_recomendado === "casa_jardin" ? "Casa con jardín" :
                    mascota.hogar_recomendado === "departamento" ? "Departamento" :
                    mascota.hogar_recomendado === "casa_sin_jardin" ? "Casa sin jardín" :
                    mascota.hogar_recomendado === "espacio_amplio" ? "Espacio amplio" :
                    mascota.hogar_recomendado}
                </p>
              </div>
            )}

            {/* Aptitudes */}
            {(mascota.necesita_hogar_temporal !== undefined || mascota.apto_con_ninos !== undefined || mascota.apto_con_otros_animales !== undefined) && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-heart"></i> {t("nuevaMascota:aptitudes", "Aptitudes")}
                </h3>
                <div className="aptitudes-grid">
                  {mascota.necesita_hogar_temporal && (
                    <span className="aptitud-tag temporal">
                      <i className="fas fa-clock"></i> {t("nuevaMascota:necesita_hogar_temporal", "Necesita hogar temporal")}
                    </span>
                  )}
                  {mascota.apto_con_ninos && (
                    <span className="aptitud-tag ninos">
                      <i className="fas fa-child"></i> {t("nuevaMascota:apto_con_ninos", "Apto con niños")}
                    </span>
                  )}
                  {!mascota.apto_con_ninos && mascota.apto_con_ninos !== undefined && (
                    <span className="aptitud-tag no-ninos">
                      <i className="fas fa-child"></i> {t("nuevaMascota:no_apto_ninos", "No apto con niños")}
                    </span>
                  )}
                  {mascota.apto_con_otros_animales && (
                    <span className="aptitud-tag animales">
                      <i className="fas fa-dog"></i> {t("nuevaMascota:apto_con_otros_animales", "Apto con otros animales")}
                    </span>
                  )}
                  {!mascota.apto_con_otros_animales && mascota.apto_con_otros_animales !== undefined && (
                    <span className="aptitud-tag no-animales">
                      <i className="fas fa-dog"></i> {t("nuevaMascota:no_apto_animales", "No apto con otros animales")}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Video */}
            {mascota.video_url && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-video"></i> {t("nuevaMascota:video", "Video")}
                </h3>
                <div className="video-container">
                  <a href={mascota.video_url} target="_blank" rel="noopener noreferrer" className="video-link">
                    <i className="fas fa-play-circle"></i> Ver video de {mascota.nombre_mascota}
                  </a>
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