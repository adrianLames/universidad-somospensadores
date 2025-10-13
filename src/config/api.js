// Configuración de la API
export const API_BASE = 'http://localhost/universidad-somospensadores/api';

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