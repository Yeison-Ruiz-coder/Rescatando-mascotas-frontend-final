import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import './MascotaApadrinarCardModal.css';

const MascotaApadrinarCardModal = ({ mascota, onClose, onSuccess }) => {
  const { t } = useTranslation('suscripciones');
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const nombreMascota = mascota?.nombre_mascota || mascota?.nombre || 'esta mascota';

  const planesApadrinamiento = [
    {
      id: 'basico',
      nombre: 'Amigo Fiel',
      monto: 10000,
      frecuencia: 'mensual',
      icon: '🐶',
      beneficios: [
        'Certificado digital de apadrinamiento',
        'Actualización mensual de tu ahijado',
        'Calcomanía virtual exclusiva'
      ],
      color: '#667eea'
    },
    {
      id: 'premium',
      nombre: 'Guardian Especial',
      monto: 25000,
      frecuencia: 'mensual',
      icon: '💝',
      destacado: true,
      beneficios: [
        'Certificado premium con foto',
        'Actualizaciones semanales',
        'Fotos exclusivas de tu mascota',
        'Descuento 15% en tienda'
      ],
      color: '#764ba2'
    },
    {
      id: 'vitalicio',
      nombre: 'Super Patrocinador',
      monto: 50000,
      frecuencia: 'mensual',
      icon: '🌟',
      beneficios: [
        'Certificado especial con tu nombre',
        'Visitas mensuales a tu ahijado',
        'Nombre en placa de agradecimiento',
        'Descuento 20% en tienda'
      ],
      color: '#ff6b9d'
    }
  ];

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  // ✅ ÚNICA DEFINICIÓN DE handleSubmit - Usando el método público
  const handleSubmit = async () => {
    if (!selectedPlan) {
      toast.warning('Por favor selecciona un plan de apadrinamiento');
      return;
    }

    setLoading(true);
    try {
      // ✅ Datos para el método público storePublic() - requiere email
      const suscripcionData = {
        email: user?.email || 'usuario@ejemplo.com',
        nombre: user?.name || 'Usuario',
        telefono: user?.phone || '',
        mascota_id: mascota?.id || null,
        monto_mensual: selectedPlan.monto,
        frecuencia: selectedPlan.frecuencia || 'mensual',
        mensaje_apoyo: `Apadrinando a ${nombreMascota} con el plan ${selectedPlan.nombre}`
      };

      console.log('📝 Enviando suscripción pública:', suscripcionData);
      
      // ✅ Usa el servicio con la ruta pública
      const response = await suscripcionService.createPublicSuscripcion(suscripcionData);
      console.log('✅ Respuesta:', response);
      
      toast.success(`🎉 ¡Excelente! Ahora eres el Guardián de ${nombreMascota}`);
      
      // ✅ Llama a onSuccess para cerrar el modal y recargar
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Error al crear suscripción:', error);
      console.error('❌ Detalles:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error al crear la suscripción';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apadrinar-modal-overlay" onClick={onClose}>
      <div className="apadrinar-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="apadrinar-modal-header">
          <div className="modal-header-content">
            <span className="paw-icon">🐾</span>
            <h2>Elige tu nivel de compromiso</h2>
            <p>Convierte a <strong>{nombreMascota}</strong> en tu compañero especial</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="apadrinar-modal-body">
          <div className="mascota-preview">
            <div className="mascota-avatar">
              {mascota?.imagen_url ? (
                <img src={mascota.imagen_url} alt={nombreMascota} />
              ) : (
                <span className="avatar-placeholder">🐕</span>
              )}
            </div>
            <div className="mascota-info-mini">
              <h3>{nombreMascota}</h3>
              <span className="mascota-especie">
                {mascota?.especie || 'Mascota'} • {mascota?.edad_aprox || '?'} años
              </span>
            </div>
          </div>

          <div className="planes-apadrinar-grid">
            {planesApadrinamiento.map((plan) => (
              <div
                key={plan.id}
                className={`plan-apadrinar-card ${selectedPlan?.id === plan.id ? 'selected' : ''} ${plan.destacado ? 'featured' : ''}`}
                onClick={() => handlePlanSelect(plan)}
                style={{ '--plan-color': plan.color }}
              >
                {plan.destacado && (
                  <div className="plan-badge">⭐ Más Popular</div>
                )}
                <div className="plan-icon">{plan.icon}</div>
                <h4>{plan.nombre}</h4>
                <div className="plan-price">
                  <span className="amount">${plan.monto.toLocaleString()}</span>
                  <span className="period">/{plan.frecuencia}</span>
                </div>
                <ul className="plan-beneficios">
                  {plan.beneficios.map((beneficio, index) => (
                    <li key={index}>
                      <span className="check-icon">✓</span>
                      <span>{beneficio}</span>
                    </li>
                  ))}
                </ul>
                <div className="plan-select-indicator">
                  {selectedPlan?.id === plan.id ? (
                    <span className="selected-badge">✓ Seleccionado</span>
                  ) : (
                    <span className="select-hint">Seleccionar</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="apadrinar-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-confirm"
            onClick={handleSubmit}
            disabled={!selectedPlan || loading}
          >
            {loading ? (
              <span className="loading-spinner-small"></span>
            ) : (
              `✨ Apadrinar a ${nombreMascota}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MascotaApadrinarCardModal;