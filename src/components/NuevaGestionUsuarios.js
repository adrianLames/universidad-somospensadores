import React, { useEffect, useState } from 'react';
import { apiRequest, getFacultades, getProgramasByFacultad } from '../config/api';
import { API_BASE } from '../config/api';
import './NuevaGestionUsuarios.css';

const tipos = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'docente', label: 'Docente' },
  { value: 'admin', label: 'Administrador' },
  { value: 'publico', label: 'Público' },
];

const NuevaGestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  // Estados para agregar usuario
  const [modalAgregar, setModalAgregar] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({ tipo: '', identificacion: '', nombres: '', apellidos: '', email: '', telefono: '', fecha_nacimiento: '', direccion: '', facultad_id: '', programa_id: '', password: '' });
  const [facultades, setFacultades] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loadingCrear, setLoadingCrear] = useState(false);
    // Cargar facultades al abrir modal
    useEffect(() => {
      if (modalAgregar) {
        getFacultades().then(setFacultades);
      }
    }, [modalAgregar]);

    // Cargar programas al seleccionar facultad
    useEffect(() => {
      if (nuevoUsuario.facultad_id) {
        getProgramasByFacultad(nuevoUsuario.facultad_id).then(setProgramas);
      } else {
        setProgramas([]);
      }
    }, [nuevoUsuario.facultad_id]);

    const openAgregar = () => {
      setNuevoUsuario({ tipo: '', identificacion: '', nombres: '', apellidos: '', email: '', telefono: '', fecha_nacimiento: '', direccion: '', facultad_id: '', programa_id: '', password: '' });
      setModalAgregar(true);
    };

    const closeAgregar = () => {
      setModalAgregar(false);
    };

    const handleNuevoChange = e => {
      const { name, value } = e.target;
      setNuevoUsuario(f => ({ ...f, [name]: value }));
      // limpiar mensajes/errores al modificar
      setCrearErrores && setCrearErrores({});
      setCrearMensaje && setCrearMensaje('');
    };
    const [crearErrores, setCrearErrores] = useState({});
    const [crearMensaje, setCrearMensaje] = useState('');

    const crearUsuario = async e => {
      e.preventDefault();
      // validación básica
      const errors = {};
      if (!nuevoUsuario.identificacion || nuevoUsuario.identificacion.toString().trim() === '') errors.identificacion = 'Identificación es requerida';
      if (!nuevoUsuario.nombres || nuevoUsuario.nombres.trim() === '') errors.nombres = 'Nombres son requeridos';
      if (!nuevoUsuario.email || !/^\S+@\S+\.\S+$/.test(nuevoUsuario.email)) errors.email = 'Email inválido';
      if (!nuevoUsuario.password || nuevoUsuario.password.length < 6) errors.password = 'Contraseña mínima 6 caracteres';
      if (Object.keys(errors).length) { setCrearErrores(errors); return; }

      setLoadingCrear(true);
      try {
        await apiRequest('usuarios.php', {
          method: 'POST',
          body: JSON.stringify(nuevoUsuario)
        });
        await fetchUsuarios();
        setCrearMensaje('Usuario creado correctamente');
        setCrearErrores({});
        setTimeout(() => { setModalAgregar(false); setCrearMensaje(''); }, 900);
      } catch (err) {
        setCrearMensaje('Error al crear usuario: ' + (err?.message || err));
      }
      setLoadingCrear(false);
    };
  const [pendientes, setPendientes] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarActivo, setMostrarActivo] = useState('todos'); // 'activos' | 'inactivos' | 'todos'
  const [tab, setTab] = useState('activos');

  // Estado para edición
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => {
    fetchUsuarios();
    fetchPendientes();
  }, []);

  // Recargar usuarios al cambiar el filtro de 'mostrar' (activos/inactivos/todos)
  useEffect(() => {
    fetchUsuarios();
  }, [mostrarActivo]);

  const fetchUsuarios = async () => {
    let url = `${API_BASE}/usuarios.php`;
    if (mostrarActivo === 'inactivos') url += '?activo=0';
    else if (mostrarActivo === 'todos') url += '?all=1';
    const res = await fetch(url);
    const data = await res.json();
    setUsuarios(data);
  };

  const fetchPendientes = async () => {
    const res = await fetch(`${API_BASE}/pendientes.php`);
    const data = await res.json();
    setPendientes(data);
  };

  // Filtrado según pestaña y selector de activo
  const usuariosFiltrados = usuarios.filter(u => {
    // Filtrar por tipo
    if (tipoFiltro !== 'todos' && u.tipo !== tipoFiltro) return false;
    // Filtrar por búsqueda
    if (!(`${u.nombres} ${u.apellidos} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase()))) return false;
    // Filtrar por estado activo/inactivo
    if (mostrarActivo === 'activos') return String(u.activo) === '1';
    if (mostrarActivo === 'inactivos') return String(u.activo) === '0';
    // Si es "todos", mostrar ambos
    return true;
  });

  const pendientesFiltrados = pendientes.filter(p =>
    (tipoFiltro === 'todos' || p.tipo === tipoFiltro) &&
    (`${p.nombres} ${p.apellidos} ${p.email}`.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Manejar apertura de modal de edición
  const openEdit = async (user) => {
    // prevenir edición de administradores
    if (user && user.tipo === 'admin') {
      // opcional: mostrar mensaje breve
      alert('La cuenta de administrador no puede ser editada desde aquí.');
      return;
    }
    setEditUser(user);
    setEditForm({ ...user });
    try {
      const f = await getFacultades();
      setFacultades(Array.isArray(f) ? f : []);
      if (user.facultad_id) {
        const progs = await getProgramasByFacultad(user.facultad_id);
        setProgramas(Array.isArray(progs) ? progs : []);
      } else {
        setProgramas([]);
      }
    } catch (err) {
      setFacultades([]);
      setProgramas([]);
    }
  };

  // Manejar cambios en el formulario de edición
  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
    // limpiar errores y mensajes al modificar
    setEditErrors({});
    setEditMessage('');
    if (name === 'facultad_id') {
      // cargar programas de la facultad seleccionada
      if (value) {
        getProgramasByFacultad(value).then(p => setProgramas(Array.isArray(p) ? p : [])).catch(() => setProgramas([]));
      } else {
        setProgramas([]);
      }
    }
  };

  // Guardar cambios
  const saveEdit = async () => {
    // validación básica
    const errors = {};
    if (!editForm.identificacion || editForm.identificacion.toString().trim() === '') errors.identificacion = 'Identificación es requerida';
    if (!editForm.nombres || editForm.nombres.trim() === '') errors.nombres = 'Nombres son requeridos';
    if (!editForm.email || !/^\S+@\S+\.\S+$/.test(editForm.email)) errors.email = 'Email inválido';
    if (Object.keys(errors).length) { setEditErrors(errors); return; }

    setEditLoading(true);
    try {
      await apiRequest(`usuarios.php?id=${editUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      await fetchUsuarios();
      setEditMessage('Usuario actualizado correctamente');
      setEditErrors({});
      setTimeout(() => { setEditUser(null); setEditMessage(''); }, 900);
    } catch (err) {
      setEditMessage('Error al actualizar: ' + (err?.message || err));
    }
    setEditLoading(false);
  };

  // Cerrar modal
  const closeEdit = () => {
    setEditUser(null);
  };

  // Navegar al inicio
  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <>
      {/* Modal de edición de usuario */}
      {editUser && (
        <div className="modal-bg">
          <div className="modal-wrapper" style={{minWidth:'360px', maxWidth:'760px'}}>
            <div style={{ width: '100%', textAlign: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{editUser ? 'Editar Usuario' : ''}</h3>
            </div>
            {editMessage && <div style={{width:'100%', textAlign:'center', marginBottom:'0.8rem'}} className="form-success">{editMessage}</div>}
            {Object.keys(editErrors || {}).length > 0 && (
              <div style={{width:'100%', marginBottom:'0.8rem'}} className="form-error">
                <ul style={{margin:0, paddingLeft:'1.2rem'}}>
                  {Object.values(editErrors).map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}
            <div className="modal-form">
              <label>Identificación
                <input name="identificacion" value={editForm.identificacion || ''} onChange={handleEditChange} />
              </label>
              <label>Nombres
                <input name="nombres" value={editForm.nombres || ''} onChange={handleEditChange} />
              </label>
              <label>Apellidos
                <input name="apellidos" value={editForm.apellidos || ''} onChange={handleEditChange} />
              </label>
              <label>Email
                <input name="email" type="email" value={editForm.email || ''} onChange={handleEditChange} />
              </label>
              <label>Teléfono
                <input name="telefono" value={editForm.telefono || ''} onChange={handleEditChange} />
              </label>
              <label>Fecha Nacimiento
                <input name="fecha_nacimiento" type="date" value={editForm.fecha_nacimiento || ''} onChange={handleEditChange} />
              </label>
              <label>Dirección
                <input name="direccion" value={editForm.direccion || ''} onChange={handleEditChange} />
              </label>
              <label>Tipo
                <select name="tipo" value={editForm.tipo || ''} onChange={handleEditChange}>
                  <option value="">Selecciona un tipo</option>
                  {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label>Facultad
                <select name="facultad_id" value={editForm.facultad_id || ''} onChange={handleEditChange}>
                  <option value="">Selecciona una facultad</option>
                  {facultades.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
              </label>
              <label>Programa
                <select name="programa_id" value={editForm.programa_id || ''} onChange={handleEditChange}>
                  <option value="">Selecciona un programa</option>
                  {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </label>
              <label>Jornada
                <select name="jornada" value={editForm.jornada || ''} onChange={handleEditChange}>
                  <option value="">Selecciona jornada</option>
                  <option value="diurna">☀️ Diurna</option>
                  <option value="nocturna">🌙 Nocturna</option>
                </select>
              </label>
              <label>Activo
                <input name="activo" type="checkbox" checked={String(editForm.activo) === '1' || editForm.activo === 1 || editForm.activo === true} onChange={e => handleEditChange({ target: { name: 'activo', value: e.target.checked ? 1 : 0 } })} />
              </label>
              <label style={{borderTop: '2px solid #d4af37', paddingTop: '1rem', marginTop: '1rem'}}>
                Nueva Contraseña (dejar en blanco para no cambiar)
                <input name="password" type="password" value={editForm.password || ''} onChange={handleEditChange} placeholder="Ingrese nueva contraseña" />
              </label>
            </div>
            <div className="modal-actions" style={{marginTop:'1rem'}}>
              <button className="btn-primary" onClick={e => { e.preventDefault(); saveEdit(); }} disabled={editLoading}>{editLoading ? 'Guardando...' : 'Guardar'}</button>
              <button className="btn-delete" onClick={closeEdit} disabled={editLoading}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <div className="nueva-gestion-usuarios">
        <div className="header-actions">
          <button className="btn-salir" onClick={goHome}>⟵ Salir al inicio</button>
          <button className="btn-agregar" onClick={openAgregar}>+ Agregar usuario</button>
        </div>
        {/* Dashboard header: cards */}
        <div className="dashboard-cards">
          {(() => {
            const total = usuarios.length;
            const estudiantes = usuarios.filter(u => u.tipo === 'estudiante').length;
            const docentes = usuarios.filter(u => u.tipo === 'docente').length;
            const personal = usuarios.filter(u => u.tipo === 'personal' || u.tipo === 'staff').length;
            return (
              <>
                <div className="card">
                  <div className="card-title">Total Usuarios</div>
                  <div className="card-value">{total}</div>
                  <div className="card-note">+0.0% vs mes anterior</div>
                </div>
                <div className="card">
                  <div className="card-title">Estudiantes</div>
                  <div className="card-value">{estudiantes}</div>
                  <div className="card-note">+0.0% vs mes anterior</div>
                </div>
                <div className="card">
                  <div className="card-title">Profesores</div>
                  <div className="card-value">{docentes}</div>
                  <div className="card-note">+0.0% vs mes anterior</div>
                </div>
                <div className="card">
                  <div className="card-title">Personal</div>
                  <div className="card-value">{personal}</div>
                  <div className="card-note">+0.0% vs mes anterior</div>
                </div>
              </>
            );
          })()}
        </div>
        {/* Modal agregar usuario */}
        {modalAgregar && (
          <div className="modal-editar-overlay">
            <div className="modal-editar">
              <h3>Agregar usuario</h3>
              {crearMensaje && <div style={{width:'100%', textAlign:'center', marginBottom:'0.6rem'}} className="form-success">{crearMensaje}</div>}
              {Object.keys(crearErrores || {}).length > 0 && (
                <div style={{width:'100%', marginBottom:'0.6rem'}} className="form-error">
                  <ul style={{margin:0, paddingLeft:'1.2rem'}}>
                    {Object.values(crearErrores).map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
              <form onSubmit={crearUsuario}>
                <div className="form-group">
                  <label>Tipo:</label>
                  <select name="tipo" value={nuevoUsuario.tipo} onChange={handleNuevoChange} required>
                    <option value="">Selecciona un rol</option>
                    {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Identificación:</label>
                  <input name="identificacion" value={nuevoUsuario.identificacion} onChange={handleNuevoChange} required />
                </div>
                <div className="form-group">
                  <label>Nombres:</label>
                  <input name="nombres" value={nuevoUsuario.nombres} onChange={handleNuevoChange} required />
                </div>
                <div className="form-group">
                  <label>Apellidos:</label>
                  <input name="apellidos" value={nuevoUsuario.apellidos} onChange={handleNuevoChange} required />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input name="email" type="email" value={nuevoUsuario.email} onChange={handleNuevoChange} required />
                </div>
                <div className="form-group">
                  <label>Teléfono:</label>
                  <input name="telefono" value={nuevoUsuario.telefono} onChange={handleNuevoChange} />
                </div>
                <div className="form-group">
                  <label>Fecha de nacimiento:</label>
                  <input name="fecha_nacimiento" type="date" value={nuevoUsuario.fecha_nacimiento} onChange={handleNuevoChange} />
                </div>
                <div className="form-group">
                  <label>Dirección:</label>
                  <input name="direccion" value={nuevoUsuario.direccion} onChange={handleNuevoChange} />
                </div>
                <div className="form-group">
                  <label>Facultad:</label>
                  <select name="facultad_id" value={nuevoUsuario.facultad_id} onChange={handleNuevoChange}>
                    <option value="">Selecciona una facultad</option>
                    {facultades.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Programa:</label>
                  <select name="programa_id" value={nuevoUsuario.programa_id} onChange={handleNuevoChange}>
                    <option value="">Selecciona un programa</option>
                    {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Jornada:</label>
                  <select name="jornada" value={nuevoUsuario.jornada || 'diurna'} onChange={handleNuevoChange}>
                    <option value="">Selecciona jornada</option>
                    <option value="diurna">☀️ Diurna</option>
                    <option value="nocturna">🌙 Nocturna</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Contraseña:</label>
                  <input name="password" type="password" value={nuevoUsuario.password} onChange={handleNuevoChange} required />
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button type="submit" disabled={loadingCrear}>{loadingCrear ? 'Creando...' : 'Crear usuario'}</button>
                  <button type="button" style={{ marginLeft: '10px' }} onClick={closeAgregar}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <h2>Gestión de Usuarios</h2>
        <div className="tabs">
          <button onClick={() => setTab('activos')} className={tab === 'activos' ? 'active' : ''}>Usuarios Activos</button>
          <button onClick={() => setTab('pendientes')} className={tab === 'pendientes' ? 'active' : ''}>Pendientes</button>
        </div>
        <div className="filtros">
          <select value={mostrarActivo} onChange={e => { setMostrarActivo(e.target.value); }}>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
            <option value="todos">Todos</option>
          </select>
          
          <select value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)}>
            <option value="todos">Todos</option>
            {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input placeholder="Buscar por nombre o email" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>

        <div className="layout">
          <div className="main">
            {tab === 'activos' && (
              <table>
                <thead>
                  <tr>
                    <th>Identificación</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Jornada</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(u => (
                    <tr key={u.id}>
                      <td>{u.identificacion}</td>
                      <td>{u.nombres} {u.apellidos}</td>
                      <td>{u.email}</td>
                      <td>
                        {u.tipo}
                      </td>
                      <td style={{textAlign:'center'}}>
                        {u.jornada ? (u.jornada === 'diurna' ? '☀️ Diurna' : '🌙 Nocturna') : '-'}
                      </td>
                      <td style={{textAlign:'center'}}>
                        {String(u.activo) === '1' ? (
                          <span style={{color:'#1a6a2a', fontWeight:'bold'}}>✔️</span>
                        ) : (
                          <span style={{color:'#e74c3c', fontWeight:'bold'}}>❌</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-primary"
                          onClick={() => openEdit(u)}
                          disabled={u.tipo === 'admin'}
                          title={u.tipo === 'admin' ? 'Cuenta administrador: no editable' : 'Editar'}
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <tr><td colSpan={5} style={{textAlign:'center'}}>No hay usuarios.</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {tab === 'pendientes' && (
              <table>
                <thead>
                  <tr>
                    <th>Identificación</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientesFiltrados.map(p => (
                    <tr key={p.id}>
                      <td>{p.identificacion}</td>
                      <td>{p.nombres} {p.apellidos}</td>
                      <td>{p.email}</td>
                      <td>{p.tipo}</td>
                      <td>
                        <button className="btn-primary" onClick={async () => {
                          if (!window.confirm('¿Aprobar este usuario?')) return;
                          try {
                            const res = await fetch(`${API_BASE}/pendientes.php?id=${p.id}`, {
                              method: 'POST',
                              headers: {'Content-Type': 'application/json'},
                              body: JSON.stringify({ id: p.id, action: 'approve', tipo: p.tipo })
                            });
                            let json = null;
                            try { json = await res.json(); } catch (errJson) { const txt = await res.text(); alert('Respuesta del servidor no es JSON:\n' + txt); await fetchPendientes(); return; }
                            if(res.ok) { alert('Usuario aprobado correctamente'); await fetchPendientes(); await fetchUsuarios(); } else { alert(json.error || 'Error al aprobar'); }
                          } catch (err) { alert('Error de conexión'); }
                        }}>✅ Aprobar</button>
                        <button className="btn-delete" onClick={async () => {
                          if (!window.confirm('¿Rechazar este usuario?')) return;
                          try {
                            const res = await fetch(`${API_BASE}/pendientes.php?id=${p.id}`, {
                              method: 'POST',
                              headers: {'Content-Type': 'application/json'},
                              body: JSON.stringify({ id: p.id, action: 'reject' })
                            });
                            let json = null;
                            try { json = await res.json(); } catch (errJson) { const txt = await res.text(); alert('Respuesta del servidor no es JSON:\n' + txt); await fetchPendientes(); return; }
                            if(res.ok) { alert('Usuario rechazado correctamente'); await fetchPendientes(); } else { alert(json.error || 'Error al rechazar'); }
                          } catch (err) { alert('Error de conexión'); }
                        }}>❌ Rechazar</button>
                      </td>
                    </tr>
                  ))}
                  {pendientesFiltrados.length === 0 && (
                    <tr><td colSpan={5} style={{textAlign:'center'}}>No hay pendientes.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <aside className="sidebar">
            <div className="activity-card">
              <h4>Actividad Reciente</h4>
              <div className="activity-list">
                {usuarios.slice(0,6).map((u, i) => (
                  <div className="activity-item" key={u.id || i}>
                    <div className="avatar">{(u.nombres||'').slice(0,1)}{(u.apellidos||'').slice(0,1)}</div>
                    <div className="activity-body">
                      <div className="activity-title">{u.nombres} {u.apellidos}</div>
                      <div className="activity-sub">{u.tipo === 'estudiante' ? 'Nuevo registro de estudiante' : 'Actualizó información'}</div>
                    </div>
                  </div>
                ))}
                {usuarios.length === 0 && <div style={{padding:'0.8rem'}}>Sin actividad reciente.</div>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default NuevaGestionUsuarios;
