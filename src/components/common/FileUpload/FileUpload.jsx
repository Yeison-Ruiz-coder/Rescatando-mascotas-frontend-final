// src/components/common/FileUpload/FileUpload.jsx
import React, { useState, useRef, useCallback } from 'react';
import './FileUpload.css';

const FileUpload = ({
  label,
  name,
  value = [],
  onChange,
  accept = 'image/*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  disabled = false,
  placeholder = 'Arrastra o haz clic para subir archivos',
  hint = 'Formatos permitidos: JPG, PNG, GIF. Máximo 5MB por archivo'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `El archivo ${file.name} excede el tamaño máximo de ${maxSize / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const newErrors = [];
    const validFiles = [];

    if (!multiple && (value.length + fileArray.length) > 1) {
      newErrors.push('Solo puedes subir un archivo');
    } else if (multiple && (value.length + fileArray.length) > maxFiles) {
      newErrors.push(`Máximo ${maxFiles} archivos permitidos`);
    }

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      const newFiles = multiple ? [...value, ...validFiles] : validFiles;
      onChange({ target: { name, value: newFiles, files: newFiles } });
    }
  }, [value, multiple, maxFiles, maxSize, name, onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const removeFile = (indexToRemove) => {
    const newFiles = value.filter((_, index) => index !== indexToRemove);
    onChange({ target: { name, value: newFiles, files: newFiles } });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilePreview = (file) => {
    if (file.type && file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="file-upload-collage">
      {label && <label className="file-upload-label">{label}</label>}
      
      <div
        className={`file-upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <i className="fas fa-cloud-upload-alt file-upload-icon"></i>
        <div className="file-upload-text">
          {placeholder || <><strong>Haz clic para subir</strong> o arrastra y suelta</>}
        </div>
        <div className="file-upload-hint">{hint}</div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="file-upload-input"
        />
      </div>

      {errors.length > 0 && (
        <div className="file-upload-errors">
          {errors.map((error, idx) => (
            <div key={idx} className="file-upload-error">
              <i className="fas fa-exclamation-triangle"></i> {error}
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="file-preview">
          {value.map((file, index) => {
            const preview = getFilePreview(file);
            return (
              <div key={index} className="file-preview-item">
                {preview ? (
                  <img src={preview} alt={file.name} className="file-preview-img" />
                ) : (
                  <div className="file-preview-icon">
                    <i className="fas fa-file-alt"></i>
                  </div>
                )}
                <button
                  type="button"
                  className="file-preview-remove"
                  onClick={() => removeFile(index)}
                >
                  <i className="fas fa-times"></i>
                </button>
                <div className="file-name" title={file.name}>
                  {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                </div>
                <div className="file-size">{formatFileSize(file.size)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;