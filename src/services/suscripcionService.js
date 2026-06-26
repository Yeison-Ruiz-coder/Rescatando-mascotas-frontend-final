// src/services/suscripcionService.js

import api from './api';

export const suscripcionService = {
  /**
   * Obtener planes de apadrinamiento (mascotas disponibles)
   * GET /api/suscripciones/planes
   */
  getPlanesMembresia: async () => {
    try {
      console.log('🔄 Obteniendo planes desde /api/suscripciones/planes');
      const response = await api.get('/suscripciones/planes');
      console.log('📊 Planes obtenidos:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error getPlanesMembresia:', error);
      return getPlanesPrueba();
    }
  },

  /**
   * Obtener detalle de un plan específico
   * GET /api/suscripciones/planes/{id}
   */
  getPlanDetalle: async (id) => {
    try {
      const response = await api.get(`/suscripciones/planes/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getPlanDetalle:', error);
      throw error;
    }
  },

  /**
   * ✅ CREAR SUSCRIPCIÓN (Usuario autenticado)
   * POST /api/suscripciones/user/crear
   */
  createPublicSuscripcion: async (data) => {
    try {
      console.log('📝 Creando suscripción...');
      console.log('📝 Datos:', data);
      
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      if (!token) {
        throw new Error('Debes iniciar sesión para crear una suscripción');
      }
      
      const payload = {
        mascota_id: data.mascota_id || null,
        monto_mensual: data.monto_mensual || 10000,
        frecuencia: data.frecuencia || 'mensual',
        mensaje_apoyo: data.mensaje_apoyo || '',
        plan_id: data.plan_id || null
      };
      
      const response = await api.post('/suscripciones/user/crear', payload);
      console.log('✅ Suscripción creada:', response.data);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Suscripción creada exitosamente'
      };
      
    } catch (error) {
      console.error('❌ Error createPublicSuscripcion:', error);
      console.error('❌ Detalles:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al crear la suscripción';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * ✅ OBTENER SUSCRIPCIONES DEL USUARIO
   * GET /api/suscripciones/user/mis-suscripciones
   */
  getUserSuscripciones: async () => {
    try {
      console.log('🔄 Obteniendo suscripciones desde /api/suscripciones/user/mis-suscripciones');
      
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      console.log('🔑 Token presente:', !!token);
      
      if (!token) {
        console.warn('⚠️ No hay token de autenticación');
        return { 
          data: [],
          error: 'No autenticado',
          needsAuth: true 
        };
      }
      
      const response = await api.get('/suscripciones/user/mis-suscripciones');
      console.log('📊 Respuesta:', response.data);
      
      if (response.data?.data) {
        return { data: response.data.data };
      }
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      return { data: response.data || [] };
      
    } catch (error) {
      console.error('❌ Error getUserSuscripciones:', error);
      console.error('❌ Detalles:', error.response?.data);
      
      if (error.response?.status === 401) {
        console.log('🔒 Token inválido o expirado');
        localStorage.removeItem("auth_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return { 
          data: [],
          error: 'Sesión expirada',
          needsAuth: true 
        };
      }
      
      return { data: [] };
    }
  },

  /**
   * ✅ CANCELAR UNA SUSCRIPCIÓN (Usuario)
   * PATCH /api/suscripciones/user/{id}/cancelar
   */
  cancelUserSuscripcion: async (id) => {
    try {
      console.log(`🗑️ Cancelando suscripción ${id} desde /api/suscripciones/user/${id}/cancelar`);
      
      const response = await api.patch(`/suscripciones/user/${id}/cancelar`);
      
      console.log('✅ Suscripción cancelada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error cancelUserSuscripcion:', error);
      console.error('❌ Detalles:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al cancelar la suscripción');
    }
  },

  /**
   * ✅ PAUSAR UNA SUSCRIPCIÓN
   * PATCH /api/suscripciones/user/{id}/pausar
   */
  pausarSuscripcion: async (id) => {
    try {
      console.log(`⏸️ Pausando suscripción ${id} desde /api/suscripciones/user/${id}/pausar`);
      const response = await api.patch(`/suscripciones/user/${id}/pausar`);
      return response.data;
    } catch (error) {
      console.error('Error pausarSuscripcion:', error);
      throw new Error(error.response?.data?.message || 'Error al pausar la suscripción');
    }
  },

  /**
   * ✅ REACTIVAR UNA SUSCRIPCIÓN (Usuario)
   * PATCH /api/suscripciones/user/{id}/reactivar
   */
  reactivarSuscripcion: async (id) => {
    try {
      console.log(`🔄 Reactivando suscripción ${id} desde /api/suscripciones/user/${id}/reactivar`);
      const response = await api.patch(`/suscripciones/user/${id}/reactivar`);
      console.log('✅ Suscripción reactivada:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error reactivarSuscripcion:', error);
      throw new Error(error.response?.data?.message || 'Error al reactivar la suscripción');
    }
  },

  /**
   * ✅ VER DETALLE DE UNA SUSCRIPCIÓN
   * GET /api/suscripciones/user/{id}
   */
  getSuscripcion: async (id) => {
    try {
      console.log(`🔍 Obteniendo suscripción ${id} desde /api/suscripciones/user/${id}`);
      const response = await api.get(`/suscripciones/user/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getSuscripcion:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener la suscripción');
    }
  },

  /**
   * Obtener estadísticas de suscripciones
   */
  getEstadisticas: async () => {
    try {
      const response = await api.get('/suscripciones/estadisticas');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getEstadisticas:', error);
      return null;
    }
  },

  // ============================================
  // ============ ADMIN ============
  // ============================================
  
  /**
   * ✅ OBTENER TODAS LAS SUSCRIPCIONES (ADMIN)
   * GET /api/admin/suscripciones
   */
  getAll: async () => {
    try {
      console.log('🔄 Obteniendo todas las suscripciones (admin)');
      
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      if (!token) {
        console.warn('⚠️ No hay token de autenticación');
        return { data: [], error: 'No autenticado' };
      }
      
      const response = await api.get('/admin/suscripciones');
      console.log('📊 Respuesta completa:', response);
      
      const responseData = response.data;
      let suscripcionesArray = [];
      
      // Estructura de Laravel con paginación
      if (responseData?.data?.data && Array.isArray(responseData.data.data)) {
        suscripcionesArray = responseData.data.data;
        console.log('✅ Suscripciones encontradas en data.data.data');
      } 
      else if (Array.isArray(responseData?.data)) {
        suscripcionesArray = responseData.data;
      }
      else if (Array.isArray(responseData)) {
        suscripcionesArray = responseData;
      }
      else if (responseData?.data && typeof responseData.data === 'object') {
        for (const key in responseData.data) {
          if (Array.isArray(responseData.data[key]) && key !== 'links') {
            suscripcionesArray = responseData.data[key];
            console.log(`✅ Encontrado array en "data.${key}"`);
            break;
          }
        }
      }
      
      console.log('📊 Suscripciones extraídas:', suscripcionesArray.length);
      if (suscripcionesArray.length > 0) {
        console.log('📊 Primera suscripción:', suscripcionesArray[0]);
      }
      
      return { 
        data: suscripcionesArray,
        pagination: {
          current_page: responseData?.data?.current_page,
          total: responseData?.data?.total,
          per_page: responseData?.data?.per_page,
          last_page: responseData?.data?.last_page
        },
        success: responseData?.success || true,
        message: responseData?.message || 'Suscripciones obtenidas'
      };
      
    } catch (error) {
      console.error('❌ Error getAll:', error);
      console.error('❌ Detalles:', error.response?.data);
      throw error;
    }
  },
  
  /**
   * ✅ OBTENER SUSCRIPCIÓN POR ID (ADMIN)
   * GET /api/admin/suscripciones/{id}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/suscripciones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getById:', error);
      throw error;
    }
  },
  
  /**
   * ✅ CREAR SUSCRIPCIÓN (ADMIN)
   * POST /api/admin/suscripciones
   */
  create: async (data) => {
    try {
      const response = await api.post('/admin/suscripciones', data);
      return response.data;
    } catch (error) {
      console.error('Error create:', error);
      throw error;
    }
  },
  
  /**
   * ✅ ACTUALIZAR SUSCRIPCIÓN (ADMIN)
   * PUT /api/admin/suscripciones/{id}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/admin/suscripciones/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error update:', error);
      throw error;
    }
  },
  
  /**
   * ✅ ELIMINAR SUSCRIPCIÓN (ADMIN)
   * DELETE /api/admin/suscripciones/{id}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/suscripciones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error delete:', error);
      throw error;
    }
  },

  /**
   * ✅ CANCELAR SUSCRIPCIÓN POR ADMIN
   * PATCH /api/admin/suscripciones/{id}/cancelar
   */
  cancelarSuscripcionAdmin: async (id) => {
    try {
      console.log(`🗑️ Admin cancelando suscripción ${id} desde /api/admin/suscripciones/${id}/cancelar`);
      
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await api.patch(`/admin/suscripciones/${id}/cancelar`);
      
      console.log('✅ Suscripción cancelada por admin:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error cancelarSuscripcionAdmin:', error);
      console.error('❌ Detalles:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al cancelar la suscripción');
    }
  },

  /**
   * ✅ ACTUALIZAR ESTADO DE SUSCRIPCIÓN POR ADMIN
   * PATCH /api/admin/suscripciones/{id}
   */
  actualizarSuscripcionAdmin: async (id, data) => {
    try {
      console.log(`🔄 Admin actualizando suscripción ${id}`);
      
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await api.patch(`/admin/suscripciones/${id}`, data);
      
      console.log('✅ Suscripción actualizada por admin:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error actualizarSuscripcionAdmin:', error);
      console.error('❌ Detalles:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al actualizar la suscripción');
    }
  },

  /**
   * ✅ OBTENER USUARIOS (ADMIN)
   * GET /api/admin/usuarios
   */
  getUsuarios: async () => {
    try {
      console.log('🔄 Obteniendo usuarios (admin)');
      const response = await api.get('/admin/usuarios');
      console.log('📊 Usuarios obtenidos:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error getUsuarios:', error);
      return [];
    }
  },

  /**
   * ✅ OBTENER ESTADÍSTICAS COMPLETAS (ADMIN)
   */
  getEstadisticasCompletas: async () => {
    try {
      console.log('📊 Obteniendo estadísticas completas...');
      
      // Obtener suscripciones y usuarios en paralelo
      const [suscripcionesResponse, usuariosResponse] = await Promise.all([
        suscripcionService.getAll(),
        suscripcionService.getUsuarios()
      ]);
      
      const suscripciones = suscripcionesResponse.data || [];
      const usuarios = Array.isArray(usuariosResponse) ? usuariosResponse : usuariosResponse.data || [];
      
      console.log('📊 Suscripciones obtenidas:', suscripciones.length);
      console.log('📊 Usuarios obtenidos:', usuarios.length);
      
      // ✅ Función para limpiar y extraer el monto correctamente
      const extraerMonto = (suscripcion) => {
        let monto = suscripcion.monto_mensual || suscripcion.monto || 0;
        
        if (typeof monto === 'string') {
          monto = monto.replace(/[^0-9.]/g, '');
          const partes = monto.split('.');
          if (partes.length > 1) {
            monto = partes[0] + '.' + partes.slice(1).join('');
          }
          monto = parseFloat(monto) || 0;
        }
        
        if (typeof monto === 'string') {
          monto = parseFloat(monto.replace(/,/g, '')) || 0;
        }
        
        return monto;
      };
      
      // Crear mapa de usuarios por ID
      const usuariosMap = {};
      usuarios.forEach(u => {
        const id = u.id || u.user_id;
        const nombre = u.name || u.nombre || u.nombre_completo || 
                       u.nombres || u.nombre_usuario || `Usuario #${id}`;
        if (id) {
          usuariosMap[id] = nombre;
        }
      });
      
      // Calcular estadísticas
      const estadisticas = {
        total: suscripciones.length,
        por_estado: {
          activas: 0,
          pendientes: 0,
          canceladas: 0,
          inactivas: 0,
          expiradas: 0
        },
        ingresos: {
          total: 0,
          mensual: 0,
          anual: 0
        },
        top_mascotas: [],
        top_usuarios: [],
        distribucion_mensual: [],
        promedio_por_suscripcion: 0
      };
      
      // Mapas para estadísticas
      const mascotasMap = {};
      const usuariosStats = {};
      
      // Procesar cada suscripción
      suscripciones.forEach(s => {
        const estado = s.estado?.toLowerCase() || 'desconocido';
        const monto = extraerMonto(s);
        
        // Contar por estado
        if (estadisticas.por_estado[estado] !== undefined) {
          estadisticas.por_estado[estado]++;
        }
        
        // Ingresos
        estadisticas.ingresos.total += monto;
        if (estado === 'activo') {
          estadisticas.ingresos.mensual += monto;
        }
        
        // Top mascotas
        const nombreMascota = s.mascota?.nombre_mascota || s.mascota?.nombre || 'Sin mascota';
        if (!mascotasMap[nombreMascota]) {
          mascotasMap[nombreMascota] = { count: 0, ingresos: 0 };
        }
        mascotasMap[nombreMascota].count++;
        mascotasMap[nombreMascota].ingresos += monto;
        
        // ✅ Top usuarios - Usar user_id para obtener nombre del mapa
        const userId = s.user_id || s.usuario_id;
        let nombreUsuario = 'Sin usuario';
        
        if (userId && usuariosMap[userId]) {
          nombreUsuario = usuariosMap[userId];
        } else if (userId) {
          nombreUsuario = `Usuario #${userId}`;
        } else if (s.usuario?.name) {
          nombreUsuario = s.usuario.name;
        } else if (s.user?.name) {
          nombreUsuario = s.user.name;
        }
        
        if (!usuariosStats[nombreUsuario]) {
          usuariosStats[nombreUsuario] = { count: 0, ingresos: 0 };
        }
        usuariosStats[nombreUsuario].count++;
        usuariosStats[nombreUsuario].ingresos += monto;
      });
      
      // Procesar top mascotas
      estadisticas.top_mascotas = Object.entries(mascotasMap)
        .map(([nombre, datos]) => ({
          nombre,
          ...datos,
          promedio: datos.ingresos / datos.count
        }))
        .sort((a, b) => b.ingresos - a.ingresos)
        .slice(0, 10);
      
      // Procesar top usuarios
      estadisticas.top_usuarios = Object.entries(usuariosStats)
        .map(([nombre, datos]) => ({
          nombre,
          ...datos,
          promedio: datos.ingresos / datos.count
        }))
        .sort((a, b) => b.ingresos - a.ingresos)
        .slice(0, 10);
      
      // Ingresos anuales
      estadisticas.ingresos.anual = estadisticas.ingresos.mensual * 12;
      
      // Promedio por suscripción
      estadisticas.promedio_por_suscripcion = estadisticas.total > 0 
        ? estadisticas.ingresos.total / estadisticas.total 
        : 0;
      
      // Distribución mensual
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const mesActual = new Date().getMonth();
      estadisticas.distribucion_mensual = meses.map((mes, index) => {
        const factor = index <= mesActual ? 1 : 0.3;
        return {
          mes,
          valor: Math.round(estadisticas.ingresos.mensual * factor * (0.5 + Math.random() * 0.5))
        };
      });
      
      console.log('📊 Top usuarios:', estadisticas.top_usuarios);
      console.log('📊 Estadísticas calculadas:', estadisticas);
      
      return estadisticas;
      
    } catch (error) {
      console.error('❌ Error getEstadisticasCompletas:', error);
      throw error;
    }
  }
};

// Datos de prueba (solo para desarrollo)
function getPlanesPrueba() {
  return [
    {
      id: 1,
      nombre: 'Plan Básico',
      monto: 10000,
      frecuencia: 'mensual',
      destacado: false,
      descripcion: 'Ideal para empezar a ayudar',
      beneficios: ['Certificado digital', 'Actualización mensual', 'Calcomanía']
    },
    {
      id: 2,
      nombre: 'Plan Premium',
      monto: 25000,
      frecuencia: 'mensual',
      destacado: true,
      descripcion: 'Para quienes quieren marcar la diferencia',
      beneficios: ['Certificado premium', 'Actualización semanal', 'Fotos exclusivas', 'Descuento en tienda']
    },
    {
      id: 3,
      nombre: 'Plan Vitalicio',
      monto: 50000,
      frecuencia: 'mensual',
      destacado: false,
      descripcion: 'Para los súper patrocinadores',
      beneficios: ['Certificado especial', 'Visitas mensuales', 'Nombre en placa', 'Descuento 20%']
    }
  ];
}

export default api;