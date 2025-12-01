import React, { useState, useEffect } from 'react';
import './GestionSemestre.css';

const API_BASE = 'http://localhost/universidad-somospensadores-main/api';

function GestionSemestre({ user }) {
    const [semestre, setSemestre] = useState('');
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [periodo, setPeriodo] = useState('1');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [cuposDisponibles, setCuposDisponibles] = useState('');
    
    const [cursos, setCursos] = useState([]);
    const [cursosSeleccionados, setCursosSeleccionados] = useState(new Set());
    const [cursosActivos, setCursosActivos] = useState([]);
    
    const [programas, setProgramas] = useState([]);
    const [programaFiltro, setProgramaFiltro] = useState('');
    const [jornadaFiltro, setJornadaFiltro] = useState('');
    const [busqueda, setBusqueda] = useState('');
    
    const [semestresDisponibles, setSemestresDisponibles] = useState([]);
    const [semestreActual, setSemestreActual] = useState('');
    const [vistaActual, setVistaActual] = useState('configurar'); // configurar, activos
    
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        fetchProgramas();
        fetchSemestresDisponibles();
        const semestreGenerado = `${anio}-${periodo}`;
        setSemestre(semestreGenerado);
    }, []);

    useEffect(() => {
        const semestreGenerado = `${anio}-${periodo}`;
        setSemestre(semestreGenerado);
    }, [anio, periodo]);

    useEffect(() => {
        if (semestreActual) {
            fetchCursosActivos();
        }
    }, [semestreActual]);

  const fetchProgramas = async () => {
    try {
      const response = await fetch(`${API_BASE}/programas.php`);
      const data = await response.json();
      
      if (data.success) {
        setProgramas(data.data || []);
      } else if (Array.isArray(data)) {
        // Retrocompatibilidad con respuesta antigua
        setProgramas(data);
      } else {
        console.error('Formato de respuesta inesperado:', data);
        setProgramas([]);
      }
    } catch (error) {
      console.error('Error al cargar programas:', error);
      setProgramas([]);
    }
  };    const fetchSemestresDisponibles = async () => {
        try {
            const response = await fetch(`${API_BASE}/semestres_activos.php?semestres=1`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Respuesta no JSON:', text);
                throw new Error('La respuesta del servidor no es JSON válido');
            }
            
            const data = await response.json();
            if (data.success) {
                setSemestresDisponibles(data.data || []);
                if (data.data && data.data.length > 0) {
                    setSemestreActual(data.data[0].semestre_academico);
                }
            }
        } catch (error) {
            console.error('Error al cargar semestres:', error);
            setSemestresDisponibles([]);
        }
    };

  const fetchCursos = async () => {
    try {
      let url = `${API_BASE}/cursos.php`;
      const params = new URLSearchParams();
      
      if (programaFiltro) params.append('programa_id', programaFiltro);
      if (jornadaFiltro) params.append('jornada', jornadaFiltro);
      
      if (params.toString()) url += '?' + params.toString();
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setCursos(data.data || []);
      } else if (Array.isArray(data)) {
        // Retrocompatibilidad con respuesta antigua
        setCursos(data);
      } else {
        console.error('Formato de respuesta inesperado:', data);
        setCursos([]);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      setCursos([]);
    }
  };    const fetchCursosActivos = async () => {
        try {
            const response = await fetch(`${API_BASE}/semestres_activos.php?semestre=${semestreActual}`);
            const data = await response.json();
            if (data.success) {
                setCursosActivos(data.data);
            }
        } catch (error) {
            console.error('Error al cargar cursos activos:', error);
        }
    };

  useEffect(() => {
    if (vistaActual === 'configurar') {
      fetchCursos();
    }
  }, [programaFiltro, jornadaFiltro, vistaActual]);

  useEffect(() => {
    fetchCursos();
  }, []);    const toggleCurso = (cursoId) => {
        const nuevosSeleccionados = new Set(cursosSeleccionados);
        if (nuevosSeleccionados.has(cursoId)) {
            nuevosSeleccionados.delete(cursoId);
        } else {
            nuevosSeleccionados.add(cursoId);
        }
        setCursosSeleccionados(nuevosSeleccionados);
    };

    const seleccionarTodos = () => {
        const cursosFiltrados = cursos.filter(curso => 
            curso.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            curso.codigo.toLowerCase().includes(busqueda.toLowerCase())
        );
        setCursosSeleccionados(new Set(cursosFiltrados.map(c => c.id)));
    };

    const limpiarSeleccion = () => {
        setCursosSeleccionados(new Set());
    };

    const activarCursos = async () => {
        if (!fechaInicio || !fechaFin) {
            setMensaje({ tipo: 'error', texto: 'Debes configurar las fechas de matrícula' });
            return;
        }

        if (cursosSeleccionados.size === 0) {
            setMensaje({ tipo: 'error', texto: 'Debes seleccionar al menos un curso' });
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/semestres_activos.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bulk_insert: true,
                    semestre_academico: semestre,
                    anio: parseInt(anio),
                    periodo: periodo,
                    fecha_inicio_matricula: fechaInicio,
                    fecha_fin_matricula: fechaFin,
                    cupos_disponibles: cuposDisponibles ? parseInt(cuposDisponibles) : null,
                    cursos_ids: Array.from(cursosSeleccionados)
                })
            });

            const data = await response.json();
            if (data.success) {
                setMensaje({ 
                    tipo: 'success', 
                    texto: `${data.count} cursos activados para el semestre ${semestre}` 
                });
                limpiarSeleccion();
                fetchSemestresDisponibles();
                
                // Cambiar a vista de cursos activos
                setSemestreActual(semestre);
                setVistaActual('activos');
            } else {
                setMensaje({ tipo: 'error', texto: data.message });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al activar cursos' });
            console.error(error);
        }
    };

    const desactivarCurso = async (id) => {
        if (!window.confirm('¿Desactivar este curso del semestre?')) return;

        try {
            const response = await fetch(`${API_BASE}/semestres_activos.php?id=${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                setMensaje({ tipo: 'success', texto: 'Curso desactivado' });
                fetchCursosActivos();
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al desactivar curso' });
        }
    };

    const cursosFiltrados = cursos.filter(curso => 
        curso.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        curso.codigo.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="gestion-semestre">
            <h2>📅 Gestión de Semestre Académico</h2>
            
            {mensaje.texto && (
                <div className={`mensaje ${mensaje.tipo}`}>
                    {mensaje.texto}
                </div>
            )}

            <div className="vista-tabs">
                <button 
                    className={vistaActual === 'configurar' ? 'active' : ''}
                    onClick={() => setVistaActual('configurar')}
                >
                    ⚙️ Configurar Nuevo Semestre
                </button>
                <button 
                    className={vistaActual === 'activos' ? 'active' : ''}
                    onClick={() => setVistaActual('activos')}
                >
                    ✅ Cursos Activos
                </button>
            </div>

            {vistaActual === 'configurar' ? (
                <>
                    <div className="config-semestre">
                        <div className="form-group">
                            <label>Año</label>
                            <input 
                                type="number" 
                                value={anio}
                                onChange={(e) => setAnio(e.target.value)}
                                min="2024"
                                max="2030"
                            />
                        </div>

                        <div className="form-group">
                            <label>Periodo</label>
                            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                                <option value="1">Primer Semestre</option>
                                <option value="2">Segundo Semestre</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Semestre Generado</label>
                            <input type="text" value={semestre} disabled className="semestre-display" />
                        </div>

                        <div className="form-group">
                            <label>Fecha Inicio Matrícula</label>
                            <input 
                                type="date" 
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Fecha Fin Matrícula</label>
                            <input 
                                type="date" 
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Cupos por Curso (opcional)</label>
                            <input 
                                type="number" 
                                value={cuposDisponibles}
                                onChange={(e) => setCuposDisponibles(e.target.value)}
                                placeholder="Sin límite"
                            />
                        </div>
                    </div>

                    <div className="filtros">
                        <div className="form-group">
                            <label>Buscar Curso</label>
                            <input 
                                type="text"
                                placeholder="Escribe código o nombre del curso..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="input-busqueda"
                            />
                            {busqueda && cursosFiltrados.length > 0 && (
                                <small style={{color: '#2ecc71', marginTop: '5px', display: 'block'}}>
                                    ✓ {cursosFiltrados.length} curso(s) encontrado(s)
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Programa</label>
                            <select 
                                value={programaFiltro} 
                                onChange={(e) => setProgramaFiltro(e.target.value)}
                            >
                                <option value="">Todos los programas</option>
                                {programas.map(prog => (
                                    <option key={prog.id} value={prog.id}>
                                        {prog.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Jornada</label>
                            <select 
                                value={jornadaFiltro} 
                                onChange={(e) => setJornadaFiltro(e.target.value)}
                            >
                                <option value="">Todas las jornadas</option>
                                <option value="diurna">Diurna</option>
                                <option value="nocturna">Nocturna</option>
                            </select>
                        </div>
                    </div>

                    <div className="acciones">
                        <button onClick={seleccionarTodos} className="btn-seleccionar">
                            Seleccionar Todos ({cursosFiltrados.length})
                        </button>
                        <button onClick={limpiarSeleccion} className="btn-limpiar">
                            Limpiar Selección
                        </button>
                        <span className="contador">
                            {cursosSeleccionados.size} cursos seleccionados
                        </span>
                        <button 
                            onClick={activarCursos} 
                            className="btn-activar"
                            disabled={cursosSeleccionados.size === 0}
                        >
                            🚀 Activar Cursos para {semestre}
                        </button>
                    </div>

                    <div className="cursos-lista">
                        {cursos.length === 0 ? (
                            <div className="no-datos">
                                <p>No hay cursos disponibles. Ajusta los filtros o carga cursos en el sistema.</p>
                            </div>
                        ) : cursosFiltrados.length === 0 ? (
                            <div className="no-datos">
                                <p>No se encontraron cursos con "{busqueda}"</p>
                                <small>Intenta con otro término de búsqueda</small>
                            </div>
                        ) : (
                            <>
                                <div style={{
                                    padding: '10px 15px',
                                    background: '#3a3a3a',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    color: '#d4af37',
                                    fontWeight: '500'
                                }}>
                                    📋 {cursosFiltrados.length} curso(s) disponible(s)
                                    {programaFiltro && programas.find(p => p.id === parseInt(programaFiltro)) && 
                                        ` - ${programas.find(p => p.id === parseInt(programaFiltro)).nombre}`}
                                    {jornadaFiltro && ` - Jornada ${jornadaFiltro}`}
                                </div>
                                {cursosFiltrados.map(curso => (
                                    <div 
                                        key={curso.id} 
                                        className={`curso-item ${cursosSeleccionados.has(curso.id) ? 'seleccionado' : ''}`}
                                        onClick={() => toggleCurso(curso.id)}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={cursosSeleccionados.has(curso.id)}
                                            readOnly
                                        />
                                        <div className="curso-info">
                                            <strong>{curso.codigo}</strong>
                                            <span>{curso.nombre}</span>
                                            {curso.programa_nombre && (
                                                <small style={{color: '#999', fontSize: '0.85em'}}>
                                                    {curso.programa_nombre}
                                                </small>
                                            )}
                                        </div>
                                        <div className="curso-detalles">
                                            <span className="badge">{curso.creditos} créditos</span>
                                            <span className="badge jornada">{curso.jornada}</span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="semestre-selector">
                        <label>Ver semestre:</label>
                        <select 
                            value={semestreActual}
                            onChange={(e) => setSemestreActual(e.target.value)}
                        >
                            {semestresDisponibles.map(sem => (
                                <option key={sem.semestre_academico} value={sem.semestre_academico}>
                                    {sem.semestre_academico} ({sem.periodo === '1' ? 'Primer' : 'Segundo'} Semestre {sem.anio})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="cursos-activos-lista">
                        {cursosActivos.length === 0 ? (
                            <p className="no-datos">No hay cursos activos en este semestre</p>
                        ) : (
                            <table className="tabla-cursos-activos">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Nombre</th>
                                        <th>Programa</th>
                                        <th>Jornada</th>
                                        <th>Matrícula</th>
                                        <th>Cupos</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cursosActivos.map(curso => {
                                        const hoy = new Date();
                                        const inicio = new Date(curso.fecha_inicio_matricula);
                                        const fin = new Date(curso.fecha_fin_matricula);
                                        const enPeriodo = hoy >= inicio && hoy <= fin;
                                        
                                        return (
                                            <tr key={curso.id}>
                                                <td><strong>{curso.codigo}</strong></td>
                                                <td>{curso.nombre}</td>
                                                <td>{curso.programa_nombre}</td>
                                                <td><span className="badge jornada">{curso.jornada}</span></td>
                                                <td>
                                                    {inicio.toLocaleDateString()} - {fin.toLocaleDateString()}
                                                </td>
                                                <td>{curso.cupos_disponibles || 'Sin límite'}</td>
                                                <td>
                                                    <span className={`estado ${enPeriodo ? 'activo' : 'inactivo'}`}>
                                                        {enPeriodo ? '✅ Abierta' : '⏸️ Cerrada'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => desactivarCurso(curso.id)}
                                                        className="btn-eliminar"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default GestionSemestre;
