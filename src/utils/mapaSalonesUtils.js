// Utilidades para manejo de coordenadas y marcadores del mapa
export const MARKER_COLORS = {
  CON_CLASES: '#FF6B6B',
  DISPONIBLE: '#4ECDC4',
  MANTENIMIENTO: '#FFD93D',
  OCUPADO: '#FF6348'
};

export const DIAS_SEMANA = [
  'LUNES',
  'MARTES',
  'MIÉRCOLES',
  'JUEVES',
  'VIERNES',
  'SÁBADO'
];

export const ESTADOS_SALON = {
  DISPONIBLE: 'Disponible',
  OCUPADO: 'Ocupado',
  MANTENIMIENTO: 'Mantenimiento',
  CERRADO: 'Cerrado'
};

/**
 * Genera coordenadas aproximadas para cada salón
 * @param {number} index - Índice del salón
 * @param {Object} baseCoords - Coordenadas base (lat, lng)
 * @param {number} radius - Radio de dispersión en grados (default: 0.0008)
 * @returns {Object} Coordenadas con lat y lng
 */
export const generarCoordenadas = (index, baseCoords, radius = 0.0008) => {
  const angle = (index * 137.5) * (Math.PI / 180); // Ángulo dorado
  const distance = (index % 5 + 1) * (radius / 3);
  
  return {
    lat: baseCoords.lat + Math.cos(angle) * distance,
    lng: baseCoords.lng + Math.sin(angle) * distance
  };
};

/**
 * Obtiene el color del marcador según el estado del salón
 * @param {Object} salon - Objeto del salón
 * @param {Array} horarios - Array de horarios
 * @param {string} diaSemana - Día actual
 * @returns {string} Color hexadecimal
 */
export const obtenerColorMarcador = (salon, horarios, diaSemana) => {
  if (salon.estado === ESTADOS_SALON.MANTENIMIENTO) {
    return MARKER_COLORS.MANTENIMIENTO;
  }

  const tieneClasesHoy = horarios.some(
    h => h.salon_id === salon.id && h.dia_semana === diaSemana
  );

  return tieneClasesHoy ? MARKER_COLORS.CON_CLASES : MARKER_COLORS.DISPONIBLE;
};

/**
 * Obtiene información completa del marcador
 * @param {Object} salon - Objeto del salón
 * @param {Array} horarios - Array de horarios
 * @returns {Object} Salón con horarios adjuntos
 */
export const obtenerInfoMarcador = (salon, horarios) => {
  const horariosDelSalon = horarios.filter(h => h.salon_id === salon.id);
  return {
    ...salon,
    horarios: horariosDelSalon
  };
};

/**
 * Filtra horarios por día de la semana
 * @param {Array} horarios - Array de horarios
 * @param {string} diaSemana - Día a filtrar
 * @returns {Array} Horarios del día especificado
 */
export const filtrarHorariosPorDia = (horarios, diaSemana) => {
  return horarios.filter(h => h.dia_semana === diaSemana);
};

/**
 * Formatea hora a formato legible
 * @param {string} hora - Hora en formato HH:MM
 * @returns {string} Hora formateada
 */
export const formatearHora = (hora) => {
  if (!hora) return '';
  return hora.substring(0, 5);
};

/**
 * Agrupa horarios por salón
 * @param {Array} horarios - Array de horarios
 * @returns {Object} Horarios agrupados por salon_id
 */
export const agruparHorariosPorSalon = (horarios) => {
  return horarios.reduce((acc, horario) => {
    if (!acc[horario.salon_id]) {
      acc[horario.salon_id] = [];
    }
    acc[horario.salon_id].push(horario);
    return acc;
  }, {});
};

/**
 * Obtiene día actual en español
 * @returns {string} Nombre del día en español
 */
export const obtenerDiaActual = () => {
  const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  return dias[new Date().getDay()];
};

/**
 * Calcula horario actual en formato HH:MM
 * @returns {string} Hora actual
 */
export const obtenerHoraActual = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

/**
 * Verifica si una clase está ocurriendo actualmente
 * @param {string} horaInicio - Hora de inicio HH:MM
 * @param {string} horaFin - Hora de fin HH:MM
 * @returns {boolean} Si la clase está en curso
 */
export const estaClaseEnCurso = (horaInicio, horaFin) => {
  const horaActual = obtenerHoraActual();
  return horaActual >= horaInicio && horaActual <= horaFin;
};

/**
 * Obtiene clase siguiente del día
 * @param {Array} horarios - Array de horarios del día
 * @returns {Object|null} Próximo horario o null
 */
export const obtenerProximaClase = (horarios) => {
  const horaActual = obtenerHoraActual();
  const proximosHorarios = horarios.filter(h => h.hora_inicio > horaActual);
  return proximosHorarios.length > 0 ? proximosHorarios[0] : null;
};

/**
 * Valida coordenadas de Google Maps
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} Si las coordenadas son válidas
 */
export const validarCoordenadas = (lat, lng) => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Calcula distancia entre dos puntos en metros (aproximado)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en metros
 */
export const calcularDistancia = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Radio de la tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
