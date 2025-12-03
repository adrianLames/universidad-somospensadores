import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config/api';
import './Asistencias.css';

const Asistencias = ({ user }) => {
  const [asistencias, setAsistencias] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentAsistencia, setCurrentAsistencia] = useState({
    estudiante_id: '',
    curso_id: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'presente',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchAsistenciasDocente = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/asistencias.php?docente_id=${user.id}`);
      if (!response.ok) {
        console.error('API response not ok:', response.status);
        setAsistencias([]);
        return;
      }
      const data = await response.json();
      // Asegurar que siempre sea un array
      setAsistencias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching asistencias:', error);
      setAsistencias([]);
    }
  }, [user.id]);

  const fetchAsistenciasEstudiante = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/asistencias.php?estudiante_id=${user.id}`);
      if (!response.ok) {
        console.error('API response not ok:', response.status);
        setAsistencias([]);
        return;
      }
      const data = await response.json();
      // Asegurar que siempre sea un array
      setAsistencias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching asistencias:', error);
      setAsistencias([]);
    }
  }, [user.id]);

  const fetchCursosDocente = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/vinculaciones.php?docente_id=${user.id}`);
      const data = await response.json();
      setCursos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cursos:', error);
      setCursos([]);
    }
  }, [user.id]);

  useEffect(() => {
    if (user.tipo === 'docente') {
      fetchAsistenciasDocente();
      fetchCursosDocente();
    } else {
      fetchAsistenciasEstudiante();
    }
  }, [user.tipo, fetchAsistenciasDocente, fetchCursosDocente, fetchAsistenciasEstudiante]);

  const fetchEstudiantesPorCurso = async (cursoId) => {
    try {
      const response = await fetch(`${API_BASE}/matriculas.php?curso_id=${cursoId}`);
      if (!response.ok) {
        console.error('API response not ok:', response.status);
        setEstudiantes([]);
        return;
      }
      const data = await response.json();
      // Asegurar que siempre sea un array y mapear los campos correctos
      const estudiantesFormateados = Array.isArray(data) 
        ? data.map(est => ({
            id: est.estudiante_id,
            nombres: est.nombres,
            apellidos: est.apellidos,
            identificacion: est.identificacion
          }))
        : [];
      setEstudiantes(estudiantesFormateados);
    } catch (error) {
      console.error('Error fetching estudiantes:', error);
      setEstudiantes([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/asistencias.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentAsistencia),
      });

      if (response.ok) {
        await fetchAsistenciasDocente();
        resetForm();
        alert('Asistencia registrada exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al registrar la asistencia');
      }
    } catch (error) {
      console.error('Error saving asistencia:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentAsistencia({
      estudiante_id: '',
      curso_id: '',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'presente',
      observaciones: ''
    });
    setShowForm(false);
    setEstudiantes([]);
  };

  const handleCursoChange = (cursoId) => {
    setCurrentAsistencia({...currentAsistencia, curso_id: cursoId, estudiante_id: ''});
    if (cursoId) {
      fetchEstudiantesPorCurso(cursoId);
    } else {
      setEstudiantes([]);
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'presente': return '#2ecc71';
      case 'ausente': return '#e74c3c';
      case 'justificado': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="asistencias">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
        <h2>✅ {user.tipo === 'docente' ? 'Control de Asistencias' : 'Mis Asistencias'}</h2>
        {user.tipo === 'docente' && (
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            ➕ Registrar Asistencia
          </button>
        )}
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>➕ Registrar Asistencia</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Curso:</label>
                <select
                  value={currentAsistencia.curso_id}
                  onChange={(e) => handleCursoChange(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map(curso => (
                    <option key={curso.curso_id} value={curso.curso_id}>
                      {curso.curso_codigo} - {curso.curso_nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Estudiante:</label>
                <select
                  value={currentAsistencia.estudiante_id}
                  onChange={(e) => setCurrentAsistencia({...currentAsistencia, estudiante_id: e.target.value})}
                  required
                  disabled={loading || !currentAsistencia.curso_id}
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
                <label>Fecha:</label>
                <input
                  type="date"
                  value={currentAsistencia.fecha}
                  onChange={(e) => setCurrentAsistencia({...currentAsistencia, fecha: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <select
                  value={currentAsistencia.estado}
                  onChange={(e) => setCurrentAsistencia({...currentAsistencia, estado: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="presente">Presente</option>
                  <option value="ausente">Ausente</option>
                  <option value="justificado">Justificado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Observaciones:</label>
                <textarea
                  value={currentAsistencia.observaciones}
                  onChange={(e) => setCurrentAsistencia({...currentAsistencia, observaciones: e.target.value})}
                  rows="3"
                  disabled={loading}
                  placeholder="Observaciones adicionales..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Registrando...' : '✅ Registrar'}
                </button>
                <button type="button" onClick={resetForm} disabled={loading}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="asistencias-list">
        {asistencias.length === 0 ? (
          <div className="no-data">
            <p>No hay registros de asistencia</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {user.tipo === 'docente' && <th>Estudiante</th>}
                <th>Curso</th>
                <th>Fecha</th>
                <th>Estado</th>
                {user.tipo === 'docente' && <th>Observaciones</th>}
              </tr>
            </thead>
            <tbody>
              {asistencias.map(asistencia => (
                <tr key={asistencia.id}>
                  {user.tipo === 'docente' && (
                    <td>{asistencia.estudiante_nombres} {asistencia.estudiante_apellidos}</td>
                  )}
                  <td>{asistencia.curso_nombre}</td>
                  <td>{new Date(asistencia.fecha).toLocaleDateString('es-ES')}</td>
                  <td>
                    <span 
                      className="estado" 
                      style={{backgroundColor: getEstadoColor(asistencia.estado)}}
                    >
                      {asistencia.estado.toUpperCase()}
                    </span>
                  </td>
                  {user.tipo === 'docente' && (
                    <td>{asistencia.observaciones || '-'}</td>
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

export default Asistencias;