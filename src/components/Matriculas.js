import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './Matriculas.css';

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
  const [semestreActual, setSemestreActual] = useState('');
  const [periodoMatricula, setPeriodoMatricula] = useState({ abierto: false, mensaje: '' });

  // Calcular semestre actual (hacerlo antes del useEffect)
  const calcularSemestreActual = () => {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const anio = fecha.getFullYear();
    // Semestre 1: Enero-Junio, Semestre 2: Julio-Diciembre
    const periodo = mes <= 6 ? '1' : '2';
    const semestre = `${anio}-${periodo}`;
    return semestre;
  };

  useEffect(() => {
    const semestre = calcularSemestreActual();
    setSemestreActual(semestre);
    setCurrentMatricula(prev => ({ ...prev, semestre }));
    fetchMatriculas();
    fetchNoAprobadas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar cursos cuando cambie el semestre seleccionado
  useEffect(() => {
    if (currentMatricula.semestre) {
      fetchCursosActivos(currentMatricula.semestre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMatricula.semestre]);

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

  const fetchCursosActivos = async (semestre) => {
    try {
      // Obtener cursos activos del semestre seleccionado
      const response = await fetch(`${API_BASE}/semestres_activos.php?semestre=${semestre}&activo=1`);
      const data = await response.json();

      if (!data.success) {
        console.error('Error en respuesta de semestres activos:', data);
        setCursos([]);
        setPeriodoMatricula({ 
          abierto: false, 
          mensaje: 'No hay cursos disponibles para matrícula en este momento' 
        });
        return;
      }

      // Verificar si estamos en periodo de matrícula
      const hoy = new Date();
      const cursosDisponibles = data.data.filter(curso => {
        const inicio = new Date(curso.fecha_inicio_matricula);
        const fin = new Date(curso.fecha_fin_matricula);
        const enPeriodo = hoy >= inicio && hoy <= fin;
        
        // Filtrar también por jornada del estudiante
        if (user.jornada) {
          return enPeriodo && curso.jornada === user.jornada;
        }
        
        return enPeriodo;
      });

      if (cursosDisponibles.length === 0) {
        setPeriodoMatricula({ 
          abierto: false, 
          mensaje: data.data.length > 0 
            ? 'El periodo de matrícula está cerrado' 
            : 'No hay cursos activos para el semestre actual' 
        });
        setCursos([]);
        return;
      }

      setPeriodoMatricula({ abierto: true, mensaje: '' });

      // El endpoint semestres_activos ya devuelve toda la información del curso
      // Solo necesitamos obtener el profesor asignado para cada curso
      const cursosConDetalles = await Promise.all(
        cursosDisponibles.map(async (semestreActivo) => {
          try {
            // Obtener profesor asignado
            const profesorResponse = await fetch(`${API_BASE}/asignacion_docentes.php?curso_id=${semestreActivo.curso_id}`);
            const profesorData = await profesorResponse.json();

            return {
              id: semestreActivo.curso_id,
              codigo: semestreActivo.codigo,
              nombre: semestreActivo.nombre,
              creditos: semestreActivo.creditos,
              jornada: semestreActivo.jornada,
              programa_nombre: semestreActivo.programa_nombre,
              facultad_nombre: semestreActivo.facultad_nombre,
              semestre_activo_id: semestreActivo.id,
              cupos_disponibles: semestreActivo.cupos_disponibles,
              fecha_inicio_matricula: semestreActivo.fecha_inicio_matricula,
              fecha_fin_matricula: semestreActivo.fecha_fin_matricula,
              profesor: profesorData.data && profesorData.data.length > 0 ? profesorData.data[0] : null
            };
          } catch (err) {
            console.error(`Error obteniendo detalles para curso ${semestreActivo.curso_id}:`, err);
            return null;
          }
        })
      );

      const cursosValidos = cursosConDetalles.filter(c => c !== null);
      setCursos(cursosValidos);

    } catch (error) {
      console.error('Error fetching cursos activos:', error);
      setCursos([]);
      setPeriodoMatricula({ 
        abierto: false, 
        mensaje: 'Error al cargar cursos disponibles' 
      });
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
          alert(`❌ No cumples con los prerequisitos\n\nDebes aprobar primero:\n${noAprobados.map(p => `• ${p.nombre}`).join('\n')}`);
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
        alert('✅ Matrícula realizada exitosamente');
      } else {
        alert(result.message || result.error || 'Error al realizar la matrícula');
      }
    } catch (error) {
      console.error('Error saving matricula:', error);
      console.error('Error details:', error.message);
      alert(`Error de conexión al matricular: ${error.message || 'Por favor intenta de nuevo'}`);
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
        {user.jornada && (
          <div style={{
            padding: '0.5rem 1rem',
            background: user.jornada === 'diurna' ? '#f39c12' : '#3498db',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            {user.jornada === 'diurna' ? '☀️ Diurna' : '🌙 Nocturna'}
          </div>
        )}
      </div>
      
      {user.tipo === 'estudiante' && (
        <>
          {!periodoMatricula.abierto ? (
            <div style={{
              background: '#fff3cd', 
              border: '1px solid #ffc107', 
              padding: '15px', 
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <p style={{margin: 0, color: '#856404'}}>
                ⚠️ <strong>{periodoMatricula.mensaje}</strong>
              </p>
            </div>
          ) : (
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Nueva Matrícula
            </button>
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
                      {curso.codigo} - {curso.nombre} ({curso.creditos} créditos) {curso.jornada === 'diurna' ? '☀️' : '🌙'}
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
                <div className="form-group prerequisitos-info" style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <label style={{color: '#495057', marginBottom: '10px', display: 'block'}}>
                    📋 Prerequisitos del curso:
                  </label>
                  <ul style={{margin: '5px 0', paddingLeft: '20px'}}>
                    {prerequisitos.map(p => (
                      <li key={p.id} style={{
                        color: p.aprobado ? '#28a745' : '#dc3545',
                        fontWeight: '500',
                        marginBottom: '5px'
                      }}>
                        {p.nombre} - {p.aprobado ? '✅ Aprobado' : '❌ No aprobado'}
                      </li>
                    ))}
                  </ul>
                  {prerequisitos.some(p => !p.aprobado) && (
                    <p style={{
                      color: '#dc3545',
                      fontSize: '0.9em',
                      marginTop: '10px',
                      fontWeight: '500'
                    }}>
                      ⚠️ Debes aprobar todos los prerequisitos antes de matricular este curso
                    </p>
                  )}
                </div>
              )}
              
              <div className="form-group">
                <label>Periodo (Año-Semestre):</label>
                <select
                  value={currentMatricula.semestre}
                  onChange={(e) => {
                    const nuevoSemestre = e.target.value;
                    setCurrentMatricula({...currentMatricula, semestre: nuevoSemestre, curso_id: ''});
                    setPrerequisitos([]);
                  }}
                  required
                  style={{
                    background: '#fff',
                    color: '#495057',
                    fontWeight: '500',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                >
                  <option value="">Selecciona el periodo</option>
                  <option value="2025-1">2025 - Primer Semestre</option>
                  <option value="2025-2">2025 - Segundo Semestre</option>
                  <option value="2026-1">2026 - Primer Semestre</option>
                  <option value="2026-2">2026 - Segundo Semestre</option>
                </select>
                <small style={{color: '#6c757d', marginTop: '5px'}}>
                  Selecciona el periodo académico para la matrícula
                </small>
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
                <th>Jornada</th>
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
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      fontWeight: '600',
                      background: matricula.jornada === 'diurna' ? '#fff3cd' : '#d1ecf1',
                      color: matricula.jornada === 'diurna' ? '#856404' : '#0c5460'
                    }}>
                      {matricula.jornada === 'diurna' ? '☀️ Diurna' : '🌙 Nocturna'}
                    </span>
                  </td>
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