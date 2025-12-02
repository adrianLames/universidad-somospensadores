
import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';
import './GestionFacultades.css';

const GestionFacultades = () => {
  const [facultades, setFacultades] = useState([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchFacultades();
  }, []);

  const fetchFacultades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/facultades.php`);
      const data = await res.json();
      const facultadesData = data.success ? data.data : (Array.isArray(data) ? data : []);
      setFacultades(facultadesData);
    } catch {
      setFacultades([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${API_BASE}/facultades.php?id=${editId}` : `${API_BASE}/facultades.php`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje(editId ? 'Facultad actualizada' : 'Facultad creada');
        setNombre('');
        setEditId(null);
        fetchFacultades();
      } else {
        setMensaje(data.error || 'Error al guardar');
      }
    } catch {
      setMensaje('Error de red');
    }
    setLoading(false);
  };

  const handleEdit = (facultad) => {
    setNombre(facultad.nombre);
    setEditId(facultad.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta facultad?')) return;
    setLoading(true);
    setMensaje('');
    try {
      const res = await fetch(`${API_BASE}/facultades.php?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMensaje('Facultad eliminada');
        fetchFacultades();
      } else {
        setMensaje(data.error || 'Error al eliminar');
      }
    } catch {
      setMensaje('Error de red');
    }
    setLoading(false);
  };

  return (
    <div className="gestion-facultades">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Gestión de Facultades Académicas</h2>
      </div>
      <form onSubmit={handleSubmit} className="facultad-form">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre de la facultad"
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading || !nombre}>
          {editId ? 'Actualizar' : 'Crear'}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setNombre(''); }} disabled={loading}>
            Cancelar
          </button>
        )}
      </form>
      {mensaje && <p className="mensaje-facultad">{mensaje}</p>}
      <table className="facultades-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facultades.map(f => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.nombre}</td>
              <td>
                <button onClick={() => handleEdit(f)} disabled={loading}>Editar</button>
                <button onClick={() => handleDelete(f.id)} disabled={loading}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionFacultades;
