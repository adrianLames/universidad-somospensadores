import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './Matriculas.css';
import BackHomeButton from './BackHomeButton';

const Matriculas = ({ user }) => {
  const [matriculas, setMatriculas] = useState([]);
  const [noAprobadas, setNoAprobadas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [prerequisitos, setPrerequisitos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentMatricula, setCurrentMatricula] = useState({
    curso_id: '',
    semestre: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);

  useEffect(() => {
    fetchMatriculas();
    fetchCursos();
    fetchNoAprobadas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Obtener materias matriculadas sin aprobar
  const fetchNoAprobadas = async () => {
    try {
      // Traer todas las matrículas activas
      const response = await fetch(`${API_BASE}/matriculas.php?estudiante_id=${user.id}`);
      const matriculasData = await response.json();
      // Traer todas las calificaciones aprobadas
      const califResponse = await fetch(`${API_BASE}/calificaciones.php?estudiante_id=${user.id}`);
      const califData = await califResponse.json();
      // IDs de cursos aprobados
      const cursosAprobados = new Set(
        califData.filter(c => c.estado === 'aprobado').map(c => c.curso_id)
      );
      // Filtrar las matrículas activas que no están aprobadas
      const noAprobadasList = matriculasData.filter(m => m.estado === 'activa' && !cursosAprobados.has(m.curso_id));
      setNoAprobadas(noAprobadasList);
    } catch (error) {
      setNoAprobadas([]);
    }
  };

  const fetchMatriculas = async () => {
    try {
      const response = await fetch(`${API_BASE}/matriculas.php?estudiante_id=${user.id}`);
      const data = await response.json();

      // Validar que la respuesta sea un array
      if (Array.isArray(data)) {
        setMatriculas(data);
      } else {
        setMatriculas([]); // Si no es un array, inicializar como vacío
        console.error('La respuesta del backend no es un array:', data);
      }
    } catch (error) {
      console.error('Error fetching matriculas:', error);
      setMatriculas([]); // Inicializar como vacío en caso de error
    }
  };

  const fetchCursos = async () => {
    try {
      // Solicitar solo cursos activos
      const response = await fetch(`${API_BASE}/cursos.php?activo=1`);
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error('La respuesta de cursos no es un array:', data);
        setCursos([]);
        return;
      }

      // Obtener profesores asignados para cada curso
      const cursosConProfesores = await Promise.all(
        data.map(async (curso) => {
          try {
            const profesorResponse = await fetch(`${API_BASE}/asignacion_docentes.php?curso_id=${curso.id}`);
            const profesorData = await profesorResponse.json();
            return {
              ...curso,
              profesor: profesorData.data && profesorData.data.length > 0 ? profesorData.data[0] : null
            };
          } catch (err) {
            console.error(`Error obteniendo profesor para curso ${curso.id}:`, err);
            return {
              ...curso,
              profesor: null
            };
          }
        })
      );

      setCursos(cursosConProfesores);
    } catch (error) {
      console.error('Error fetching cursos:', error);
      setCursos([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar prerequisitos antes de matricular
      const prereqResponse = await fetch(`${API_BASE}/verificar_prerequisitos.php?curso_id=${currentMatricula.curso_id}&estudiante_id=${user.id}`);
      const prereqData = await prereqResponse.json();
      
      if (prereqData.data && prereqData.data.length > 0) {
        const noAprobados = prereqData.data.filter(p => !p.aprobado);
        if (noAprobados.length > 0) {
          alert(`No puedes matricular este curso. Debes aprobar primero: ${noAprobados.map(p => p.nombre).join(', ')}`);
          setLoading(false);
          return;
        }
      }

      // Separar semestre y año del formato 'YYYY-S'
      const [anio, semestreNum] = currentMatricula.semestre.split('-');
      
      const matriculaData = {
        estudiante_id: user.id,
        curso_id: currentMatricula.curso_id,
        semestre: semestreNum,
        anio: parseInt(anio)
      };

      const response = await fetch(`${API_BASE}/matriculas.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matriculaData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await fetchMatriculas();
        await fetchNoAprobadas();
        resetForm();
        alert('Matrícula realizada exitosamente');
      } else {
        alert(result.message || result.error || 'Error al realizar la matrícula');
      }
    } catch (error) {
      console.error('Error saving matricula:', error);
      alert('Error de conexión al matricular');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentMatricula({
      curso_id: '',
      semestre: ''
    });
    setSelectedCurso(null);
    setPrerequisitos([]);
    setShowForm(false);
  };

  const cancelMatricula = async (id) => {
    if (window.confirm('¿Está seguro de cancelar esta matrícula?')) {
      try {
        const response = await fetch(`${API_BASE}/matriculas.php?id=${id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          await fetchMatriculas();
          await fetchNoAprobadas();
          alert('Matrícula cancelada exitosamente');
        } else {
          alert(result.message || result.error || 'Error al cancelar la matrícula');
        }
      } catch (error) {
        console.error('Error deleting matricula:', error);
        alert('Error de conexión al cancelar');
      }
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

  const handleCursoSelect = (cursoId) => {
    setSelectedCurso(cursoId);
    (async () => {
      try {
        const data = await fetch(`${API_BASE}/verificar_prerequisitos.php?curso_id=${cursoId}&estudiante_id=${user.id}`)
          .then(r => r.json());
        setPrerequisitos(data.data);
      } catch (err) {
        console.error('Error verificando prerequisitos:', err);
        setPrerequisitos([]);
      }
    })();
  };

  return (
    <div className="matriculas">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>🎓 Gestión de Matrículas</h2>
        <BackHomeButton label="Inicio" />
      </div>
      
      {user.tipo === 'estudiante' && (
        <>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
            disabled={cursos.length === 0}
          >
            ➕ Nueva Matrícula
          </button>
          {cursos.length === 0 && (
            <div style={{
              background: '#fff3cd', 
              border: '1px solid #ffc107', 
              padding: '15px', 
              borderRadius: '5px',
              marginTop: '10px'
            }}>
              <p style={{margin: 0, color: '#856404'}}>
                ⚠️ <strong>No hay cursos disponibles para matricular.</strong><br/>
                Por favor contacta con el administrador para activar cursos en el sistema.
              </p>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>➕ Nueva Matrícula</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Curso:</label>
                <select
                  value={currentMatricula.curso_id}
                  onChange={(e) => {
                    const cursoId = e.target.value;
                    setCurrentMatricula({...currentMatricula, curso_id: cursoId});
                    if (cursoId) handleCursoSelect(cursoId);
                  }}
                  required
                  disabled={loading}
                >
                  <option value="">
                    {cursos.length === 0 ? 'No hay cursos disponibles' : 'Seleccionar curso'}
                  </option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.codigo} - {curso.nombre} ({curso.creditos} créditos)
                      {curso.profesor ? ` - Prof. ${curso.profesor.docente_nombre}` : ''}
                    </option>
                  ))}
                </select>
                {cursos.length === 0 && (
                  <p style={{color: 'orange', fontSize: '0.9em', marginTop: '5px'}}>
                    ⚠️ No hay cursos activos disponibles. Contacta con administración.
                  </p>
                )}
              </div>
              
              {currentMatricula.curso_id && prerequisitos.length > 0 && (
                <div className="form-group prerequisitos-info">
                  <label>Prerequisitos del curso:</label>
                  <ul style={{margin: '5px 0', paddingLeft: '20px'}}>
                    {prerequisitos.map(p => (
                      <li key={p.id} style={{color: p.aprobado ? 'green' : 'red'}}>
                        {p.nombre} - {p.aprobado ? '✅ Aprobado' : '❌ No aprobado'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="form-group">
                <label>Periodo (Año-Semestre):</label>
                <select
                  value={currentMatricula.semestre}
                  onChange={(e) => setCurrentMatricula({...currentMatricula, semestre: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar periodo</option>
                  {getSemestres().map(semestre => (
                    <option key={semestre} value={semestre}>
                      {semestre.replace('-1', ' - Primer Semestre').replace('-2', ' - Segundo Semestre')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Matriculando...' : '🎓 Matricular'}
                </button>
                <button type="button" onClick={resetForm} disabled={loading}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="matriculas-list">
        <div className="no-aprobadas">
          <h3>Materias matriculadas sin aprobar</h3>
          {noAprobadas.length > 0 ? (
            <ul>
              {noAprobadas.map(m => (
                <li key={m.id}>{m.curso_nombre} ({m.semestre} - {m.anio})</li>
              ))}
            </ul>
          ) : (
            <p>No tienes materias matriculadas sin aprobar.</p>
          )}
        </div>
        {matriculas.length === 0 ? (
          <div className="no-data">
            <p>No hay matrículas registradas</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Curso</th>
                <th>Periodo</th>
                <th>Fecha Matrícula</th>
                <th>Estado</th>
                {user.tipo === 'estudiante' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {matriculas.map(matricula => (
                <tr key={matricula.id}>
                  <td><strong>{matricula.curso_codigo}</strong></td>
                  <td>{matricula.curso_nombre}</td>
                  <td>{matricula.anio}-{matricula.semestre}</td>
                  <td>{new Date(matricula.fecha_matricula).toLocaleDateString('es-CO')}</td>
                  <td>
                    <span className={`estado ${matricula.estado}`}>
                      {matricula.estado === 'activa' ? '🟢 ACTIVA' : 
                       matricula.estado === 'completada' ? '✅ COMPLETADA' : '❌ CANCELADA'}
                    </span>
                  </td>
                  {user.tipo === 'estudiante' && matricula.estado === 'activa' && (
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => cancelMatricula(matricula.id)}
                          className="btn-danger"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="cursos-list">
        <h2>Lista de Cursos</h2>
        <ul>
          {cursos.map(curso => (
            <li key={curso.id} onClick={() => handleCursoSelect(curso.id)}>
              {curso.nombre}
            </li>
          ))}
        </ul>
      </div>
      {selectedCurso && (
        <div className="prerequisitos">
          <h2>Prerequisitos</h2>
          {prerequisitos.length > 0 ? (
            <ul>
              {prerequisitos.map(prerequisito => (
                <li key={prerequisito.id}>
                  {prerequisito.nombre} - {prerequisito.aprobado ? 'Aprobado' : 'No aprobado'}
                </li>
              ))}
            </ul>
          ) : (
            <p>Este curso no tiene prerequisitos.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Matriculas;