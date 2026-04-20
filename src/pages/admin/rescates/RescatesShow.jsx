import React from 'react';
import { useParams } from 'react-router-dom';

const RescatesShow = () => {
  const { id } = useParams();
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Detalle del Rescate #{id}</h1>
      <p>Información completa del rescate - Próximamente</p>
    </div>
  );
};

export default RescatesShow;