import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './GestionUsuarios.css';

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

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE}/usuarios.php`);
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert('Usuario guardado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al guardar el usuario');
      }
    } catch (error) {
      console.error('Error saving usuario:', error);
      alert('Error de conexión');
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
    setShowForm(false);
  };

  const editUsuario = (usuario) => {
    setCurrentUsuario({...usuario, password: ''});
    setShowForm(true);
  };

  const deleteUsuario = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        const response = await fetch(`${API_BASE}/usuarios.php?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchUsuarios();
          alert('Usuario eliminado exitosamente');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Error al eliminar el usuario');
        }
      } catch (error) {
        console.error('Error deleting usuario:', error);
        alert('Error de conexión');
      }
    }
  };

  return (
    <div className="gestion-usuarios">
      <h2>👥 Gestión de Usuarios</h2>
      
      <button 
        className="btn-primary"
        onClick={() => setShowForm(true)}
      >
        ➕ Nuevo Usuario
      </button>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{currentUsuario.id ? '✏️ Editar' : '➕ Nuevo'} Usuario</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  value={currentUsuario.tipo}
                  onChange={(e) => setCurrentUsuario({...currentUsuario, tipo: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label>Identificación:</label>
                <input
                  type="text"
                  value={currentUsuario.identificacion}
                  onChange={(e) => setCurrentUsuario({...currentUsuario, identificacion: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Nombres:</label>
                <input
                  type="text"
                  value={currentUsuario.nombres}
                  onChange={(e) => setCurrentUsuario({...currentUsuario, nombres: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Apellidos:</label>
                <input
                  type="text"
                  value={currentUsuario.apellidos}
                  onChange={(e) => setCurrentUsuario({...currentUsuario, apellidos: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={currentUsuario.email}
                  onChange={(e) => setCurrentUsuario({...currentUsuario, email: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Teléfono:</label>
                <input
                  type="tel"
                  value={currentUsuario.telefono}
                  onChange={(e) => setCurrentUsuario({...currentUsuario, telefono: e.target.value})}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Nacimiento:</label>
                <input
                  type="date"
                  value={currentUsuario.fecha_nacimiento}
                  onChange={(e) => setCurrentUsuario({...currentUsuario, fecha_nacimiento: e.target.value})}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Dirección:</label>
                <textarea
                  value={currentUsuario.direccion}
                  onChange={(e) => setCurrentUsuario({...currentUsuario, direccion: e.target.value})}
                  rows="3"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Contraseña:</label>
                <input
                  type="password"
                  value={currentUsuario.password}
                  onChange={(e) => setCurrentUsuario({...currentUsuario, password: e.target.value})}
                  required={!currentUsuario.id}
                  disabled={loading}
                  placeholder={currentUsuario.id ? "Dejar en blanco para mantener la actual" : ""}
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

      <div className="usuarios-list">
        {usuarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No hay usuarios registrados</p>
          </div>
        ) : (
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
                <tr key={usuario.id}>
                  <td><strong>{usuario.identificacion}</strong></td>
                  <td>{usuario.nombres} {usuario.apellidos}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`user-role ${usuario.tipo}`}>
                      {usuario.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => editUsuario(usuario)}>✏️ Editar</button>
                      <button onClick={() => deleteUsuario(usuario.id)}>🗑️ Eliminar</button>
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

export default GestionUsuarios;