// src/pages/public/SolicitarAdopcion/SolicitarAdopcion.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import useImageUrl from "../../../hooks/useImageUrl";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import StepperProgreso from "./components/StepperProgreso";
import Paso1DatosPersonales from "./components/Paso1DatosPersonales";
import Paso2InformacionAdicional from "./components/Paso2InformacionAdicional";
import Paso3Compromisos from "./components/Paso3Compromisos";
import Paso4Revision from "./components/Paso4Revision";
import TarjetaMascotaInfo from "./components/TarjetaMascotaInfo";
import BotonesNavegacion from "./components/BotonesNavegacion";
import "./SolicitarAdopcion.css";

const SolicitarAdopcion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("adoption");
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { getImageUrl } = useImageUrl();

  const [paso, setPaso] = useState(1);
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState({});

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento_identidad: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    ocupacion: "",
    direccion: "",
    ciudad: "",
    departamento: "",
    codigo_postal: "",
    estado_civil: "",
    cantidad_hijos: "",
    tipo_vivienda: "",
    es_propietario: "",
    experiencia_mascotas: "",
    motivo_adopcion: "",
    compromiso_cuidado: false,
    compromiso_esterilizacion: false,
    compromiso_seguimiento: false,
  });

  // Función para hacer scroll al primer campo con error
  const scrollToFirstError = () => {
    setTimeout(() => {
      const primerError = document.querySelector(
        ".solicitud-adopcion-unique .form-grupo input.error, .solicitud-adopcion-unique .form-grupo select.error, .solicitud-adopcion-unique .form-grupo textarea.error, .solicitud-adopcion-unique .error-mensaje",
      );
      if (primerError) {
        const inputPadre = primerError.closest(".form-grupo");
        if (inputPadre) {
          inputPadre.scrollIntoView({ behavior: "smooth", block: "center" });
          const input = inputPadre.querySelector("input, select, textarea");
          if (input) input.focus();
        }
      }
    }, 100);
  };

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.warning(t("debes_iniciar_sesion"));
        navigate("/login", { state: { from: `/solicitar-adopcion/${id}` } });
      }
    }
  }, [isAuthenticated, authLoading, navigate, id, t]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMascota();
      setFormData((prev) => ({
        ...prev,
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
      }));
    }
  }, [id, isAuthenticated, user]);

  const fetchMascota = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/mascotas/${id}`, {
        params: {
          fields:
            "id,nombre_mascota,especie,genero,edad_aprox,tamano,estado,foto_principal,galeria_fotos",
        },
      });
      if (response.data.success) {
        const data = response.data.data;
        if (data.estado !== "En adopcion" && data.estado !== "En adopción") {
          toast.error(t("mascota_no_disponible"));
          navigate("/mascotas");
          return;
        }
        setMascota(data);
      } else {
        toast.error(t("error_cargar_mascota"));
        navigate("/mascotas");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(t("error_cargar_mascota"));
      navigate("/mascotas");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      if (errores[name]) {
        setErrores((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errores],
  );

  // VALIDACIÓN COMPLETA CON TODAS LAS REGLAS
  const validarPaso = useCallback(() => {
    const nuevosErrores = {};

    // Expresiones regulares
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefonoRegex = /^[0-9]{7,15}$/;
    const documentoRegex = /^[0-9]{6,15}$/;

    if (paso === 1) {
      // Nombre y apellido
      if (!formData.nombre?.trim())
        nuevosErrores.nombre = t("nombre_requerido");
      else if (formData.nombre.trim().length < 2)
        nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres";

      if (!formData.apellido?.trim())
        nuevosErrores.apellido = t("apellido_requerido");
      else if (formData.apellido.trim().length < 2)
        nuevosErrores.apellido = "El apellido debe tener al menos 2 caracteres";

      // Documento
      if (!formData.documento_identidad?.trim())
        nuevosErrores.documento_identidad = t("documento_requerido");
      else if (
        !documentoRegex.test(formData.documento_identidad.replace(/\D/g, ""))
      ) {
        nuevosErrores.documento_identidad =
          "Ingresa un documento válido (solo números, mínimo 6 dígitos)";
      }

      // Email
      if (!formData.email?.trim()) nuevosErrores.email = t("email_requerido");
      else if (!emailRegex.test(formData.email))
        nuevosErrores.email = "Ingresa un correo electrónico válido";

      // Teléfono
      if (!formData.telefono?.trim())
        nuevosErrores.telefono = t("telefono_requerido");
      else if (!telefonoRegex.test(formData.telefono.replace(/\D/g, ""))) {
        nuevosErrores.telefono =
          "Ingresa un teléfono válido (mínimo 7 dígitos)";
      }

      // Fecha de nacimiento (opcional pero si se ingresa, validar edad)
      if (formData.fecha_nacimiento) {
        const fechaNac = new Date(formData.fecha_nacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mesDiff = hoy.getMonth() - fechaNac.getMonth();
        if (
          mesDiff < 0 ||
          (mesDiff === 0 && hoy.getDate() < fechaNac.getDate())
        ) {
          edad--;
        }
        if (edad < 18) {
          nuevosErrores.fecha_nacimiento =
            "Debes ser mayor de 18 años para adoptar";
        } else if (edad > 100) {
          nuevosErrores.fecha_nacimiento =
            "Por favor verifica tu fecha de nacimiento";
        }
      }
      if (!formData.fecha_nacimiento) {
        nuevosErrores.fecha_nacimiento = "La fecha de nacimiento es requerida";
      } else {
        const fechaNac = new Date(formData.fecha_nacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mesDiff = hoy.getMonth() - fechaNac.getMonth();
        if (
          mesDiff < 0 ||
          (mesDiff === 0 && hoy.getDate() < fechaNac.getDate())
        ) {
          edad--;
        }
        if (edad < 18) {
          nuevosErrores.fecha_nacimiento =
            "Debes ser mayor de 18 años para adoptar";
        } else if (edad > 100) {
          nuevosErrores.fecha_nacimiento =
            "Por favor verifica tu fecha de nacimiento";
        }
      }
    }

    if (paso === 2) {
      if (!formData.direccion?.trim())
        nuevosErrores.direccion = t("direccion_requerida");
      else if (formData.direccion.trim().length < 5)
        nuevosErrores.direccion = "La dirección debe ser más específica";

      if (!formData.ciudad?.trim())
        nuevosErrores.ciudad = t("ciudad_requerida");
      else if (formData.ciudad.trim().length < 3)
        nuevosErrores.ciudad = "Ingresa una ciudad válida";

      if (!formData.tipo_vivienda)
        nuevosErrores.tipo_vivienda = t("tipo_vivienda_requerido");
    }

    if (paso === 3) {
      if (!formData.experiencia_mascotas?.trim()) {
        nuevosErrores.experiencia_mascotas = t("experiencia_minimo");
      } else if (formData.experiencia_mascotas.trim().length < 10) {
        nuevosErrores.experiencia_mascotas =
          "Cuéntanos más sobre tu experiencia (mínimo 10 caracteres)";
      }

      if (!formData.motivo_adopcion?.trim()) {
        nuevosErrores.motivo_adopcion = t("motivo_minimo");
      } else if (formData.motivo_adopcion.trim().length < 10) {
        nuevosErrores.motivo_adopcion =
          "Cuéntanos más sobre por qué quieres adoptar (mínimo 10 caracteres)";
      }

      if (!formData.compromiso_cuidado)
        nuevosErrores.compromiso_cuidado = t("compromiso_cuidado_requerido");
      if (!formData.compromiso_esterilizacion)
        nuevosErrores.compromiso_esterilizacion = t(
          "compromiso_esterilizacion_requerido",
        );
      if (!formData.compromiso_seguimiento)
        nuevosErrores.compromiso_seguimiento = t(
          "compromiso_seguimiento_requerido",
        );
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }, [paso, formData, t]);

  const handleSiguiente = useCallback(() => {
    if (validarPaso() && paso < 4) {
      setPaso(paso + 1);
      window.scrollTo(0, 0);
    } else if (!validarPaso()) {
      toast.warning(t("completa_campos"));
      scrollToFirstError();
    }
  }, [paso, validarPaso, t]);

  const handleAnterior = useCallback(() => {
    if (paso > 1) {
      setPaso(paso - 1);
      window.scrollTo(0, 0);
    }
  }, [paso]);

  const handleEnviar = useCallback(async () => {
    if (!validarPaso()) {
      toast.warning(t("completa_campos"));
      scrollToFirstError();
      return;
    }

    try {
      setEnviando(true);

      const payload = {
        tipo_solicitud: "adopcion",
        mascota_id: parseInt(id),
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        documento_identidad: formData.documento_identidad,
        ocupacion: formData.ocupacion,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        departamento: formData.departamento,
        codigo_postal: formData.codigo_postal,
        estado_civil: formData.estado_civil,
        cantidad_hijos: formData.cantidad_hijos,
        experiencia_mascotas: formData.experiencia_mascotas,
        tipo_vivienda: formData.tipo_vivienda,
        es_propietario: formData.es_propietario,
        motivo_adopcion: formData.motivo_adopcion,
        compromiso_cuidado: formData.compromiso_cuidado,
        compromiso_esterilizacion: formData.compromiso_esterilizacion,
        compromiso_seguimiento: formData.compromiso_seguimiento,
      };

      const response = await api.post("/user/solicitudes/adopcion", payload);

      if (response.data.success) {
        const datosParaPDF = {
          solicitud: response.data.data,
          mascota: mascota,
          formData: formData,
        };
        sessionStorage.setItem(
          `solicitud_pdf_${response.data.data.id}`,
          JSON.stringify(datosParaPDF),
        );

        toast.success(t("solicitud_enviada"));
        navigate(`/adopcion-exitosa/${response.data.data.id}`);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || t("error_envio"));
    } finally {
      setEnviando(false);
    }
  }, [validarPaso, t, id, formData, mascota, navigate]);

  const memoizedFormData = useMemo(() => formData, [formData]);
  const memoizedErrores = useMemo(() => errores, [errores]);

  if (authLoading || loading) {
    return <LoadingSpinner text={t("cargando")} />;
  }

  if (!mascota) {
    return (
      <div className="solicitud-adopcion-unique">
        <div className="error-container">
          <i className="fas fa-paw"></i>
          <h2>{t("error_titulo")}</h2>
          <p>{t("mascota_no_encontrada")}</p>
          <button onClick={() => navigate("/mascotas")} className="btn-volver">
            {t("volver")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitud-adopcion-unique">
      <div className="bento-container">
        <div className="bento-grid">
          <div className="bento-6">
            <div className="collage-card form-card">
              <div className="form-header">
                <h1>{t("solicitar_adopcion")}</h1>
                <p className="form-subtitle">
                  {t("adoptar")}: <strong>{mascota.nombre_mascota}</strong>
                </p>
              </div>

              <StepperProgreso paso={paso} t={t} erroresPorPaso={errores} />

              <div className="paso-contenido">
                {paso === 1 && (
                  <Paso1DatosPersonales
                    formData={memoizedFormData}
                    handleInputChange={handleInputChange}
                    errores={memoizedErrores}
                    t={t}
                  />
                )}

                {paso === 2 && (
                  <Paso2InformacionAdicional
                    formData={memoizedFormData}
                    handleInputChange={handleInputChange}
                    t={t}
                    errores={memoizedErrores}
                  />
                )}

                {paso === 3 && (
                  <Paso3Compromisos
                    formData={memoizedFormData}
                    t={t}
                    handleInputChange={handleInputChange}
                    errores={memoizedErrores}
                  />
                )}

                {paso === 4 && (
                  <Paso4Revision
                    t={t}
                    formData={memoizedFormData}
                    mascota={mascota}
                    getImageUrl={getImageUrl}
                  />
                )}
              </div>

              <BotonesNavegacion
                paso={paso}
                enviando={enviando}
                t={t}
                onAnterior={handleAnterior}
                onSiguiente={handleSiguiente}
                onEnviar={handleEnviar}
              />
            </div>
          </div>

          <div className="bento-6">
            <TarjetaMascotaInfo
              mascota={mascota}
              getImageUrl={getImageUrl}
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitarAdopcion;
