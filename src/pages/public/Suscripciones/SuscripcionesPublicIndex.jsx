// src/pages/public/suscripciones/SuscripcionesPublicIndex.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './SuscripcionesPublic.css';

const SuscripcionesPublicIndex = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar todos los datos en paralelo
      const [planesData, mascotasData, statsData] = await Promise.all([
        suscripcionService.getPlanesMembresia(),
        suscripcionService.getMascotasApadrinar(),
        suscripcionService.getEstadisticas()
      ]);
      
      setPlanes(planesData || []);
      setMascotas(mascotasData || []);
      setEstadisticas(statsData);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleApadrinar = (mascota) => {
    if (!isAuthenticated) {
      toast.info('Por favor, inicia sesión para apadrinar');
      navigate('/login', { state: { from: '/suscripciones' } });
      return;
    }
    setSelectedMascota(mascota);
    setSelectedPlan(null);
    setShowModal(true);
  };

  const handlePlanClick = (plan) => {
    if (!isAuthenticated) {
      toast.info('Por favor, inicia sesión para continuar');
      navigate('/login', { state: { from: '/suscripciones' } });
      return;
    }
    setSelectedPlan(plan);
    setSelectedMascota(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="suscripciones-loading">
        <div className="spinner"></div>
        <p>Cargando opciones de membresía...</p>
      </div>
    );
  }

  return (
    <div className="suscripciones-public">
      {/* Hero Section */}
      <div className="hero-section-suscripciones">
        <div className="hero-content">
          <h1>Conviértete en Patrocinador</h1>
          <p>
            Con tu apoyo, podemos seguir rescatando, rehabilitando y dando 
            una segunda oportunidad a más animales necesitados.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{estadisticas?.total_suscripciones || 500}+</span>
              <span className="stat-label">Suscripciones activas</span>
            </div>
            <div className="stat">
              <span className="stat-number">{estadisticas?.activas || 200}+</span>
              <span className="stat-label">Padrinos activos</span>
            </div>
            <div className="stat">
              <span className="stat-number">${estadisticas?.ingreso_mensual_total || 10000}+</span>
              <span className="stat-label">Ayuda mensual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Planes de Membresía */}
      <div className="planes-section-suscripciones">
        <div className="section-header">
          <h2>Planes de Membresía</h2>
          <p>Elige el plan que mejor se adapte a ti y comienza a marcar la diferencia.</p>
        </div>
        
        <div className="planes-grid">
          {planes.map((plan, index) => (
            <div key={plan.id} className={`plan-card ${plan.destacado ? 'featured' : ''}`}>
              {plan.destacado && <div className="plan-badge">⭐ Más Popular</div>}
              <div className="plan-icon">
                {index === 0 && '🐾'}
                {index === 1 && '💝'}
                {index === 2 && '🌟'}
              </div>
              <h3>{plan.nombre}</h3>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">{plan.monto.toLocaleString()}</span>
                <span className="period">/{plan.frecuencia}</span>
              </div>
              <p className="plan-description">{plan.descripcion}</p>
              <ul className="plan-features">
                {plan.beneficios?.map((beneficio, i) => (
                  <li key={i}>
                    <span className="check">✓</span>
                    {beneficio}
                  </li>
                ))}
              </ul>
              <button 
                className={`btn-plan ${plan.destacado ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handlePlanClick(plan)}
              >
                Seleccionar Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mascotas para Apadrinar */}
      <div className="mascotas-section-suscripciones">
        <div className="section-header">
          <h2>Mascotas que necesitan tu ayuda</h2>
          <p>Apadrina una mascota específica y recibe actualizaciones de su progreso.</p>
          <div className="mascotas-stats">
            <span className="badge-count">🐾 Tenemos {mascotas.length} mascotas esperando un padrino</span>
          </div>
        </div>

        <div className="mascotas-grid">
          {mascotas.map((mascota) => (
            <div key={mascota.id} className="mascota-card">
              <div className="mascota-image">
                <img 
                  src={mascota.foto_url || '/images/default-pet.jpg'} 
                  alt={mascota.nombre}
                  onError={(e) => { 
                    e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=250&fit=crop';
                  }}
                />
                <div className="mascota-status">
                  <span className="status-badge">🐾 Necesita Ayuda</span>
                </div>
              </div>
              <div className="mascota-info">
                <h3>{mascota.nombre}</h3>
                <div className="mascota-details">
                  <span className="especie">{mascota.especie}</span>
                  <span className="raza">{mascota.raza}</span>
                  <span className="edad">{mascota.edad} años</span>
                </div>
                <p className="mascota-historia">{mascota.historia_corta}</p>
                <div className="mascota-stats">
                  <div className="stat">
                    <span className="value">{mascota.apadrinamientos || 0}</span>
                    <span className="label">Apadrinamientos</span>
                  </div>
                  <div className="stat">
                    <span className="value">${(mascota.monto_sugerido || 10000).toLocaleString()}</span>
                    <span className="label">Monto sugerido</span>
                  </div>
                </div>
                <button 
                  className="btn-apadrinar"
                  onClick={() => handleApadrinar(mascota)}
                >
                  Apadrinar a {mascota.nombre}
                </button>
              </div>
            </div>
          ))}
        </div>

        {mascotas.length === 0 && (
          <div className="no-results">
            <p>No hay mascotas disponibles para apadrinar en este momento.</p>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="faq-section-suscripciones">
        <div className="section-header">
          <h2>Preguntas Frecuentes</h2>
          <p>Resolvemos tus dudas sobre el apadrinamiento</p>
        </div>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>🐶 ¿Cómo funciona el apadrinamiento?</h4>
            <p>Al apadrinar, tu donación mensual se destina específicamente al cuidado de la mascota que elegiste: alimentación, atención veterinaria, medicamentos y rehabilitación.</p>
          </div>
          <div className="faq-item">
            <h4>📅 ¿Puedo visitar a la mascota que apadrino?</h4>
            <p>Sí, coordinamos visitas para que puedas conocer a tu ahijado y ver su progreso. Contáctanos para agendar una cita.</p>
          </div>
          <div className="faq-item">
            <h4>🎁 ¿Qué beneficios tengo como patrocinador?</h4>
            <p>Recibirás certificado digital, actualizaciones mensuales, fotos de tu mascota, descuentos en tienda y eventos exclusivos.</p>
          </div>
          <div className="faq-item">
            <h4>❌ ¿Cómo cancelo mi suscripción?</h4>
            <p>Puedes cancelar en cualquier momento desde tu perfil o contactándonos. Sin compromisos a largo plazo.</p>
          </div>
        </div>
      </div>

      {/* Modal de Suscripción */}
      {showModal && (
        <SuscripcionModal
          plan={selectedPlan}
          mascota={selectedMascota}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            toast.success('¡Gracias por tu apoyo!');
            navigate('/user/mis-suscripciones');
          }}
        />
      )}
    </div>
  );
};

// Componente Modal
const SuscripcionModal = ({ plan, mascota, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    monto: plan?.monto || mascota?.monto_sugerido || 10000,
    frecuencia: 'mensual',
    mensaje_apoyo: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = {
        user_id: user.id,
        mascota_id: mascota?.id || null,
        monto_mensual: formData.monto,
        frecuencia: formData.frecuencia,
        fecha_inicio: new Date().toISOString().split('T')[0],
        mensaje_apoyo: formData.mensaje_apoyo,
        estado: 'activo'
      };
      
      await suscripcionService.createPublicSuscripcion(data);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {mascota 
              ? `Apadrinar a ${mascota.nombre}`
              : `Plan ${plan?.nombre}`
            }
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Monto a donar (COP)</label>
              <div className="monto-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  min="1000"
                  step="1000"
                  required
                />
              </div>
              <small>Monto mínimo: $1,000 COP</small>
            </div>
            
            <div className="form-group">
              <label>Frecuencia</label>
              <div className="frecuencia-opciones">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="frecuencia"
                    value="mensual"
                    checked={formData.frecuencia === 'mensual'}
                    onChange={handleChange}
                  />
                  <span>Mensual</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="frecuencia"
                    value="trimestral"
                    checked={formData.frecuencia === 'trimestral'}
                    onChange={handleChange}
                  />
                  <span>Trimestral</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="frecuencia"
                    value="anual"
                    checked={formData.frecuencia === 'anual'}
                    onChange={handleChange}
                  />
                  <span>Anual</span>
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>Mensaje de apoyo (opcional)</label>
              <textarea
                name="mensaje_apoyo"
                rows="3"
                placeholder="Déjanos un mensaje de apoyo para la mascota..."
                value={formData.mensaje_apoyo}
                onChange={handleChange}
              />
            </div>
            
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancelar
              </button>
              <button type="submit" className="btn-confirm" disabled={loading}>
                {loading ? 'Procesando...' : 'Confirmar Suscripción'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuscripcionesPublicIndex;