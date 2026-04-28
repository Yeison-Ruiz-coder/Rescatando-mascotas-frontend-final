// src/pages/public/suscripciones/SuscripcionesPublicIndex.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import "./SuscripcionesPublic.css";

// DATOS DE PRUEBA (mientras el backend no está listo)
const DATOS_PRUEBA = {
  planes: [
    {
      id: 1,
      nombre: "Plan Básico",
      monto: 10000,
      frecuencia: "mensual",
      destacado: false,
      descripcion: "Ideal para empezar a ayudar",
      beneficios: ["Certificado digital", "Actualización mensual", "Calcomanía"]
    },
    {
      id: 2,
      nombre: "Plan Premium",
      monto: 25000,
      frecuencia: "mensual",
      destacado: true,
      descripcion: "Para quienes quieren marcar la diferencia",
      beneficios: ["Certificado premium", "Actualización semanal", "Fotos exclusivas", "Descuento en tienda", "Eventos especiales"]
    },
    {
      id: 3,
      nombre: "Plan Vitalicio",
      monto: 50000,
      frecuencia: "mensual",
      destacado: false,
      descripcion: "Para los súper patrocinadores",
      beneficios: ["Certificado especial", "Visitas mensuales", "Nombre en placa", "Descuento 20% tienda", "Eventos VIP"]
    }
  ],
  mascotas: [
    {
      id: 1,
      nombre: "Max",
      especie: "Perro",
      raza: "Golden Retriever",
      edad: 3,
      historia_corta: "Max fue rescatado de la calle y necesita cuidados especiales.",
      monto_sugerido: 15000,
      apadrinamientos: 2,
      foto_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=250&fit=crop"
    },
    {
      id: 2,
      nombre: "Luna",
      especie: "Gato",
      raza: "Siamés",
      edad: 2,
      historia_corta: "Luna es muy cariñosa y busca un hogar temporal.",
      monto_sugerido: 12000,
      apadrinamientos: 1,
      foto_url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=250&fit=crop"
    },
    {
      id: 3,
      nombre: "Toby",
      especie: "Perro",
      raza: "Labrador",
      edad: 4,
      historia_corta: "Toby necesita una operación y tu ayuda es vital.",
      monto_sugerido: 20000,
      apadrinamientos: 0,
      foto_url: "https://images.unsplash.com/photo-1587301091292-9d12c5e3c1b6?w=300&h=250&fit=crop"
    }
  ]
};

