// src/components/Payment/ModalPago.jsx
import React, { useState, useEffect } from 'react';
import { suscripcionService } from '../../services/suscripcionService';
import { toast } from 'react-toastify';
import './ModalPago.css';

const ModalPago = ({ isOpen, onClose, suscripcionId, mascotaNombre, monto }) => {
  const [procesando, setProcesando] = useState(false);
  const [paso, setPaso] = useState(1); // 1: confirmar, 2: procesando, 3: completado
  const [paymentMode, setPaymentMode] = useState({ isDemo: true });

  useEffect(() => {
    if (isOpen) {
      cargarModoPago();
    }
  }, [isOpen]);

  const cargarModoPago = async () => {
    try {
      const mode = await suscripcionService.getPaymentMode();
      setPaymentMode(mode);
    } catch (error) {
      console.error('Error al cargar modo de pago:', error);
    }
  };

  const handlePagar = async () => {
    setProcesando(true);
    setPaso(2);

    try {
      // 1. Iniciar pago
      const iniciarRes = await suscripcionService.iniciarPago(suscripcionId);
      const { reference } = iniciarRes;

      // 2. Simular delay de procesamiento (efecto visual)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Confirmar pago
      await suscripcionService.confirmarPago(suscripcionId, reference);

      setPaso(3);
      
      const mensaje = paymentMode.isDemo 
        ? '✅ ¡Pago exitoso! (Modo demostración)' 
        : '✅ ¡Pago realizado con éxito!';
      
      toast.success(mensaje);
      
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);

    } catch (error) {
      setPaso(1);
      toast.error(error.response?.data?.message || 'Error en el pago');
    } finally {
      setProcesando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Badge de modo */}
        <div className="mode-badge">
          {paymentMode.isDemo && (
            <span className="badge-demo">🎭 Modo Demo - Sin cargo real</span>
          )}
          {!paymentMode.isDemo && (
            <span className="badge-live">🔒 Pago Real - Seguro</span>
          )}
        </div>

        {paso === 1 && (
          <>
            <h2>💳 Confirmar Pago</h2>
            <p>Estás a punto de apadrinar a <strong>{mascotaNombre}</strong></p>
            
            <div className="detalle-pago">
              <p>💰 Monto: <strong>${parseFloat(monto || 0).toLocaleString()}</strong> / mes</p>
              <p>🔄 Frecuencia: <strong>Mensual</strong></p>
            </div>
            
            {paymentMode.isDemo && (
              <div className="demo-info">
                ⚡ Este es un <strong>simulador de pagos</strong>. No se realizará ningún cargo real.
              </div>
            )}

            <div className="modal-botones">
              <button 
                onClick={onClose} 
                className="btn-cancelar"
              >
                Cancelar
              </button>
              <button 
                onClick={handlePagar} 
                className="btn-pagar"
                disabled={procesando}
              >
                💳 Pagar ${parseFloat(monto || 0).toLocaleString()}
              </button>
            </div>
          </>
        )}

        {paso === 2 && (
          <div className="procesando">
            <div className="spinner"></div>
            <h3>🔄 Procesando pago...</h3>
            <p>Por favor espera</p>
            {paymentMode.isDemo && (
              <p className="text-muted small">(Simulación - Modo Demo)</p>
            )}
          </div>
        )}

        {paso === 3 && (
          <div className="exito">
            <div className="checkmark">✅</div>
            <h2>¡Pago Exitoso!</h2>
            <p>🎉 ¡Ya eres padrino de <strong>{mascotaNombre}</strong>!</p>
            {paymentMode.isDemo && (
              <p className="text-muted small">(Modo demostración - sin cargo real)</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalPago;