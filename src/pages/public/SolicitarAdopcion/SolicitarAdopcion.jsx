// src/pages/public/SolicitarAdopcion/SolicitarAdopcion.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import useImageUrl from '../../../hooks/useImageUrl';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import StepperProgreso from './components/StepperProgreso';
import Paso1DatosPersonales from './components/Paso1DatosPersonales';
import Paso2InformacionAdicional from './components/Paso2InformacionAdicional';
import Paso3Compromisos from './components/Paso3Compromisos';
import Paso4Revision from './components/Paso4Revision';
import BotonesNavegacion from './components/BotonesNavegacion';
import './SolicitarAdopcion.css';

const SolicitarAdopcion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('adoption');
  const { isAuthenticated, user } = useAuth();
  const { getImageUrl } = useImageUrl();
  
  const [paso, setPaso] = useState(1);
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState({});
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento_identidad: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    ocupacion: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    codigo_postal: '',
    estado_civil: '',
    cantidad_hijos: '',
    tipo_vivienda: '',
    es_propietario: '',
    experiencia_mascotas: '',
    motivo_adopcion: '',
    compromiso_cuidado: false,
    compromiso_esterilizacion: false,
    compromiso_seguimiento: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning(t('debes_iniciar_sesion'));
      navigate('/login', { state: { from: `/solicitar-adopcion/${id}` } });
    }
  }, [isAuthenticated, navigate, id, t]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMascota();
      if (user) {
        setFormData(prev => ({
          ...prev,
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          email: user.email || '',
          telefono: user.telefono || '',
        }));
      }
    }
  }, [id, isAuthenticated, user]);

  const fetchMascota = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/mascotas/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        if (data.estado !== 'En adopcion') {
          toast.error(t('mascota_no_disponible'));
          navigate('/mascotas');
          return;
        }
        setMascota(data);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(t('error_cargar_mascota'));
      navigate('/mascotas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarPaso = () => {
    const nuevosErrores = {};
    
    if (paso === 1) {
      if (!formData.nombre?.trim()) nuevosErrores.nombre = t('nombre_requerido');
      if (!formData.apellido?.trim()) nuevosErrores.apellido = t('apellido_requerido');
      if (!formData.documento_identidad?.trim()) nuevosErrores.documento_identidad = t('documento_requerido');
      if (!formData.email?.trim()) nuevosErrores.email = t('email_requerido');
      if (!formData.telefono?.trim()) nuevosErrores.telefono = t('telefono_requerido');
    }
    
    if (paso === 2) {
      if (!formData.direccion?.trim()) nuevosErrores.direccion = t('direccion_requerida');
      if (!formData.ciudad?.trim()) nuevosErrores.ciudad = t('ciudad_requerida');
      if (!formData.tipo_vivienda) nuevosErrores.tipo_vivienda = t('tipo_vivienda_requerido');
    }
    
    if (paso === 3) {
      if (!formData.experiencia_mascotas?.trim() || formData.experiencia_mascotas.length < 10) {
        nuevosErrores.experiencia_mascotas = t('experiencia_minimo');
      }
      if (!formData.motivo_adopcion?.trim() || formData.motivo_adopcion.length < 10) {
        nuevosErrores.motivo_adopcion = t('motivo_minimo');
      }
      if (!formData.compromiso_cuidado) nuevosErrores.compromiso_cuidado = t('compromiso_cuidado_requerido');
      if (!formData.compromiso_esterilizacion) nuevosErrores.compromiso_esterilizacion = t('compromiso_esterilizacion_requerido');
      if (!formData.compromiso_seguimiento) nuevosErrores.compromiso_seguimiento = t('compromiso_seguimiento_requerido');
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSiguiente = () => {
    if (validarPaso() && paso < 4) {
      setPaso(paso + 1);
      window.scrollTo(0, 0);
    } else if (!validarPaso()) {
      toast.warning(t('completa_campos'));
    }
  };

  const handleAnterior = () => {
    if (paso > 1) {
      setPaso(paso - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleEnviar = async () => {
    if (!validarPaso()) {
      toast.warning(t('completa_campos'));
      return;
    }
    
    try {
      setEnviando(true);
      
      const payload = {
        tipo_solicitud: 'adopcion',
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
      
      const response = await api.post('/user/solicitudes/adopcion', payload);
      
      if (response.data.success) {
        const datosParaPDF = {
          solicitud: response.data.data,
          mascota: mascota,
          formData: formData,
        };
        sessionStorage.setItem(`solicitud_pdf_${response.data.data.id}`, JSON.stringify(datosParaPDF));
        
        toast.success(t('solicitud_enviada'));
        navigate(`/adopcion-exitosa/${response.data.data.id}`);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.message || t('error_envio'));
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text={t('cargando')} />;
  }

  if (!mascota) {
    return (
      <div className="error-container">
        <i className="fas fa-paw"></i>
        <h2>{t('error_titulo')}</h2>
        <p>{t('mascota_no_encontrada')}</p>
        <button onClick={() => navigate('/mascotas')} className="btn-volver">
          {t('volver')}
        </button>
      </div>
    );
  }

  return (
    <div className="solicitar-adopcion-page">
      <div className="adopcion-container">
        <div className="adopcion-header">
          <h1>{t('solicitar_adopcion')}</h1>
          <p>{t('adoptar')}: <strong>{mascota.nombre_mascota}</strong></p>
        </div>

        <StepperProgreso paso={paso} t={t} />

        <div className="adopcion-contenido">
          <div className="mascota-info-adopcion">
            <img 
              src={getImageUrl(mascota.foto_principal)} 
              alt={mascota.nombre_mascota}
              className="mascota-imagen-pequena"
            />
            <div>
              <h3>{mascota.nombre_mascota}</h3>
              <p>{mascota.especie} - {mascota.genero} - {mascota.edad_aprox} {t('años')}</p>
            </div>
          </div>

          <div className="formulario-adopcion">
            {paso === 1 && (
              <Paso1DatosPersonales 
                formData={formData} 
                handleInputChange={handleInputChange}
                errores={errores}
                t={t}
              />
            )}
            
            {paso === 2 && (
              <Paso2InformacionAdicional 
                formData={formData} 
                handleInputChange={handleInputChange}
                t={t}
                errores={errores}
              />
            )}
            
            {paso === 3 && (
              <Paso3Compromisos 
                formData={formData} 
                t={t}
                handleInputChange={handleInputChange}
                errores={errores}
              />
            )}
            
            {paso === 4 && (
              <Paso4Revision 
                t={t}
                formData={formData}
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
    </div>
  );
};

export default SolicitarAdopcion;