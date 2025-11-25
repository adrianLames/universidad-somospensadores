import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './GestionCursos.css';
import BackHomeButton from './BackHomeButton';

const GestionCursos = ({ user }) => {
  const [cursos, setCursos] = useState([]);
  const [filtroPrograma, setFiltroPrograma] = useState('');
  const [filtroJornada, setFiltroJornada] = useState('');
  const [programas, setProgramas] = useState([]);
  const [prerequisitos, setPrerequisitos] = useState([]); // Prerequisitos del curso seleccionado
  const [esDeCursosMap, setEsDeCursosMap] = useState({}); // Mapeo curso_id -> array de nombres
  const [allCursos, setAllCursos] = useState([]); // Para el select múltiple
  const [selectedPrereqs, setSelectedPrereqs] = useState([]); // IDs seleccionados en el form
  const [showForm, setShowForm] = useState(false);
  const [currentCurso, setCurrentCurso] = useState({
    id: null,
    codigo: '',
    nombre: '',
    descripcion: '',
    creditos: '',
    programa_id: '',
    facultad_id: '',
    jornada: 'diurna',
    activo: true,
    es_prerequisito: true, // Nuevo campo para marcar si puede ser prerequisito
    es_publico: false // Campo para marcar si el curso es público
  });
  const [loading, setLoading] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);

  useEffect(() => {
    fetchCursos();
    fetchProgramas();
    fetchAllCursos();
    fetchEsDeCursosTodos();
  }, []);

  // Traer para todos los cursos: en cuáles es prerequisito
  const fetchEsDeCursosTodos = async () => {
    try {
      const response = await fetch(`${API_BASE}/prerequisitos.php`);
      const data = await response.json();
      if (data && data.success && Array.isArray(data.data)) {
        // Agrupar por prerequisito_id
        const map = {};
        data.data.forEach(row => {
          if (!map[row.prerequisito_id]) map[row.prerequisito_id] = [];
          map[row.prerequisito_id].push(row.curso_nombre);
        });
        setEsDeCursosMap(map);
      } else {
        setEsDeCursosMap({});
      }
    } catch {
      setEsDeCursosMap({});
    }
  };

  // Filtrar cursos por programa y jornada
  let cursosFiltrados = cursos;
  if (filtroPrograma) {
    cursosFiltrados = cursosFiltrados.filter(c => String(c.programa_id) === String(filtroPrograma));
  }
  if (filtroJornada) {
    cursosFiltrados = cursosFiltrados.filter(c => String(c.jornada) === String(filtroJornada));
  }

  // Traer todos los cursos para el select de prerequisitos
  const fetchAllCursos = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php`);
      const data = await response.json();
      setAllCursos(data);
    } catch (error) {
      setAllCursos([]);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php`);
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Error fetching cursos:', error);
    }
  };

  const fetchProgramas = async () => {
    try {
      const response = await fetch(`${API_BASE}/programas.php`);
      const data = await response.json();
      setProgramas(data);
    } catch (error) {
      console.error('Error fetching programas:', error);
    }
  };

  // Cuando cambia el programa seleccionado, asignar automáticamente la facultad
  useEffect(() => {
    if (currentCurso.programa_id && programas.length > 0) {
      const prog = programas.find(p => String(p.id) === String(currentCurso.programa_id));
      if (prog && prog.facultad_id) {
        setCurrentCurso(c => ({ ...c, facultad_id: prog.facultad_id }));
      }
    }
    // Si se borra el programa, limpiar facultad
    if (!currentCurso.programa_id) {
      setCurrentCurso(c => ({ ...c, facultad_id: '' }));
    }
  }, [currentCurso.programa_id, programas]);

  const fetchPrerequisitos = async (cursoId) => {
    try {
      // Prerequisitos de este curso
      const response = await fetch(`${API_BASE}/prerequisitos.php?curso_id=${cursoId}`);
      const data = await response.json();
      if (data && data.success) {
        setPrerequisitos(data.data);
        setSelectedPrereqs(data.data.map(p => p.prerequisito_id));
      } else {
        setPrerequisitos([]);
        setSelectedPrereqs([]);
      }
    } catch (error) {
      setPrerequisitos([]);
      setSelectedPrereqs([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = currentCurso.id ? 'PUT' : 'POST';
      const url = currentCurso.id 
        ? `${API_BASE}/cursos.php?id=${currentCurso.id}`
        : `${API_BASE}/cursos.php`;
      // Asegurarse de enviar facultad_id correcto
      const cursoEnviar = { ...currentCurso };
      if (!cursoEnviar.facultad_id && cursoEnviar.programa_id && programas.length > 0) {
        const prog = programas.find(p => String(p.id) === String(cursoEnviar.programa_id));
        if (prog && prog.facultad_id) {
          cursoEnviar.facultad_id = prog.facultad_id;
        }
      }
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cursoEnviar),
      });

      if (response.ok) {
        // Guardar prerequisitos si hay seleccionados
        if (selectedPrereqs.length > 0) {
          await fetch(`${API_BASE}/prerequisitos.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ curso_id: currentCurso.id || (await response.json()).id, prerequisitos: selectedPrereqs })
          });
        }
        await fetchCursos();
        await fetchAllCursos(); // Recargar lista de cursos para el select
        resetForm();
        alert('Curso guardado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al guardar el curso');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentCurso({
      id: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      creditos: '',
      programa_id: '',
      facultad_id: '',
      jornada: 'diurna',
      activo: true,
      es_prerequisito: true,
      es_publico: false
    });
    setSelectedPrereqs([]);
    setShowForm(false);
  };

  const editCurso = (curso) => {
    setCurrentCurso({
      ...curso,
      activo: curso.activo === undefined ? true : Boolean(Number(curso.activo)),
      jornada: curso.jornada || 'diurna',
    });
    fetchPrerequisitos(curso.id);
    setShowForm(true);
  };

  const deleteCurso = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este curso?')) {
      try {
        const response = await fetch(`${API_BASE}/cursos.php?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchCursos();
          alert('Curso eliminado exitosamente');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Error al eliminar el curso');
        }
      } catch (error) {
        console.error('Error deleting curso:', error);
        alert('Error de conexión');
      }
    }
  };

  const handleCursoSelect = (cursoId) => {
    setSelectedCurso(cursoId);
    fetchPrerequisitos(cursoId);
  };

  // Tarjetas resumen
  const totalCursos = cursos.length;
  const activos = cursos.filter(c => String(c.activo) === '1' || c.activo === 1 || c.activo === true).length;
  const totalProgramas = programas.length;
  const totalCreditos = cursos.reduce((acc, c) => acc + (parseInt(c.creditos) || 0), 0);

  return (
    <div className="gestion-cursos">
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
          <span style={{background:'#1a3c7b', color:'#fff', borderRadius:'50%', padding:'0.5rem', fontSize:'1.5rem'}}>
            <span role="img" aria-label="curso">📖</span>
          </span>
          <h2 style={{margin:0, fontWeight:700}}>Gestión de Cursos</h2>
        </div>
        <BackHomeButton className="small-btn right" label="Inicio" />
      </div>
      <div className="cursos-resumen-cards" style={{display:'flex', gap:'2rem', margin:'1.2rem 0', justifyContent:'center'}}>
        <div className="resumen-card"><div>Total Cursos</div><div className="resumen-value">{totalCursos}</div></div>
        <div className="resumen-card"><div>Activos</div><div className="resumen-value" style={{color:'#1bbd7e'}}>{activos}</div></div>
        <div className="resumen-card"><div>Programas</div><div className="resumen-value">{totalProgramas}</div></div>
        <div className="resumen-card"><div>Créditos Total</div><div className="resumen-value">{totalCreditos}</div></div>
      </div>
      <div className="cursos-filtros-panel" style={{display:'flex', gap:'1.2rem', alignItems:'center', marginBottom:'1.2rem', justifyContent:'center'}}>
        <button 
          className="btn-primary"
          style={{fontWeight:600, fontSize:'1rem'}}
          onClick={() => setShowForm(true)}
        >
          <span role="img" aria-label="nuevo">🟦</span> Nuevo Curso
        </button>
        <input
          type="text"
          placeholder="🔍 Buscar cursos..."
          style={{padding:'0.5em 1em', borderRadius:8, border:'1px solid #b5c6e0', fontSize:'1rem', width:'220px'}}
          value={filtroPrograma}
          onChange={e => setFiltroPrograma(e.target.value)}
        />
        <select value={filtroPrograma} onChange={e => setFiltroPrograma(e.target.value)} style={{padding:'0.5em 1em', borderRadius:8, border:'1px solid #b5c6e0', fontSize:'1rem'}}>
          <option value="">Todos los programas</option>
          {programas.map(programa => (
            <option key={programa.id} value={programa.id}>{programa.nombre}</option>
          ))}
        </select>
        <select value={filtroJornada} onChange={e => setFiltroJornada(e.target.value)} style={{padding:'0.5em 1em', borderRadius:8, border:'1px solid #b5c6e0', fontSize:'1rem'}}>
          <option value="">Todas las jornadas</option>
          <option value="diurna">Diurna</option>
          <option value="nocturna">Nocturna</option>
        </select>
      </div>
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{currentCurso.id ? '✏️ Editar' : '➕ Nuevo'} Curso</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Código:</label>
                <input
                  type="text"
                  value={currentCurso.codigo}
                  onChange={(e) => setCurrentCurso({...currentCurso, codigo: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={currentCurso.nombre}
                  onChange={(e) => setCurrentCurso({...currentCurso, nombre: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={currentCurso.descripcion}
                  onChange={(e) => setCurrentCurso({...currentCurso, descripcion: e.target.value})}
                  rows="3"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Créditos:</label>
                <input
                  type="number"
                  value={currentCurso.creditos}
                  onChange={(e) => setCurrentCurso({...currentCurso, creditos: e.target.value})}
                  required
                  min="1"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Programa:</label>
                <select
                  value={currentCurso.programa_id}
                  onChange={(e) => setCurrentCurso({...currentCurso, programa_id: e.target.value})}
                  disabled={loading}
                >
                  <option value="">Seleccionar programa</option>
                  {programas.map(programa => (
                    <option key={programa.id} value={programa.id}>
                      {programa.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Jornada:</label>
                <select
                  value={currentCurso.jornada}
                  onChange={e => setCurrentCurso({ ...currentCurso, jornada: e.target.value })}
                  disabled={loading}
                >
                  <option value="diurna">Diurna</option>
                  <option value="nocturna">Nocturna</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 'bold', color: '#1a3c7b' }}>
                  ¿Activo?
                </label>
                <input
                  type="checkbox"
                  checked={!!currentCurso.activo}
                  onChange={e => setCurrentCurso({...currentCurso, activo: e.target.checked})}
                  disabled={loading}
                  style={{ marginLeft: 8 }}
                />
              </div>
              <div className="form-group">
                <label>Prerequisitos:</label>
                <div style={{
                  border: '1px solid #b5c6e0',
                  borderRadius: 6,
                  padding: '0.5em 0.7em',
                  background: '#f8fafd',
                  maxHeight: 160,
                  overflowY: 'auto',
                  marginTop: 2
                }}>
                  {allCursos
                    .filter(c =>
                      Number(c.es_prerequisito) === 1 &&
                      (!currentCurso.id || c.id !== currentCurso.id) &&
                      (String(c.programa_id) === String(currentCurso.programa_id))
                    )
                    .map(curso => (
                      <label key={curso.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, cursor: 'pointer', fontWeight: 500, color: '#1a3c7b', gap: '0.5em' }}>
                        {curso.nombre}
                        <input
                          type="checkbox"
                          checked={selectedPrereqs.includes(String(curso.id))}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedPrereqs(prev => [...prev, String(curso.id)]);
                            } else {
                              setSelectedPrereqs(prev => prev.filter(id => id !== String(curso.id)));
                            }
                          }}
                          disabled={loading}
                          style={{ marginLeft: 8 }}
                        />
                      </label>
                    ))}
                  {allCursos.filter(c =>
                    Number(c.es_prerequisito) === 1 &&
                    (!currentCurso.id || c.id !== currentCurso.id) &&
                    (String(c.programa_id) === String(currentCurso.programa_id))
                  ).length === 0 && (
                    <span style={{ color: '#888' }}>No hay cursos elegibles como prerequisito.</span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 'bold', color: '#1a3c7b' }}>
                  ¿Este curso puede ser prerequisito?
                </label>
                <div style={{ display: 'flex', gap: '1em', marginTop: 4 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!currentCurso.es_prerequisito}
                      onChange={e => setCurrentCurso({ ...currentCurso, es_prerequisito: true })}
                      disabled={loading}
                    /> Sí
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={!currentCurso.es_prerequisito}
                      onChange={e => setCurrentCurso({ ...currentCurso, es_prerequisito: false })}
                      disabled={loading}
                    /> No
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 'bold', color: '#1a3c7b' }}>
                  ¿Curso público? (Accesible para usuarios públicos)
                </label>
                <input
                  type="checkbox"
                  checked={!!currentCurso.es_publico}
                  onChange={e => setCurrentCurso({...currentCurso, es_publico: e.target.checked})}
                  disabled={loading}
                  style={{ marginLeft: 8 }}
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : '💾 Guardar'}
                </button>
                <button type="button" onClick={resetForm} disabled={loading}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="cursos-list">
        {cursosFiltrados.length === 0 ? (
          <div className="no-data">
            <p>No hay cursos registrados</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Créditos</th>
                <th>Programa</th>
                <th>Jornada</th>
                <th>Activo</th>
                <th>Público</th>
                <th>Fecha Creación</th>
                <th>¿Puede ser prerequisito?</th>
                <th>Es prerequisito de</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursosFiltrados.map(curso => (
                <tr key={curso.id}>
                  <td><strong>{curso.codigo}</strong></td>
                  <td>{curso.nombre}</td>
                  <td>{curso.creditos}</td>
                  <td>{curso.programa_nombre || 'Sin programa'}</td>
                  <td>{curso.jornada === 'nocturna' ? 'Nocturna' : curso.jornada === 'diurna' ? 'Diurna' : '-'}</td>
                  <td>{String(curso.activo) === '1' || curso.activo === 1 || curso.activo === true ? 'Sí' : 'No'}</td>
                  <td>
                    {curso.es_publico === 1 || curso.es_publico === true || curso.es_publico === '1' ? 
                      <span style={{color: '#1bbd7e', fontWeight: 'bold'}}>✓ Sí</span> : 
                      <span style={{color: '#888'}}>No</span>
                    }
                  </td>
                  <td>{curso.fecha_creacion ? new Date(curso.fecha_creacion).toLocaleDateString() : '-'}</td>
                  <td>{curso.es_prerequisito === 1 || curso.es_prerequisito === true || curso.es_prerequisito === '1' ? 'Sí' : 'No'}</td>
                  <td>
                    {Array.isArray(esDeCursosMap[curso.id]) && esDeCursosMap[curso.id].length > 0
                      ? esDeCursosMap[curso.id].join(', ')
                      : <span style={{ color: '#888' }}>-</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => editCurso(curso)}>✏️ Editar</button>
                      <button onClick={() => deleteCurso(curso.id)}>🗑️ Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedCurso && (
        <div className="prerequisitos">
          <h2>Prerequisitos</h2>
          {prerequisitos.length > 0 ? (
            <ul>
              {prerequisitos.map(prerequisito => (
                <li key={prerequisito.id}>{prerequisito.prerequisito_nombre}</li>
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

export default GestionCursos;