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
  const { t } = useTranslation("nuevaMascota");

  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [vacunas, setVacunas] = useState([]);
  const [razas, setRazas] = useState([]);

  // Función para formatear edad
  const formatEdad = (edad) => {
    if (!edad && edad !== 0) return "No especificada";
    const edadNum = parseFloat(edad);
    if (isNaN(edadNum)) return "No especificada";

    if (edadNum < 1) {
      const meses = Math.round(edadNum * 12);
      return `${meses} ${meses === 1 ? "mes" : "meses"}`;
    }
    if (Number.isInteger(edadNum)) {
      return `${edadNum} ${edadNum === 1 ? "año" : "años"}`;
    }
    return `${edadNum.toFixed(1)} años`;
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
        toast.error("No se pudo cargar la mascota");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar la mascota");
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
        toast.success(`Estado actualizado a ${nuevoEstado}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar estado");
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleEliminar = async () => {
    if (!mascotaId) return;

    if (window.confirm(`¿Eliminar a ${mascota?.nombre_mascota}?`)) {
      try {
        const response = await api.delete(`/entity/mascotas/${mascotaId}`);
        if (response.data.success) {
          toast.success("Mascota eliminada");
          navigate("/fundacion/mascotas");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error al eliminar");
      }
    }
  };

  if (loading) {
    return (
      <div className="mascota-detalle-page-fundacion">
        <LoadingSpinner text="Cargando..." />
      </div>
    );
  }

  if (!mascota) {
    return (
      <div className="mascota-detalle-page-fundacion">
        <div className="error-container">
          <i className="fas fa-paw"></i>
          <h2>Mascota no encontrada</h2>
          <Link to="/fundacion/mascotas" className="btn-back-fundacion">
            Volver
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
        return "En adopción";
      case "Adoptado":
        return "Adoptado";
      case "Rescatada":
        return "Rescatada";
      default:
        return "En acogida";
    }
  };

  const galeriaArray = getGaleriaArray(mascota.galeria_fotos);

  // Todas las fotos (principal + galería)
  const todasLasFotos = [
    mascota.foto_principal && {
      url: mascota.foto_principal,
      esPrincipal: true,
    },
    ...galeriaArray.map((foto) => ({ url: foto, esPrincipal: false })),
  ].filter(Boolean);

  return (
    <div className="mascota-detalle-page-fundacion">
      <div className="detalle-container-fundacion">
        <div className="detalle-header-fundacion">
          <button onClick={() => navigate(-1)} className="btn-back-fundacion">
            <i className="fas fa-arrow-left"></i> Volver
          </button>
          <div className="header-actions-fundacion">
            <Link
              to={`/fundacion/mascotas/editar/${mascotaId}`}
              className="btn-edit-fundacion"
            >
              <i className="fas fa-edit"></i> Editar
            </Link>
            <button onClick={handleEliminar} className="btn-delete-fundacion">
              <i className="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>

        <div className="detalle-content-fundacion">
          <div className="detalle-imagen-fundacion">
            {mascota.foto_principal ? (
              <img
                src={getImageUrl(mascota.foto_principal)}
                alt={mascota.nombre_mascota}
                onError={(e) => {
                  e.target.src = "https://placehold.co/400x300?text=Sin+Imagen";
                }}
              />
            ) : (
              <div className="image-placeholder-fundacion">
                <i className="fas fa-paw fa-5x"></i>
              </div>
            )}
            <span className={`estado-badge-fundacion ${getEstadoClass()}`}>
              {getEstadoTexto()}
            </span>
          </div>

          <div className="detalle-info-fundacion">
            <h1>{mascota.nombre_mascota}</h1>
            <p className="id-mascota-fundacion">ID: #{mascota.id}</p>

            <div className="info-grid-fundacion">
              <div className="info-item-fundacion">
                <i className="fas fa-tag"></i>
                <strong>Especie:</strong>
                <span>{mascota.especie || "No especificada"}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-paw"></i>
                <strong>Raza(s):</strong>
                <span>
                  {razas.length > 0
                    ? razas.map((r) => r.nombre_raza || r.nombre).join(", ")
                    : "Mixto"}
                </span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-calendar"></i>
                <strong>Edad:</strong>
                <span>{formatEdad(mascota.edad_aprox)}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-venus-mars"></i>
                <strong>Género:</strong>
                <span>{mascota.genero || "No especificado"}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-map-marker-alt"></i>
                <strong>Lugar de rescate:</strong>
                <span>{mascota.lugar_rescate || "No especificado"}</span>
              </div>
              <div className="info-item-fundacion">
                <i className="fas fa-clock"></i>
                <strong>Fecha ingreso:</strong>
                <span>
                  {new Date(mascota.fecha_ingreso).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="info-section-fundacion">
              <h3>Descripción</h3>
              <p>{mascota.descripcion || "Sin descripción"}</p>
            </div>

            {mascota.condiciones_especiales && (
              <div className="info-section-fundacion">
                <h3>Condiciones especiales</h3>
                <p>{mascota.condiciones_especiales}</p>
              </div>
            )}

            {/* Vacunas */}
            {vacunas.length > 0 && (
              <div className="info-section-fundacion">
                <h3>
                  <i className="fas fa-syringe"></i> Vacunas aplicadas
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

            <div className="info-section-fundacion">
              <h3>Estado actual</h3>
              <select
                value={mascota.estado}
                onChange={(e) => handleEstadoChange(e.target.value)}
                className="estado-select-fundacion"
                disabled={cambiandoEstado}
              >
                <option value="En adopcion">En adopción</option>
                <option value="Rescatada">Rescatada</option>
                <option value="En acogida">En acogida</option>
                <option value="Adoptado">Adoptado</option>
              </select>
              {cambiandoEstado && (
                <span className="loading-fundacion">Actualizando...</span>
              )}
            </div>

            {/* Galería de fotos */}
            {todasLasFotos.length > 0 && (
              <div className="info-section-fundacion">
                <h3>Galería de fotos</h3>
                <div className="galeria-grid-fundacion">
                  {todasLasFotos.map((foto, idx) => (
                    <div
                      key={idx}
                      className={`galeria-item-fundacion ${foto.esPrincipal ? "principal" : ""}`}
                    >
                      <img
                        src={getImageUrl(foto.url)}
                        alt={`Foto ${idx + 1}`}
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/100x100?text=Error";
                        }}
                      />
                      {foto.esPrincipal && (
                        <span className="principal-badge-fundacion">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MascotaDetalleFundacion;