import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Mail,
  Heart,
  FileText,
  PawPrint,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import "./FundacionesDetalle.css";

const MapaSimple = ({ direccion, nombre, lat, lng, t }) => {
  // Construir URL para Google Maps iframe
  let mapUrl;
  
  if (lat && lng && parseFloat(lat) !== 0 && parseFloat(lng) !== 0) {
    // Usar coordenadas si están disponibles y son válidas
    mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  } else if (direccion) {
    // Usar dirección codificada
    const encodedAddress = encodeURIComponent(direccion);
    mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&z=15&output=embed`;
  } else {
    // Fallback: coordenadas por defecto (Medellín)
    mapUrl = `https://maps.google.com/maps?q=6.2442,-75.5812&z=13&output=embed`;
  }
  
  // Enlace para abrir en Google Maps
  let googleMapsUrl;
  if (lat && lng && parseFloat(lat) !== 0 && parseFloat(lng) !== 0) {
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  } else {
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion || '')}`;
  }

  return (
    <div className="detalle-mapa-container">
      <iframe
        title={`Mapa de ${nombre}`}
        src={mapUrl}
        width="100%"
        height="280"
        style={{ border: 0, borderRadius: "12px" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="detalle-mapa-footer">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="detalle-mapa-link-externo"
        >
          <MapPin size={14} />
          {t("abrir_maps") || "Abrir en Google Maps"}
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

const FundacionDetalle = () => {
  const { id } = useParams();
  const { t } = useTranslation("fundaciones");
  const [fundacion, setFundacion] = useState(null);
  const [necesidades, setNecesidades] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/storage")) return `http://localhost:8000${url}`;
    return `http://localhost:8000/storage/${url}`;
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/fundaciones/${id}`, {
          signal: abortController.signal,
        });

        if (!isMounted) return;

        let fundacionData = null;
        let necesidadesData = [];
        let mascotasData = [];
        let estadisticasData = null;

        if (response.data && response.data.fundacion) {
          fundacionData = response.data.fundacion;
          necesidadesData = response.data.necesidades || [];
          mascotasData = response.data.mascotas || [];
          estadisticasData = response.data.estadisticas || null;
        } else if (response.data && response.data.id && response.data.Nombre_1) {
          fundacionData = response.data;
          necesidadesData = response.data.necesidades_actuales || [];
        } else if (
          response.data &&
          response.data.success === true &&
          response.data.data
        ) {
          if (response.data.data.fundacion) {
            fundacionData = response.data.data.fundacion;
            necesidadesData = response.data.data.necesidades || [];
            mascotasData = response.data.data.mascotas || [];
          } else {
            fundacionData = response.data.data;
            necesidadesData = fundacionData.necesidades_actuales || [];
          }
        }

        if (!fundacionData) {
          throw new Error(`No se encontró la fundación con ID ${id}`);
        }

        setFundacion(fundacionData);
        setNecesidades(necesidadesData);
        setMascotas(mascotasData);
        setEstadisticas(estadisticasData);
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") {
          return;
        }
        console.error("Error:", error);
        if (isMounted) {
          setError(error.message || t("error_carga"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadData();
    } else {
      setError(t("id_no_especificado"));
      setLoading(false);
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [id, t]);

  if (loading) {
    return (
      <div className="detalle-loading">
        <LoadingSpinner text={t("cargando")} />
      </div>
    );
  }

  if (error || !fundacion) {
    return (
      <div className="fundacion-detalle-page">
        <div className="detalle-container">
          <div className="detalle-error-card">
            <Building size={48} />
            <h4>{t("error_titulo")}</h4>
            <p>{error || t("no_encontrada")}</p>
            <Link to="/fundaciones" className="detalle-btn-back">
              {t("volver")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fundacion-detalle-page">
      {/* Botón volver FUERA del contenedor principal */}
      <div className="detalle-back-outer">
        <div className="detalle-container">
          <Link to="/fundaciones" className="detalle-back-link">
            <ArrowLeft size={16} />
            <span>{t("volver")}</span>
          </Link>
        </div>
      </div>

      <div className="detalle-container">
        <div className="detalle-main-card">
          <div className="detalle-card-content-wrapper">
            {/* Header */}
            <div className="detalle-header">
              <h1>{fundacion.Nombre_1 || fundacion.nombre || t("sin_nombre")}</h1>
              <div className="detalle-header-info">
                {fundacion.ciudad && (
                  <div className="detalle-ciudad">
                    <MapPin size={16} />
                    <span>{fundacion.ciudad}</span>
                  </div>
                )}
                {estadisticas?.verificado && (
                  <div className="detalle-verified">
                    <CheckCircle size={16} />
                    <span>{t("verificada")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Grid 2 columnas */}
            <div className="detalle-info-grid">
              {/* Contacto */}
              <div className="detalle-info-card">
                <div className="detalle-card-header">
                  <Phone size={18} />
                  <h3>{t("contacto")}</h3>
                </div>
                <div className="detalle-card-content">
                  {fundacion.Direccion && (
                    <div className="detalle-field">
                      <label>{t("direccion")}</label>
                      <p>{fundacion.Direccion}</p>
                    </div>
                  )}
                  {fundacion.Telefono && (
                    <div className="detalle-field">
                      <label>{t("telefono")}</label>
                      <p>{fundacion.Telefono}</p>
                    </div>
                  )}
                  {fundacion.Email && (
                    <div className="detalle-field">
                      <label>{t("email")}</label>
                      <p>{fundacion.Email}</p>
                    </div>
                  )}
                  {fundacion.horario_atencion && (
                    <div className="detalle-field">
                      <label>{t("horario")}</label>
                      <p>{fundacion.horario_atencion}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Datos */}
              <div className="detalle-info-card">
                <div className="detalle-card-header">
                  <Heart size={18} />
                  <h3>{t("datos")}</h3>
                </div>
                <div className="detalle-card-content">
                  {fundacion.registro_sanitario && (
                    <div className="detalle-field">
                      <label>{t("registro_sanitario")}</label>
                      <p>{fundacion.registro_sanitario}</p>
                    </div>
                  )}
                  {(fundacion.capacidad_maxima || estadisticas?.capacidad_maxima) && (
                    <div className="detalle-field">
                      <label>{t("capacidad")}</label>
                      <p>
                        {fundacion.capacidad_maxima || estadisticas?.capacidad_maxima} {t("animales")}
                      </p>
                    </div>
                  )}
                  {fundacion.recibe_voluntarios !== undefined && (
                    <div className="detalle-field">
                      <label>{t("voluntarios")}</label>
                      <p>{fundacion.recibe_voluntarios ? t("si_recibe") : t("no_recibe")}</p>
                    </div>
                  )}
                  {fundacion.fecha_fundacion && (
                    <div className="detalle-field">
                      <label>{t("fundacion")}</label>
                      <p>{new Date(fundacion.fecha_fundacion).getFullYear()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            {fundacion.Descripcion && (
              <div className="detalle-section">
                <div className="detalle-section-header">
                  <FileText size={18} />
                  <h3>{t("descripcion")}</h3>
                </div>
                <p className="detalle-descripcion-text">{fundacion.Descripcion}</p>
              </div>
            )}

            {/* Necesidades */}
            {necesidades.length > 0 && (
              <div className="detalle-section">
                <div className="detalle-section-header">
                  <Heart size={18} />
                  <h3>{t("necesidades")}</h3>
                </div>
                <div className="detalle-tags">
                  {necesidades.map((item, index) => (
                    <span key={index} className="detalle-tag">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mapa */}
            {fundacion.Direccion && (
              <div className="detalle-section">
                <div className="detalle-section-header">
                  <MapPin size={18} />
                  <h3>{t("ubicacion")}</h3>
                </div>
                <div className="detalle-mapa-wrapper">
                  <MapaSimple
                    direccion={fundacion.Direccion}
                    nombre={fundacion.Nombre_1}
                    lat={fundacion.lat}
                    lng={fundacion.lng}
                    t={t}
                  />
                </div>
              </div>
            )}

            {/* Mascotas */}
            {mascotas.length > 0 && (
              <div className="detalle-section">
                <div className="detalle-section-header">
                  <PawPrint size={18} />
                  <h3>{t("mascotas_adopcion")}</h3>
                </div>
                <div className="detalle-mascotas-grid">
                  {mascotas.slice(0, 4).map((mascota) => (
                    <Link
                      key={mascota.id}
                      to={`/mascota/${mascota.id}`}
                      className="detalle-mascota-card"
                    >
                      <div className="detalle-mascota-img">
                        {mascota.foto_principal ? (
                          <img
                            src={getImageUrl(mascota.foto_principal)}
                            alt={mascota.nombre_mascota}
                            loading="lazy"
                          />
                        ) : (
                          <div className="detalle-mascota-placeholder">
                            <PawPrint size={24} />
                          </div>
                        )}
                      </div>
                      <div className="detalle-mascota-info">
                        <strong>{mascota.nombre_mascota}</strong>
                        <span>{mascota.especie}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                {mascotas.length > 4 && (
                  <Link to={`/mascotas?fundacion=${id}`} className="detalle-ver-mas">
                    {t("ver_todas")} ({mascotas.length})
                  </Link>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="detalle-footer">
              <small>
                {t("actualizado")}: {new Date(fundacion.updated_at || Date.now()).toLocaleDateString()}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundacionDetalle;