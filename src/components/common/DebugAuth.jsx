import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DebugAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [visible, setVisible] = useState(false);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#ff5722',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'rgba(0,0,0,0.9)',
        color: '#0f0',
        padding: '15px',
        borderRadius: '8px',
        maxWidth: '400px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid #0f0',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      <button
        onClick={() => setVisible(false)}
        style={{
          float: 'right',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          padding: '2px 6px'
        }}
      >
        Cerrar
      </button>
      <h4 style={{ marginTop: 0 }}>Debug Auth</h4>
      <div>
        <strong>Loading:</strong> {loading ? 'true' : 'false'}
      </div>
      <div>
        <strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}
      </div>
      <div>
        <strong>User:</strong>
        <pre style={{ color: '#0f0', overflow: 'auto' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <div>
        <strong>Token en localStorage:</strong>
        <div style={{ wordBreak: 'break-all' }}>
          {localStorage.getItem('token') || 'No hay token'}
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;