const SuscripcionesPublicIndex = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [membresias, setMembresias] = useState([]);
  const [mascotasApadrinar, setMascotasApadrinar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembresia, setSelectedMembresia] = useState(null);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterEspecie, setFilterEspecie] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recientes');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      let membresiasData = DATOS_PRUEBA.planes;
      let mascotasData = DATOS_PRUEBA.mascotas;
      
      try {
        const response = await suscripcionService.getPlanesMembresia();
        if (response && Array.isArray(response) && response.length > 0) {
          membresiasData = response;
          console.log('✅ Planes cargados del backend');
        }
      } catch (errorPlan) {
        console.log('⚠️ Usando datos de prueba para planes');
      }
      
      try {
        const response = await suscripcionService.getMascotasApadrinar();
        if (response && Array.isArray(response) && response.length > 0) {
          mascotasData = response;
          console.log('✅ Mascotas cargadas del backend');
        }
      } catch (errorMascota) {
        console.log('⚠️ Usando datos de prueba para mascotas');
      }
      
      setMembresias(membresiasData);
      setMascotasApadrinar(mascotasData);
      
    } catch (error) {
      console.error('Error general:', error);
      toast.error('Error al cargar las opciones de membresía');
    } finally {
      setLoading(false);
    }
  };

  const handleApadrinar = (mascota) => {
    if (!isAuthenticated) {
      localStorage.setItem('intencion_apadrinar', JSON.stringify({
        mascota_id: mascota.id,
        timestamp: new Date().getTime()
      }));
      toast.info('Por favor, inicia sesión o regístrate para apadrinar');
      navigate('/login', { state: { from: '/suscripciones' } });
      return;
    }
    setSelectedMascota(mascota);
    setSelectedMembresia(null);
    setShowModal(true);
  };

  const handleMembresiaClick = (membresia) => {
    if (!isAuthenticated) {
      localStorage.setItem('intencion_membresia', JSON.stringify({
        plan_id: membresia.id,
        timestamp: new Date().getTime()
      }));
      toast.info('Por favor, inicia sesión o regístrate para continuar');
      navigate('/login', { state: { from: '/suscripciones' } });
      return;
    }
    setSelectedMembresia(membresia);
    setSelectedMascota(null);
    setShowModal(true);
  };

  const mascotasFiltradas = mascotasApadrinar
    .filter(mascota => {
      if (filterEspecie !== 'todas' && mascota.especie !== filterEspecie) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return mascota.nombre.toLowerCase().includes(searchLower) ||
               (mascota.raza && mascota.raza.toLowerCase().includes(searchLower));
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recientes') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'antiguos') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre);
      return 0;
    });

  const especiesUnicas = ['todas', ...new Set(mascotasApadrinar.map(m => m.especie))];

  if (loading) {
    return (
      <div className="suscripciones-public">
        <div className="suscripciones-loading">
          <div className="spinner"></div>
          <p>Cargando opciones de membresía...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="suscripciones-public">
      {/* Hero Section */}
      <div className="suscripciones-hero">
        <div className="hero-content">
          <h1>Conviértete en Patrocinador</h1>
          <p>
            Con tu apoyo, podemos seguir rescatando, rehabilitando y dando 
            una segunda oportunidad a más animales necesitados.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Animales rescatados</span>
            </div>
            <div className="stat">
              <span className="stat-number">200+</span>
              <span className="stat-label">Adopciones exitosas</span>
            </div>
            <div className="stat">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Patrocinadores activos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Planes de Membresía */}
      <div className="planes-section">
        {/* Banner con emoji */}
        <div className="planes-banner-simple">
          <div className="simple-banner-content">
            <span className="puppy-emoji">🐶🐱🐾</span>
            <div>
              <h3>¡Ellos te necesitan!</h3>
              <p>Con tu apoyo, muchos animales tendrán una segunda oportunidad</p>
            </div>
          </div>
        </div>

        <div className="section-header">
          <h2>Planes de Membresía</h2>
          <p>Elige el plan que mejor se adapte a ti y comienza a marcar la diferencia.</p>
        </div>
        
        <div className="planes-grid">
          {membresias.map((plan, index) => (
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
                onClick={() => handleMembresiaClick(plan)}
              >
                Seleccionar Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mascotas para Apadrinar */}
      <div className="mascotas-section">
        <div className="section-header">
          <h2>Mascotas que necesitan tu ayuda</h2>
          <p>Apadrina una mascota específica y recibe actualizaciones de su progreso.</p>
          <div className="badge-count">
            🐾 Tenemos {mascotasFiltradas.length} mascotas esperando un padrino
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="filtros-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por nombre o raza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filters-group">
            <div className="filter-item">
              <label>ESPECIE</label>
              <select value={filterEspecie} onChange={(e) => setFilterEspecie(e.target.value)}>
                {especiesUnicas.map(especie => (
                  <option key={especie} value={especie}>
                    {especie === 'todas' ? 'Todas las especies' : especie}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resultados y orden */}
        <div className="results-header">
          <div className="results-count">
            Mostrando {mascotasFiltradas.length} de {mascotasApadrinar.length} mascotas
          </div>
          <div className="sort-options">
            <label>Ordenar por:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="nombre">Nombre</option>
            </select>
          </div>
        </div>

        {/* Grid de mascotas */}
        <div className="mascotas-grid">
          {mascotasFiltradas.map((mascota) => (
            <div key={mascota.id} className="mascota-card">
              <div className="mascota-image">
                <img 
                  src={mascota.foto_url} 
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
                  <span>{mascota.especie}</span>
                  <span>{mascota.raza}</span>
                  <span>{mascota.edad} años</span>
                </div>
                <p className="mascota-historia">{mascota.historia_corta}</p>
                <div className="mascota-stats">
                  <div className="stat">
                    <span className="value">{mascota.apadrinamientos || 0}</span>
                    <span className="label">Apadrinamientos</span>
                  </div>
                  <div className="stat">
                    <span className="value">${mascota.monto_sugerido.toLocaleString()}</span>
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

        {mascotasFiltradas.length === 0 && (
          <div className="no-results">
            <p>No se encontraron mascotas que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
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
          membresia={selectedMembresia}
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
const SuscripcionModal = ({ membresia, mascota, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    monto: membresia?.monto || mascota?.monto_sugerido || 10000,
    frecuencia: 'mensual',
    mensaje_apoyo: '',
    metodo_pago: 'tarjeta'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const suscripcionData = {
        user_id: user.id,
        mascota_id: mascota?.id || null,
        monto_mensual: formData.monto,
        frecuencia: formData.frecuencia,
        fecha_inicio: new Date().toISOString().split('T')[0],
        mensaje_apoyo: formData.mensaje_apoyo,
        estado: 'activo',
        plan_id: membresia?.id || null
      };
      
      await suscripcionService.createPublicSuscripcion(suscripcionData);
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
              : `Plan ${membresia?.nombre}`
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
                  <input type="radio" name="frecuencia" value="mensual" checked={formData.frecuencia === 'mensual'} onChange={handleChange} />
                  <span>Mensual</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="frecuencia" value="trimestral" checked={formData.frecuencia === 'trimestral'} onChange={handleChange} />
                  <span>Trimestral</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="frecuencia" value="anual" checked={formData.frecuencia === 'anual'} onChange={handleChange} />
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
            
            <div className="form-group">
              <label>Método de pago</label>
              <select name="metodo_pago" value={formData.metodo_pago} onChange={handleChange} required>
                <option value="tarjeta">Tarjeta de crédito/débito</option>
              </select>
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