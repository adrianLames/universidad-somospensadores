import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './GestionCursos.css';

const GestionCursos = ({ user }) => {
  const [cursos, setCursos] = useState([]);
  const [filtroPrograma, setFiltroPrograma] = useState('');
  const [filtroJornada, setFiltroJornada] = useState('');
  const [programas, setProgramas] = useState([]);
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
  }, []);

  // Filtrar cursos por programa y jornada
  let cursosFiltrados = cursos;
  if (filtroPrograma) {
    cursosFiltrados = cursosFiltrados.filter(c => String(c.programa_id) === String(filtroPrograma));
  }
  if (filtroJornada) {
    cursosFiltrados = cursosFiltrados.filter(c => String(c.jornada) === String(filtroJornada));
  }

  const fetchCursos = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php`);
      const result = await response.json();
      const data = result.success ? result.data : (Array.isArray(result) ? result : []);
      setCursos(data);
    } catch (error) {
      console.error('Error fetching cursos:', error);
    }
  };

  const fetchProgramas = async () => {
    try {
      const response = await fetch(`${API_BASE}/programas.php`);
      const data = await response.json();
      const programasData = data.success ? data.data : (Array.isArray(data) ? data : []);
      setProgramas(programasData);
    } catch (error) {
      console.error('Error fetching programas:', error);
      setProgramas([]);
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
        await fetchCursos();
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
    setShowForm(false);
  };

  const editCurso = (curso) => {
    setCurrentCurso({
      ...curso,
      activo: curso.activo === undefined ? true : Boolean(Number(curso.activo)),
      jornada: curso.jornada || 'diurna',
    });
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
                <label style={{ fontWeight: 'bold' }}>
                  ¿Activo?
                </label>
                <div style={{ display: 'flex', gap: '1em', marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3em', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!currentCurso.activo}
                      onChange={e => setCurrentCurso({ ...currentCurso, activo: true })}
                      disabled={loading}
                    /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3em', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!currentCurso.activo}
                      onChange={e => setCurrentCurso({ ...currentCurso, activo: false })}
                      disabled={loading}
                    /> No
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>
                  ¿Este curso puede ser prerequisito?
                </label>
                <div style={{ display: 'flex', gap: '1em', marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3em', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!currentCurso.es_prerequisito}
                      onChange={e => setCurrentCurso({ ...currentCurso, es_prerequisito: true })}
                      disabled={loading}
                    /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3em', cursor: 'pointer' }}>
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
                <label style={{ fontWeight: 'bold' }}>
                  ¿Curso público? (Accesible para usuarios públicos)
                </label>
                <div style={{ display: 'flex', gap: '1em', marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3em', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!currentCurso.es_publico}
                      onChange={e => setCurrentCurso({ ...currentCurso, es_publico: true })}
                      disabled={loading}
                    /> Sí
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3em', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!currentCurso.es_publico}
                      onChange={e => setCurrentCurso({ ...currentCurso, es_publico: false })}
                      disabled={loading}
                    /> No
                  </label>
                </div>
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
    </div>
  );
};

export default GestionCursos;