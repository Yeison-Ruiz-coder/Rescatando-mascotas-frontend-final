import React, { useState, useRef } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ 
  label, 
  name, 
  onImageChange, 
  currentImage = null,
  required = false,
  maxSize = 2, // MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
}) => {
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (file) => {
    setError('');
    
    if (!file) return;
    
    if (!validateFile(file)) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onImageChange(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setPreview(null);
    setError('');
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader">
      {label && <label className="image-uploader-label">{label} {required && <span className="required">*</span>}</label>}
      
      <div
        className={`image-uploader-area ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
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
        ) : (
          <div className="upload-placeholder">
            <i className="fas fa-cloud-upload-alt"></i>
            <p>Haz clic o arrastra una imagen aquí</p>
            <small>Máximo {maxSize}MB - JPG, PNG, GIF</small>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept={acceptedFormats.join(',')}
        onChange={(e) => handleFileChange(e.target.files[0])}
        style={{ display: 'none' }}
      />
      
      {error && <div className="image-uploader-error">{error}</div>}
    </div>
  );
};

export default ImageUploader;