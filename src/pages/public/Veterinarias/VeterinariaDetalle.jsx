// src/pages/public/Veterinarias/VeterinariaDetalle.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
  Ambulance,
  Star,
  Stethoscope,
  Info,
  ExternalLink,
} from "lucide-react";
import api from "../../../services/api";
import { getImageUrl as buildImageUrl } from "../../../utils/imageUtils";
import { SimpleLoadingBar } from "../../../components/common/ProgressBar/ProgressBar";
import "./VeterinariaDetalle.css";

const VeterinariaDetalle = ({ 
  veterinariaId, 
  embed = false,
  onNavigateToVeterinaria // ✅ Nuevo prop
}) => {
  const { id: urlId } = useParams();
  const id = veterinariaId || urlId;
  const { t } = useTranslation("veterinarias");
  const [veterinaria, setVeterinaria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  // ✅ Función para navegar a otra veterinaria (desde veterinarias relacionadas)
  const handleNavigateToVeterinaria = useCallback((nuevoId) => {
    if (onNavigateToVeterinaria) {
      onNavigateToVeterinaria(nuevoId);
    } else if (embed) {
      window.location.href = `/veterinarias/${nuevoId}`;
    } else {
      window.location.href = `/veterinarias/${nuevoId}`;
    }
  }, [embed, onNavigateToVeterinaria]);

  const getImageUrl = (path) => buildImageUrl(path);

  const getImagenUrl = () => {
    if (!veterinaria) return "https://placehold.co/800x450/667eea/FFFFFF?text=Veterinaria";
    
    if (veterinaria.logo) {
      const url = getImageUrl(veterinaria.logo);
      if (url) return url;
    }
    
    if (veterinaria.galeria_fotos) {
      let galeria = veterinaria.galeria_fotos;
      if (typeof galeria === 'string') {
        try {
          galeria = JSON.parse(galeria);
        } catch {
          galeria = [];
        }
      }
      if (Array.isArray(galeria) && galeria.length > 0) {
        const url = getImageUrl(galeria[0]);
        if (url) return url;
      }
    }
    
    return "https://placehold.co/800x450/667eea/FFFFFF?text=Veterinaria";
  };

  const extractData = (response) => {
    if (response?.data && !Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response[0];
    if (response?.data?.data && !Array.isArray(response.data.data))
      return response.data.data;
    return response;
  };

  const getServiciosList = () => {
    if (!veterinaria) return [];

    let servicios = [];
    if (veterinaria.servicios) {
      if (typeof veterinaria.servicios === "string") {
        try {
          const parsed = JSON.parse(veterinaria.servicios);
          if (Array.isArray(parsed) && parsed[0]?.nombre) {
            servicios = parsed.map((s) => s.nombre || s.name || s.servicio);
          } else {
            servicios = parsed;
          }
        } catch {
          servicios = [];
        }
      } else if (Array.isArray(veterinaria.servicios)) {
        if (veterinaria.servicios[0]?.nombre) {
          servicios = veterinaria.servicios.map(
            (s) => s.nombre || s.name || s.servicio,
          );
        } else {
          servicios = veterinaria.servicios;
        }
      }
    }

    if (veterinaria.servicios_detallados) {
      let detallados = [];
      if (typeof veterinaria.servicios_detallados === "string") {
        try {
          const parsed = JSON.parse(veterinaria.servicios_detallados);
          if (Array.isArray(parsed) && parsed[0]?.nombre) {
            detallados = parsed.map((s) => s.nombre || s.name || s.servicio);
          } else {
            detallados = parsed;
          }
        } catch {
          detallados = [];
        }
      } else if (Array.isArray(veterinaria.servicios_detallados)) {
        if (veterinaria.servicios_detallados[0]?.nombre) {
          detallados = veterinaria.servicios_detallados.map(
            (s) => s.nombre || s.name || s.servicio,
          );
        } else {
          detallados = veterinaria.servicios_detallados;
        }
      }
      servicios = [...servicios, ...detallados];
    }

    return [...new Set(servicios)];
  };
  
  const getHorario = () => {
    if (!veterinaria) return null;
    if (veterinaria.horario_atencion) return veterinaria.horario_atencion;
    if (veterinaria.urgencias_24h) return t("horario_24h");
    return t("horario_consultar");
  };

  useEffect(() => {
    const loadVeterinaria = async () => {
      if (!id) return;

      setLoading(true);
      setLoadProgress(0);
      setError(null);

      const progressInterval = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 100);

      try {
        const response = await api.get(`/veterinarias/${id}`);
        let data = extractData(response.data);

        if (data && data.veterinaria) {
          data = data.veterinaria;
        }

        if (!data || Object.keys(data).length === 0) {
          setLoadProgress(100);
          setTimeout(() => {
            setError(t("no_encontrada"));
            setLoading(false);
          }, 300);
        } else {
          setLoadProgress(100);
          setTimeout(() => {
            setVeterinaria(data);
            setLoading(false);
          }, 300);
        }
      } catch (err) {
        console.error("Error cargando veterinaria:", err);
        setLoadProgress(100);
        setTimeout(() => {
          if (err.response?.status === 404) {
            setError(t("no_encontrada"));
          } else {
            setError(err.response?.data?.message || t("error_carga"));
          }
          setLoading(false);
        }, 300);
      } finally {
        clearInterval(progressInterval);
      }
    };

    loadVeterinaria();
  }, [id, t]);

  if (loading) {
    return (
      <div style={{ width: "100%", padding: "20px 0" }}>
        <SimpleLoadingBar
          progress={loadProgress}
          height="12px"
          variant="gradient"
        />
      </div>
    );
  }

  if (error || !veterinaria) {
    return (
      <div className="vd-container">
        {!embed && (
          <div className="vd-actions-bar">
            <Link to="/veterinarias" className="vd-btn-back">
              <ArrowLeft size={16} />
              <span>{t("volver")}</span>
            </Link>
          </div>
        )}
        <div className="vd-bento-grid">
          <div className="vd-error">
            <MapPin size={48} />
            <h3>{error || t("no_encontrada")}</h3>
            <p>{t("error_mensaje")}</p>
            {!embed && (
              <Link
                to="/veterinarias"
                className="vd-btn-back"
                style={{ marginTop: "1rem" }}
              >
                ← {t("volver")}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const servicios = getServiciosList();
  const imageUrl = getImagenUrl();

  return (
    <div className="vd-container">
      {!embed && (
        <div className="vd-actions-bar reveal-up delay-100">
          <Link to="/veterinarias" className="vd-btn-back">
            <ArrowLeft size={16} />
            <span>{t("volver")}</span>
          </Link>
        </div>
      )}

      <div className="vd-bento-grid">
        <div className="vd-imagen-wrapper reveal-scale delay-150">
          <img
            src={imageUrl}
            alt={veterinaria.Nombre_vet}
            className="vd-imagen"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/800x450/667eea/FFFFFF?text=Veterinaria";
            }}
          />
        </div>

        <div className="vd-sidebar">
          <div className="vd-info-card reveal-right delay-200">
            <div className="vd-card-header">
              <Phone size={16} />
              <h3>{t("contacto")}</h3>
            </div>
            {veterinaria.Direccion && (
              <div className="vd-field">
                <label>{t("direccion")}</label>
                <p>{veterinaria.Direccion}</p>
              </div>
            )}
            {veterinaria.Telefono && (
              <div className="vd-field">
                <label>{t("telefono")}</label>
                <p>{veterinaria.Telefono}</p>
              </div>
            )}
            {veterinaria.Email && (
              <div className="vd-field">
                <label>{t("email")}</label>
                <p>{veterinaria.Email}</p>
              </div>
            )}
          </div>

          <div className="vd-info-card reveal-right delay-250">
            <div className="vd-card-header">
              <Clock size={16} />
              <h3>{t("horario")}</h3>
            </div>
            <div className="vd-field">
              <label>{t("atencion")}</label>
              <p>{getHorario()}</p>
            </div>
          </div>

          {(veterinaria.urgencias_24h ||
            veterinaria.verificado ||
            veterinaria.acepta_seguros) && (
            <div className="vd-info-card reveal-right delay-300">
              <div className="vd-card-header">
                <Shield size={16} />
                <h3>{t("servicios_destacados")}</h3>
              </div>
              <div className="vd-badges">
                {veterinaria.urgencias_24h && (
                  <span className="vd-badge vd-badge-urgente">
                    <Ambulance size={12} />
                    {t("urgencias_24h")}
                  </span>
                )}
                {veterinaria.verificado && (
                  <span className="vd-badge vd-badge-verificado">
                    <Shield size={12} />
                    {t("verificado")}
                  </span>
                )}
                {veterinaria.acepta_seguros && (
                  <span className="vd-badge vd-badge-seguro">
                    <Shield size={12} />
                    {t("acepta_seguros")}
                  </span>
                )}
              </div>
            </div>
          )}

          {veterinaria.valoracion_promedio > 0 && (
            <div className="vd-info-card reveal-right delay-350">
              <div className="vd-card-header">
                <Star size={16} />
                <h3>{t("valoracion")}</h3>
              </div>
              <div className="vd-rating">
                <span className="vd-rating-stars">
                  {"★".repeat(Math.round(veterinaria.valoracion_promedio))}
                  {"☆".repeat(5 - Math.round(veterinaria.valoracion_promedio))}
                </span>
                <span className="vd-rating-number">
                  {veterinaria.valoracion_promedio}/5
                </span>
                <span className="vd-rating-count">
                  ({veterinaria.total_valoraciones || 0} {t("valoraciones")})
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="vd-main">
          <h1 className="vd-titulo reveal-up delay-200">{veterinaria.Nombre_vet}</h1>

          {veterinaria.descripcion && (
            <div className="vd-descripcion reveal-up delay-250">
              {veterinaria.descripcion}
            </div>
          )}

          {servicios.length > 0 && (
            <>
              <div className="vd-card-header reveal-up delay-300" style={{ marginBottom: "12px" }}>
                <Stethoscope size={18} />
                <h3 style={{ fontSize: "1rem", margin: 0 }}>
                  {t("servicios")}
                </h3>
              </div>
              <div className="vd-servicios-grid stagger-children">
                {servicios.map((servicio, index) => (
                  <span key={index} className="vd-servicio-badge">
                    ✓ {servicio}
                  </span>
                ))}
              </div>
            </>
          )}

          {(veterinaria.anios_experiencia || veterinaria.equipo_medico) && (
            <div className="vd-info-adicional reveal-up delay-350">
              {veterinaria.anios_experiencia && (
                <div className="vd-info-item">
                  <strong>{t("anios_experiencia")}:</strong>
                  <span>{veterinaria.anios_experiencia}</span>
                </div>
              )}
              {veterinaria.equipo_medico && (
                <div className="vd-info-item">
                  <strong>{t("equipo_medico")}:</strong>
                  <div className="vd-equipo-content">
                    {(() => {
                      let equipo = veterinaria.equipo_medico;

                      if (typeof equipo === "string") {
                        try {
                          equipo = JSON.parse(equipo);
                        } catch {
                          equipo = null;
                        }
                      }

                      if (!equipo) return <span>{t("no_disponible")}</span>;

                      return (
                        <div style={{ marginTop: "8px" }}>
                          {equipo.veterinarios && (
                            <div>
                              <strong>👨‍⚕️ Veterinarios:</strong>{" "}
                              {equipo.veterinarios}
                            </div>
                          )}
                          {equipo.asistentes && (
                            <div>
                              <strong>🩺 Asistentes:</strong>{" "}
                              {equipo.asistentes}
                            </div>
                          )}
                          {equipo.equipos && equipo.equipos.length > 0 && (
                            <div>
                              <strong>🔬 Equipos:</strong>
                              <div
                                className="vd-equipos-tags"
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "6px",
                                  marginTop: "4px",
                                }}
                              >
                                {equipo.equipos.map((eq, idx) => (
                                  <span
                                    key={idx}
                                    className="vd-servicio-badge"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    {eq}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {veterinaria.Direccion && (
            <>
              <div className="vd-card-header reveal-up delay-400" style={{ marginBottom: "12px" }}>
                <MapPin size={18} />
                <h3 style={{ fontSize: "1rem", margin: 0 }}>
                  {t("ubicacion")}
                </h3>
              </div>
              <div className="vd-mapa-container">
                <iframe
                  title={`Mapa de ${veterinaria.Nombre_vet}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(veterinaria.Direccion)}&output=embed`}
                  width="100%"
                  height="280"
                  style={{ border: 0, borderRadius: "8px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div style={{ textAlign: "right", marginTop: "8px" }}>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(veterinaria.Direccion)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vd-mapa-link"
                >
                  <MapPin size={12} />
                  {t("abrir_maps")}
                  <ExternalLink size={10} />
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="vd-footer reveal-fade delay-400">
        <Clock size={14} />
        <small>
          {t("actualizado")}:{" "}
          {new Date(veterinaria.updated_at || Date.now()).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export default VeterinariaDetalle;