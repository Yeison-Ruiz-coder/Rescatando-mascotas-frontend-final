import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './Suscripciones.css';

const AdminSuscripcionesShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [s, setS] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get(`/entity/suscripciones/${id}`);
            setS(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const badgeClass = (estado) => {
        switch (estado) {
            case 'activo': return 'badge badge-green';
            case 'pausado': return 'badge badge-orange';
            case 'cancelado': return 'badge badge-red';
            case 'finalizado': return 'badge badge-gray';
            default: return 'badge';
        }
    };

    if (loading) return <p>Cargando...</p>;
    if (!s) return <p>No encontrada</p>;

    return (
        <div className="container">

            <h2>💳 Suscripción #{s.id}</h2>

            <div className="card">

                <div className="row">
                    <span className="label">Usuario:</span>
                    <span>{s.user?.name}</span>
                </div>

                <div className="row">
                    <span className="label">Mascota:</span>
                    <span>{s.mascota?.nombre}</span>
                </div>

                <div className="row">
                    <span className="label">Monto:</span>
                    <span>${s.monto_mensual}</span>
                </div>

                <div className="row">
                    <span className="label">Frecuencia:</span>
                    <span>{s.frecuencia}</span>
                </div>

                <div className="row">
                    <span className="label">Estado:</span>
                    <span className={badgeClass(s.estado)}>
                        {s.estado}
                    </span>
                </div>

                <div className="row">
                    <span className="label">Inicio:</span>
                    <span>{s.fecha_inicio}</span>
                </div>

                <div className="row">
                    <span className="label">Fin:</span>
                    <span>{s.fecha_fin}</span>
                </div>

                <div className="row">
                    <span className="label">Mensaje:</span>
                    <span>{s.mensaje_apoyo}</span>
                </div>

            </div>

            <div className="actions">
                <button onClick={() => navigate('/suscripciones')}>
                    Volver
                </button>

                <button onClick={() => navigate(`/suscripciones/edit/${id}`)}>
                    Editar
                </button>
            </div>

        </div>
    );
};

export default AdminSuscripcionesShow;