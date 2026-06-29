// src/pages/admin/Dashboard/hooks/useAdminDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../../../services/api';

export const useAdminDashboard = () => {
  const { t } = useTranslation('admin');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // ===== ESTADÍSTICAS =====
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalMascotas: 0,
    adopcionesCompletadas: 0,
    eventosActivos: 0,
    rescatesPendientes: 0,
    suscripcionesActivas: 0,
  });

  // ===== DATOS PARA GRÁFICOS =====
  const [chartData, setChartData] = useState({
    mascotasMensual: [],
    adopcionesMensual: [],
    distribucionAdopciones: [],
    tiposUsuarios: [],
    eventosMensual: [],
    rescatesPrioridad: [],
    ingresosSuscripciones: [],
  });

  // ===== ACTIVIDAD RECIENTE =====
  const [recentActivity, setRecentActivity] = useState({
    usuarios: [],
    mascotas: [],
    adopciones: [],
    rescates: [],
    eventos: [],
  });

  // ===== ALERTAS =====
  const [alerts, setAlerts] = useState({
    usuariosPendientes: 0,
    rescatesPendientes: 0,
    solicitudesPendientes: 0,
  });

  // ===== FUNCIÓN PARA EXTRAER DATOS DE RESPUESTA =====
  const extractData = useCallback((response, defaultData = []) => {
    if (!response) return defaultData;
    
    // Si es un array, devolverlo directamente
    if (Array.isArray(response)) return response;
    
    // Si tiene data.data (estructura común de paginación)
    if (response.data?.data) {
      return Array.isArray(response.data.data) ? response.data.data : defaultData;
    }
    
    // Si tiene data y es array
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Si tiene data pero es objeto con data dentro
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    // Si es un objeto con datos dentro
    if (typeof response === 'object' && !Array.isArray(response)) {
      for (const key in response) {
        if (Array.isArray(response[key]) && response[key].length > 0) {
          return response[key];
        }
      }
    }
    
    return defaultData;
  }, []);

  // ===== FUNCIÓN PRINCIPAL - CARGAR DATOS =====
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Siempre usar endpoints individuales (más confiable)
      await fetchIndividualEndpoints();

    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError(err.response?.data?.message || t('error_carga_dashboard', 'Error al cargar el dashboard'));
      toast.error(t('error_carga_dashboard', 'Error al cargar el dashboard'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  // ===== FUNCIÓN FALLBACK - ENDPOINTS INDIVIDUALES =====
  const fetchIndividualEndpoints = useCallback(async () => {
    try {
      console.log('📊 Cargando datos del dashboard...');

      // 1. Usuarios - Obtener todos (no solo 5)
      const usersRes = await api.get('/admin/usuarios', { params: { per_page: 100 } });
      let usersData = extractData(usersRes.data);
      const totalUsuarios = usersRes.data?.data?.total || usersRes.data?.total || usersData.length || 0;
      
      console.log(`👥 Usuarios: ${totalUsuarios}`);

      // 2. Mascotas - Obtener todos
      const petsRes = await api.get('/admin/mascotas', { params: { per_page: 100 } });
      let petsData = extractData(petsRes.data);
      const totalMascotas = petsRes.data?.data?.total || petsRes.data?.total || petsData.length || 0;
      
      console.log(`🐾 Mascotas: ${totalMascotas}`);

      // 3. Adopciones - Obtener todos
      const adoptionsRes = await api.get('/admin/adopciones', { params: { per_page: 100 } });
      let adoptionsData = extractData(adoptionsRes.data);
      const totalAdopciones = adoptionsRes.data?.data?.total || adoptionsRes.data?.total || adoptionsData.length || 0;
      
      console.log(`📋 Adopciones: ${totalAdopciones}`);

      // 4. Rescates - Obtener todos
      const rescuesRes = await api.get('/admin/rescates', { params: { per_page: 100 } });
      let rescuesData = extractData(rescuesRes.data);
      
      console.log(`🆘 Rescates: ${rescuesData.length}`);

      // 5. Eventos - Obtener todos
      const eventsRes = await api.get('/admin/eventos', { params: { per_page: 100 } });
      let eventsData = extractData(eventsRes.data);
      
      console.log(`📅 Eventos: ${eventsData.length}`);

      // 6. Suscripciones - Obtener todos
      const subsRes = await api.get('/admin/suscripciones');
      let subsData = extractData(subsRes.data);
      
      console.log(`💳 Suscripciones: ${subsData.length}`);

      // 7. Usuarios pendientes
      const pendingUsersRes = await api.get('/admin/usuarios', { params: { estado: 'pendiente', per_page: 1 } });
      const pendingUsersTotal = pendingUsersRes.data?.data?.total || pendingUsersRes.data?.total || 0;

      // ===== ESTABLECER ESTADÍSTICAS =====
      const adopcionesCompletadas = adoptionsData.filter(a => 
        a.estado === 'completada' || a.estado === 'Completada'
      ).length;

      const eventosActivos = eventsData.filter(e => {
        if (!e.fecha_evento) return false;
        return new Date(e.fecha_evento) > new Date();
      }).length;

      const rescatesPendientes = rescuesData.filter(r => 
        r.estado === 'pendiente' || r.estado === 'en_progreso'
      ).length;

      const suscripcionesActivas = subsData.filter(s => 
        s.estado === 'activo' || s.estado === 'Activo'
      ).length;

      setStats({
        totalUsuarios: totalUsuarios,
        totalMascotas: totalMascotas,
        adopcionesCompletadas: adopcionesCompletadas,
        eventosActivos: eventosActivos,
        rescatesPendientes: rescatesPendientes,
        suscripcionesActivas: suscripcionesActivas,
      });

      console.log('📊 Estadísticas:', {
        totalUsuarios,
        totalMascotas,
        adopcionesCompletadas,
        eventosActivos,
        rescatesPendientes,
        suscripcionesActivas,
      });

      // ===== ESTABLECER ACTIVIDAD RECIENTE =====
      setRecentActivity({
        usuarios: Array.isArray(usersData) ? usersData.slice(0, 5) : [],
        mascotas: Array.isArray(petsData) ? petsData.slice(0, 5) : [],
        adopciones: Array.isArray(adoptionsData) ? adoptionsData.slice(0, 5) : [],
        rescates: Array.isArray(rescuesData) ? rescuesData.slice(0, 5) : [],
        eventos: Array.isArray(eventsData) ? eventsData.slice(0, 5) : [],
      });

      // ===== ESTABLECER ALERTAS =====
      setAlerts({
        usuariosPendientes: pendingUsersTotal,
        rescatesPendientes: rescatesPendientes,
        solicitudesPendientes: 0,
      });

      // ===== GENERAR DATOS PARA GRÁFICOS =====
      generateChartData(usersData, petsData, adoptionsData, rescuesData, eventsData, subsData);

    } catch (err) {
      console.error('Error en fetchIndividualEndpoints:', err);
      // No lanzar error para no romper la UI
    }
  }, [extractData]);

  // ===== GENERAR DATOS PARA GRÁFICOS =====
  const generateChartData = useCallback((users, pets, adoptions, rescues, events, subscriptions) => {
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ahora = new Date();
    const ultimos6Meses = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(ahora);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      ultimos6Meses.push({
        key,
        mes: mesesNombres[d.getMonth()],
        year: d.getFullYear(),
        label: `${mesesNombres[d.getMonth()]} ${d.getFullYear()}`,
        mascotas: 0,
        adopcionesCompletadas: 0,
        adopcionesProceso: 0,
        eventos: 0,
        rescates: 0,
      });
    }

    // Contar mascotas por mes
    if (Array.isArray(pets)) {
      pets.forEach(p => {
        if (!p.created_at) return;
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const found = ultimos6Meses.find(m => m.key === key);
        if (found) found.mascotas += 1;
      });
    }

    // Contar adopciones por mes
    if (Array.isArray(adoptions)) {
      adoptions.forEach(a => {
        if (!a.created_at) return;
        const d = new Date(a.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const found = ultimos6Meses.find(m => m.key === key);
        if (found) {
          if (a.estado === 'completada' || a.estado === 'Completada') {
            found.adopcionesCompletadas += 1;
          } else {
            found.adopcionesProceso += 1;
          }
        }
      });
    }

    // Contar eventos por mes
    if (Array.isArray(events)) {
      events.forEach(e => {
        if (!e.created_at) return;
        const d = new Date(e.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const found = ultimos6Meses.find(m => m.key === key);
        if (found) found.eventos += 1;
      });
    }

    // Contar rescates por mes
    if (Array.isArray(rescues)) {
      rescues.forEach(r => {
        if (!r.created_at) return;
        const d = new Date(r.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const found = ultimos6Meses.find(m => m.key === key);
        if (found) found.rescates += 1;
      });
    }

    // Datos para gráficos
    setChartData({
      mascotasMensual: ultimos6Meses.map(m => ({
        mes: m.label,
        total: m.mascotas,
      })),
      adopcionesMensual: ultimos6Meses.map(m => ({
        mes: m.label,
        completadas: m.adopcionesCompletadas,
        en_proceso: m.adopcionesProceso,
      })),
      distribucionAdopciones: [
        { name: 'En adopción', value: Array.isArray(pets) ? pets.filter(p => p.estado === 'En adopcion' || p.estado === 'En adopción').length : 0 },
        { name: 'Adoptados', value: Array.isArray(pets) ? pets.filter(p => p.estado === 'Adoptado').length : 0 },
        { name: 'Rescatados', value: Array.isArray(pets) ? pets.filter(p => p.estado === 'Rescatada').length : 0 },
        { name: 'En acogida', value: Array.isArray(pets) ? pets.filter(p => p.estado === 'En acogida').length : 0 },
      ].filter(d => d.value > 0),
      tiposUsuarios: [
        { name: 'Usuarios', value: Array.isArray(users) ? users.filter(u => u.tipo === 'usuario' || !u.tipo).length : 0 },
        { name: 'Fundaciones', value: Array.isArray(users) ? users.filter(u => u.tipo === 'fundacion').length : 0 },
        { name: 'Veterinarias', value: Array.isArray(users) ? users.filter(u => u.tipo === 'veterinaria').length : 0 },
      ].filter(d => d.value > 0),
      eventosMensual: ultimos6Meses.map(m => ({
        mes: m.label,
        total: m.eventos,
      })),
      rescatesPrioridad: [
        { nombre: 'Alta', value: Array.isArray(rescues) ? rescues.filter(r => r.prioridad === 'alta').length : 0 },
        { nombre: 'Media', value: Array.isArray(rescues) ? rescues.filter(r => r.prioridad === 'media').length : 0 },
        { nombre: 'Baja', value: Array.isArray(rescues) ? rescues.filter(r => r.prioridad === 'baja').length : 0 },
      ].filter(d => d.value > 0),
      ingresosSuscripciones: ultimos6Meses.map((m, index) => ({
        mes: m.label,
        monto: Array.isArray(subscriptions) ? subscriptions
          .filter(s => s.estado === 'activo')
          .reduce((sum, s) => sum + (parseFloat(s.monto_mensual) || 0), 0) / (index + 1) : 0,
      })),
    });
  }, []);

  // ===== REFRESCAR =====
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ===== CARGA INICIAL =====
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    loading,
    refreshing,
    error,
    stats,
    chartData,
    recentActivity,
    alerts,
    handleRefresh,
  };
};