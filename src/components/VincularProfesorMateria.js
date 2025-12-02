import React, { useEffect, useState } from 'react';
import './VincularProfesorMateria.css';
import { apiRequest, getFacultades, getProgramasByFacultad, getCursosByPrograma } from '../config/api';

// Obtener usuario autenticado desde localStorage (ajusta según tu contexto de auth)
const getUsuarioActual = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    return usuario || {};
  } catch {
    return {};
  }
};

function VincularProfesorMateria() {
  const usuarioActual = getUsuarioActual();
  const [profesores, setProfesores] = useState([]);
    // Estados para el modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    const [asignacionEditar, setAsignacionEditar] = useState(null);
    const [editMateriaId, setEditMateriaId] = useState('');
    const [editAnio, setEditAnio] = useState('');
    const [editSemestre, setEditSemestre] = useState('');
  const [materias, setMaterias] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [profesorId, setProfesorId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [facultadId, setFacultadId] = useState('');
  const [facultadBloqueada, setFacultadBloqueada] = useState(false);
  const [programaId, setProgramaId] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [vinculaciones, setVinculaciones] = useState([]);
  const [cargandoVinculaciones, setCargandoVinculaciones] = useState(false);
  // cargar datos iniciales: profesores, facultades y materias
    // Cuando cambia el profesor seleccionado, autocompletar facultad
    useEffect(() => {
      if (!profesorId) {
        setFacultadId('');
        setFacultadBloqueada(false);
        return;
      }
      const prof = profesores.find(p => String(p.id) === String(profesorId));
      if (prof && prof.facultad_id) {
        setFacultadId(prof.facultad_id);
        setFacultadBloqueada(true);
      } else {
        setFacultadId('');
        setFacultadBloqueada(false);
      }
    }, [profesorId, profesores]);
  useEffect(() => {
    (async () => {
      try {
        const profs = await apiRequest('usuarios.php?tipo=docente');
        setProfesores(Array.isArray(profs) ? profs : []);
      } catch (e) {
        setProfesores([]);
      }

      try {
        const f = await getFacultades();
        setFacultades(Array.isArray(f) ? f : []);
      } catch (e) {
        setFacultades([]);
      }

      try {
        const mats = await apiRequest('cursos.php');
        setMaterias(Array.isArray(mats) ? mats : []);
      } catch (e) {
        setMaterias([]);
      }

      // Cargar vinculaciones
      cargarVinculaciones();
    })();
  }, []);
  // Función para cargar vinculaciones (todas si admin, solo propias si profesor)
  const cargarVinculaciones = async () => {
    setCargandoVinculaciones(true);
    try {
      let url = 'asignacion_docentes.php';
      if (usuarioActual.rol === 'docente' && usuarioActual.id) {
        url += `?usuario_id=${usuarioActual.id}`;
      }
      const res = await apiRequest(url);
      setVinculaciones(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (e) {
      setVinculaciones([]);
    }
    setCargandoVinculaciones(false);
  };

  // cuando cambia la facultad, cargar programas
  useEffect(() => {
    (async () => {
      if (!facultadId) {
        setProgramas([]);
        setProgramaId('');
        return;
      }
      try {
        const progs = await getProgramasByFacultad(facultadId);
        setProgramas(Array.isArray(progs) ? progs : []);
      } catch (err) {
        setProgramas([]);
      }
    })();
  }, [facultadId]);

  // cuando cambia el programa, cargar materias por programa
  useEffect(() => {
    (async () => {
      if (!programaId) {
        // si no hay programa seleccionado, dejar materias generales
        try {
          const mats = await apiRequest('cursos.php');
          setMaterias(Array.isArray(mats) ? mats : []);
        } catch (e) {
          setMaterias([]);
        }
        return;
      }
      try {
        const mats = await getCursosByPrograma(programaId);
        setMaterias(Array.isArray(mats) ? mats : []);
      } catch (err) {
        setMaterias([]);
      }
    })();
  }, [programaId]);
  

  const handleVincular = async (e) => {
    e.preventDefault();
    setMensaje('');
    if (!profesorId || !materiaId) {
      setMensaje('Selecciona profesor y materia.');
      return;
    }
    try {
      await apiRequest('vinculaciones.php', {
        method: 'POST',
        body: JSON.stringify({ usuario_id: profesorId, curso_id: materiaId })
      });
      setMensaje('¡Vinculación exitosa!');
      cargarVinculaciones();
    } catch (err) {
      setMensaje(err?.message || 'Error de red o servidor.');
    }
  };

  return (
    <div className="vincular-profesor-materia-bg">
      <div className="vincular-profesor-materia-card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 style={{margin: '0 0 0.5rem 0', color: '#1766c2'}}>Vincular Profesor con Materia</h2>
        </div>
        <p>Asocie profesores con las materias que impartirán durante el semestre académico</p>
        <form onSubmit={handleVincular}>
          <div className="form-row" style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>Profesor</label>
              <select value={profesorId} onChange={e => setProfesorId(e.target.value)} required>
                <option value="">Selecciona un profesor</option>
                {profesores.map(prof => (
                  <option key={prof.id} value={prof.id}>{prof.nombres} {prof.apellidos}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label>Facultad</label>
              <select value={facultadId} onChange={e => setFacultadId(e.target.value)} required>
                <option value="">Todas las facultades</option>
                {facultades.map(f => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label>Programa</label>
              <select value={programaId} onChange={e => setProgramaId(e.target.value)} required>
                <option value="">Primero selecciona una facultad</option>
                {programas.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label>Materia</label>
              <select value={materiaId} onChange={e => setMateriaId(e.target.value)} required>
                <option value="">Selecciona una materia</option>
                {materias.map(mat => (
                  <option key={mat.id} value={mat.id}>{mat.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1.2rem'}}>
            <button type="submit" className="btn-primary"><span role="img" aria-label="vincular">🔗</span> Vincular Profesor</button>
          </div>
        </form>
        <div className="vincular-profesor-materia-list-card">
          <h3>Profesor y materia vinculada</h3>
          <p>Listado de todas las vinculaciones activas en el sistema</p>
          <table className="vincular-profesor-materia-table">
            <thead>
              <tr>
                <th>Profesor</th>
                <th>Materia</th>
                <th>Programa</th>
                <th>Facultad</th>
                <th>Año</th>
                <th>Semestre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vinculaciones.map(v => (
                <tr key={v.id}>
                  <td>{v.nombres} {v.apellidos}</td>
                  <td>{v.materia}</td>
                  <td><span className="tag">{v.programa_nombre}</span></td>
                  <td><span className="tag">{v.facultad_nombre}</span></td>
                  <td>{v.anio}</td>
                  <td>{v.semestre}</td>
                  <td>
                    <button className="btn-icon" title="Editar"><span role="img" aria-label="editar">✏️</span></button>
                    <button className="btn-icon" title="Eliminar"><span role="img" aria-label="eliminar">🗑️</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
// Fin del componente

}
export default VincularProfesorMateria;
