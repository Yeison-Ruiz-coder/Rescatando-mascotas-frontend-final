// src/components/common/RouteChangeListener.jsx
import { useEffect } from 'react';
import { requestManager } from '../../services/api';

/**
 * Listener global de cambios de ruta
 * Mantiene una barra de carga visible mientras la navegación está activa.
 */
const RouteChangeListener = ({ router, onLoadingChange }) => {
  useEffect(() => {
    if (!router) {
      console.warn('⚠️ RouteChangeListener: No se recibió router');
      return;
    }

    const handleRouteState = (state) => {
      const isLoading = state.navigation.state === 'loading';

      if (typeof onLoadingChange === 'function') {
        onLoadingChange(isLoading);
      }

      if (isLoading) {
        const path = state.navigation.location?.pathname || 'unknown';
        console.log(`📍 [ROUTER] Cambio de ruta: ${path}`);
        requestManager.cancelAllRequests();
      }
    };

    const unsubscribe = router.subscribe(handleRouteState);

    return () => {
      unsubscribe();
    };
  }, [router, onLoadingChange]);

  return null;
};

export default RouteChangeListener;