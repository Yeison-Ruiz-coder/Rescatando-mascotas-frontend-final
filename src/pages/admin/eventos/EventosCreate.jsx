// src/pages/admin/eventos/EventosCreate.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, MapPin, FileText, Image as ImageIcon, X, Loader } from 'lucide-react';
import api from '../../../services/api';
import './EventosForm.css';

const AdminEventosCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    
    const [formData, setFormData] = useState({
        nombre_evento: '',
        lugar_evento: '',
        descripcion: '',
        fecha_evento: '',
        fecha_fin: '',
        capacidad_maxima: '',
        costo: '',
        organizador: '',
        telefono_contacto: '',
        email_contacto: '',
        categoria: '',
        tags: []
    });
    
    const [tagInput, setTagInput] = useState('');
    const [imagen, setImagen] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('La imagen no puede superar los 2MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Solo se permiten imágenes');
                return;
            }
            setImagen(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'tags' && formData.tags.length > 0) {
                formDataToSend.append(key, JSON.stringify(formData.tags));
            } else if (formData[key]) {
                formDataToSend.append(key, formData[key]);
            }
        });
        if (imagen) formDataToSend.append('imagen', imagen);

        try {
            const response = await api.post('/admin/eventos', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const evento = response.data.data || response.data;
            navigate(`/admin/eventos/${evento.id}`);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || 'Error al crear el evento');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-eventos-form-container">
            <div className="admin-eventos-form-card">
                <div className="form-header">
                    <Link to="/admin/eventos" className="back-link">
                        <ArrowLeft size={20} /> Volver a eventos
                    </Link>
                    <h1> Crear Nuevo Evento</h1>
                    <p>Completa los datos para crear un evento global</p>
                </div>

                <form onSubmit={handleSubmit} className="eventos-form">
                    <div className="form-grid">
                        <div className="form-column">
                            <div className="form-group required">
                                <label>⚲ Nombre del evento *</label>
                                <input
                                    type="text"
                                    name="nombre_evento"
                                    value={formData.nombre_evento}
                                    onChange={handleChange}
                                    className={errors.nombre_evento ? 'error' : ''}
                                    required
                                />
                                {errors.nombre_evento && <span className="error-message">{errors.nombre_evento[0]}</span>}
                            </div>

                            <div className="form-group required">
                                <label><MapPin size={16} /> Lugar *</label>
                                <input
                                    type="text"
                                    name="lugar_evento"
                                    value={formData.lugar_evento}
                                    onChange={handleChange}
                                    className={errors.lugar_evento ? 'error' : ''}
                                    required
                                />
                                {errors.lugar_evento && <span className="error-message">{errors.lugar_evento[0]}</span>}
                            </div>

                            <div className="form-group required">
                                <label><Calendar size={16} /> Fecha de inicio *</label>
                                <input
                                    type="datetime-local"
                                    name="fecha_evento"
                                    value={formData.fecha_evento}
                                    onChange={handleChange}
                                    className={errors.fecha_evento ? 'error' : ''}
                                    required
                                />
                                {errors.fecha_evento && <span className="error-message">{errors.fecha_evento[0]}</span>}
                            </div>

                            <div className="form-group">
                                <label><Calendar size={16} /> Fecha de fin (opcional)</label>
                                <input
                                    type="datetime-local"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>𖠋𖠋 Capacidad máxima</label>
                                <input
                                    type="number"
                                    name="capacidad_maxima"
                                    value={formData.capacidad_maxima}
                                    onChange={handleChange}
                                    placeholder="Ej: 100"
                                />
                            </div>
                        </div>

                        <div className="form-column">
                            <div className="form-group required">
                                <label><FileText size={16} /> Descripción *</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="5"
                                    className={errors.descripcion ? 'error' : ''}
                                    required
                                />
                                {errors.descripcion && <span className="error-message">{errors.descripcion[0]}</span>}
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>$ Costo</label>
                                    <input type="text" name="costo" value={formData.costo} onChange={handleChange} placeholder="Ej: Gratuito" />
                                </div>
                                <div className="form-group">
                                    <label>🗁 Categoría</label>
                                    <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} placeholder="Ej: Adopción" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>✆ Contacto (opcional)</label>
                                <div className="form-row-2">
                                    <input type="text" name="organizador" value={formData.organizador} onChange={handleChange} placeholder="Organizador" />
                                    <input type="tel" name="telefono_contacto" value={formData.telefono_contacto} onChange={handleChange} placeholder="Teléfono" />
                                </div>
                                <input type="email" name="email_contacto" value={formData.email_contacto} onChange={handleChange} placeholder="Email de contacto" />
                            </div>

                            <div className="form-group">
                                <label>𖤘 Etiquetas</label>
                                <div className="tags-input-container">
                                    <div className="tags-list">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="tag">
                                                {tag}
                                                <button type="button" onClick={() => handleRemoveTag(tag)}><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="tags-input-wrapper">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder="Agregar etiqueta"
                                        />
                                        <button type="button" onClick={handleAddTag}>+</button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label><ImageIcon size={16} /> Imagen del evento</label>
                                <div className="image-upload-area">
                                    {previewImage ? (
                                        <div className="image-preview">
                                            <img src={previewImage} alt="Preview" />
                                            <button type="button" onClick={() => { setImagen(null); setPreviewImage(null); }}><X size={20} /></button>
                                        </div>
                                    ) : (
                                        <label className="upload-label">
                                            <input type="file" accept="image/*" onChange={handleImageChange} />
                                            <div className="upload-placeholder">
                                                <ImageIcon size={32} />
                                                <span>Haz clic para subir una imagen</span>
                                                <small>JPG, PNG, GIF (max 2MB)</small>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Link to="/admin/eventos" className="btn-cancel">Cancelar</Link>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? <Loader size={20} className="spinner" /> : <Save size={20} />}
                            {loading ? 'Creando...' : 'Crear Evento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEventosCreate;