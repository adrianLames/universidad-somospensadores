import React, { useState, useCallback } from 'react';
import Notificacion from './Notificacion';
import './Notificacion.css';

let notificacionId = 0;

const NotificacionesProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);

  const agregarNotificacion = useCallback((tipo, mensaje, duracion = 4000) => {
    const id = ++notificacionId;
    const nuevaNotificacion = { id, tipo, mensaje, duracion };
    
    setNotificaciones(prev => [...prev, nuevaNotificacion]);

    // Auto-remover después de la duración + tiempo de animación
    if (duracion > 0) {
      setTimeout(() => {
        eliminarNotificacion(id);
      }, duracion + 300);
    }
  }, []);

  const eliminarNotificacion = useCallback((id) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Exponer funciones globalmente
  React.useEffect(() => {
    window.mostrarNotificacion = agregarNotificacion;
    return () => {
      delete window.mostrarNotificacion;
    };
  }, [agregarNotificacion]);

  return (
    <>
      {children}
      <div className="notificaciones-container">
        {notificaciones.map(notif => (
          <Notificacion
            key={notif.id}
            tipo={notif.tipo}
            mensaje={notif.mensaje}
            duracion={notif.duracion}
            onClose={() => eliminarNotificacion(notif.id)}
          />
        ))}
      </div>
    </>
  );
};

export default NotificacionesProvider;
