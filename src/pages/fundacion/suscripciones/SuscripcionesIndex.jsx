import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const SuscripcionesIndex = () => {
    const navigate = useNavigate();

    const [suscripciones, setSuscripciones] = useState([]);
    const [search, setSearch] = useState('');
    const [estado, setEstado] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/entity/suscripciones');
            setSuscripciones(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    // 🔎 filtros frontend
    const filtradas = suscripciones
        .filter(s =>
            (s.user?.name || '').toLowerCase().includes(search.toLowerCase())
        )
        .filter(s =>
            estado ? s.estado === estado : true
        );

    // 🗑 eliminar
    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar suscripción?')) return;

        try {
            await api.delete(`/entity/suscripciones/${id}`);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: 20 }}>

            <h2>💳 Suscripciones</h2>

            {/* 🔎 filtros */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>

                <input
                    placeholder="Buscar usuario..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="finalizado">Finalizado</option>
                </select>

                <button onClick={() => navigate('/suscripciones/create')}>
                    + Nueva
                </button>
            </div>

            {/* 📊 tabla */}
            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Mascota</th>
                        <th>Monto</th>
                        <th>Frecuencia</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {filtradas.map(s => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.user?.name}</td>
                            <td>{s.mascota?.nombre}</td>
                            <td>${s.monto_mensual}</td>
                            <td>{s.frecuencia}</td>
                            <td>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    background:
                                        s.estado === 'activo' ? 'green' :
                                        s.estado === 'pausado' ? 'orange' :
                                        s.estado === 'cancelado' ? 'red' : 'gray',
                                    color: 'white'
                                }}>
                                    {s.estado}
                                </span>
                            </td>

                            <td style={{ display: 'flex', gap: 5 }}>
                                <button onClick={() => navigate(`/suscripciones/${s.id}`)}>
                                    Ver
                                </button>

                                <button onClick={() => navigate(`/suscripciones/edit/${s.id}`)}>
                                    Editar
                                </button>

                                <button onClick={() => handleDelete(s.id)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
};

export default SuscripcionesIndex;