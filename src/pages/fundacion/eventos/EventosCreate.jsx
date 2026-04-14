import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Image, FileText, X, Upload } from 'lucide-react';
import api from '../../../services/api';
import './Eventos.css';

const EventosCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        Nombre_evento: '',
        Lugar_evento: '',
        Descripcion: '',
        Fecha_evento: '',
        imagen: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, imagen: 'El archivo no debe superar los 2MB' }));
                return;
            }
            setFormData(prev => ({ ...prev, imagen: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.Nombre_evento.trim()) newErrors.Nombre_evento = 'El nombre es requerido';
        if (!formData.Lugar_evento.trim()) newErrors.Lugar_evento = 'El lugar es requerido';
        if (!formData.Descripcion.trim()) newErrors.Descripcion = 'La descripción es requerida';
        if (!formData.Fecha_evento) newErrors.Fecha_evento = 'La fecha es requerida';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('Nombre_evento', formData.Nombre_evento);
            formDataToSend.append('Lugar_evento', formData.Lugar_evento);
            formDataToSend.append('Descripcion', formData.Descripcion);
            formDataToSend.append('Fecha_evento', formData.Fecha_evento);
            if (formData.imagen) formDataToSend.append('imagen', formData.imagen);

            await api.post('/entity/eventos', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/fundacion/eventos');
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Error al crear el evento');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="eventos-form-container">
            <div className="form-card">
                <div className="form-card-header">
                    <h2>Crear Evento</h2>
                    <p>Completa los datos del evento para tu fundación</p>
                </div>
                <div className="form-card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label><FileText size={16} /> Nombre del Evento *</label>
                                <input type="text" name="Nombre_evento" className={`form-control ${errors.Nombre_evento ? 'is-invalid' : ''}`} value={formData.Nombre_evento} onChange={handleChange} placeholder="Ej: Feria de Adopción" />
                                {errors.Nombre_evento && <div className="invalid-feedback">{errors.Nombre_evento}</div>}
                            </div>
                            <div className="form-group">
                                <label><MapPin size={16} /> Lugar del Evento *</label>
                                <input type="text" name="Lugar_evento" className={`form-control ${errors.Lugar_evento ? 'is-invalid' : ''}`} value={formData.Lugar_evento} onChange={handleChange} placeholder="Ej: Parque Central" />
                                {errors.Lugar_evento && <div className="invalid-feedback">{errors.Lugar_evento}</div>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FileText size={16} /> Descripción *</label>
                            <textarea name="Descripcion" rows="5" className={`form-control ${errors.Descripcion ? 'is-invalid' : ''}`} value={formData.Descripcion} onChange={handleChange} placeholder="Describe detalladamente el evento..." />
                            {errors.Descripcion && <div className="invalid-feedback">{errors.Descripcion}</div>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><Calendar size={16} /> Fecha y Hora *</label>
                                <input type="datetime-local" name="Fecha_evento" className={`form-control ${errors.Fecha_evento ? 'is-invalid' : ''}`} value={formData.Fecha_evento} onChange={handleChange} />
                                {errors.Fecha_evento && <div className="invalid-feedback">{errors.Fecha_evento}</div>}
                            </div>
                            <div className="form-group">
                                <label><Image size={16} /> Imagen del Evento</label>
                                <div className="file-upload">
                                    <input type="file" id="imagen" className="file-input" accept="image/*" onChange={handleFileChange} />
                                    <label htmlFor="imagen" className="file-label"><Upload size={20} /> Seleccionar imagen</label>
                                </div>
                                {previewImage && (
                                    <div className="image-preview">
                                        <img src={previewImage} alt="Vista previa" />
                                        <button type="button" onClick={() => { setPreviewImage(null); setFormData(prev => ({ ...prev, imagen: null })); }} className="remove-preview"><X size={16} /></button>
                                    </div>
                                )}
                                <div className="form-text">Formatos: JPEG, PNG, JPG, GIF (Máximo 2MB)</div>
                                {errors.imagen && <div className="invalid-feedback">{errors.imagen}</div>}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => navigate('/fundacion/eventos')} className="btn-secondary" disabled={loading}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creando...' : 'Crear Evento'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EventosCreate;