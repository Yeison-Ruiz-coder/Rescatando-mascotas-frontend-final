import React, { useState, useEffect } from 'react';
import { 
  Users, PawPrint, Heart, DollarSign, TrendingUp, 
  Award, Activity, ShoppingBag
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {

  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topDonations, setTopDonations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, donationsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getReporteDonaciones()
      ]);

      setStats(statsRes.data);
      setTopDonations(donationsRes.data?.top_donaciones || []);

      setRecentActivity([
        { id: 1, action: 'Nuevo usuario registrado', user: 'Carlos Pérez', time: 'Hace 5 min', icon: Users, color: '#48bb78' },
        { id: 2, action: 'Nueva adopción', user: 'Luna', time: 'Hace 15 min', icon: Heart, color: '#f687b3' },
        { id: 3, action: 'Donación recibida', user: 'María López', time: 'Hace 1 hora', icon: DollarSign, color: '#9f7aea' },
        { id: 4, action: 'Reporte de rescate', user: 'Zona norte', time: 'Hace 2 horas', icon: Activity, color: '#f56565' },
      ]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // 🟣 CARDS PRINCIPALES
  const statCards = [
    {
      title: 'Usuarios',
      value: stats?.total_usuarios || 0,
      icon: Users,
      bg: 'linear-gradient(135deg,#667eea,#764ba2)'
    },
    {
      title: 'Mascotas',
      value: stats?.total_mascotas || 0,
      icon: PawPrint,
      bg: 'linear-gradient(135deg,#ed8936,#dd6b20)'
    },
    {
      title: 'Adopciones',
      value: stats?.total_adopciones || 0,
      icon: Heart,
      bg: 'linear-gradient(135deg,#f687b3,#ed64a6)'
    },
    {
      title: 'Donaciones',
      value: `$${stats?.total_donaciones || 0}`,
      icon: DollarSign,
      bg: 'linear-gradient(135deg,#48bb78,#38a169)'
    },
    {
      title: 'Suscripciones',
      value: stats?.total_suscripciones || 0,
      icon: TrendingUp,
      bg: 'linear-gradient(135deg,#4f46e5,#7c3aed)'
    }
  ];

  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <p>Bienvenido {user?.nombre}</p>
      </div>

      {/* 🟣 CARDS */}
      <div className="stats-cards">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card" style={{ background: s.bg }}>
              <Icon size={26} color="#fff" />
              <div>
                <h3>{s.title}</h3>
                <h2>{s.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🟡 GRID */}
      <div className="dashboard-grid">

        {/* ACTIVIDAD */}
        <div className="activity-card">
          <h3>Actividad reciente</h3>

          {recentActivity.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} className="activity-item">
                <Icon size={18} color={a.color} />
                <div>
                  <p>{a.action}</p>
                  <small>{a.user} • {a.time}</small>
                </div>
              </div>
            );
          })}
        </div>

        {/* DONACIONES */}
        <div className="donations-card">
          <h3>Donaciones</h3>

          {topDonations.slice(0, 5).map((d, i) => (
            <div key={i} className="donation-item">
              <span>{i + 1}</span>
              <div>
                <p>{d.usuario_nombre}</p>
                <small>{d.fundacion_nombre}</small>
              </div>
              <b>${d.valor}</b>
            </div>
          ))}
        </div>

      </div>

      {/* 🚀 BOTONES CONECTADOS (IMPORTANTE) */}
      <div className="quick-actions">

        <h3>Acciones rápidas</h3>

        <div className="actions-grid">

          {[
            { icon: Heart, label: 'Adopciones', path: '/admin/adopciones' },
            { icon: PawPrint, label: 'Mascotas', path: '/admin/mascotas/nueva' },
            { icon: Users, label: 'Solicitudes', path: '/admin/solicitudes' },
            { icon: ShoppingBag, label: 'Tienda', path: '/admin/productos' },
            { icon: TrendingUp, label: 'Suscripciones', path: '/admin/suscripciones' }
          ].map((a, i) => {
            const Icon = a.icon;

            return (
              <button
                key={i}
                className="action-btn"
                onClick={() => navigate(a.path)}
              >
                <Icon size={18} />
                <span>{a.label}</span>
              </button>
            );
          })}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;