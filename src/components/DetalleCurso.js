import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import './DetalleCurso.css';
import BackHomeButton from './BackHomeButton';

const DetalleCurso = ({ user }) => {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalTarea, setShowModalTarea] = useState(false);
  const [showModalCalificar, setShowModalCalificar] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    descripcion: '',
    fecha_entrega: '',
    puntos_maximos: 100
  });
  const [calificacion, setCalificacion] = useState({
    estudiante_id: '',
    nota: '',
    comentarios: ''
  });
  const [estudiantes, setEstudiantes] = useState([]);
  const [entregas, setEntregas] = useState([]);

  useEffect(() => {
    fetchCursoDetalle();
    fetchTareas();
    if (user.tipo === 'docente') {
      fetchEstudiantes();
    }
  }, [cursoId]);

  const fetchCursoDetalle = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php?id=${cursoId}`);
      const data = await response.json();
      setCurso(Array.isArray(data) ? data[0] : data);
    } catch (error) {
      console.error('Error fetching curso:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTareas = async () => {
    try {
      const response = await fetch(`${API_BASE}/tareas.php?curso_id=${cursoId}`);
      const data = await response.json();
      setTareas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tareas:', error);
      setTareas([]);
    }
  };

  const fetchEstudiantes = async () => {
    try {
      const response = await fetch(`${API_BASE}/matriculas.php?curso_id=${cursoId}`);
      const data = await response.json();
      setEstudiantes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching estudiantes:', error);
    }
  };

  const fetchEntregas = async (tareaId) => {
    try {
      const response = await fetch(`${API_BASE}/entregas.php?tarea_id=${tareaId}`);
      const data = await response.json();
      setEntregas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching entregas:', error);
    }
  };

  const crearTarea = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/tareas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevaTarea,
          curso_id: cursoId,
          docente_id: user.id
        })
      });

      if (response.ok) {
        alert('Tarea creada exitosamente');
        setShowModalTarea(false);
        setNuevaTarea({
          titulo: '',
          descripcion: '',
          fecha_entrega: '',
          puntos_maximos: 100
        });
        fetchTareas();
      } else {
        alert('Error al crear la tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const eliminarTarea = async (tareaId) => {
    if (window.confirm('¿Está seguro de eliminar esta tarea?')) {
      try {
        const response = await fetch(`${API_BASE}/tareas.php?id=${tareaId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Tarea eliminada');
          fetchTareas();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const abrirModalCalificar = (tarea) => {
    setTareaSeleccionada(tarea);
    fetchEntregas(tarea.id);
    setShowModalCalificar(true);
  };

  const guardarCalificacion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/calificaciones.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: calificacion.estudiante_id,
          curso_id: cursoId,
          tarea_id: tareaSeleccionada.id,
          nota: calificacion.nota,
          comentarios: calificacion.comentarios,
          docente_id: user.id
        })
      });

      if (response.ok) {
        alert('Calificación guardada exitosamente');
        setCalificacion({ estudiante_id: '', nota: '', comentarios: '' });
        fetchEntregas(tareaSeleccionada.id);
      } else {
        alert('Error al guardar la calificación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const entregarTarea = async (tareaId) => {
    try {
      const response = await fetch(`${API_BASE}/entregas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarea_id: tareaId,
          estudiante_id: user.id,
          fecha_entrega: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Tarea entregada exitosamente');
        fetchTareas();
      } else {
        alert('Error al entregar la tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="detalle-curso-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="detalle-curso-container">
        <div className="error-message">
          <h3>Curso no encontrado</h3>
          <button onClick={() => navigate('/mis-cursos')}>Volver a Mis Cursos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-curso-container">
      <div className="curso-header-banner" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <div className="curso-header-content">
          <BackHomeButton className="btn-back-white" label="← Volver" />
          <h1>{curso.nombre}</h1>
          <p className="curso-codigo">{curso.codigo}</p>
          <div className="curso-meta">
            <span>📚 {curso.creditos} Créditos</span>
            <span>👥 {estudiantes.length} Estudiantes</span>
          </div>
        </div>
      </div>

      <div className="curso-content">
        <div className="curso-sidebar">
          <div className="sidebar-section">
            <h3>📋 Navegación</h3>
            <ul className="sidebar-menu">
              <li className="active">📝 Tareas</li>
              <li>📊 Calificaciones</li>
              <li>👥 Participantes</li>
              <li>ℹ️ Información</li>
            </ul>
          </div>

          {curso.descripcion && (
            <div className="sidebar-section">
              <h3>ℹ️ Descripción</h3>
              <p>{curso.descripcion}</p>
            </div>
          )}
        </div>

        <div className="curso-main">
          <div className="section-header">
            <h2>📝 Tareas y Actividades</h2>
            {user.tipo === 'docente' && (
              <button 
                className="btn-primary"
                onClick={() => setShowModalTarea(true)}
              >
                ➕ Nueva Tarea
              </button>
            )}
          </div>

          {tareas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No hay tareas</h3>
              <p>
                {user.tipo === 'docente' 
                  ? 'Crea la primera tarea para tus estudiantes' 
                  : 'El profesor aún no ha publicado tareas'}
              </p>
            </div>
          ) : (
            <div className="tareas-list">
              {tareas.map((tarea, index) => (
                <div key={tarea.id} className="tarea-card">
                  <div className="tarea-header">
                    <div className="tarea-icon">📄</div>
                    <div className="tarea-info">
                      <h3>{tarea.titulo}</h3>
                      <p className="tarea-meta">
                        📅 Fecha entrega: {new Date(tarea.fecha_entrega).toLocaleDateString('es-ES')}
                        {tarea.puntos_maximos && <span> • ⭐ {tarea.puntos_maximos} puntos</span>}
                      </p>
                    </div>
                    {user.tipo === 'docente' && (
                      <div className="tarea-actions">
                        <button 
                          className="btn-calificar"
                          onClick={() => abrirModalCalificar(tarea)}
                        >
                          ✏️ Calificar
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => eliminarTarea(tarea.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="tarea-body">
                    <p>{tarea.descripcion}</p>
                  </div>
                  {user.tipo === 'estudiante' && (
                    <div className="tarea-footer">
                      <button 
                        className="btn-entregar"
                        onClick={() => entregarTarea(tarea.id)}
                      >
                        📤 Entregar Tarea
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Nueva Tarea */}
      {showModalTarea && (
        <div className="modal-overlay" onClick={() => setShowModalTarea(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Nueva Tarea</h3>
              <button className="btn-close" onClick={() => setShowModalTarea(false)}>✕</button>
            </div>
            <form onSubmit={crearTarea}>
              <div className="form-group">
                <label>Título de la tarea:</label>
                <input
                  type="text"
                  value={nuevaTarea.titulo}
                  onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                  required
                  placeholder="Ej: Tarea 1 - Fundamentos"
                />
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={nuevaTarea.descripcion}
                  onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                  rows="4"
                  placeholder="Describe la tarea y sus requisitos..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de entrega:</label>
                  <input
                    type="date"
                    value={nuevaTarea.fecha_entrega}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, fecha_entrega: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Puntos máximos:</label>
                  <input
                    type="number"
                    value={nuevaTarea.puntos_maximos}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, puntos_maximos: e.target.value})}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">💾 Guardar Tarea</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModalTarea(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Calificar */}
      {showModalCalificar && tareaSeleccionada && (
        <div className="modal-overlay" onClick={() => setShowModalCalificar(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Calificar: {tareaSeleccionada.titulo}</h3>
              <button className="btn-close" onClick={() => setShowModalCalificar(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <h4>Estudiantes Matriculados</h4>
              <form onSubmit={guardarCalificacion}>
                <div className="form-group">
                  <label>Seleccionar Estudiante:</label>
                  <select
                    value={calificacion.estudiante_id}
                    onChange={(e) => setCalificacion({...calificacion, estudiante_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccione un estudiante</option>
                    {estudiantes.map(est => (
                      <option key={est.estudiante_id} value={est.estudiante_id}>
                        {est.estudiante_nombre || `ID: ${est.estudiante_id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nota (0-{tareaSeleccionada.puntos_maximos}):</label>
                    <input
                      type="number"
                      value={calificacion.nota}
                      onChange={(e) => setCalificacion({...calificacion, nota: e.target.value})}
                      min="0"
                      max={tareaSeleccionada.puntos_maximos}
                      step="0.1"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Comentarios:</label>
                  <textarea
                    value={calificacion.comentarios}
                    onChange={(e) => setCalificacion({...calificacion, comentarios: e.target.value})}
                    rows="3"
                    placeholder="Retroalimentación para el estudiante..."
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">💾 Guardar Calificación</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowModalCalificar(false)}>
                    Cancelar
                  </button>
                </div>
              </form>

              {entregas.length > 0 && (
                <div className="entregas-list">
                  <h4>Calificaciones Registradas</h4>
                  <table className="tabla-entregas">
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Nota</th>
                        <th>Comentarios</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entregas.map(entrega => (
                        <tr key={entrega.id}>
                          <td>{entrega.estudiante_nombre}</td>
                          <td><strong>{entrega.nota}</strong></td>
                          <td>{entrega.comentarios || '-'}</td>
                          <td>{new Date(entrega.fecha_calificacion).toLocaleDateString('es-ES')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleCurso;
