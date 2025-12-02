import React, { useEffect } from 'react';
import './Notificacion.css';

const Notificacion = ({ tipo = 'info', mensaje, onClose, duracion = 4000 }) => {
  useEffect(() => {
    if (duracion > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duracion);
      return () => clearTimeout(timer);
    }
  }, [duracion, onClose]);

  const iconos = {
    exito: '✓',
    error: '✕',
    advertencia: '⚠',
    info: 'ℹ'
  };

  const titulos = {
    exito: 'Éxito',
    error: 'Error',
    advertencia: 'Advertencia',
    info: 'Información'
  };

  return (
    <div className={`notificacion notificacion-${tipo}`}>
      <div className="notificacion-icono">
        {iconos[tipo]}
      </div>
      <div className="notificacion-contenido">
        <div className="notificacion-titulo">{titulos[tipo]}</div>
        <div className="notificacion-mensaje">{mensaje}</div>
      </div>
      <button className="notificacion-cerrar" onClick={onClose}>
        ✕
      </button>
      <div className="notificacion-progreso" style={{ animationDuration: `${duracion}ms` }}></div>
    </div>
  );
};

export default Notificacion;
