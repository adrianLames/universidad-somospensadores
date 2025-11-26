import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config/api';
import './GestionPrerequisitos.css';
import BackHomeButton from './BackHomeButton';

const GestionPrerequisitos = ({ user }) => {
  const [cursos, setCursos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [selectedPrograma, setSelectedPrograma] = useState('');
  const [prerequisitosMap, setPrerequisitosMap] = useState({});
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [availableCursos, setAvailableCursos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [vistaActual, setVistaActual] = useState('diagrama'); // diagrama, lista, arbol

  const fetchProgramas = async () => {
    try {
      const response = await fetch(`${API_BASE}/programas.php`);
      const data = await response.json();
      const programasData = data.success ? data.data : (Array.isArray(data) ? data : []);
      setProgramas(programasData);
      if (programasData.length > 0) {
        setSelectedPrograma(programasData[0].id);
      }
    } catch (error) {
      console.error('Error fetching programas:', error);
      setProgramas([]);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/prerequisitos.php`);
      const data = await response.json();
      
      if (data && data.success && Array.isArray(data.data)) {
        const map = {};
        data.data.forEach(row => {
          if (!map[row.curso_id]) {
            map[row.curso_id] = [];
          }
          map[row.curso_id].push({
            id: row.prerequisito_id,
            nombre: row.prerequisito_nombre,
            relacion_id: row.id
          });
        });
        setPrerequisitosMap(map);
      }
    } catch (error) {
      console.error('Error fetching prerequisitos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCursosByPrograma = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/cursos.php`);
      const result = await response.json();
      const data = result.success ? result.data : (Array.isArray(result) ? result : []);
      const filtered = data.filter(c => String(c.programa_id) === String(selectedPrograma));
      
      // Ordenar por semestre
      filtered.sort((a, b) => {
        const semestreA = parseInt(a.semestre) || 0;
        const semestreB = parseInt(b.semestre) || 0;
        return semestreA - semestreB;
      });
      
      setCursos(filtered);
      setAvailableCursos(filtered.filter(c => c.es_prerequisito === 1 || c.es_prerequisito === true));
    } catch (error) {
      console.error('Error fetching cursos:', error);
      setCursos([]);
      setAvailableCursos([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPrograma]);

  useEffect(() => {
    fetchProgramas();
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedPrograma) {
      fetchCursosByPrograma();
    }
  }, [selectedPrograma, fetchCursosByPrograma]);

  const detectarCiclos = (cursoId, prerequisitoId, prerequisitosActuales = {}) => {
    // Crear copia temporal del mapa con el nuevo prerequisito
    const tempMap = { ...prerequisitosActuales };
    if (!tempMap[cursoId]) tempMap[cursoId] = [];
    tempMap[cursoId] = [...tempMap[cursoId], { id: prerequisitoId }];

    // DFS para detectar ciclos
    const visitados = new Set();
    const enProceso = new Set();

    const tieneCiclo = (id) => {
      if (enProceso.has(id)) return true;
      if (visitados.has(id)) return false;

      visitados.add(id);
      enProceso.add(id);

      const prereqs = tempMap[id] || [];
      for (let prereq of prereqs) {
        if (tieneCiclo(prereq.id)) return true;
      }

      enProceso.delete(id);
      return false;
    };

    return tieneCiclo(cursoId);
  };

  const agregarPrerequisito = async (cursoId, prerequisitoId) => {
    // Validar ciclo
    if (detectarCiclos(cursoId, prerequisitoId, prerequisitosMap)) {
      alert('⚠️ Error: Esta asignación crearía una dependencia circular. No se puede agregar.');
      return;
    }

    try {
      setLoading(true);
      const prerequisitosActuales = prerequisitosMap[cursoId] || [];
      const nuevosIds = [...prerequisitosActuales.map(p => p.id), prerequisitoId];

      const response = await fetch(`${API_BASE}/prerequisitos.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curso_id: cursoId,
          prerequisitos: nuevosIds
        })
      });

      if (response.ok) {
        await fetchAllData();
        await fetchCursosByPrograma();
        alert('✅ Prerequisito agregado exitosamente');
      }
    } catch (error) {
      alert('❌ Error al agregar prerequisito');
    } finally {
      setLoading(false);
    }
  };

  const eliminarPrerequisito = async (relacionId, cursoId) => {
    if (!window.confirm('¿Eliminar este prerequisito?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/prerequisitos.php?id=${relacionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAllData();
        await fetchCursosByPrograma();
        alert('✅ Prerequisito eliminado');
      }
    } catch (error) {
      alert('❌ Error al eliminar prerequisito');
    } finally {
      setLoading(false);
    }
  };

  const abrirPanelEdicion = (curso) => {
    setSelectedCurso(curso);
    setSearchTerm('');
    setShowPanel(true);
  };

  const cerrarPanel = () => {
    setShowPanel(false);
    setSelectedCurso(null);
    setSearchTerm('');
  };

  const getCadenaPrerequisitos = (cursoId, visitados = new Set()) => {
    if (visitados.has(cursoId)) return ['[Ciclo detectado]'];
    visitados.add(cursoId);

    const prereqs = prerequisitosMap[cursoId] || [];
    if (prereqs.length === 0) return [];

    const cadena = [];
    prereqs.forEach(p => {
      const curso = cursos.find(c => c.id === p.id);
      if (curso) {
        cadena.push(curso.nombre);
        const subPrereqs = getCadenaPrerequisitos(p.id, new Set(visitados));
        if (subPrereqs.length > 0) {
          cadena.push(...subPrereqs.map(s => `  → ${s}`));
        }
      }
    });
    return cadena;
  };

  // Agrupar cursos por semestre
  const cursosPorSemestre = cursos.reduce((acc, curso) => {
    const semestre = curso.semestre || 'Sin semestre';
    if (!acc[semestre]) acc[semestre] = [];
    acc[semestre].push(curso);
    return acc;
  }, {});

  const semestresOrdenados = Object.keys(cursosPorSemestre).sort((a, b) => {
    if (a === 'Sin semestre') return 1;
    if (b === 'Sin semestre') return -1;
    return parseInt(a) - parseInt(b);
  });

  // Filtrar cursos disponibles para búsqueda
  const cursosDisponibles = availableCursos.filter(c => 
    c.id !== selectedCurso?.id &&
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !(prerequisitosMap[selectedCurso?.id] || []).some(p => p.id === c.id)
  );

  // Estadísticas
  const totalCursos = cursos.length;
  const cursosSinPrerequisitos = cursos.filter(c => !(prerequisitosMap[c.id] || []).length).length;
  const totalRelaciones = Object.values(prerequisitosMap).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="gestion-prerequisitos">
      <div className="page-header">
        <div className="header-title">
          <span className="icon">🔗</span>
          <h2>Gestión de Prerequisitos</h2>
        </div>
        <BackHomeButton className="small-btn right" label="Inicio" />
      </div>

      {/* Estadísticas */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">Total Cursos</div>
          <div className="stat-value">{totalCursos}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sin Prerequisitos</div>
          <div className="stat-value" style={{color: '#1bbd7e'}}>{cursosSinPrerequisitos}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Relaciones</div>
          <div className="stat-value" style={{color: '#d4af37'}}>{totalRelaciones}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Programa:</label>
          <select 
            value={selectedPrograma} 
            onChange={e => setSelectedPrograma(e.target.value)}
            disabled={loading}
          >
            <option value="">Seleccionar programa</option>
            {programas.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="view-toggles">
          <button 
            className={vistaActual === 'diagrama' ? 'active' : ''}
            onClick={() => setVistaActual('diagrama')}
          >
            📊 Diagrama
          </button>
          <button 
            className={vistaActual === 'lista' ? 'active' : ''}
            onClick={() => setVistaActual('lista')}
          >
            📋 Lista
          </button>
          <button 
            className={vistaActual === 'arbol' ? 'active' : ''}
            onClick={() => setVistaActual('arbol')}
          >
            🌳 Árbol
          </button>
        </div>
      </div>

      {loading && <div className="loading-overlay"><div className="spinner"></div></div>}

      {/* Vista Diagrama por Semestres */}
      {vistaActual === 'diagrama' && (
        <div className="diagrama-container">
          {semestresOrdenados.map(semestre => (
            <div key={semestre} className="semestre-group">
              <div className="semestre-header">
                <h3>Semestre {semestre}</h3>
                <span className="curso-count">{cursosPorSemestre[semestre].length} cursos</span>
              </div>
              <div className="cursos-grid">
                {cursosPorSemestre[semestre].map(curso => {
                  const prereqs = prerequisitosMap[curso.id] || [];
                  return (
                    <div 
                      key={curso.id} 
                      className={`curso-card ${prereqs.length === 0 ? 'sin-prereqs' : ''}`}
                      onClick={() => abrirPanelEdicion(curso)}
                    >
                      <div className="curso-codigo">{curso.codigo}</div>
                      <div className="curso-nombre">{curso.nombre}</div>
                      <div className="curso-creditos">{curso.creditos} créditos</div>
                      {prereqs.length > 0 && (
                        <div className="prereqs-badge">
                          <span>🔗 {prereqs.length} prerequisito{prereqs.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {prereqs.length === 0 && (
                        <div className="prereqs-badge empty">
                          <span>✓ Sin prerequisitos</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista Lista */}
      {vistaActual === 'lista' && (
        <div className="lista-container">
          <table className="prerequisitos-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Código</th>
                <th>Semestre</th>
                <th>Prerequisitos</th>
                <th>Cadena Completa</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map(curso => {
                const prereqs = prerequisitosMap[curso.id] || [];
                const cadena = getCadenaPrerequisitos(curso.id);
                return (
                  <tr key={curso.id}>
                    <td><strong>{curso.nombre}</strong></td>
                    <td>{curso.codigo}</td>
                    <td>{curso.semestre || '-'}</td>
                    <td>
                      {prereqs.length > 0 ? (
                        <div className="prereqs-list">
                          {prereqs.map(p => (
                            <span key={p.id} className="prereq-tag">{p.nombre}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="no-prereqs">Sin prerequisitos</span>
                      )}
                    </td>
                    <td>
                      {cadena.length > 0 ? (
                        <div className="cadena-prereqs">
                          {cadena.map((item, idx) => (
                            <div key={idx} className="cadena-item">{item}</div>
                          ))}
                        </div>
                      ) : (
                        <span className="no-prereqs">-</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn-edit"
                        onClick={() => abrirPanelEdicion(curso)}
                      >
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Vista Árbol */}
      {vistaActual === 'arbol' && (
        <div className="arbol-container">
          {cursos.map(curso => {
            const prereqs = prerequisitosMap[curso.id] || [];
            if (prereqs.length === 0) return null;
            
            return (
              <div key={curso.id} className="arbol-item">
                <div className="arbol-curso" onClick={() => abrirPanelEdicion(curso)}>
                  <strong>{curso.nombre}</strong> ({curso.codigo})
                </div>
                <div className="arbol-prerequisitos">
                  {prereqs.map(p => {
                    const subPrereqs = prerequisitosMap[p.id] || [];
                    return (
                      <div key={p.id} className="arbol-branch">
                        <div className="arbol-node">
                          ↳ {p.nombre}
                          {subPrereqs.length > 0 && (
                            <span className="sub-count"> ({subPrereqs.length} sub-prerequisitos)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Panel Lateral de Edición */}
      {showPanel && selectedCurso && (
        <div className="panel-overlay" onClick={cerrarPanel}>
          <div className="panel-lateral" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <div>
                <h3>{selectedCurso.nombre}</h3>
                <p className="panel-subtitle">{selectedCurso.codigo} - Semestre {selectedCurso.semestre || 'N/A'}</p>
              </div>
              <button className="btn-close" onClick={cerrarPanel}>✕</button>
            </div>

            <div className="panel-body">
              {/* Prerequisitos Actuales */}
              <div className="section">
                <h4>Prerequisitos Actuales</h4>
                {(prerequisitosMap[selectedCurso.id] || []).length > 0 ? (
                  <div className="prerequisitos-actuales">
                    {(prerequisitosMap[selectedCurso.id] || []).map(prereq => (
                      <div key={prereq.id} className="prereq-item">
                        <div className="prereq-info">
                          <span className="prereq-nombre">{prereq.nombre}</span>
                          <span className="prereq-codigo">
                            {cursos.find(c => c.id === prereq.id)?.codigo}
                          </span>
                        </div>
                        <button 
                          className="btn-delete-small"
                          onClick={() => eliminarPrerequisito(prereq.relacion_id, selectedCurso.id)}
                          disabled={loading}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Este curso no tiene prerequisitos configurados.</p>
                )}
              </div>

              {/* Agregar Prerequisito */}
              <div className="section">
                <h4>Agregar Prerequisito</h4>
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Buscar curso..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <div className="cursos-disponibles">
                  {searchTerm && cursosDisponibles.length > 0 ? (
                    cursosDisponibles.slice(0, 5).map(curso => (
                      <div 
                        key={curso.id} 
                        className="curso-disponible"
                        onClick={() => {
                          agregarPrerequisito(selectedCurso.id, curso.id);
                          setSearchTerm('');
                        }}
                      >
                        <div>
                          <div className="curso-nombre">{curso.nombre}</div>
                          <div className="curso-info">
                            {curso.codigo} - Semestre {curso.semestre || 'N/A'}
                          </div>
                        </div>
                        <button className="btn-add-small">+</button>
                      </div>
                    ))
                  ) : searchTerm ? (
                    <p className="no-data">No se encontraron cursos</p>
                  ) : (
                    <p className="hint">Escribe para buscar cursos disponibles</p>
                  )}
                </div>
              </div>

              {/* Cadena de Prerequisitos */}
              <div className="section">
                <h4>Cadena de Prerequisitos</h4>
                <div className="cadena-completa">
                  {getCadenaPrerequisitos(selectedCurso.id).length > 0 ? (
                    getCadenaPrerequisitos(selectedCurso.id).map((item, idx) => (
                      <div key={idx} className="cadena-step">{item}</div>
                    ))
                  ) : (
                    <p className="no-data">No hay prerequisitos previos</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPrerequisitos;
