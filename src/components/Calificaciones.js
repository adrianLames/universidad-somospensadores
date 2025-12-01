import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './Calificaciones.css';
import BackHomeButton from './BackHomeButton';

const Calificaciones = ({ user }) => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentCalificacion, setCurrentCalificacion] = useState({
    estudiante_id: '',
    curso_id: '',
    semestre: '',
    anio: new Date().getFullYear(),
    nota_final: ''
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user && user.tipo === 'docente') {
      fetchCalificacionesDocente();
      fetchCursosDocente();
    } else if (user && user.tipo === 'estudiante') {
      fetchCalificacionesEstudiante();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.tipo]);

  const fetchCalificacionesDocente = async () => {
    try {
      const response = await fetch(`${API_BASE}/calificaciones.php?docente_id=${user.id}`);
      if (!response.ok) {
        console.error('API response not ok:', response.status);
        setCalificaciones([]);
        return;
      }
      const data = await response.json();
      console.log('📊 Calificaciones del docente:', data);
      // Asegurar que siempre sea un array
      setCalificaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching calificaciones:', error);
      setCalificaciones([]);
    }
  };

  const fetchCalificacionesEstudiante = async () => {
    try {
      const response = await fetch(`${API_BASE}/calificaciones.php?estudiante_id=${user.id}`);
      if (!response.ok) {
        console.error('API response not ok:', response.status);
        setCalificaciones([]);
        return;
      }
      const data = await response.json();
      // Asegurar que siempre sea un array
      setCalificaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching calificaciones:', error);
      setCalificaciones([]);
    }
  };

  const fetchCursosDocente = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php?docente_id=${user.id}`);
      const result = await response.json();
      const data = result.success ? result.data : (Array.isArray(result) ? result : []);
      console.log('📚 Cursos del docente (ID: ' + user.id + '):', data);
      setCursos(data);
    } catch (error) {
      console.error('Error fetching cursos:', error);
      setCursos([]);
    }
  };

  const fetchEstudiantesPorCurso = async (cursoId) => {
    try {
      console.log('🔍 Buscando estudiantes para curso:', cursoId);
      // Usar el nuevo endpoint de calificaciones que retorna todos los estudiantes matriculados
      const url = `${API_BASE}/calificaciones.php?curso_id=${cursoId}`;
      console.log('URL:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
      }
      
      const data = await response.json();
      console.log('👥 Estudiantes encontrados (raw):', data);
      console.log('Tipo de data:', typeof data, 'Es array:', Array.isArray(data), 'Longitud:', data.length);
      
      if (Array.isArray(data) && data.length > 0) {
        // Mapear los campos del API al formato esperado por React
        const estudiantesFormateados = data.map(est => ({
          id: est.estudiante_id,
          nombres: est.estudiante_nombres,
          apellidos: est.estudiante_apellidos,
          email: est.email,
          ...est // Mantener todos los otros campos también
        }));
        console.log('👥 Estudiantes formateados:', estudiantesFormateados);
        setEstudiantes(estudiantesFormateados);
      } else {
        console.error('Data vacío o no es un array:', data);
        setEstudiantes([]);
      }
    } catch (error) {
      console.error('Error fetching estudiantes:', error);
      console.error('Error message:', error.message);
      setEstudiantes([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (editingId) {
        // Update existing calificación
        response = await fetch(`${API_BASE}/calificaciones.php?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nota_final: parseFloat(currentCalificacion.nota_final) })
        });
      } else {
        // Create new calificación
        response = await fetch(`${API_BASE}/calificaciones.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentCalificacion),
        });
      }

      if (response.ok) {
        if (user.tipo === 'docente') await fetchCalificacionesDocente();
        else await fetchCalificacionesEstudiante();
        resetForm();
        setEditingId(null);
        alert(editingId ? 'Calificación actualizada exitosamente' : 'Calificación registrada exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al guardar la calificación');
      }
    } catch (error) {
      console.error('Error saving calificacion:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentCalificacion({
      estudiante_id: '',
      curso_id: '',
      semestre: '',
      anio: new Date().getFullYear(),
      nota_final: ''
    });
    setShowForm(false);
    setEstudiantes([]);
    setEditingId(null);
  };

  const handleCursoChange = (cursoId) => {
    console.log('🎯 Curso seleccionado:', cursoId);
    setCurrentCalificacion({...currentCalificacion, curso_id: cursoId, estudiante_id: ''});
    if (cursoId) {
      fetchEstudiantesPorCurso(cursoId);
    } else {
      setEstudiantes([]);
    }
  };

  const getSemestres = () => {
    const currentYear = new Date().getFullYear();
    const semestres = [];
    
    for (let i = 0; i < 4; i++) {
      const year = currentYear + Math.floor(i / 2);
      const semester = (i % 2) + 1;
      semestres.push(`${year}-${semester}`);
    }
    
    return semestres;
  };

  const getEstadoCalificacion = (nota) => {
    if (nota >= 3.0) return 'aprobado';
    if (nota >= 2.0) return 'reprobado';
    return 'reprobado';
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'aprobado': return '#2ecc71';
      case 'reprobado': return '#e74c3c';
      case 'en_proceso': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const startEditCalificacion = (calificacion) => {
    // Prefill form and open modal in edit mode
    setEditingId(calificacion.id);
    setCurrentCalificacion({
      estudiante_id: calificacion.estudiante_id || '',
      curso_id: calificacion.curso_id || '',
      semestre: calificacion.semestre || '',
      anio: calificacion.anio || new Date().getFullYear(),
      nota_final: calificacion.nota_final || ''
    });
    // load estudiantes for the curso to keep select consistent
    if (calificacion.curso_id) fetchEstudiantesPorCurso(calificacion.curso_id);
    setShowForm(true);
  };

  const deleteCalificacion = async (id) => {
    if (!window.confirm('¿Eliminar esta calificación?')) return;
    try {
      const res = await fetch(`${API_BASE}/calificaciones.php?id=${id}`, { method: 'DELETE' });
      const j = await res.json();
      if (res.ok) {
        if (user.tipo === 'docente') await fetchCalificacionesDocente();
        else await fetchCalificacionesEstudiante();
        alert(j.message || 'Calificación eliminada');
      } else {
        alert(j.error || 'Error eliminando calificación');
      }
    } catch (err) {
      console.error('Error eliminando calificacion', err);
      alert('Error de conexión');
    }
  }

  const handleOpenForm = () => {
    console.log('🔓 Abriendo formulario');
    setShowForm(true);
    setEditingId(null);
    setEstudiantes([]);
    setCurrentCalificacion({
      estudiante_id: '',
      curso_id: '',
      semestre: '',
      anio: new Date().getFullYear(),
      nota_final: ''
    });
  };

  return (
    <div className="calificaciones">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'}}>
        <h2>📊 {user.tipo === 'docente' ? 'Registro de Calificaciones' : 'Mis Calificaciones'}</h2>
        <BackHomeButton label="Inicio" />
      </div>
      
      {user && user.tipo === 'docente' && (
        <>
          <div style={{fontSize: '12px', color: '#d4af37', marginBottom: '1rem'}}>
            DEBUG: {cursos.length} cursos cargados | Estudiantes: {estudiantes.length} | User: {user.id}
          </div>
          <button 
            className="btn-primary"
            onClick={handleOpenForm}
          >
            ➕ Registrar Calificación
          </button>
        </>
      )}

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingId ? '✏️ Editar Calificación' : '➕ Registrar Calificación'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
              {/* If editing, only allow changing the nota_final. Otherwise show full form to create */}
              {!editingId ? (
                <>
                <div className="form-group">
                  <label>Curso:</label>
                  <select
                    value={currentCalificacion.curso_id}
                    onChange={(e) => handleCursoChange(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar curso</option>
                    {cursos.map(curso => (
                      <option key={curso.id} value={curso.id}>
                        {curso.codigo} - {curso.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estudiante:</label>
                  <select
                    value={currentCalificacion.estudiante_id}
                    onChange={(e) => setCurrentCalificacion({...currentCalificacion, estudiante_id: e.target.value})}
                    required
                    disabled={loading || !currentCalificacion.curso_id}
                  >
                    <option value="">Seleccionar estudiante</option>
                    {estudiantes.map(estudiante => (
                      <option key={estudiante.id} value={estudiante.id}>
                        {estudiante.nombres} {estudiante.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Semestre:</label>
                  <select
                    value={currentCalificacion.semestre}
                    onChange={(e) => setCurrentCalificacion({...currentCalificacion, semestre: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar semestre</option>
                    {getSemestres().map(semestre => (
                      <option key={semestre} value={semestre}>
                        {semestre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Año:</label>
                  <input
                    type="number"
                    value={currentCalificacion.anio}
                    onChange={(e) => setCurrentCalificacion({...currentCalificacion, anio: e.target.value})}
                    required
                    min="2020"
                    max="2030"
                    disabled={loading}
                  />
                </div>
                </>
              ) : null}

              <div className="form-group">
                <label>Nota Final (0.0 - 5.0):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="5.0"
                  value={currentCalificacion.nota_final}
                  onChange={(e) => setCurrentCalificacion({...currentCalificacion, nota_final: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Registrando...' : '📊 Registrar'}
                </button>
                <button type="button" onClick={resetForm} disabled={loading}>
                  ❌ Cancelar
                </button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="calificaciones-list">
        {calificaciones.length === 0 ? (
          <div className="no-data">
            <p>No hay calificaciones registradas</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {user.tipo === 'docente' && <th>Estudiante</th>}
                <th>Curso</th>
                <th>Semestre</th>
                <th>Año</th>
                <th>Nota Final</th>
                <th>Estado</th>
                {user.tipo === 'docente' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {calificaciones.map(calificacion => (
                <tr key={calificacion.id}>
                  {user.tipo === 'docente' && (
                    <td>{calificacion.estudiante_nombres} {calificacion.estudiante_apellidos}</td>
                  )}
                  <td>{calificacion.curso_nombre}</td>
                  <td>{calificacion.semestre}</td>
                  <td>{calificacion.anio}</td>
                  <td>
                    <strong className={`nota ${getEstadoCalificacion(calificacion.nota_final)}`}>
                      {calificacion.nota_final}
                    </strong>
                  </td>
                  <td>
                    <span 
                      className="estado" 
                      style={{backgroundColor: getEstadoColor(calificacion.estado)}}
                    >
                      {calificacion.estado.toUpperCase()}
                    </span>
                  </td>
                  {user.tipo === 'docente' && (
                    <td>
                      <button className="btn-edit" onClick={() => startEditCalificacion(calificacion)}>Editar</button>
                      <button className="btn-delete" onClick={() => deleteCalificacion(calificacion.id)}>Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Calificaciones;