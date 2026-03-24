import React, { useState, useEffect } from 'react';
import { 
  Users, PawPrint, Heart, DollarSign, TrendingUp, 
  Award, Calendar, Activity, ArrowUp, ArrowDown,
  ShoppingBag, Building2, MapPin, Clock
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
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
        { id: 1, type: 'user', action: 'Nuevo usuario registrado', user: 'Carlos Pérez', time: 'Hace 5 min', icon: Users, color: '#48bb78' },
        { id: 2, type: 'adoption', action: 'Nueva adopción', user: 'Luna - Fundación Patitas', time: 'Hace 15 min', icon: Heart, color: '#f687b3' },
        { id: 3, type: 'donation', action: 'Donación recibida', user: 'María López - $50,000', time: 'Hace 1 hora', icon: DollarSign, color: '#9f7aea' },
        { id: 4, type: 'rescue', action: 'Reporte de rescate', user: 'Zona norte - Urgente', time: 'Hace 2 horas', icon: Activity, color: '#f56565' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  const statCards = [
    { title: 'Usuarios', value: stats?.total_usuarios || 0, icon: Users, color: '#667eea', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', change: '+12%', trend: 'up' },
    { title: 'Mascotas', value: stats?.total_mascotas || 0, icon: PawPrint, color: '#ed8936', bg: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)', change: '+8%', trend: 'up' },
    { title: 'Adopciones', value: stats?.total_adopciones || 0, icon: Heart, color: '#f687b3', bg: 'linear-gradient(135deg, #f687b3 0%, #ed64a6 100%)', change: '+15%', trend: 'up' },
    { title: 'Donaciones', value: `$${stats?.total_donaciones?.toLocaleString() || 0}`, icon: DollarSign, color: '#48bb78', bg: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', change: '+23%', trend: 'up' },
  ];
  
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <p>Bienvenido de vuelta, {user?.nombre}. Aquí está el resumen de tu plataforma.</p>
      </div>
      
      <div className="stats-cards">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card" style={{ background: stat.bg }}>
              <div className="stat-icon-wrapper">
                <Icon size={24} color="#fff" />
              </div>
              <div className="stat-info">
                <p className="stat-title">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
                <span className={`stat-change ${stat.trend === 'up' ? 'positive' : 'negative'}`}>
                  {stat.trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="dashboard-grid">
        <div className="activity-card">
          <div className="card-header">
            <h3>Actividad Reciente</h3>
            <button>Ver todas</button>
          </div>
          <div className="activity-list">
            {recentActivity.map(activity => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon" style={{ background: `${activity.color}15` }}>
                    <Icon size={20} color={activity.color} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-action">{activity.action}</p>
                    <p className="activity-user">{activity.user}</p>
                  </div>
                  <span className="activity-time">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="donations-card">
          <div className="card-header">
            <h3>Donaciones Destacadas</h3>
            <Award size={20} color="#f6ad55" />
          </div>
          <div className="donations-list">
            {topDonations.slice(0, 5).map((donation, index) => (
              <div key={index} className="donation-item">
                <div className="donation-rank">{index + 1}</div>
                <div className="donation-info">
                  <p className="donation-user">{donation.usuario_nombre}</p>
                  <p className="donation-foundation">{donation.fundacion_nombre}</p>
                </div>
                <p className="donation-amount">${donation.valor?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <p>Gestiona rápidamente las tareas más comunes del sistema</p>
        <div className="actions-grid">
          {[
            { icon: Heart, label: 'Gestionar Adopciones', path: '/admin/adopciones', color: '#f687b3' },
            { icon: PawPrint, label: 'Nueva Mascota', path: '/admin/mascotas/nueva', color: '#ed8936' },
            { icon: Users, label: 'Ver Solicitudes', path: '/admin/solicitudes', color: '#48bb78' },
            { icon: ShoppingBag, label: 'Gestionar Tienda', path: '/admin/productos', color: '#9f7aea' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <a key={index} href={action.path} className="action-btn">
                <Icon size={18} />
                <span>{action.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;