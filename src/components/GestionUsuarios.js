import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './GestionUsuarios.css';
import BackHomeButton from './BackHomeButton';

const GestionUsuarios = ({ user }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState({
    id: null,
    tipo: 'estudiante',
    identificacion: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    direccion: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [asignacionesPorDocente, setAsignacionesPorDocente] = useState({});
  const [openDocentes, setOpenDocentes] = useState({});
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [newAsignacion, setNewAsignacion] = useState({ curso_id: '', semestre: '2025-1', anio: new Date().getFullYear() });
  const [editingAsignacionId, setEditingAsignacionId] = useState(null);
  const [editingAsignacionData, setEditingAsignacionData] = useState({ curso_id: '', semestre: '', anio: '' });
  

  useEffect(() => {
    fetchUsuarios();
  }, []);

  

  // Cerrar el formulario con la tecla ESC
  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        resetForm();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showForm]);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE}/usuarios.php`);
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  };

  const loadAsignacionesForDocente = async (docenteId, force = false) => {
    if (!docenteId) return;
    // si ya está cargado y no se fuerza, no recargar
    if (asignacionesPorDocente[docenteId] && !force) return;
    try {
      const res = await fetch(`${API_BASE}/asignacion_docentes.php?docente_id=${docenteId}`);
      const json = await res.json();
      const lista = Array.isArray(json) ? json : (json.data || []);
      setAsignacionesPorDocente(prev => ({ ...prev, [docenteId]: lista }));
    } catch (err) {
      console.error('Error cargando asignaciones del docente', docenteId, err);
      setAsignacionesPorDocente(prev => ({ ...prev, [docenteId]: [] }));
    }
  };

  const toggleDocenteOpen = (docenteId) => {
    setOpenDocentes(prev => {
      const next = { ...prev, [docenteId]: !prev[docenteId] };
      if (!prev[docenteId]) loadAsignacionesForDocente(docenteId);
      return next;
    });
  };

  // fetch cursos disponibles
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/cursos.php`);
        const j = await res.json();
        const lista = Array.isArray(j) ? j : (j.data || j);
        setCursosDisponibles(lista);
      } catch (err) {
        console.error('Error fetching cursosDisponibles', err);
        setCursosDisponibles([]);
      }
    })();
  }, []);

  const addAsignacionForDocente = async (docenteId) => {
    if (!docenteId || !newAsignacion.curso_id) return alert('Seleccione un curso');
    try {
      const res = await fetch(`${API_BASE}/asignacion_docentes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docente_id: docenteId, curso_id: newAsignacion.curso_id, semestre: newAsignacion.semestre, anio: parseInt(newAsignacion.anio, 10) })
      });
      const j = await res.json();
      if (res.ok) {
        // recargar asignaciones forzando
        await loadAsignacionesForDocente(docenteId, true);
        // reset form
        setNewAsignacion({ curso_id: '', semestre: '2025-1', anio: new Date().getFullYear() });
      } else {
        alert(j.message || 'Error agregando asignación');
      }
    } catch (err) {
      console.error('Error agregando asignacion', err);
      alert('Error de conexión');
    }
  };

  const deleteAsignacionForDocente = async (asignacionId, docenteId) => {
    if (!asignacionId) return;
    if (!window.confirm('¿Eliminar esta asignación?')) return;
    try {
      const res = await fetch(`${API_BASE}/asignacion_docentes.php?id=${asignacionId}`, { method: 'DELETE' });
      const j = await res.json();
      if (res.ok) {
        await loadAsignacionesForDocente(docenteId, true);
      } else {
        alert(j.message || 'Error eliminando asignación');
      }
    } catch (err) {
      console.error('Error eliminando asignacion', err);
      alert('Error de conexión');
    }
  };

  const startEditingAsignacion = (asig) => {
    setEditingAsignacionId(asig.id);
    setEditingAsignacionData({ curso_id: asig.curso_id, semestre: asig.semestre, anio: asig.anio });
  };

  const cancelEditingAsignacion = () => {
    setEditingAsignacionId(null);
    setEditingAsignacionData({ curso_id: '', semestre: '', anio: '' });
  };

  const updateAsignacionForDocente = async (asignacionId, docenteId) => {
    if (!asignacionId) return;
    try {
      const res = await fetch(`${API_BASE}/asignacion_docentes.php?id=${asignacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curso_id: editingAsignacionData.curso_id, semestre: editingAsignacionData.semestre, anio: parseInt(editingAsignacionData.anio, 10) })
      });
      const j = await res.json();
      if (res.ok) {
        await loadAsignacionesForDocente(docenteId, true);
        cancelEditingAsignacion();
      } else {
        alert(j.message || 'Error actualizando asignación');
      }
    } catch (err) {
      console.error('Error actualizando asignacion', err);
      alert('Error de conexión');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!currentUsuario.identificacion.trim()) {
      newErrors.identificacion = 'La identificación es obligatoria';
    }
    
    if (!currentUsuario.nombres.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios';
    }
    
    if (!currentUsuario.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }
    
    if (!currentUsuario.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(currentUsuario.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!currentUsuario.id && !currentUsuario.password) {
      newErrors.password = 'La contraseña es obligatoria para nuevos usuarios';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const method = currentUsuario.id ? 'PUT' : 'POST';
      const url = currentUsuario.id 
        ? `${API_BASE}/usuarios.php?id=${currentUsuario.id}`
        : `${API_BASE}/usuarios.php`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentUsuario),
      });

      if (response.ok) {
        await fetchUsuarios();
        resetForm();
        alert('✅ Usuario guardado exitosamente');
      } else {
        const errorData = await response.json();
        alert(`❌ ${errorData.error || 'Error al guardar el usuario'}`);
      }
    } catch (error) {
      console.error('Error saving usuario:', error);
      alert('❌ Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentUsuario({
      id: null,
      tipo: 'estudiante',
      identificacion: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      fecha_nacimiento: '',
      direccion: '',
      password: ''
    });
    setErrors({});
    setShowForm(false);
  };

  const editUsuario = (usuario) => {
    setCurrentUsuario({...usuario, password: ''});
    setShowForm(true);
    // Si es docente, cargar sus asignaciones para mostrarlas en el modal de edición
    if (usuario.tipo === 'docente') {
      loadAsignacionesForDocente(usuario.id);
    }
  };

  const deleteUsuario = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`${API_BASE}/usuarios.php?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchUsuarios();
          alert('✅ Usuario eliminado exitosamente');
        } else {
          const errorData = await response.json();
          alert(`❌ ${errorData.error || 'Error al eliminar el usuario'}`);
        }
      } catch (error) {
        console.error('Error deleting usuario:', error);
        alert('❌ Error de conexión');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setCurrentUsuario(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="gestion-usuarios">
      <div className="header-section">
        <h2>👥 Gestión de Usuarios</h2>
        <BackHomeButton />
        <p className="admin-info">Administrador: {user?.nombres || 'Sistema'}</p>
      </div>
      
      <div className="toolbar">
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Nuevo Usuario
        </button>
        <span className="counter">{usuarios.length} usuarios registrados</span>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentUsuario.id ? '✏️ Editar' : '➕ Nuevo'} Usuario</h3>
              <button 
                className="close-btn"
                onClick={resetForm}
                disabled={loading}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Usuario:</label>
                  <select
                    value={currentUsuario.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="estudiante">🎓 Estudiante</option>
                    <option value="docente">👨‍🏫 Docente</option>
                    <option value="admin">⚙️ Administrador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Identificación:</label>
                  <input
                    type="text"
                    value={currentUsuario.identificacion}
                    onChange={(e) => handleInputChange('identificacion', e.target.value)}
                    required
                    disabled={loading}
                    className={errors.identificacion ? 'error' : ''}
                  />
                  {errors.identificacion && <span className="error-message">{errors.identificacion}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombres:</label>
                  <input
                    type="text"
                    value={currentUsuario.nombres}
                    onChange={(e) => handleInputChange('nombres', e.target.value)}
                    required
                    disabled={loading}
                    className={errors.nombres ? 'error' : ''}
                  />
                  {errors.nombres && <span className="error-message">{errors.nombres}</span>}
                </div>

                <div className="form-group">
                  <label>Apellidos:</label>
                  <input
                    type="text"
                    value={currentUsuario.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                    required
                    disabled={loading}
                    className={errors.apellidos ? 'error' : ''}
                  />
                  {errors.apellidos && <span className="error-message">{errors.apellidos}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={currentUsuario.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={loading}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    value={currentUsuario.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Nacimiento:</label>
                  <input
                    type="date"
                    value={currentUsuario.fecha_nacimiento}
                    onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Contraseña:</label>
                  <input
                    type="password"
                    value={currentUsuario.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required={!currentUsuario.id}
                    disabled={loading}
                    className={errors.password ? 'error' : ''}
                    placeholder={currentUsuario.id ? "Dejar en blanco para mantener la actual" : "Ingrese la contraseña"}
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Dirección:</label>
                <textarea
                  value={currentUsuario.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  rows="3"
                  disabled={loading}
                  placeholder="Ingrese la dirección completa"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} disabled={loading}>
                  ❌ Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-save">
                  {loading ? '⏳ Guardando...' : '💾 Guardar Usuario'}
                </button>
              </div>
            </form>
            {currentUsuario.tipo === 'docente' && currentUsuario.id && (
              <div className="modal-section docente-modal-asignaciones">
                <h4>Materias asignadas</h4>
                {asignacionesPorDocente[currentUsuario.id] ? (
                  asignacionesPorDocente[currentUsuario.id].length > 0 ? (
                    <ul>
                      {asignacionesPorDocente[currentUsuario.id].map(a => (
                        <li key={a.id} className="asignacion-item-row">
                          {editingAsignacionId === a.id ? (
                            <div className="asignacion-edit-row">
                              <select value={editingAsignacionData.curso_id} onChange={(e) => setEditingAsignacionData(prev => ({...prev, curso_id: e.target.value}))}>
                                <option value="">Seleccionar curso</option>
                                {cursosDisponibles.map(c => (
                                  <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                              </select>
                              <input type="text" value={editingAsignacionData.semestre} onChange={(e) => setEditingAsignacionData(prev => ({...prev, semestre: e.target.value}))} />
                              <input type="number" value={editingAsignacionData.anio} onChange={(e) => setEditingAsignacionData(prev => ({...prev, anio: e.target.value}))} />
                              <div className="asignacion-actions">
                                <button className="edit-btn" onClick={() => updateAsignacionForDocente(a.id, currentUsuario.id)}>Guardar</button>
                                <button className="cancel-btn" onClick={cancelEditingAsignacion}>Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <div className="asignacion-view-row">
                              <div className="asignacion-info">
                                <span className="curso-nombre">{a.curso_nombre}</span>
                                <span className="curso-meta">{a.semestre} • {a.anio}</span>
                              </div>
                              <div className="asignacion-actions">
                                <button className="edit-btn" onClick={() => startEditingAsignacion(a)}>Editar</button>
                                <button className="delete-btn" onClick={() => deleteAsignacionForDocente(a.id, currentUsuario.id)}>Eliminar</button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Este docente no tiene materias asignadas.</p>
                  )
                ) : (
                  <p>Cargando asignaciones...</p>
                )}

                {/* Formulario de agregar asignación removido por petición del usuario */}
              </div>
            )}
            {/* Asignaciones de docentes movidas al módulo ProfesorMaterias */}
          </div>
        </div>
      )}

      <div className="usuarios-list">
        {usuarios.length === 0 ? (
          <div className="empty-state">
            <p>📭 No hay usuarios registrados</p>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Crear primer usuario
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Identificación</th>
                  <th>Nombre Completo</th>
                  <th>Email</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <React.Fragment key={usuario.id}>
                  <tr>
                    <td><strong>{usuario.identificacion}</strong></td>
                    <td>{usuario.nombres} {usuario.apellidos}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className={`user-role ${usuario.tipo}`}>
                        {usuario.tipo === 'estudiante' && '🎓 '}
                        {usuario.tipo === 'docente' && '👨‍🏫 '}
                        {usuario.tipo === 'admin' && '⚙️ '}
                        {usuario.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit"
                          onClick={() => editUsuario(usuario)}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => deleteUsuario(usuario.id)}
                        >
                          🗑️ Eliminar
                        </button>
                        {/* botón 'Ver materias' eliminado a petición del usuario */}
                      </div>
                    </td>
                  </tr>
                  {usuario.tipo === 'docente' && openDocentes[usuario.id] && (
                    <tr className="docente-asignaciones-row" key={`asig-${usuario.id}`}>
                      <td colSpan="5">
                        <div className="docente-asignaciones">
                          <h4>Materias asignadas</h4>
                          {asignacionesPorDocente[usuario.id] ? (
                            asignacionesPorDocente[usuario.id].length > 0 ? (
                              <ul>
                                {asignacionesPorDocente[usuario.id].map(a => (
                                  <li key={a.id}><strong>{a.curso_nombre}</strong> — {a.semestre} • {a.anio}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>No hay materias asignadas a este docente.</p>
                            )
                          ) : (
                            <p>Cargando asignaciones...</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionUsuarios;