import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './Calificaciones.css';

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

  useEffect(() => {
    if (user.tipo === 'docente') {
      fetchCalificacionesDocente();
      fetchCursosDocente();
    } else {
      fetchCalificacionesEstudiante();
    }
  }, [user]);

  const fetchCalificacionesDocente = async () => {
    try {
      const response = await fetch(`${API_BASE}/calificaciones.php?docente_id=${user.id}`);
      const data = await response.json();
      setCalificaciones(data);
    } catch (error) {
      console.error('Error fetching calificaciones:', error);
    }
  };

  const fetchCalificacionesEstudiante = async () => {
    try {
      const response = await fetch(`${API_BASE}/calificaciones.php?estudiante_id=${user.id}`);
      const data = await response.json();
      setCalificaciones(data);
    } catch (error) {
      console.error('Error fetching calificaciones:', error);
    }
  };

  const fetchCursosDocente = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php?docente_id=${user.id}`);
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Error fetching cursos:', error);
    }
  };

  const fetchEstudiantesPorCurso = async (cursoId) => {
    try {
      const response = await fetch(`${API_BASE}/usuarios.php?tipo=estudiante&curso_id=${cursoId}`);
      const data = await response.json();
      setEstudiantes(data);
    } catch (error) {
      console.error('Error fetching estudiantes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/calificaciones.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentCalificacion),
      });

      if (response.ok) {
        await fetchCalificacionesDocente();
        resetForm();
        alert('Calificación registrada exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al registrar la calificación');
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
  };

  const handleCursoChange = (cursoId) => {
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

  return (
    <div className="calificaciones">
      <h2>📊 {user.tipo === 'docente' ? 'Registro de Calificaciones' : 'Mis Calificaciones'}</h2>
      
      {user.tipo === 'docente' && (
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Registrar Calificación
        </button>
      )}

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>➕ Registrar Calificación</h3>
            <form onSubmit={handleSubmit}>
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