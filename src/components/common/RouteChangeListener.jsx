// src/components/common/RouteChangeListener.jsx
import { useEffect } from 'react';
import { requestManager } from '../../services/api';

/**
 * Listener global de cambios de ruta
 * NO usa hooks de React Router, usa el objeto router directamente
 */
const RouteChangeListener = ({ router }) => {
  useEffect(() => {
    if (!router) {
      console.warn('⚠️ RouteChangeListener: No se recibió router');
      return;
    }

    console.log('✅ RouteChangeListener: Escuchando cambios de ruta...');

    // Suscribirse a cambios de navegación
    const unsubscribe = router.subscribe((state) => {
      // Cuando el estado de navegación cambia a "loading", cancela peticiones
      if (state.navigation.state === 'loading') {
        const path = state.navigation.location?.pathname || 'unknown';
        console.log(`📍 [ROUTER] Cambio de ruta: ${path}`);
        requestManager.cancelAllRequests();
      }
    });

    // Cleanup: desuscribirse al desmontar
    return () => {
      console.log('⏹️ RouteChangeListener: Desuscrito');
      unsubscribe();
    };
  }, [router]);

  return null; // No renderiza nada visible
};

export default RouteChangeListener;