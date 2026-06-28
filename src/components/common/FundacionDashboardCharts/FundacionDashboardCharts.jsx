// src/components/common/FundacionDashboardCharts/FundacionDashboardCharts.jsx
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
} from 'lucide-react';
import './FundacionDashboardCharts.css';

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
  <div className="chart-wrapper">
    <div className="chart-header">
      <div className="skeleton-text" style={{ width: '150px', height: '20px' }} />
    </div>
    <div className="chart-body" style={{ height }}>
      <div className="skeleton-chart" />
    </div>
  </div>
);

const ChartEmpty = ({ message }) => (
  <div className="chart-wrapper">
    <div className="chart-empty">
      <p>{message}</p>
    </div>
  </div>
);

// ===== COMPONENTE: MASCOTAS POR ESTADO (Gráfico de Anillos) =====
const PetsByStatusChart = ({ data, loading }) => {
  const { t } = useTranslation('fundacion');

  if (loading) {
    return <ChartSkeleton height={280} />;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty message={t('sin_datos_estado', 'No hay datos de estados')} />;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h4>
          <PieChartIcon size={16} />
          {t('distribucion_por_estado', 'Distribución por Estado')}
        </h4>
        <span className="chart-total">{total} {t('total', 'total')}</span>
      </div>
      <div className="chart-body" style={{ height: 260 }}>
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
              formatter={(value) => [value, t('mascotas', 'Mascotas')]}
              contentStyle={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        {data.map((item, index) => (
          <span key={index} className="chart-legend-item">
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

// ===== COMPONENTE: ADOPCIONES MENSUALES (Gráfico de Barras) =====
const MonthlyAdoptionsChart = ({ data, loading }) => {
  const { t } = useTranslation('fundacion');

  if (loading) {
    return <ChartSkeleton height={280} />;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty message={t('sin_datos_mensuales', 'No hay datos mensuales')} />;
  }

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h4>
          <BarChart2 size={16} />
          {t('adopciones_mensuales', 'Adopciones Mensuales')}
        </h4>
        <span className="chart-badge">
          {data.reduce((sum, d) => sum + d.adoptadas, 0)} {t('total', 'total')}
        </span>
      </div>
      <div className="chart-body" style={{ height: 260 }}>
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
                  adoptadas: t('adoptadas', 'Adoptadas'),
                  en_proceso: t('en_proceso', 'En Proceso'),
                };
                return [value, labels[name] || name];
              }}
            />
            <Legend
              formatter={(value) => {
                const labels = {
                  adoptadas: t('adoptadas', 'Adoptadas'),
                  en_proceso: t('en_proceso', 'En Proceso'),
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ color: 'var(--color-text)', fontSize: 12 }}
            />
            <Bar dataKey="adoptadas" fill={COLORS.success} radius={[4, 4, 0, 0]} />
            <Bar dataKey="en_proceso" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ===== COMPONENTE: TASA DE ÉXITO (Gráfico de Área) =====
const SuccessRateChart = ({ data, loading }) => {
  const { t } = useTranslation('fundacion');

  if (loading) {
    return <ChartSkeleton height={280} />;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty message={t('sin_datos_exito', 'No hay datos de tasa de éxito')} />;
  }

  const latestRate = data[data.length - 1]?.tasa || 0;

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h4>
          <TrendingUp size={16} />
          {t('tasa_exito', 'Tasa de Éxito')}
        </h4>
        <span className="chart-badge success">
          {latestRate}%
        </span>
      </div>
      <div className="chart-body" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
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
              formatter={(value) => [`${value}%`, t('tasa_exito', 'Tasa de Éxito')]}
            />
            <Area
              type="monotone"
              dataKey="tasa"
              stroke={COLORS.success}
              strokeWidth={2}
              fill="url(#successGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ===== COMPONENTE: MASCOTAS POR ESPECIE (con soporte para especie única) =====
const SpeciesChart = ({ data, loading }) => {
  const { t } = useTranslation('fundacion');

  if (loading) {
    return <ChartSkeleton height={280} />;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty message={t('sin_datos_especie', 'No hay datos por especie')} />;
  }

  // Si solo hay una especie, mostrar mensaje informativo
  if (data.length === 1) {
    const total = data[0].value;
    const especie = data[0].name;
    
    return (
      <div className="chart-wrapper">
        <div className="chart-header">
          <h4>
            <PieChartIcon size={16} />
            {t('mascotas_por_especie', 'Mascotas por Especie')}
          </h4>
          <span className="chart-total">
            {total} {t('total', 'total')}
          </span>
        </div>
        <div className="chart-body" style={{ height: 260 }}>
          <div className="chart-single-species">
            <div className="single-species-icon">🐾</div>
            <p className="single-species-text">
              <strong>{especie}</strong>
              <br />
              <span>{t('unica_especie_registrada', 'Única especie registrada')}</span>
            </p>
            <div className="single-species-bar">
              <div 
                className="single-species-bar-fill" 
                style={{ width: '100%', background: CHART_COLORS[0] }}
              />
            </div>
            <span className="single-species-count">
              {total} {total === 1 ? t('mascota', 'mascota') : t('mascotas', 'mascotas')}
            </span>
          </div>
        </div>
        <div className="chart-footer">
          <span className="chart-legend-item">
            <span className="legend-dot" style={{ background: CHART_COLORS[0] }} />
            {especie}: {total}
          </span>
        </div>
      </div>
    );
  }

  // Renderizado normal con múltiples especies
  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h4>
          <PieChartIcon size={16} />
          {t('mascotas_por_especie', 'Mascotas por Especie')}
        </h4>
        <span className="chart-total">
          {data.reduce((sum, d) => sum + d.value, 0)} {t('total', 'total')}
        </span>
      </div>
      <div className="chart-body" style={{ height: 260 }}>
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
              formatter={(value) => [value, t('mascotas', 'Mascotas')]}
              contentStyle={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        {data.map((item, index) => (
          <span key={index} className="chart-legend-item">
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
const FundacionDashboardCharts = ({ mascotas = [], adopciones = [], loading = false }) => {
  const { t } = useTranslation('fundacion');
  const [filterPeriod, setFilterPeriod] = useState('6');
  const [chartData, setChartData] = useState({
    estado: [],
    mensual: [],
    tasaExito: [],
    especie: [],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Procesar datos para gráficos
  useEffect(() => {
    if (!mascotas || !adopciones) return;

    const procesarDatos = () => {
      // 1. Distribución por estado (usando todas las mascotas)
      const estadoMap = {};
      mascotas.forEach((m) => {
        const estado = m.estado || 'Desconocido';
        estadoMap[estado] = (estadoMap[estado] || 0) + 1;
      });
      const estadoData = Object.entries(estadoMap).map(([name, value]) => ({
        name,
        value,
      }));

      // 2. Adopciones mensuales
      const meses = {};
      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const ahora = new Date();
      const limite = parseInt(filterPeriod);

      // Inicializar meses
      for (let i = 0; i < limite; i++) {
        const d = new Date(ahora);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        meses[key] = {
          mes: `${mesesNombres[d.getMonth()]} ${d.getFullYear()}`,
          adoptadas: 0,
          en_proceso: 0,
          total: 0,
        };
      }

      // Llenar datos de adopciones
      adopciones.forEach((a) => {
        if (!a.created_at) return;
        const fecha = new Date(a.created_at);
        const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        if (meses[key]) {
          if (a.estado === 'completada' || a.estado === 'aprobada') {
            meses[key].adoptadas += 1;
          } else {
            meses[key].en_proceso += 1;
          }
          meses[key].total += 1;
        }
      });

      const mensualData = Object.values(meses).reverse();

      // 3. Tasa de éxito mensual
      const tasaData = mensualData.map((m) => ({
        mes: m.mes,
        tasa: m.total > 0 ? Math.round((m.adoptadas / m.total) * 100) : 0,
        adoptadas: m.adoptadas,
        total: m.total,
      }));

      // 4. Mascotas por especie (usando TODAS las mascotas, no solo adoptadas)
      const especieMap = {};
      mascotas.forEach((m) => {
        const especie = m.especie || 'Desconocida';
        especieMap[especie] = (especieMap[especie] || 0) + 1;
      });
      const especieData = Object.entries(especieMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setChartData({
        estado: estadoData,
        mensual: mensualData,
        tasaExito: tasaData,
        especie: especieData,
      });
    };

    procesarDatos();
  }, [mascotas, adopciones, filterPeriod]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleExport = () => {
    // Exportar datos como CSV
    const headers = ['Mes', 'Adoptadas', 'En Proceso', 'Total', 'Tasa Éxito'];
    const rows = chartData.mensual.map((m) => [
      m.mes,
      m.adoptadas,
      m.en_proceso,
      m.total,
      m.total > 0 ? `${Math.round((m.adoptadas / m.total) * 100)}%` : '0%',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `adopciones_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="dashboard-charts-container">
      {/* Filtros */}
      <div className="charts-filters">
        <div className="filters-left">
          <div className="filter-group">
            <label>
              <Calendar size={14} />
              {t('periodo', 'Período')}
            </label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="filter-select"
            >
              <option value="3">{t('3_meses', '3 meses')}</option>
              <option value="6">{t('6_meses', '6 meses')}</option>
              <option value="12">{t('12_meses', '12 meses')}</option>
              <option value="24">{t('24_meses', '24 meses')}</option>
            </select>
          </div>
        </div>
        <div className="filters-right">
          <button
            className="filter-btn export-btn"
            onClick={handleExport}
            title={t('exportar_datos', 'Exportar datos')}
          >
            <Download size={16} />
            <span>{t('exportar', 'Exportar')}</span>
          </button>
          <button
            className={`filter-btn refresh-btn ${isRefreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title={t('refrescar', 'Refrescar')}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Grid de gráficos */}
      <div className="charts-grid">
        <div className="chart-card">
          <PetsByStatusChart data={chartData.estado} loading={loading} />
        </div>
        <div className="chart-card">
          <MonthlyAdoptionsChart data={chartData.mensual} loading={loading} />
        </div>
        <div className="chart-card">
          <SuccessRateChart data={chartData.tasaExito} loading={loading} />
        </div>
        <div className="chart-card">
          <SpeciesChart data={chartData.especie} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default FundacionDashboardCharts;