
import React, { useState, useEffect } from 'react';
import { API_BASE, getFacultades, getProgramasByFacultad } from '../config/api';
import './EditarUsuarios.css';

const EditarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [activeTab, setActiveTab] = useState('estudiante');
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [facultades, setFacultades] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetchUsuarios();
    fetchFacultades();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_BASE}/usuarios.php`);
      const data = await res.json();
      setUsuarios(data);
    } catch (e) {
      setUsuarios([]);
    }
  };

  const fetchFacultades = async () => {
    try {
      const f = await getFacultades();
      setFacultades(Array.isArray(f) ? f : []);
    } catch (e) {
      setFacultades([]);
    }
  };

  const handleSelectUsuario = (usuario) => {
    setSelectedUsuario(usuario);
    if (usuario.facultad_id) {
      fetchProgramas(usuario.facultad_id);
    }
  };

  const fetchProgramas = async (facultadId) => {
    try {
      const progs = await getProgramasByFacultad(facultadId);
      setProgramas(Array.isArray(progs) ? progs : []);
    } catch (e) {
      setProgramas([]);
    }
  };

  const handleInputChange = (field, value) => {
    setSelectedUsuario(prev => ({ ...prev, [field]: value }));
    if (field === 'facultad_id') {
      setSelectedUsuario(prev => ({ ...prev, programa_id: '' }));
      fetchProgramas(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    try {
      // Actualizar usuario (tabla usuarios)
      const res = await fetch(`${API_BASE}/usuarios.php?id=${selectedUsuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUsuario)
      });
      let ok = res.ok;
      // Si es docente o estudiante, actualizar también la tabla específica
      if (res.ok && (selectedUsuario.tipo === 'docente' || selectedUsuario.tipo === 'estudiante')) {
        // Buscar el id de la tabla específica (docentes o estudiantes)
        let tabla = selectedUsuario.tipo === 'docente' ? 'docentes' : 'estudiantes';
        let endpoint = `${API_BASE}/${tabla}.php`;
        // Buscar el registro por usuario_id
        const listaRes = await fetch(endpoint);
        const lista = await listaRes.json();
        const registro = lista.find(u => String(u.usuario_id) === String(selectedUsuario.id));
        if (registro && registro.id) {
          // Solo enviar los campos básicos para mantener sincronía
          const payload = {
            ...selectedUsuario,
            usuario_id: selectedUsuario.id
          };
          const res2 = await fetch(`${endpoint}?id=${registro.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          ok = ok && res2.ok;
        }
      }
      if (ok) {
        setMensaje('Usuario actualizado correctamente');
        fetchUsuarios();
      } else {
        setMensaje('Error al actualizar usuario');
      }
    } catch (e) {
      setMensaje('Error de red');
    }
    setLoading(false);
  };

  // Filtrar usuarios por tipo
  const usuariosPorTipo = usuarios.filter(u => u.tipo === activeTab);

  return (
    <div className="editar-usuarios">
      <h2>Editar Usuarios</h2>
      <div className="editar-tabs">
        <button className={activeTab === 'estudiante' ? 'active' : ''} onClick={() => setActiveTab('estudiante')}>Estudiantes</button>
        <button className={activeTab === 'docente' ? 'active' : ''} onClick={() => setActiveTab('docente')}>Docentes</button>
        <button className={activeTab === 'admin' ? 'active' : ''} onClick={() => setActiveTab('admin')}>Administradores</button>
      </div>
      <div className="usuarios-lista">
        <h4>Selecciona un usuario:</h4>
        <ul>
          {usuariosPorTipo.map(u => (
            <li key={u.id}>
              <button onClick={() => handleSelectUsuario(u)}>
                {u.nombres} {u.apellidos} ({u.email})
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selectedUsuario && selectedUsuario.tipo === activeTab && (
        <form className="editar-form" onSubmit={handleSubmit}>
          <h4>✏️ Editar Usuario</h4>
          <p className="usuario-seleccionado">{selectedUsuario.nombres} {selectedUsuario.apellidos}</p>
          
          <div className="form-row">
            <div className="form-group">
              <label>Identificación:</label>
              <input 
                type="text" 
                value={selectedUsuario.identificacion || ''} 
                onChange={e => handleInputChange('identificacion', e.target.value)} 
                required 
                disabled={loading} 
              />
            </div>
            <div className="form-group">
              <label>Nombres:</label>
              <input 
                type="text" 
                value={selectedUsuario.nombres || ''} 
                onChange={e => handleInputChange('nombres', e.target.value)} 
                required 
                disabled={loading} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Apellidos:</label>
              <input 
                type="text" 
                value={selectedUsuario.apellidos || ''} 
                onChange={e => handleInputChange('apellidos', e.target.value)} 
                disabled={loading} 
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input 
                type="email" 
                value={selectedUsuario.email || ''} 
                onChange={e => handleInputChange('email', e.target.value)} 
                required 
                disabled={loading} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono:</label>
              <input 
                type="tel" 
                value={selectedUsuario.telefono || ''} 
                onChange={e => handleInputChange('telefono', e.target.value)} 
                disabled={loading} 
              />
            </div>
            <div className="form-group">
              <label>Fecha Nacimiento:</label>
              <input 
                type="date" 
                value={selectedUsuario.fecha_nacimiento || ''} 
                onChange={e => handleInputChange('fecha_nacimiento', e.target.value)} 
                disabled={loading} 
              />
            </div>
          </div>

          {selectedUsuario.tipo !== 'admin' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Facultad:</label>
                  <select 
                    value={selectedUsuario.facultad_id || ''} 
                    onChange={e => handleInputChange('facultad_id', e.target.value)} 
                    disabled={loading}
                  >
                    <option value="">Selecciona una facultad</option>
                    {facultades.map(f => (
                      <option key={f.id} value={f.id}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Programa:</label>
                  <select 
                    value={selectedUsuario.programa_id || ''} 
                    onChange={e => handleInputChange('programa_id', e.target.value)} 
                    disabled={loading || !selectedUsuario.facultad_id}
                  >
                    <option value="">
                      {selectedUsuario.facultad_id ? 'Selecciona un programa' : 'Primero selecciona una facultad'}
                    </option>
                    {programas.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Dirección:</label>
            <textarea 
              value={selectedUsuario.direccion || ''} 
              onChange={e => handleInputChange('direccion', e.target.value)} 
              rows="2" 
              disabled={loading} 
            />
          </div>

          <div className="form-group">
            <label>Tipo:</label>
            <select 
              value={selectedUsuario.tipo || ''} 
              onChange={e => handleInputChange('tipo', e.target.value)} 
              disabled={loading}
            >
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="form-group">
            <label>¿Activo?</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={!!selectedUsuario.activo} 
                  onChange={e => handleInputChange('activo', e.target.checked)} 
                  disabled={loading} 
                />
                <span>Sí</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={!selectedUsuario.activo} 
                  onChange={e => handleInputChange('activo', !e.target.checked)} 
                  disabled={loading} 
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <div className="form-group password-section">
            <label>🔒 Cambiar Contraseña (dejar en blanco para mantener la actual):</label>
            <input 
              type="password" 
              value={selectedUsuario.password || ''} 
              onChange={e => handleInputChange('password', e.target.value)} 
              disabled={loading} 
              placeholder="Nueva contraseña" 
              className="password-input"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? '🔄 Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
          {mensaje && <p className="mensaje-editar">{mensaje}</p>}
        </form>
      )}
    </div>
  );
};

export default EditarUsuarios;
