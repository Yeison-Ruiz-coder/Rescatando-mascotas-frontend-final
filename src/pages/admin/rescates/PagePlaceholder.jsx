// src/pages/admin/PagePlaceholder.jsx
import React from 'react';

const PagePlaceholder = ({ title, description = 'Próximamente - Página en construcción' }) => (
  <div
    style={{
      minHeight: '70vh',
      padding: '4rem 1.5rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f8fafc',
      color: '#1f2937'
    }}
  >
    <div style={{ maxWidth: '860px', textAlign: 'center', width: '100%' }}>
      <h1 style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>{title}</h1>
      <p style={{ fontSize: '1.15rem', lineHeight: '1.75', color: '#475569' }}>{description}</p>
    </div>
  </div>
);

export default PagePlaceholder;