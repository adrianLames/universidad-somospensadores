  import React, { useState, useEffect } from 'react';
  import { API_BASE } from '../config/api';
  import './Horarios.css';
  import BackHomeButton from './BackHomeButton';

  const Horarios = ({ user }) => {
        // Estado para paneles desplegables de salones
        const [openSalones, setOpenSalones] = useState({});
      // Filtros para salones
      const [filtroEdificio, setFiltroEdificio] = useState('');
      const [filtroCapacidad, setFiltroCapacidad] = useState('');
    const [horarios, setHorarios] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [salones, setSalones] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [totalDocentes, setTotalDocentes] = useState(0);
    const colores = ['#e3f2fd', '#ffe0b2', '#e1bee7', '#c8e6c9', '#fff9c4', '#f8bbd0', '#dcedc8', '#b2ebf2', '#f0f4c3'];
    const [currentHorario, setCurrentHorario] = useState({
      docente_id: '',
      curso_id: '',
      salon_id: '',
      dia_semana: 'Lunes',
      hora_inicio: '08:00',
      hora_fin: '10:00',
      color: ''
    });
    const [loading, setLoading] = useState(false);
      const [showSalonForm, setShowSalonForm] = useState(false);
      const [nuevoSalon, setNuevoSalon] = useState({
        codigo: '',
        edificio: '',
        capacidad: '',
        tipo: 'aula',
        equipamiento: '',
        estado: 'Disponible'
      });
      const [loadingSalon, setLoadingSalon] = useState(false);

    useEffect(() => {
      fetchHorarios();
      fetchCursos();
      fetchSalones();
      fetchDocentes();
      fetchTotalDocentes();
    }, []);

    const fetchHorarios = async () => {
      try {
        const response = await fetch(`${API_BASE}/horarios.php`);
        const data = await response.json();
        setHorarios(data);
      } catch (error) {
        console.error('Error fetching horarios:', error);
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

    const fetchSalones = async () => {
      try {
        const response = await fetch(`${API_BASE}/salones.php`);
        const data = await response.json();
        setSalones(data);
      } catch (error) {
        console.error('Error fetching salones:', error);
      }
    };

      // Crear nuevo salón
      const handleCreateSalon = async (e) => {
        e.preventDefault();
        setLoadingSalon(true);
        try {
          const response = await fetch(`${API_BASE}/salones.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoSalon),
          });
          if (response.ok) {
            await fetchSalones();
            setShowSalonForm(false);
            setNuevoSalon({ codigo: '', edificio: '', capacidad: '', tipo: 'aula', equipamiento: '', estado: 'Disponible' });
            alert('Salón creado correctamente');
          } else {
            const errorData = await response.json();
            alert(errorData.error || 'Error al crear el salón');
          }
        } catch (error) {
          console.error('Error creando salón:', error);
          alert('Error de conexión');
        } finally {
          setLoadingSalon(false);
        }
      };

    const fetchDocentes = async () => {
      try {
        const response = await fetch(`${API_BASE}/usuarios.php?tipo=docente`);
        const data = await response.json();
        setDocentes(data);
      } catch (error) {
        console.error('Error fetching docentes:', error);
      }
    };

    const fetchTotalDocentes = async () => {
      try {
        const response = await fetch(`${API_BASE}/usuarios.php?tipo=docente`);
        const data = await response.json();
        setTotalDocentes(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        setTotalDocentes(0);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        // Asignar color aleatorio solo si no tiene color
        let color = currentHorario.color;
        if (!color) {
          color = colores[Math.floor(Math.random() * colores.length)];
        }
        const horarioConColor = { ...currentHorario, color };
        const response = await fetch(`${API_BASE}/horarios.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(horarioConColor),
        });
        if (response.ok) {
          await fetchHorarios();
          resetForm();
          alert('Horario asignado exitosamente');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Error al asignar el horario');
        }
      } catch (error) {
        console.error('Error saving horario:', error);
        alert('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    const resetForm = () => {
      setCurrentHorario({
        docente_id: '',
        curso_id: '',
        salon_id: '',
        dia_semana: 'Lunes',
        hora_inicio: '08:00',
        hora_fin: '10:00',
        color: ''
      });
    };

      // Eliminar horario
      const deleteHorario = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este horario?')) return;
        setLoading(true);
        try {
          const response = await fetch(`${API_BASE}/horarios.php?id=${id}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            await fetchHorarios();
            alert('Horario eliminado correctamente');
          } else {
            const errorData = await response.json();
            alert(errorData.error || 'Error al eliminar el horario');
          }
        } catch (error) {
          console.error('Error eliminando horario:', error);
          alert('Error de conexión');
        } finally {
          setLoading(false);
        }
      };

    // Calcular datos resumen
    const clasesProgramadas = horarios.length;
    const profesoresActivos = totalDocentes;
    const aulasEnUso = new Set(horarios.map(h => h.salon_id)).size;
    const horariosDisponibles = 45 - clasesProgramadas;
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const horasRango = [
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00',
    ];
    const horariosPorDiaHora = {};
    diasSemana.forEach(dia => {
      horariosPorDiaHora[dia] = {};
      horasRango.forEach(rango => {
        horariosPorDiaHora[dia][rango] = null;
      });
    });
    // Agrupar por día y calcular el rango de horas para cada horario
    horarios.forEach(h => {
      const inicio = h.hora_inicio ? h.hora_inicio.slice(0,5) : '';
      const fin = h.hora_fin ? h.hora_fin.slice(0,5) : '';
      let startIdx = horasRango.findIndex(r => {
        const [start, end] = r.split(' - ');
        return inicio >= start && inicio < end;
      });
      let endIdx = horasRango.findIndex(r => {
        const [start, end] = r.split(' - ');
        return fin > start && fin <= end;
      });
      if (endIdx === -1) {
        endIdx = horasRango.findIndex(r => {
          const [start, end] = r.split(' - ');
          return fin > start && fin < end;
        });
        if (endIdx === -1) {
          endIdx = horasRango.length - 1;
        }
      }
      if (startIdx === -1 || endIdx === -1 || !horariosPorDiaHora[h.dia_semana]) return;
      // Usar el color guardado en la base de datos
      const color = h.color || colores[0];
      for (let i = startIdx; i <= endIdx; i++) {
        const rango = horasRango[i];
        horariosPorDiaHora[h.dia_semana][rango] = (i === startIdx) ? {...h, rowSpan: endIdx - startIdx + 1, colorBloque: color} : 'merged';
      }
    });

    return (
      <div className="horarios">
        <div className="page-header">
          <h2>Asignación de Horarios</h2>
          <p>Gestiona y organiza los horarios de clases, profesores y aulas</p>
          <BackHomeButton className="small-btn right" label="Inicio" />
        </div>
        <div style={{display: 'flex', gap: '2rem', alignItems: 'flex-start'}}>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
              <div className="resumen-card">
                <div>Clases Programadas</div>
                <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{clasesProgramadas}</div>
              </div>
              <div className="resumen-card">
                <div>Profesores Activos</div>
                <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{profesoresActivos}</div>
              </div>
              <div className="resumen-card">
                <div>Aulas en Uso</div>
                <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{aulasEnUso}</div>
              </div>
              <div className="resumen-card">
                <div>Horarios Disponibles</div>
                <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{horariosDisponibles}</div>
              </div>
            </div>
            {/* Filtros de salones */}
            <div className="filtros-salones-panel" style={{display:'flex', gap:'1.2rem', marginBottom:'1.5rem', alignItems:'center', justifyContent:'space-between'}}>
              <div style={{display:'flex', gap:'1.2rem'}}>
                <select id="filtro-edificio" style={{padding:'0.5em 1em', borderRadius:8, border:'1px solid #b5c6e0', fontSize:'1rem'}} value={filtroEdificio} onChange={e => setFiltroEdificio(e.target.value)}>
                  <option value="">Todos los edificios</option>
                  {[...new Set(salones.map(s => s.edificio))].map(edificio => (
                    <option key={edificio} value={edificio}>{edificio}</option>
                  ))}
                </select>
                <select id="filtro-capacidad" style={{padding:'0.5em 1em', borderRadius:8, border:'1px solid #b5c6e0', fontSize:'1rem'}} value={filtroCapacidad} onChange={e => setFiltroCapacidad(e.target.value)}>
                  <option value="">Todas las capacidades</option>
                  {[...new Set(salones.map(s => s.capacidad))].map(capacidad => (
                    <option key={capacidad} value={capacidad}>{capacidad}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => setShowSalonForm(!showSalonForm)} style={{padding:'0.7rem 1.2rem', background:'#7c4dff', color:'#fff', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>
                {showSalonForm ? '✖ Cancelar' : '➕ Nuevo Salón'}
              </button>
            </div>
            {/* Formulario para crear salón */}
            {showSalonForm && (
              <div style={{marginBottom:'1.5rem', padding:'1rem', background:'#f5f5f5', borderRadius:'8px', border:'1px solid #ddd'}}>
                <h4>Crear Nuevo Salón</h4>
                <form onSubmit={handleCreateSalon} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                  <div className="form-group">
                    <label>Código:</label>
                    <input
                      type="text"
                      value={nuevoSalon.codigo}
                      onChange={(e) => setNuevoSalon({...nuevoSalon, codigo: e.target.value})}
                      required
                      disabled={loadingSalon}
                    />
                  </div>
                  <div className="form-group">
                    <label>Edificio:</label>
                    <input
                      type="text"
                      value={nuevoSalon.edificio}
                      onChange={(e) => setNuevoSalon({...nuevoSalon, edificio: e.target.value})}
                      required
                      disabled={loadingSalon}
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacidad:</label>
                    <input
                      type="number"
                      value={nuevoSalon.capacidad}
                      onChange={(e) => setNuevoSalon({...nuevoSalon, capacidad: e.target.value})}
                      required
                      disabled={loadingSalon}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo:</label>
                    <select
                      value={nuevoSalon.tipo}
                      onChange={(e) => setNuevoSalon({...nuevoSalon, tipo: e.target.value})}
                      disabled={loadingSalon}
                    >
                      <option value="aula">Aula</option>
                      <option value="laboratorio">Laboratorio</option>
                      <option value="auditorio">Auditorio</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Equipamiento:</label>
                    <input
                      type="text"
                      value={nuevoSalon.equipamiento}
                      onChange={(e) => setNuevoSalon({...nuevoSalon, equipamiento: e.target.value})}
                      disabled={loadingSalon}
                      placeholder="Ej: Proyector, WiFi"
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado:</label>
                    <select
                      value={nuevoSalon.estado}
                      onChange={(e) => setNuevoSalon({...nuevoSalon, estado: e.target.value})}
                      disabled={loadingSalon}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Ocupado">Ocupado</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                  <div style={{gridColumn:'1 / -1', display:'flex', gap:'1rem'}}>
                    <button type="submit" className="btn-primary" disabled={loadingSalon} style={{flex:1}}>
                      {loadingSalon ? 'Creando...' : '✅ Crear Salón'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* Panel por salón */}
            <div className="horarios-grid">
              <h3>Horarios por Salón</h3>
              <p>Consulta y gestiona la disponibilidad de cada aula</p>
              {salones
                .filter(s => (!filtroEdificio || s.edificio === filtroEdificio) && (!filtroCapacidad || String(s.capacidad) === String(filtroCapacidad)))
                .map(salon => {
                  const open = !!openSalones[salon.id];
                  // Matriz de horarios por día y hora para este salón
                  const horariosSalon = horarios.filter(h => String(h.salon_id) === String(salon.id));
                  const horariosPorDiaHoraSalon = {};
                  diasSemana.forEach(dia => {
                    horariosPorDiaHoraSalon[dia] = {};
                    horasRango.forEach(rango => {
                      horariosPorDiaHoraSalon[dia][rango] = null;
                    });
                  });
                  horariosSalon.forEach(h => {
                    const inicio = h.hora_inicio ? h.hora_inicio.slice(0,5) : '';
                    const fin = h.hora_fin ? h.hora_fin.slice(0,5) : '';
                    let startIdx = horasRango.findIndex(r => {
                      const [start, end] = r.split(' - ');
                      return inicio >= start && inicio < end;
                    });
                    let endIdx = horasRango.findIndex(r => {
                      const [start, end] = r.split(' - ');
                      return fin > start && fin <= end;
                    });
                    if (endIdx === -1) {
                      endIdx = horasRango.findIndex(r => {
                        const [start, end] = r.split(' - ');
                        return fin > start && fin < end;
                      });
                      if (endIdx === -1) {
                        endIdx = horasRango.length - 1;
                      }
                    }
                    if (startIdx === -1 || endIdx === -1 || !horariosPorDiaHoraSalon[h.dia_semana]) return;
                    const color = h.color || colores[0];
                    for (let i = startIdx; i <= endIdx; i++) {
                      const rango = horasRango[i];
                      horariosPorDiaHoraSalon[h.dia_semana][rango] = (i === startIdx) ? {...h, rowSpan: endIdx - startIdx + 1, colorBloque: color} : 'merged';
                    }
                  });
                  return (
                    <div key={salon.id} className="salon-horario-panel" style={{marginBottom:'1.2rem', background:'#fff', borderRadius:'16px', boxShadow:'0 2px 12px #e3eafc', border:'1.5px solid #e0e7ef'}}>
                      <button
                        className="salon-toggle-btn"
                        style={{width:'100%', textAlign:'left', background:'none', border:'none', padding:'1.2rem', fontSize:'1.1rem', fontWeight:700, color:'#1766c2', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between'}}
                        onClick={() => setOpenSalones(prev => ({...prev, [salon.id]: !prev[salon.id]}))}
                      >
                        <span>🏫 {salon.codigo} - {salon.edificio} <span style={{color:'#888', fontWeight:400, fontSize:'0.95rem'}}>Capacidad: {salon.capacidad}</span></span>
                        <span style={{fontSize:'1.3rem'}}>{open ? '▲' : '▼'}</span>
                      </button>
                      {open && (
                        <div style={{padding:'0 1.5rem 1.5rem 1.5rem'}}>
                          <table className="tabla-horarios">
                            <thead>
                              <tr>
                                <th>Horario</th>
                                {diasSemana.slice(0,5).map(dia => (
                                  <th key={dia}>{dia}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {horasRango.map((rango, rowIdx) => (
                                <tr key={rango}>
                                  <td className="grid-time">{rango}</td>
                                  {diasSemana.slice(0,5).map(dia => {
                                    const horario = horariosPorDiaHoraSalon[dia][rango];
                                    if (horario === 'merged') return null;
                                    if (horario && horario.rowSpan > 1) {
                                      return (
                                        <td className="grid-cell" key={dia} rowSpan={horario.rowSpan} style={{verticalAlign: 'top'}}>
                                          <div className="bloque-horario" style={{background: horario.colorBloque, borderColor: '#d5c9e4', color: '#7b4da8'}}>
                                            <strong>{horario.curso_nombre}</strong><br/>
                                            <span>👨‍🏫 {horario.docente_nombres} {horario.docente_apellidos}</span><br/>
                                            <button className="btn-delete" onClick={() => deleteHorario(horario.id)}>Eliminar</button>
                                          </div>
                                        </td>
                                      );
                                    }
                                    return (
                                      <td className="grid-cell" key={dia}>
                                        {horario ? (
                                          <div className="bloque-horario" style={{background: horario.colorBloque, borderColor: '#d5c9e4', color: '#7b4da8'}}>
                                            <strong>{horario.curso_nombre}</strong><br/>
                                            <span>👨‍🏫 {horario.docente_nombres} {horario.docente_apellidos}</span><br/>
                                            <button className="btn-delete" onClick={() => deleteHorario(horario.id)}>Eliminar</button>
                                          </div>
                                        ) : (
                                          <span style={{color: '#bbb'}}>Disponible</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
          <div style={{width: '370px', minWidth: '320px'}}>
            <div className="panel-form">
              <h3 style={{marginBottom: '1rem', color: '#2c3e91'}}>
                <span style={{fontSize: '1.5rem', color: '#7c4dff', marginRight: '6px'}}>+</span> Nueva Asignación
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Docente:</label>
                  <select
                    value={currentHorario.docente_id}
                    onChange={(e) => setCurrentHorario({...currentHorario, docente_id: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar docente</option>
                    {docentes.map(docente => (
                      <option key={docente.id} value={docente.id}>
                        {docente.nombres} {docente.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Curso:</label>
                  <select
                    value={currentHorario.curso_id}
                    onChange={(e) => setCurrentHorario({...currentHorario, curso_id: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar curso</option>
                    {cursos.map(curso => (
                      <option key={curso.id} value={curso.id}>
                        {curso.codigo} - {curso.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Salón:</label>
                  <select
                    value={currentHorario.salon_id}
                    onChange={(e) => setCurrentHorario({...currentHorario, salon_id: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar salón</option>
                    {salones.map(salon => (
                      <option key={salon.id} value={salon.id}>
                        {salon.codigo} - {salon.edificio} (Capacidad: {salon.capacidad})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Día de la semana:</label>
                  <select
                    value={currentHorario.dia_semana}
                    onChange={(e) => setCurrentHorario({...currentHorario, dia_semana: e.target.value})}
                    required
                    disabled={loading}
                  >
                    {diasSemana.map(dia => (
                      <option key={dia} value={dia}>{dia}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hora de inicio:</label>
                  <input
                    type="time"
                    value={currentHorario.hora_inicio}
                    onChange={(e) => setCurrentHorario({...currentHorario, hora_inicio: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Hora de fin:</label>
                  <input
                    type="time"
                    value={currentHorario.hora_fin}
                    onChange={(e) => setCurrentHorario({...currentHorario, hora_fin: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-actions" style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Asignando...' : '🕐 Asignar'}
                  </button>
                  <button type="button" style={{background: '#bdbdbd', color: '#fff', borderRadius: '6px', border: 'none', padding: '0.7rem 1.2rem', fontWeight: 'bold'}} onClick={resetForm} disabled={loading}>
                    ❌ Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Horarios;