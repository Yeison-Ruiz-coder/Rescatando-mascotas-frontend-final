import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './ImageUploader.css';

const ImageUploader = ({ 
  label, 
  labelKey,
  name, 
  onImageChange,
  multiple = false,
  maxFiles = 10,
  currentImages = [],
  currentImage = null,
  required = false,
  maxSize = 2,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
}) => {
  const { t } = useTranslation(['nuevaMascota', 'common']);
  const [previews, setPreviews] = useState(currentImages);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const displayLabel = labelKey ? t(labelKey, label) : label;

  useEffect(() => {
    if (multiple) {
      setPreviews(currentImages);
    } else {
      setPreview(currentImage);
    }
  }, [currentImage, currentImages, multiple]);

  const validateFile = (file) => {
    if (!acceptedFormats.includes(file.type)) {
      setError(t('common:invalid_file_format', `Formato no válido. Formatos permitidos: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`));
      return false;
    }
    if (file.size > maxSize * 1024 * 1024) {
      setError(t('nuevaMascota:mensajes.imagen_muy_grande', 'La imagen no puede superar los {{maxSize}}MB', { maxSize }));
      return false;
    }
    return true;
  };

  const handleMultipleFiles = (newFiles) => {
    setError('');
    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const validPreviews = [];

    for (const file of fileArray) {
      if (!validateFile(file)) continue;
      
      if (files.length + validFiles.length >= maxFiles) {
        setError(t('common:max_files', `Máximo {{maxFiles}} imágenes permitidas`, { maxFiles }));
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
      onImageChange(updatedFiles, updatedPreviews);
    });
  };

  const handleSingleFile = (file) => {
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

  const removeMultipleImage = (index) => {
    const newPreviews = [...previews];
    const newFiles = [...files];
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    setPreviews(newPreviews);
    setFiles(newFiles);
    onImageChange(newFiles, newPreviews);
  };

  const removeSingleImage = () => {
    setPreview(null);
    setError('');
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = multiple ? removeMultipleImage : removeSingleImage;

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
        <p>{multiple ? t('common:click_or_drag_images', 'Haz clic o arrastra imágenes aquí') : t('common:click_or_drag_image', 'Haz clic o arrastra una imagen aquí')}</p>
        <small>
          {multiple ? t('common:max_images', `Máximo {{maxFiles}} imágenes - `, { maxFiles }) : ''}
          {t('common:max_size_each', `Máximo {{maxSize}}MB cada una - `, { maxSize })}
          {acceptedFormats.map(f => f.split('/')[1]).join(', ')}
        </small>
      </div>
    );
  };

  return (
    <div className="image-uploader">
      {displayLabel && (
        <label className="image-uploader-label">
          {displayLabel} {required && <span className="required">*</span>}
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