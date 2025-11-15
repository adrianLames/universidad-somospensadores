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
    semestre: '',
    anio: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);

  useEffect(() => {
    fetchMatriculas();
    fetchCursos();
    fetchNoAprobadas();
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
      const response = await fetch(`${API_BASE}/cursos.php`);
      const data = await response.json();

      // Obtener profesores asignados para cada curso
      const cursosConProfesores = await Promise.all(
        data.map(async (curso) => {
          const profesorResponse = await fetch(`${API_BASE}/asignacion_docentes.php?curso_id=${curso.id}`);
          const profesorData = await profesorResponse.json();
          return {
            ...curso,
            profesor: profesorData.data.length > 0 ? profesorData.data[0] : null
          };
        })
      );

      setCursos(cursosConProfesores);
    } catch (error) {
      console.error('Error fetching cursos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const matriculaData = {
        ...currentMatricula,
        estudiante_id: user.id
      };

      const response = await fetch(`${API_BASE}/matriculas.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matriculaData),
      });

      if (response.ok) {
        await fetchMatriculas();
        resetForm();
        alert('Matrícula realizada exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al realizar la matrícula');
      }
    } catch (error) {
      console.error('Error saving matricula:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentMatricula({
      curso_id: '',
      semestre: '',
      anio: new Date().getFullYear()
    });
    setShowForm(false);
  };

  const cancelMatricula = async (id) => {
    if (window.confirm('¿Está seguro de cancelar esta matrícula?')) {
      try {
        const response = await fetch(`${API_BASE}/matriculas.php?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchMatriculas();
          alert('Matrícula cancelada exitosamente');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Error al cancelar la matrícula');
        }
      } catch (error) {
        console.error('Error deleting matricula:', error);
        alert('Error de conexión');
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
    fetch(`/api/verificar_prerequisitos.php?curso_id=${cursoId}&estudiante_id=${user.id}`)
      .then(response => response.json())
      .then(data => setPrerequisitos(data.data));
  };

  return (
    <div className="matriculas">
      <h2>🎓 Gestión de Matrículas</h2>
      
      {user.tipo === 'estudiante' && (
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Nueva Matrícula
        </button>
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
                  onChange={(e) => setCurrentMatricula({...currentMatricula, curso_id: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.codigo} - {curso.nombre} ({curso.creditos} créditos)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Semestre:</label>
                <select
                  value={currentMatricula.semestre}
                  onChange={(e) => setCurrentMatricula({...currentMatricula, semestre: e.target.value})}
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
                  value={currentMatricula.anio}
                  onChange={(e) => setCurrentMatricula({...currentMatricula, anio: e.target.value})}
                  required
                  min="2020"
                  max="2030"
                  disabled={loading}
                />
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
                <th>Curso</th>
                <th>Código</th>
                <th>Semestre</th>
                <th>Año</th>
                <th>Estado</th>
                {user.tipo === 'estudiante' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {matriculas.map(matricula => (
                <tr key={matricula.id}>
                  <td>{matricula.curso_nombre}</td>
                  <td><strong>{matricula.curso_codigo}</strong></td>
                  <td>{matricula.semestre}</td>
                  <td>{matricula.anio}</td>
                  <td>
                    <span className={`estado ${matricula.estado}`}>
                      {matricula.estado.toUpperCase()}
                    </span>
                  </td>
                  {user.tipo === 'estudiante' && matricula.estado === 'activa' && (
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => cancelMatricula(matricula.id)}>❌ Cancelar</button>
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