import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { veterinariaService } from '../../../../services/veterinariaService';

const safeResult = (result) => {
  if (!result || result.status !== 'fulfilled') return [];
  return Array.isArray(result.value) ? result.value : [];
};

const normalizeDateValue = (item) => {
  return item?.fecha || item?.fecha_cita || item?.fecha_hora || item?.created_at || item?.createdAt;
};

const isSameDay = (dateA, dateB) => {
  if (!dateA || !dateB) return false;
  const a = new Date(dateA);
  const b = new Date(dateB);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

export const useVeterinariaDashboard = () => {
  const { t } = useTranslation('veterinaria');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    citasHoy: 0,
    pacientesActivos: 0,
    serviciosDisponibles: 0,
    totalCitas: 0,
    totalPacientes: 0,
  });
  const [recentCitas, setRecentCitas] = useState([]);
  const [recentPacientes, setRecentPacientes] = useState([]);

  const cargarDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [pacientesRes, citasRes, serviciosRes] = await Promise.allSettled([
        veterinariaService.getPacientes({ per_page: 100 }),
        veterinariaService.getCitas({ per_page: 100 }),
        veterinariaService.getServicios({ per_page: 100 }),
      ]);

      const pacientes = safeResult(pacientesRes);
      const citas = safeResult(citasRes);
      const servicios = safeResult(serviciosRes);
      const hoy = new Date();

      const citasHoy = citas.filter((cita) => isSameDay(normalizeDateValue(cita), hoy)).length;
      const pacientesActivos = pacientes.filter((paciente) => {
        if (typeof paciente.esta_activo === 'boolean') return paciente.esta_activo;
        if (typeof paciente.activo === 'boolean') return paciente.activo;
        return true;
      }).length;

      setStats({
        citasHoy,
        pacientesActivos,
        serviciosDisponibles: servicios.length,
        totalCitas: citas.length,
        totalPacientes: pacientes.length,
      });
      setRecentCitas(citas.slice(0, 5));
      setRecentPacientes(pacientes.slice(0, 5));
    } catch (err) {
      console.error('Error cargando dashboard veterinaria:', err);
      setError(t('error_carga_dashboard', 'Error al cargar el dashboard de veterinaria'));
      toast.error(t('error_carga_dashboard', 'Error al cargar el dashboard de veterinaria'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  return {
    loading,
    error,
    stats,
    recentCitas,
    recentPacientes,
    handleRefresh: cargarDashboard,
  };
};
