// src/pages/admin/eventos/AdminEventosCalendario.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Eye,
  RefreshCw,
  AlertCircle,
  Clock,
  MapPin,
  Users,
  Heart,
  Plus,
  CheckCircle,
  CalendarDays,
  ArrowRight,
  Calendar as CalendarIcon2
} from 'lucide-react';
import api from '../../../services/api';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import StatCard from '../../../components/common/StatCard/StatCard';
import './AdminEventosCalendario.css';

const AdminEventosCalendario = () => {
  const { t } = useTranslation('eventos');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // ===== FUNCIÓN PARA EXTRAER EVENTOS DE LA RESPUESTA =====
  const extractEventsFromResponse = (data) => {
    const findEventsArray = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      
      if (Array.isArray(obj)) {
        if (obj.length > 0) {
          const first = obj[0];
          if (first && typeof first === 'object') {
            const hasEventFields = first.nombre_evento || first.fecha_evento || first.id;
            if (hasEventFields) {
              return obj;
            }
          }
          for (const item of obj) {
            const result = findEventsArray(item);
            if (result) return result;
          }
        }
        return null;
      }
      
      for (const key in obj) {
        const result = findEventsArray(obj[key]);
        if (result) return result;
      }
      
      return null;
    };

    const eventosEncontrados = findEventsArray(data);
    return Array.isArray(eventosEncontrados) ? eventosEncontrados : [];
  };

  // ===== OBTENER EVENTOS =====
  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin/eventos', {
        params: { per_page: 9999 }
      });
      
      const eventosData = extractEventsFromResponse(response.data);
      setEventos(eventosData);
      
      // ✅ NO movemos el calendario al mes del evento
      // El calendario ya está en el mes actual (HOY)
      // Solo mostramos los eventos en el mes actual
      
    } catch (err) {
      console.error('Error cargando eventos:', err);
      setError(err.response?.data?.message || 'Error al cargar los eventos');
      setEventos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEventos();
  };

  // ===== FUNCIONES DEL CALENDARIO =====
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (delta) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + delta);
      return newDate;
    });
    // Limpiar selección si el día ya no tiene eventos
    if (selectedDate) {
      const { year, month, day } = selectedDate;
      const events = getEventsForDay(year, month, day);
      if (events.length === 0) {
        setSelectedDate(null);
      }
    }
  };

  // ===== IR A HOY =====
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    
    // Verificar si hoy tiene eventos
    const eventsToday = getEventsForDay(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    
    if (eventsToday.length > 0) {
      setSelectedDate({
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate()
      });
    } else {
      setSelectedDate(null);
      // Mostrar mensaje de que no hay eventos hoy
    }
  };

  // ===== IR AL MES CON EVENTOS =====
  const goToMonthWithEvents = () => {
    if (eventos.length === 0) return;
    
    // Encontrar el primer evento con fecha
    const eventoConFecha = eventos.find(e => e.fecha_evento);
    if (eventoConFecha) {
      const fecha = new Date(eventoConFecha.fecha_evento);
      if (!isNaN(fecha.getTime())) {
        setCurrentDate(fecha);
        // Seleccionar el día del primer evento
        setSelectedDate({
          year: fecha.getFullYear(),
          month: fecha.getMonth(),
          day: fecha.getDate()
        });
      }
    }
  };

  // ===== OBTENER EVENTOS POR DÍA =====
  const getEventsForDay = useCallback((year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return eventos.filter(e => {
      const fechaStr = e.fecha_evento || e.fecha || e.fecha_inicio;
      if (!fechaStr) return false;
      
      try {
        const d = new Date(fechaStr);
        if (!isNaN(d.getTime())) {
          const datePart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return datePart === dateStr;
        }
        return fechaStr.startsWith(dateStr);
      } catch {
        return false;
      }
    });
  }, [eventos]);

  const eventsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const { year, month, day } = selectedDate;
    return getEventsForDay(year, month, day);
  }, [selectedDate, getEventsForDay]);

  // ===== ESTADÍSTICAS =====
  const stats = useMemo(() => {
    const total = eventos.length;
    const now = new Date();
    
    const proximos = eventos.filter(e => {
      const fechaStr = e.fecha_evento || e.fecha || e.fecha_inicio;
      if (!fechaStr) return false;
      try {
        const fecha = new Date(fechaStr);
        return !isNaN(fecha.getTime()) && fecha > now;
      } catch {
        return false;
      }
    }).length;
    
    const esteMes = eventos.filter(e => {
      const fechaStr = e.fecha_evento || e.fecha || e.fecha_inicio;
      if (!fechaStr) return false;
      try {
        const fecha = new Date(fechaStr);
        return !isNaN(fecha.getTime()) && 
               fecha.getMonth() === now.getMonth() && 
               fecha.getFullYear() === now.getFullYear();
      } catch {
        return false;
      }
    }).length;
    
    const diasSet = new Set();
    eventos.forEach(e => {
      const fechaStr = e.fecha_evento || e.fecha || e.fecha_inicio;
      if (fechaStr) {
        try {
          const d = new Date(fechaStr);
          if (!isNaN(d.getTime())) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            diasSet.add(key);
          }
        } catch {}
      }
    });
    
    return { total, proximos, esteMes, diasConEventos: diasSet.size };
  }, [eventos]);

  // ===== CONTAR EVENTOS POR DÍA =====
  const eventsByDay = useMemo(() => {
    const map = {};
    eventos.forEach(e => {
      const fechaStr = e.fecha_evento || e.fecha || e.fecha_inicio;
      if (!fechaStr) return;
      
      try {
        let dateStr = null;
        const d = new Date(fechaStr);
        if (!isNaN(d.getTime())) {
          dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        } else if (typeof fechaStr === 'string') {
          dateStr = fechaStr.substring(0, 10);
        }
        
        if (dateStr) {
          if (!map[dateStr]) {
            map[dateStr] = { count: 0, events: [] };
          }
          map[dateStr].count += 1;
          map[dateStr].events.push(e);
        }
      } catch {}
    });
    return map;
  }, [eventos]);

  // ===== MANEJAR CLICK EN DÍA =====
  const handleDayClick = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = eventsByDay[dateStr];
    if (dayData && dayData.count > 0) {
      setSelectedDate({ year, month, day });
    } else {
      setSelectedDate(null);
    }
  };

  // ===== VERIFICAR SI HAY EVENTOS EN EL MES ACTUAL =====
  const hasEventsInCurrentMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return eventos.some(e => {
      const fechaStr = e.fecha_evento || e.fecha || e.fecha_inicio;
      if (!fechaStr) return false;
      try {
        const d = new Date(fechaStr);
        return !isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year;
      } catch {
        return false;
      }
    });
  }, [eventos, currentDate]);

  // ===== OBTENER MESES CON EVENTOS =====
  const monthsWithEvents = useMemo(() => {
    const months = new Set();
    eventos.forEach(e => {
      const fechaStr = e.fecha_evento || e.fecha || e.fecha_inicio;
      if (fechaStr) {
        try {
          const d = new Date(fechaStr);
          if (!isNaN(d.getTime())) {
            months.add(`${d.getFullYear()}-${d.getMonth()}`);
          }
        } catch {}
      }
    });
    return Array.from(months);
  }, [eventos]);

  // ===== RENDERIZADO =====
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  if (loading) {
    return (
      <div className="ec-container">
        <div className="ec-loading">
          <div className="ec-spinner"></div>
          <p>{t('loading', 'Cargando calendario...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ec-container">
        <div className="bento-container">
          <div className="ec-error">
            <AlertCircle size={48} className="ec-error-icon" />
            <h3>{t('error_title', 'Error al cargar el calendario')}</h3>
            <p>{error}</p>
            <button onClick={fetchEventos} className="ec-btn-retry">
              {t('retry', 'Reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ec-container">
      {/* ===== BANNER ===== */}
      <div className="ec-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('banner.titulo_calendario', {
              defaultValue: 'Calendario de Eventos · {{count}} eventos este mes',
              count: stats.esteMes,
            }),
            solicitudes: stats.total,
            adopciones: stats.proximos,
            eventos: stats.esteMes,
          }}
        />
      </div>

      {/* ===== STATS ===== */}
      <section className="ec-stats-section">
        <div className="bento-container">
          <div className="ec-stats-grid">
            <StatCard
              icon={<CalendarIcon size={24} />}
              label={t('stats.total', 'Total eventos')}
              value={stats.total}
              color="primary"
              subtitle={t('stats.registrados', 'Registrados')}
            />
            <StatCard
              icon={<Clock size={24} />}
              label={t('stats.proximos', 'Próximos')}
              value={stats.proximos}
              color="success"
              subtitle={t('stats.por_venir', 'Por venir')}
            />
            <StatCard
              icon={<CalendarDays size={24} />}
              label={t('stats.dias_con_eventos', 'Días con eventos')}
              value={stats.diasConEventos}
              color="info"
              subtitle={t('stats.dias', 'Días')}
            />
            <StatCard
              icon={<Heart size={24} />}
              label={t('stats.este_mes', 'Eventos este mes')}
              value={stats.esteMes}
              color="warning"
              subtitle={t('stats.activos', 'Activos')}
            />
          </div>
        </div>
      </section>

      {/* ===== CALENDARIO ===== */}
      <section className="ec-calendar-section">
        <div className="bento-container">
          <div className="ec-calendar-card">
            {/* Header del calendario */}
            <div className="ec-calendar-header">
              <div className="ec-calendar-nav">
                <button onClick={() => changeMonth(-1)} className="ec-nav-btn">
                  <ChevronLeft size={20} />
                </button>
                <h2>
                  {monthNames[month]} {year}
                </h2>
                <button onClick={() => changeMonth(1)} className="ec-nav-btn">
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="ec-calendar-actions">
                {/* Botón Hoy - siempre visible y destacado */}
                <button onClick={goToToday} className="ec-today-btn ec-today-btn-main">
                  <CalendarIcon2 size={14} />
                  Hoy
                </button>
                
                {/* Botón para ir al mes con eventos (solo si hay eventos y no estamos en un mes con eventos) */}
                {eventos.length > 0 && !hasEventsInCurrentMonth && (
                  <button onClick={goToMonthWithEvents} className="ec-goto-events-btn">
                    <CalendarDays size={14} />
                    Ver eventos ({eventos.length})
                  </button>
                )}
                
                <button onClick={handleRefresh} className="ec-refresh-btn" disabled={refreshing}>
                  <RefreshCw size={16} className={refreshing ? 'ec-spin' : ''} />
                </button>
                <button 
                  onClick={() => navigate('/admin/eventos/crear')} 
                  className="ec-create-btn"
                >
                  <Plus size={16} />
                  Nuevo evento
                </button>
              </div>
            </div>

            {/* Indicador de eventos - Mejorado */}
            <div className="ec-events-info">
              <span className="ec-events-total">
                📌 {eventos.length} eventos totales en {stats.diasConEventos} días
              </span>
              
              {hasEventsInCurrentMonth ? (
                <span className="ec-events-current">
                  ✅ {stats.esteMes} eventos este mes
                </span>
              ) : (
                <span className="ec-events-other">
                  ⚠️ No hay eventos en {monthNames[month]} {year}
                  {eventos.length > 0 && (
                    <button onClick={goToMonthWithEvents} className="ec-goto-link">
                      Ver eventos en otros meses →
                    </button>
                  )}
                </span>
              )}
              
              {(() => {
                const otrosMeses = eventos.filter(e => {
                  const fechaStr = e.fecha_evento || e.fecha || e.fecha_inicio;
                  if (!fechaStr) return false;
                  try {
                    const fecha = new Date(fechaStr);
                    return !isNaN(fecha.getTime()) && (fecha.getMonth() !== month || fecha.getFullYear() !== year);
                  } catch {
                    return false;
                  }
                }).length;
                return otrosMeses > 0 && hasEventsInCurrentMonth ? (
                  <span className="ec-events-other">
                    ({otrosMeses} en otros meses)
                  </span>
                ) : null;
              })()}
            </div>

            {/* Días de la semana */}
            <div className="ec-weekdays">
              {dayNames.map(day => (
                <div key={day} className="ec-weekday">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="ec-days-grid">
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="ec-day-empty" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const isToday = date.toDateString() === today.toDateString();
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = eventsByDay[dateStr];
                const count = dayEvents?.count || 0;
                const isSelected = selectedDate &&
                  selectedDate.year === year &&
                  selectedDate.month === month &&
                  selectedDate.day === day;
                const hasEvents = count > 0;

                return (
                  <div
                    key={day}
                    className={`ec-day 
                      ${isToday ? 'ec-today' : ''} 
                      ${isSelected ? 'ec-selected' : ''} 
                      ${hasEvents ? 'ec-has-events' : ''}
                      ${hasEvents ? 'ec-clickable' : ''}
                    `}
                    onClick={() => handleDayClick(year, month, day)}
                    role={hasEvents ? 'button' : undefined}
                    tabIndex={hasEvents ? 0 : -1}
                    aria-label={`${day} de ${monthNames[month]}${hasEvents ? `, ${count} eventos` : ''}`}
                    title={hasEvents ? `${count} evento(s) programado(s)` : 'Sin eventos'}
                  >
                    <span className="ec-day-number">{day}</span>
                    {hasEvents && (
                      <div className="ec-day-event-indicator">
                        <CheckCircle size={14} className="ec-day-check" />
                        <span className="ec-day-count">{count}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Leyenda */}
            <div className="ec-legend">
              <div className="ec-legend-item">
                <span className="ec-legend-dot ec-legend-dot-event"></span>
                <span>Día con eventos</span>
              </div>
              <div className="ec-legend-item">
                <span className="ec-legend-dot ec-legend-dot-selected"></span>
                <span>Día seleccionado</span>
              </div>
              <div className="ec-legend-item">
                <span className="ec-legend-dot ec-legend-dot-today"></span>
                <span>Hoy</span>
              </div>
            </div>
          </div>

          {/* ===== EVENTOS DEL DÍA SELECCIONADO ===== */}
          {selectedDate && (
            <div className="ec-day-events-card">
              <div className="ec-day-events-header">
                <h3>
                  <CalendarIcon size={18} />
                  Eventos del {selectedDate.day} de {monthNames[selectedDate.month]} de {selectedDate.year}
                </h3>
                <span className="ec-day-events-count">{eventsOnSelectedDate.length} eventos</span>
              </div>

              {eventsOnSelectedDate.length === 0 ? (
                <div className="ec-no-events">
                  <p>No hay eventos programados para este día</p>
                </div>
              ) : (
                <div className="ec-day-events-list">
                  {eventsOnSelectedDate.map((evento) => {
                    const nombre = evento.nombre_evento || evento.nombre || evento.titulo || 'Evento sin nombre';
                    const lugar = evento.lugar_evento || evento.lugar || evento.ubicacion || 'Sin ubicación';
                    const fechaStr = evento.fecha_evento || evento.fecha || evento.fecha_inicio;
                    let hora = '00:00';
                    try {
                      const d = new Date(fechaStr);
                      if (!isNaN(d.getTime())) {
                        hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                      }
                    } catch {}
                    
                    return (
                      <div
                        key={evento.id}
                        className="ec-day-event-item"
                        onClick={() => navigate(`/admin/eventos/${evento.id}`)}
                      >
                        <div className="ec-event-time">
                          <Clock size={14} />
                          {hora}
                        </div>
                        <div className="ec-event-info">
                          <span className="ec-event-title">{nombre}</span>
                          <span className="ec-event-location">
                            <MapPin size={12} />
                            {lugar}
                          </span>
                        </div>
                        <button className="ec-event-view-btn" aria-label="Ver evento">
                          <Eye size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {eventsOnSelectedDate.length > 0 && (
                <div className="ec-view-all-container">
                  <button 
                    className="ec-view-all-btn"
                    onClick={() => navigate('/admin/eventos')}
                  >
                    Ver todos los eventos <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mensaje cuando no hay fecha seleccionada pero hay eventos en el mes */}
          {!selectedDate && eventos.length > 0 && hasEventsInCurrentMonth && (
            <div className="ec-day-events-card ec-hint-card">
              <div className="ec-hint-content">
                <CalendarDays size={32} className="ec-hint-icon" />
                <h4>Selecciona un día con eventos</h4>
                <p>Haz clic en cualquier fecha marcada con <span className="ec-hint-badge">●</span> para ver los eventos</p>
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay eventos en el mes actual */}
          {!selectedDate && eventos.length > 0 && !hasEventsInCurrentMonth && (
            <div className="ec-day-events-card ec-hint-card ec-hint-no-events">
              <div className="ec-hint-content">
                <CalendarIcon size={32} className="ec-hint-icon" />
                <h4>No hay eventos en {monthNames[month]} {year}</h4>
                <p>
                  Hay {eventos.length} eventos en otros meses
                  <br />
                  <button onClick={goToMonthWithEvents} className="ec-goto-link-btn">
                    Ir al mes con eventos →
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay eventos en absoluto */}
          {eventos.length === 0 && (
            <div className="ec-day-events-card ec-empty-card">
              <div className="ec-hint-content">
                <CalendarIcon size={32} className="ec-hint-icon" />
                <h4>No hay eventos programados</h4>
                <p>Comienza creando un nuevo evento para tu organización</p>
                <button 
                  className="ec-create-btn ec-create-btn-large"
                  onClick={() => navigate('/admin/eventos/crear')}
                >
                  <Plus size={18} />
                  Crear primer evento
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminEventosCalendario;