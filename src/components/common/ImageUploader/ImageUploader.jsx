// src/components/common/ImageUploader/ImageUploader.jsx
import React, { useState, useRef, useEffect } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ 
  label, 
  name, 
  onImageChange,
  // Modo múltiple (NUEVO)
  multiple = false,
  maxFiles = 5,
  currentImages = [],
  // Modo single (existente)
  currentImage = null,
  required = false,
  maxSize = 2, // MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
}) => {
  // Estado para modo múltiple
  const [previews, setPreviews] = useState(currentImages);
  const [files, setFiles] = useState([]);
  
  // Estado para modo single (mantiene compatibilidad)
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Efecto para sincronizar cuando cambian las props
  useEffect(() => {
    if (multiple) {
      setPreviews(currentImages);
    } else {
      setPreview(currentImage);
    }
  }, [currentImage, currentImages, multiple]);

  const validateFile = (file) => {
    if (!acceptedFormats.includes(file.type)) {
      setError(`Formato no válido. Formatos permitidos: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`);
      return false;
    }
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo no debe superar los ${maxSize}MB`);
      return false;
    }
    return true;
  };

  // Manejador para múltiples archivos
  const handleMultipleFiles = (newFiles) => {
    setError('');
    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const validPreviews = [];

    for (const file of fileArray) {
      if (!validateFile(file)) continue;
      
      if (files.length + validFiles.length >= maxFiles) {
        setError(`Máximo ${maxFiles} imágenes permitidas`);
        break;
      }

      validFiles.push(file);
      const reader = new FileReader();
      const previewPromise = new Promise((resolve) => {
        reader.onloadend = () => {
          resolve({ file, preview: reader.result });
        };
        reader.readAsDataURL(file);
      });
      validPreviews.push(previewPromise);
    }

    Promise.all(validPreviews).then((results) => {
      const newPreviews = results.map(r => r.preview);
      const newFilesList = results.map(r => r.file);
      
      const updatedPreviews = [...previews, ...newPreviews];
      const updatedFiles = [...files, ...newFilesList];
      
      setPreviews(updatedPreviews);
      setFiles(updatedFiles);
      
      // Callback con el formato esperado
      onImageChange(updatedFiles, updatedPreviews);
    });
  };

  // Manejador para archivo único (comportamiento original)
  const handleSingleFile = (file) => {
    setError('');
    
    if (!file) return;
    
    if (!validateFile(file)) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      // Mantiene compatibilidad con la API original
      onImageChange(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    if (multiple) {
      handleMultipleFiles(e.target.files);
    } else {
      handleSingleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (multiple) {
      handleMultipleFiles(e.dataTransfer.files);
    } else {
      handleSingleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Remover imagen en modo múltiple
  const removeMultipleImage = (index) => {
    const newPreviews = [...previews];
    const newFiles = [...files];
    
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    
    setPreviews(newPreviews);
    setFiles(newFiles);
    onImageChange(newFiles, newPreviews);
  };

  // Remover imagen en modo single
  const removeSingleImage = () => {
    setPreview(null);
    setError('');
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = multiple ? removeMultipleImage : removeSingleImage;

  // Renderizar previews según el modo
  const renderPreviews = () => {
    if (multiple && previews.length > 0) {
      return (
        <div className="image-previews-grid">
          {previews.map((img, index) => (
            <div key={index} className="image-preview-item">
              <img src={img} alt={`Preview ${index + 1}`} />
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      );
    }
    
    if (!multiple && preview) {
      return (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          <button 
            type="button" 
            className="remove-image-btn"
            onClick={(e) => {
              e.stopPropagation();
              removeImage();
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      );
    }
    
    return (
      <div className="upload-placeholder">
        <i className="fas fa-cloud-upload-alt"></i>
        <p>Haz clic o arrastra {multiple ? 'imágenes' : 'una imagen'} aquí</p>
        <small>
          {multiple ? `Máximo ${maxFiles} imágenes - ` : ''}
          Máximo {maxSize}MB cada una - {acceptedFormats.map(f => f.split('/')[1]).join(', ')}
        </small>
      </div>
    );
  };

  return (
    <div className="image-uploader">
      {label && (
        <label className="image-uploader-label">
          {label} {required && <span className="required">*</span>}
          
        </label>
      )}
      
      <div
        className={`image-uploader-area ${isDragging ? 'dragging' : ''} ${preview || previews.length > 0 ? 'has-preview' : ''} ${multiple ? 'multiple-mode' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {renderPreviews()}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept={acceptedFormats.join(',')}
        onChange={handleFileChange}
        multiple={multiple}
        style={{ display: 'none' }}
      />
      
      {error && <div className="image-uploader-error">{error}</div>}
    </div>
  );
};

export default ImageUploader;