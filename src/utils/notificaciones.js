// Utilidades para notificaciones

export const mostrarExito = (mensaje) => {
  if (window.mostrarNotificacion) {
    window.mostrarNotificacion('exito', mensaje);
  } else {
    alert(mensaje);
  }
};

export const mostrarError = (mensaje) => {
  if (window.mostrarNotificacion) {
    window.mostrarNotificacion('error', mensaje);
  } else {
    alert(mensaje);
  }
};

export const mostrarAdvertencia = (mensaje) => {
  if (window.mostrarNotificacion) {
    window.mostrarNotificacion('advertencia', mensaje);
  } else {
    alert(mensaje);
  }
};

export const mostrarInfo = (mensaje) => {
  if (window.mostrarNotificacion) {
    window.mostrarNotificacion('info', mensaje);
  } else {
    alert(mensaje);
  }
};
