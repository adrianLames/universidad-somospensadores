// Configuración de la API
export const API_BASE = 'http://localhost/universidad-somospensadores-main/api';

// Funciones auxiliares para las peticiones
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}/${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Función específica para obtener facultades
export const getFacultades = async () => {
  try {
    const response = await fetch(`${API_BASE}/facultades.php`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching facultades:', error);
    return [];
  }
};

// Función específica para obtener programas
export const getProgramas = async () => {
  try {
    const response = await fetch(`${API_BASE}/programas.php`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching programas:', error);
    return [];
  }
};

// Función para obtener programas filtrados por facultad
export const getProgramasByFacultad = async (facultad) => {
  try {
    const response = await fetch(`${API_BASE}/programas.php?facultad=${encodeURIComponent(facultad)}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching programas by facultad:', error);
    return [];
  }
};

// Funciones para las nuevas tablas específicas
export const getEstudiantes = async () => {
  try {
    const response = await fetch(`${API_BASE}/estudiantes.php`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching estudiantes:', error);
    return [];
  }
};

export const getDocentesEspecificos = async () => {
  try {
    const response = await fetch(`${API_BASE}/docentes.php`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching docentes específicos:', error);
    return [];
  }
};

export const getAdministradores = async () => {
  try {
    const response = await fetch(`${API_BASE}/administradores.php`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching administradores:', error);
    return [];
  }
};