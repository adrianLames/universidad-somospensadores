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

    const contentType = response.headers.get('content-type') || '';

    // If response not OK, read body (text or json) and include it in the thrown error for debugging
    if (!response.ok) {
      let bodyText = '';
      try {
        if (contentType.includes('application/json')) {
          const bodyJson = await response.json();
          bodyText = JSON.stringify(bodyJson);
        } else {
          bodyText = await response.text();
        }
      } catch (e) {
        bodyText = `<unable to read body: ${e.message}>`;
      }
      throw new Error(`Error ${response.status}: ${response.statusText} - ${bodyText}`);
    }

    // If the response is JSON, parse it; otherwise return raw text (but signal it's not JSON)
    if (contentType.includes('application/json')) {
      return await response.json();
    }

    const text = await response.text();
    // Try to parse text as JSON as a last resort
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text}`);
    }
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
    const result = await response.json();
    // Manejar tanto formato nuevo {success, data} como array directo
    return result.success ? result.data : (Array.isArray(result) ? result : []);
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
    const result = await response.json();
    // Manejar tanto formato nuevo {success, data} como array directo
    return result.success ? result.data : (Array.isArray(result) ? result : []);
  } catch (error) {
    console.error('Error fetching programas:', error);
    return [];
  }
};

// Función para obtener programas filtrados por facultad
export const getProgramasByFacultad = async (facultadId) => {
  try {
    if (!facultadId) return [];
    const response = await fetch(`${API_BASE}/programas.php?facultad_id=${encodeURIComponent(facultadId)}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();
    // Manejar tanto formato nuevo {success, data} como array directo
    return result.success ? result.data : (Array.isArray(result) ? result : []);
  } catch (error) {
    console.error('Error fetching programas by facultad:', error);
    return [];
  }
};

// Función para obtener cursos/materias filtrados por programa
export const getCursosByPrograma = async (programaId) => {
  try {
    const response = await fetch(`${API_BASE}/cursos.php?programa_id=${encodeURIComponent(programaId)}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cursos by programa:', error);
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