// src/components/common/VeterinariaCard/VeterinariaCard.jsx
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Building,
  MapPin,
  Phone,
  Clock,
  Shield,
  Ambulance,
  ChevronRight,
} from "lucide-react";
import "./VeterinariaCard.css";

const VeterinariaCard = memo(
  ({
    veterinaria,
    getImageUrl,
    variant = "default",
    showActions = true,
    onView,
  }) => {
    const { t } = useTranslation("veterinarias");

    const {
      id,
      Nombre_vet,
      Direccion,
      Telefono,
      ciudad,
      verificado = false,
      urgencias_24h = false,
      horario_atencion,
      servicios,
      logo,                    // ✅ CORREGIDO: antes era imagen_portada
    } = veterinaria;

    const getServiciosList = () => {
      if (!servicios) return [];
      if (typeof servicios === "string") {
        try {
          return JSON.parse(servicios);
        } catch {
          return [];
        }
      }
      if (Array.isArray(servicios)) return servicios;
      return [];
    };

    const serviciosList = getServiciosList();
    const serviciosMostrar = serviciosList.slice(0, 3);
    
    // ✅ CORREGIDO: usa logo en lugar de imagen_portada
    const imageUrl = useMemo(
      () => getImageUrl?.(logo),
      [logo, getImageUrl],
    );

    return (
      <div className="vc-card">
        <div className="vc-image">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={Nombre_vet}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
                const placeholder =
                  e.target.parentElement?.querySelector(".vc-placeholder");
                if (placeholder) placeholder.style.display = "flex";
              }}
            />
          ) : null}

          {/* ✅ CORREGIDO: usa logo en lugar de imagen_portada */}
          <div
            className="vc-placeholder"
            style={{ display: logo ? "none" : "flex" }}
          >
            <Building />
            <span>{t("veterinaria", "Veterinaria")}</span>
          </div>

          <div className="vc-badges">
            {verificado && (
              <span
                className="vc-badge-verificado"
                title={t("verificado", "Verificada")}
              >
                <Shield size={12} />
              </span>
            )}

            {urgencias_24h && (
              <span
                className="vc-badge-urgencia"
                title={t("urgencias_24h", "Urgencias 24h")}
              >
                <Ambulance size={12} />
              </span>
            )}
          </div>
        </div>

        <div className="vc-main">
          <div className="vc-header">
            <h3 className="vc-title">{Nombre_vet}</h3>

            {ciudad && (
              <span className="vc-ciudad">
                <MapPin />
                {ciudad}
              </span>
            )}
          </div>

          <div className="vc-contact-info">
            {Telefono && (
              <div className="vc-contact-item">
                <Phone />
                <span>{Telefono}</span>
              </div>
            )}

            {Direccion && (
              <div className="vc-contact-item">
                <MapPin />
                <span>{Direccion}</span>
              </div>
            )}

            {horario_atencion && (
              <div className="vc-contact-item">
                <Clock />
                <span>{horario_atencion}</span>
              </div>
            )}
          </div>

          {serviciosMostrar.length > 0 && (
            <div className="vc-servicios">
              {serviciosMostrar.map((servicio, idx) => (
                <span key={idx} className="vc-servicio-tag">
                  {servicio}
                </span>
              ))}

              {serviciosList.length > 3 && (
                <span className="vc-servicio-mas">
                  +{serviciosList.length - 3}
                </span>
              )}
            </div>
          )}

          {showActions && (
            <div className="vc-actions">
              <button
                className="vc-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(veterinaria);
                }}
                type="button"
              >
                {t("ver_detalles", "Ver detalles")}
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

VeterinariaCard.displayName = "VeterinariaCard";

export default VeterinariaCard;