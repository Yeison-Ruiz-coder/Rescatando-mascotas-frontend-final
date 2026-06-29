// src/pages/admin/Dashboard/components/DashboardCharts.jsx
import React from 'react';
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
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#667eea', '#2ecc71', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const DashboardCharts = ({ chartData, loading }) => {
  const { t } = useTranslation('admin');

  if (loading) {
    return (
      <div className="dc-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="dc-chart-card dc-skeleton">
            <div className="dc-skeleton-header"></div>
            <div className="dc-skeleton-body"></div>
          </div>
        ))}
      </div>
    );
  }

  const hasData = (data) => data && data.length > 0;

  return (
    <div className="dc-grid">
      {/* Gráfico 1: Mascotas registradas por mes */}
      <div className="dc-chart-card">
        <h3 className="dc-chart-title">
          {t('charts.mascotas_mensual', 'Mascotas registradas por mes')}
        </h3>
        <div className="dc-chart-body">
          {hasData(chartData.mascotasMensual) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.mascotasMensual}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="total" fill="#667eea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dc-empty">{t('sin_datos', 'Sin datos disponibles')}</div>
          )}
        </div>
      </div>

      {/* Gráfico 2: Adopciones por mes */}
      <div className="dc-chart-card">
        <h3 className="dc-chart-title">
          {t('charts.adopciones_mensual', 'Adopciones por mes')}
        </h3>
        <div className="dc-chart-body">
          {hasData(chartData.adopcionesMensual) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.adopcionesMensual}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="completadas" fill="#2ecc71" radius={[4, 4, 0, 0]} />
                <Bar dataKey="en_proceso" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dc-empty">{t('sin_datos', 'Sin datos disponibles')}</div>
          )}
        </div>
      </div>

      {/* Gráfico 3: Distribución de adopciones (Pie) */}
      <div className="dc-chart-card">
        <h3 className="dc-chart-title">
          {t('charts.distribucion_adopciones', 'Distribución de adopciones')}
        </h3>
        <div className="dc-chart-body">
          {hasData(chartData.distribucionAdopciones) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData.distribucionAdopciones}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.distribucionAdopciones.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="dc-empty">{t('sin_datos', 'Sin datos disponibles')}</div>
          )}
        </div>
      </div>

      {/* Gráfico 4: Tipos de usuarios (Pie) */}
      <div className="dc-chart-card">
        <h3 className="dc-chart-title">
          {t('charts.tipos_usuarios', 'Tipos de usuarios')}
        </h3>
        <div className="dc-chart-body">
          {hasData(chartData.tiposUsuarios) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData.tiposUsuarios}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.tiposUsuarios.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="dc-empty">{t('sin_datos', 'Sin datos disponibles')}</div>
          )}
        </div>
      </div>

      {/* Gráfico 5: Eventos por mes */}
      <div className="dc-chart-card dc-chart-full">
        <h3 className="dc-chart-title">
          {t('charts.eventos_mensual', 'Eventos por mes')}
        </h3>
        <div className="dc-chart-body">
          {hasData(chartData.eventosMensual) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData.eventosMensual}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="total" stroke="#667eea" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="dc-empty">{t('sin_datos', 'Sin datos disponibles')}</div>
          )}
        </div>
      </div>

      {/* Gráfico 6: Rescates por prioridad */}
      <div className="dc-chart-card dc-chart-full">
        <h3 className="dc-chart-title">
          {t('charts.rescates_prioridad', 'Rescates por prioridad')}
        </h3>
        <div className="dc-chart-body">
          {hasData(chartData.rescatesPrioridad) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.rescatesPrioridad}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="nombre" tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dc-empty">{t('sin_datos', 'Sin datos disponibles')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;