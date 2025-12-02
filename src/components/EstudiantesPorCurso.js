import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './EstudiantesPorCurso.css';

const EstudiantesPorCurso = ({ user }) => {
  const [cursos, setCursos] = useState([]);
  const [estudiantesPorCurso, setEstudiantesPorCurso] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedCurso, setExpandedCurso] = useState(null);

  useEffect(() => {
    if (user && user.tipo === 'docente') {
      fetchCursosYEstudiantes();
    }
  }, [user]);

  const fetchCursosYEstudiantes = async () => {
    setLoading(true);
    try {
      // 1. Obtener cursos asignados al profesor
      const cursosResponse = await fetch(`${API_BASE}/cursos.php?docente_id=${user.id}`);
      const cursosData = await cursosResponse.json();
      const cursosArray = Array.isArray(cursosData) ? cursosData : [];
      
      setCursos(cursosArray);
      console.log('📚 Cursos cargados:', cursosArray);

      // 2. Para cada curso, obtener estudiantes
      const estudiantesMap = {};
      
      for (const curso of cursosArray) {
        try {
          const estudiantesResponse = await fetch(`${API_BASE}/calificaciones.php?curso_id=${curso.id}`);
          const estudiantesData = await estudiantesResponse.json();
          
          // Mapear los datos del API
          const estudiantesFormateados = Array.isArray(estudiantesData) 
            ? estudiantesData.map(est => ({
                id: est.estudiante_id,
                nombres: est.estudiante_nombres,
                apellidos: est.estudiante_apellidos,
                email: est.email,
                nota_final: est.nota_final,
                estado: est.estado
              }))
            : [];
          
          estudiantesMap[curso.id] = estudiantesFormateados;
        } catch (error) {
          console.error(`Error fetching estudiantes for curso ${curso.id}:`, error);
          estudiantesMap[curso.id] = [];
        }
      }
      
      setEstudiantesPorCurso(estudiantesMap);
      console.log('👥 Estudiantes por curso:', estudiantesMap);
    } catch (error) {
      console.error('Error fetching cursos:', error);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCurso = (cursoId) => {
    setExpandedCurso(expandedCurso === cursoId ? null : cursoId);
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
    <div className="estudiantes-por-curso">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <h2>👥 Estudiantes Matriculados por Materia</h2>
      </div>

      {loading ? (
        <div className="loading">
          <p>Cargando cursos y estudiantes...</p>
        </div>
      ) : cursos.length === 0 ? (
        <div className="no-cursos">
          <p>No tienes cursos asignados.</p>
        </div>
      ) : (
        <div className="cursos-container">
          {cursos.map(curso => {
            const estudiantes = estudiantesPorCurso[curso.id] || [];
            const isExpanded = expandedCurso === curso.id;

            return (
              <div key={curso.id} className="curso-card">
                <div 
                  className="curso-header"
                  onClick={() => toggleCurso(curso.id)}
                >
                  <div className="curso-info">
                    <h3>{curso.codigo} - {curso.nombre}</h3>
                    <span className="creditos">{curso.creditos} créditos</span>
                  </div>
                  <div className="curso-stats">
                    <span className="estudiantes-count">
                      👥 {estudiantes.length} {estudiantes.length === 1 ? 'estudiante' : 'estudiantes'}
                    </span>
                    <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="curso-content">
                    {estudiantes.length === 0 ? (
                      <div className="no-estudiantes">
                        <p>No hay estudiantes matriculados en este curso.</p>
                      </div>
                    ) : (
                      <table className="estudiantes-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Nota Final</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {estudiantes.map((est, index) => (
                            <tr key={est.id}>
                              <td>{index + 1}</td>
                              <td className="nombre">{est.nombres} {est.apellidos}</td>
                              <td className="email">{est.email}</td>
                              <td className="nota">
                                {est.nota_final ? (
                                  <strong>{est.nota_final}</strong>
                                ) : (
                                  <span className="sin-nota">Sin calificar</span>
                                )}
                              </td>
                              <td className="estado">
                                {est.estado ? (
                                  <span 
                                    className="estado-badge"
                                    style={{backgroundColor: getEstadoColor(est.estado)}}
                                  >
                                    {est.estado.toUpperCase()}
                                  </span>
                                ) : (
                                  <span className="estado-badge" style={{backgroundColor: '#95a5a6'}}>
                                    PENDIENTE
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EstudiantesPorCurso;
