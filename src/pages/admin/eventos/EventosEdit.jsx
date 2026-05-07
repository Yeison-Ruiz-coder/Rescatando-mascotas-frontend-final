// src/pages/admin/eventos/EventosEdit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Calendar, FileText, Image as ImageIcon, X, Loader } from 'lucide-react';
import api from '../../../services/api';
import './EventosForm.css';

const AdminEventosEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    
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

    const getImageUrl = useCallback((url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';
        return url.startsWith('/storage') ? `${baseUrl}${url}` : `${baseUrl}/storage/${url}`;
    }, []);

    useEffect(() => {
        const loadEvento = async () => {
            try {
                const response = await api.get(`/admin/eventos/${id}`);
                const evento = response.data.data || response.data;
                
                setFormData({
                    nombre_evento: evento.nombre_evento || '',
                    lugar_evento: evento.lugar_evento || '',
                    descripcion: evento.descripcion || '',
                    fecha_evento: evento.fecha_evento ? evento.fecha_evento.slice(0, 16) : '',
                    fecha_fin: evento.fecha_fin ? evento.fecha_fin.slice(0, 16) : '',
                    capacidad_maxima: evento.capacidad_maxima || '',
                    costo: evento.costo || '',
                    organizador: evento.organizador || '',
                    telefono_contacto: evento.telefono_contacto || '',
                    email_contacto: evento.email_contacto || '',
                    categoria: evento.categoria || '',
                    tags: Array.isArray(evento.tags) ? evento.tags : (evento.tags ? JSON.parse(evento.tags) : [])
                });
                
                if (evento.imagen_url) setExistingImage(getImageUrl(evento.imagen_url));
            } catch (error) {
                alert('Error al cargar el evento');
                navigate('/admin/eventos');
            } finally {
                setInitialLoading(false);
            }
        };
        loadEvento();
    }, [id, navigate, getImageUrl]);

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
            if (file.size > 2 * 1024 * 1024) { alert('La imagen no puede superar los 2MB'); return; }
            if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes'); return; }
            setImagen(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
            setExistingImage(null);
        }
    };

    const handleRemoveExistingImage = () => {
        setExistingImage(null);
        setImagen(null);
        setPreviewImage(null);
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
        formDataToSend.append('_method', 'PUT');

        try {
            await api.post(`/admin/eventos/${id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate(`/admin/eventos/${id}`);
        } catch (error) {
            if (error.response?.data?.errors) setErrors(error.response.data.errors);
            else alert(error.response?.data?.message || 'Error al actualizar');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="admin-eventos-form-loading">
                <Loader size={40} className="spinner" />
                <p>Cargando evento...</p>
            </div>
        );
    }

    return (
        <div className="admin-eventos-form-container">
            <div className="admin-eventos-form-card">
                <div className="form-header">
                    <Link to="/admin/eventos" className="back-link">
                        <ArrowLeft size={20} /> Volver
                    </Link>
                    <h1>✏️ Editar Evento</h1>
                </div>

                <form onSubmit={handleSubmit} className="eventos-form">
                    <div className="form-grid">
                        <div className="form-column">
                            <div className="form-group required">
                                <label>⚲ Nombre del evento *</label>
                                <input type="text" name="nombre_evento" value={formData.nombre_evento} onChange={handleChange} required />
                            </div>

                            <div className="form-group required">
                                <label><MapPin size={16} /> Lugar *</label>
                                <input type="text" name="lugar_evento" value={formData.lugar_evento} onChange={handleChange} required />
                            </div>

                            <div className="form-group required">
                                <label><Calendar size={16} /> Fecha de inicio *</label>
                                <input type="datetime-local" name="fecha_evento" value={formData.fecha_evento} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label><Calendar size={16} /> Fecha de fin</label>
                                <input type="datetime-local" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-column">
                            <div className="form-group required">
                                <label><FileText size={16} /> Descripción *</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="5" required />
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>$ Costo</label>
                                    <input type="text" name="costo" value={formData.costo} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>𖠋𖠋 Capacidad</label>
                                    <input type="number" name="capacidad_maxima" value={formData.capacidad_maxima} onChange={handleChange} />
                                </div>
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
                                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} placeholder="Agregar etiqueta" />
                                        <button type="button" onClick={handleAddTag}>+</button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label> Imagen</label>
                                <div className="image-upload-area">
                                    {(existingImage || previewImage) ? (
                                        <div className="image-preview">
                                            <img src={previewImage || existingImage} alt="Preview" />
                                            <button type="button" onClick={handleRemoveExistingImage}><X size={20} /></button>
                                        </div>
                                    ) : (
                                        <label className="upload-label">
                                            <input type="file" accept="image/*" onChange={handleImageChange} />
                                            <div className="upload-placeholder">
                                                <ImageIcon size={32} />
                                                <span>Subir nueva imagen</span>
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
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEventosEdit;