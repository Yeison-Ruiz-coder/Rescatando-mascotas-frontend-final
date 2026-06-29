// src/components/common/UserDashboardCharts/UserDashboardCharts.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart2,
  Calendar,
  Download,
  RefreshCw,
  Heart,
  PawPrint,
  CalendarCheck,
} from 'lucide-react';
import './UserDashboardCharts.css';

// Colores para gráficos
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#2ecc71',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.pink,
  COLORS.teal,
  COLORS.orange,
];

// ===== SUBCOMPONENTES =====
const ChartSkeleton = ({ height }) => (
  <div className="user-chart-wrapper">
    <div className="user-chart-header">
      <div className="skeleton-text" style={{ width: '150px', height: '20px' }} />
    </div>
    <div className="user-chart-body" style={{ height }}>
      <div className="skeleton-chart" />
    </div>
  </div>
);

const ChartEmpty = ({ message }) => (
  <div className="user-chart-wrapper">
    <div className="user-chart-empty">
      <p>{message}</p>
    </div>
  </div>
);

// ===== GRÁFICO 1: ESTADO DE SUSCRIPCIONES =====
const SubscriptionStatusChart = ({ data, loading }) => {
  const { t } = useTranslation('dashboard');

  if (loading) {
    return <ChartSkeleton height={280} />;
  }

  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return <ChartEmpty message={t('charts.sin_suscripciones', 'No tienes suscripciones activas')} />;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="user-chart-wrapper">
      <div className="user-chart-header">
        <h4>
          <PieChartIcon size={16} />
          {t('charts.estado_suscripciones', 'Estado de tus Suscripciones')}
        </h4>
        <span className="user-chart-total">{total} {t('charts.total', 'total')}</span>
      </div>
      <div className="user-chart-body" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value, t('charts.suscripciones', 'Suscripciones')]}
              contentStyle={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="user-chart-footer">
        {data.map((item, index) => (
          <span key={index} className="user-chart-legend-item">
            <span
              className="legend-dot"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            {item.name}: {item.value}
          </span>
        ))}
      </div>
    </div>
  );
};

