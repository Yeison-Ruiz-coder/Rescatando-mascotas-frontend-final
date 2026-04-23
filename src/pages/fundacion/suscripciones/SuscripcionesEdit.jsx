import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './Suscripciones.css';

const SuscripcionesEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        monto_mensual: '',
        frecuencia: '',
        fecha_inicio: '',
        fecha_fin: '',
        mensaje_apoyo: '',
        estado: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get(`/entity/suscripciones/${id}`);
            setFormData(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/entity/suscripciones/${id}`, formData);
            navigate('/suscripciones');
        } catch (error) {
            console.error(error);
            alert('Error al actualizar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">

            <h2>✏️ Editar Suscripción</h2>

            <form className="card" onSubmit={handleSubmit}>

                <label>Monto mensual</label>
                <input
                    type="number"
                    name="monto_mensual"
                    value={formData.monto_mensual || ''}
                    onChange={handleChange}
                />

                <label>Frecuencia</label>
                <select
                    name="frecuencia"
                    value={formData.frecuencia || ''}
                    onChange={handleChange}
                >
                    <option value="">Seleccionar</option>
                    <option value="unica">Única</option>
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="anual">Anual</option>
                </select>

                <label>Estado</label>
                <select
                    name="estado"
                    value={formData.estado || ''}
                    onChange={handleChange}
                >
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="finalizado">Finalizado</option>
                </select>

                <label>Fecha inicio</label>
                <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio || ''}
                    onChange={handleChange}
                />

                <label>Fecha fin</label>
                <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin || ''}
                    onChange={handleChange}
                />

                <label>Mensaje</label>
                <textarea
                    name="mensaje_apoyo"
                    value={formData.mensaje_apoyo || ''}
                    onChange={handleChange}
                />

                <div className="actions">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Actualizar'}
                    </button>

                    <button type="button" onClick={() => navigate('/suscripciones')}>
                        Cancelar
                    </button>
                </div>

            </form>

        </div>
    );
};

export default SuscripcionesEdit;