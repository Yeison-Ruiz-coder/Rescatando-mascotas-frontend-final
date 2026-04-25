import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './Suscripciones.css';

const AdminSuscripcionesCreate = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState([]);
    const [mascotas, setMascotas] = useState([]);

    const [userSearch, setUserSearch] = useState('');
    const [mascotaSearch, setMascotaSearch] = useState('');

    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        user_id: '',
        mascota_id: '',
        monto_mensual: '',
        frecuencia: '',
        fecha_inicio: '',
        fecha_fin: '',
        mensaje_apoyo: '',
        estado: 'activo'
    });

    // 📦 Cargar datos
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [u, m] = await Promise.all([
                    api.get('/entity/users'),
                    api.get('/entity/mascotas')
                ]);

                setUsers(u.data);
                setMascotas(m.data);
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
        };

        fetchData();
    }, []);

    // 🔎 filtros
    const usersFiltrados = users.filter(u =>
        (u.name || '').toLowerCase().includes(userSearch.toLowerCase())
    );

    const mascotasFiltradas = mascotas.filter(m =>
        (m.nombre || '').toLowerCase().includes(mascotaSearch.toLowerCase())
    );

    // ✏️ cambios input
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ✔ validar
    const validate = () => {
        const err = {};

        if (!formData.user_id) err.user_id = 'Selecciona usuario';
        if (!formData.mascota_id) err.mascota_id = 'Selecciona mascota';
        if (!formData.monto_mensual || formData.monto_mensual <= 0)
            err.monto_mensual = 'Monto inválido';
        if (!formData.frecuencia) err.frecuencia = 'Selecciona frecuencia';
        if (!formData.fecha_inicio) err.fecha_inicio = 'Fecha requerida';

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    // 🚀 submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            await api.post('/entity/suscripciones', formData);
            navigate('/suscripciones');
        } catch (error) {
            console.error('Error backend:', error.response?.data);
            alert('Error al crear suscripción');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="eventos-form-container">
            <div className="form-card">

                <div className="form-card-header">
                    <h2>Crear Suscripción</h2>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* 👤 USUARIO */}
                    <div className="form-group">
                        <label>Usuario</label>

                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="form-control"
                        />

                        <div className="list-box">
                            {usersFiltrados.map(u => (
                                <div
                                    key={u.id}
                                    className={`item ${formData.user_id === u.id ? 'active' : ''}`}
                                    onClick={() =>
                                        setFormData(prev => ({ ...prev, user_id: u.id }))
                                    }
                                >
                                    <img src={u.avatar || '/user.png'} alt="" />
                                    <span>{u.name}</span>
                                </div>
                            ))}
                        </div>

                        {errors.user_id && <small>{errors.user_id}</small>}
                    </div>

                    {/* 🐶 MASCOTA */}
                    <div className="form-group">
                        <label>Mascota</label>

                        <input
                            type="text"
                            placeholder="Buscar mascota..."
                            value={mascotaSearch}
                            onChange={(e) => setMascotaSearch(e.target.value)}
                            className="form-control"
                        />

                        <div className="list-box">
                            {mascotasFiltradas.map(m => (
                                <div
                                    key={m.id}
                                    className={`item ${formData.mascota_id === m.id ? 'active' : ''}`}
                                    onClick={() =>
                                        setFormData(prev => ({ ...prev, mascota_id: m.id }))
                                    }
                                >
                                    <img src={m.imagen || '/pet.png'} alt="" />
                                    <span>{m.nombre}</span>
                                </div>
                            ))}
                        </div>

                        {errors.mascota_id && <small>{errors.mascota_id}</small>}
                    </div>

                    {/* 💰 MONTO */}
                    <input
                        type="number"
                        name="monto_mensual"
                        value={formData.monto_mensual}
                        placeholder="Monto mensual"
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.monto_mensual && <small>{errors.monto_mensual}</small>}

                    {/* 🔁 FRECUENCIA (CORREGIDO) */}
                    <select
                        name="frecuencia"
                        value={formData.frecuencia}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Frecuencia</option>
                        <option value="unica">Única</option>
                        <option value="mensual">Mensual</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="anual">Anual</option>
                    </select>
                    {errors.frecuencia && <small>{errors.frecuencia}</small>}

                    {/* 📅 FECHAS */}
                    <input
                        type="date"
                        name="fecha_inicio"
                        value={formData.fecha_inicio}
                        onChange={handleChange}
                        className="form-control"
                    />
                    {errors.fecha_inicio && <small>{errors.fecha_inicio}</small>}

                    <input
                        type="date"
                        name="fecha_fin"
                        value={formData.fecha_fin}
                        onChange={handleChange}
                        className="form-control"
                    />

                    {/* 💬 MENSAJE */}
                    <textarea
                        name="mensaje_apoyo"
                        value={formData.mensaje_apoyo}
                        placeholder="Mensaje de apoyo"
                        onChange={handleChange}
                        className="form-control"
                    />

                    {/* 🚀 BOTÓN */}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Crear Suscripción'}
                    </button>

                </form>

            </div>
        </div>
    );
};

export default AdminSuscripcionesCreate;