// ===== GRÁFICO 2: SOLICITUDES POR MES =====
const MonthlyRequestsChart = ({ data, loading }) => {
  const { t } = useTranslation('dashboard');

  if (loading) {
    return <ChartSkeleton height={280} />;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty message={t('charts.sin_solicitudes', 'No hay solicitudes registradas')} />;
  }

  return (
    <div className="user-chart-wrapper">
      <div className="user-chart-header">
        <h4>
          <BarChart2 size={16} />
          {t('charts.solicitudes_mensuales', 'Solicitudes por Mes')}
        </h4>
        <span className="user-chart-badge">
          {data.reduce((sum, d) => sum + d.total, 0)} {t('charts.total', 'total')}
        </span>
      </div>
      <div className="user-chart-body" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="mes"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--color-border)' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
              formatter={(value, name) => {
                const labels = {
                  aprobadas: t('charts.aprobadas', 'Aprobadas'),
                  pendientes: t('charts.pendientes', 'Pendientes'),
                  rechazadas: t('charts.rechazadas', 'Rechazadas'),
                };
                return [value, labels[name] || name];
              }}
            />
            <Legend
              formatter={(value) => {
                const labels = {
                  aprobadas: t('charts.aprobadas', 'Aprobadas'),
                  pendientes: t('charts.pendientes', 'Pendientes'),
                  rechazadas: t('charts.rechazadas', 'Rechazadas'),
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ color: 'var(--color-text)', fontSize: 12 }}
            />
            <Bar dataKey="aprobadas" fill={COLORS.success} radius={[4, 4, 0, 0]} />
            <Bar dataKey="pendientes" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
            <Bar dataKey="rechazadas" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ===== GRÁFICO 3: TASA DE ÉXITO EN ADOPCIONES =====
const AdoptionSuccessRateChart = ({ data, loading }) => {
  const { t } = useTranslation('dashboard');

  if (loading) {
    return <ChartSkeleton height={280} />;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty message={t('charts.sin_datos_exito', 'No hay datos de tasa de éxito')} />;
  }

  const latestRate = data[data.length - 1]?.tasa || 0;

  return (
    <div className="user-chart-wrapper">
      <div className="user-chart-header">
        <h4>
          <TrendingUp size={16} />
          {t('charts.tasa_exito_adopciones', 'Tasa de Éxito en Adopciones')}
        </h4>
        <span className="user-chart-badge success">
          {latestRate}%
        </span>
      </div>
      <div className="user-chart-body" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="userSuccessGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="mes"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--color-border)' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
              formatter={(value) => [`${value}%`, t('charts.tasa_exito', 'Tasa de Éxito')]}
            />
            <Area
              type="monotone"
              dataKey="tasa"
              stroke={COLORS.success}
              strokeWidth={2}
              fill="url(#userSuccessGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ===== GRÁFICO 4: DISTRIBUCIÓN DE SOLICITUDES POR ESTADO =====
const RequestStatusChart = ({ data, loading }) => {
  const { t } = useTranslation('dashboard');

  if (loading) {
    return <ChartSkeleton height={280} />;
  }

  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return <ChartEmpty message={t('charts.sin_solicitudes_estado', 'No hay solicitudes')} />;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="user-chart-wrapper">
      <div className="user-chart-header">
        <h4>
          <PieChartIcon size={16} />
          {t('charts.distribucion_solicitudes', 'Distribución de Solicitudes')}
        </h4>
        <span className="user-chart-total">{total} {t('charts.total', 'total')}</span>
      </div>
      <div className="user-chart-body" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: 'var(--color-text-muted)' }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value, t('charts.solicitudes', 'Solicitudes')]}
              contentStyle={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="user-chart-footer">
        {data.map((item, index) => (
          <span key={index} className="user-chart-legend-item">
            <span
              className="legend-dot"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            {item.name}: {item.value}
          </span>
        ))}
      </div>
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
const UserDashboardCharts = ({ 
  suscripciones = [], 
  solicitudes = [], 
  loading = false 
}) => {
  const { t } = useTranslation('dashboard');
  const [filterPeriod, setFilterPeriod] = useState('6');
  const [chartData, setChartData] = useState({
    suscripcionesEstado: [],
    solicitudesMensuales: [],
    tasaExito: [],
    solicitudesEstado: [],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Procesar datos para gráficos
  useEffect(() => {
    if (!suscripciones && !solicitudes) return;

    const procesarDatos = () => {
      // 1. Estado de suscripciones
      const estadoMap = {};
      suscripciones.forEach((s) => {
        const estado = s.estado || 'Desconocido';
        const estadoLabel = {
          'activo': t('estados.activo', 'Activo'),
          'pendiente': t('estados.pendiente', 'Pendiente'),
          'cancelado': t('estados.cancelado', 'Cancelado'),
          'inactivo': t('estados.inactivo', 'Inactivo'),
          'expirado': t('estados.expirado', 'Expirado'),
        }[estado] || estado;
        estadoMap[estadoLabel] = (estadoMap[estadoLabel] || 0) + 1;
      });
      const suscripcionesEstadoData = Object.entries(estadoMap).map(([name, value]) => ({
        name,
        value,
      }));

      // 2. Solicitudes mensuales
      const meses = {};
      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const ahora = new Date();
      const limite = parseInt(filterPeriod);

      for (let i = 0; i < limite; i++) {
        const d = new Date(ahora);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        meses[key] = {
          mes: `${mesesNombres[d.getMonth()]} ${d.getFullYear()}`,
          aprobadas: 0,
          pendientes: 0,
          rechazadas: 0,
          total: 0,
        };
      }

      solicitudes.forEach((s) => {
        if (!s.created_at) return;
        const fecha = new Date(s.created_at);
        const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        if (meses[key]) {
          const estado = s.estado?.toLowerCase() || '';
          if (estado === 'aprobada' || estado === 'completada') {
            meses[key].aprobadas += 1;
          } else if (estado === 'pendiente' || estado === 'en_revision') {
            meses[key].pendientes += 1;
          } else if (estado === 'rechazada') {
            meses[key].rechazadas += 1;
          }
          meses[key].total += 1;
        }
      });

      const solicitudesMensualesData = Object.values(meses).reverse();

      // 3. Tasa de éxito mensual
      const tasaData = solicitudesMensualesData.map((m) => ({
        mes: m.mes,
        tasa: m.total > 0 ? Math.round((m.aprobadas / m.total) * 100) : 0,
        aprobadas: m.aprobadas,
        total: m.total,
      }));

      // 4. Distribución de solicitudes por estado
      const solicitudesEstadoMap = {};
      solicitudes.forEach((s) => {
        const estado = s.estado || 'Desconocido';
        const estadoLabel = {
          'pendiente': t('estados.pendiente', 'Pendiente'),
          'en_revision': t('estados.en_revision', 'En revisión'),
          'aprobada': t('estados.aprobada', 'Aprobada'),
          'rechazada': t('estados.rechazada', 'Rechazada'),
          'completada': t('estados.completada', 'Completada'),
        }[estado] || estado;
        solicitudesEstadoMap[estadoLabel] = (solicitudesEstadoMap[estadoLabel] || 0) + 1;
      });
      const solicitudesEstadoData = Object.entries(solicitudesEstadoMap).map(([name, value]) => ({
        name,
        value,
      }));

      setChartData({
        suscripcionesEstado: suscripcionesEstadoData,
        solicitudesMensuales: solicitudesMensualesData,
        tasaExito: tasaData,
        solicitudesEstado: solicitudesEstadoData,
      });
    };

    procesarDatos();
  }, [suscripciones, solicitudes, filterPeriod, t]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleExport = () => {
    const headers = ['Mes', 'Aprobadas', 'Pendientes', 'Rechazadas', 'Total', 'Tasa Éxito'];
    const rows = chartData.solicitudesMensuales.map((m) => [
      m.mes,
      m.aprobadas,
      m.pendientes,
      m.rechazadas,
      m.total,
      m.total > 0 ? `${Math.round((m.aprobadas / m.total) * 100)}%` : '0%',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuario_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="user-dashboard-charts-container">
      {/* Filtros */}
      <div className="user-charts-filters">
        <div className="user-filters-left">
          <div className="user-filter-group">
            <label>
              <Calendar size={14} />
              {t('charts.periodo', 'Período')}
            </label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="user-filter-select"
            >
              <option value="3">{t('charts.3_meses', '3 meses')}</option>
              <option value="6">{t('charts.6_meses', '6 meses')}</option>
              <option value="12">{t('charts.12_meses', '12 meses')}</option>
              <option value="24">{t('charts.24_meses', '24 meses')}</option>
            </select>
          </div>
        </div>
        <div className="user-filters-right">
          <button
            className="user-filter-btn user-export-btn"
            onClick={handleExport}
            title={t('charts.exportar_datos', 'Exportar datos')}
          >
            <Download size={16} />
            <span>{t('charts.exportar', 'Exportar')}</span>
          </button>
          <button
            className={`user-filter-btn user-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title={t('charts.refrescar', 'Refrescar')}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Grid de gráficos */}
      <div className="user-charts-grid">
        <div className="user-chart-card">
          <SubscriptionStatusChart data={chartData.suscripcionesEstado} loading={loading} />
        </div>
        <div className="user-chart-card">
          <MonthlyRequestsChart data={chartData.solicitudesMensuales} loading={loading} />
        </div>
        <div className="user-chart-card">
          <AdoptionSuccessRateChart data={chartData.tasaExito} loading={loading} />
        </div>
        <div className="user-chart-card">
          <RequestStatusChart data={chartData.solicitudesEstado} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboardCharts;