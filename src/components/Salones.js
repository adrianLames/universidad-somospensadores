import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './Salones.css';
import BackHomeButton from './BackHomeButton';

const ICONS = {
  capacidad: <span role="img" aria-label="capacidad">👥</span>,
  edificio: <span role="img" aria-label="edificio">🏢</span>,
  recursos: <span role="img" aria-label="recursos">💻</span>,
  estado: <span role="img" aria-label="estado">✔️</span>,
  calendario: <span role="img" aria-label="calendario">📅</span>,
};

const Salones = () => {
  const [salones, setSalones] = useState([]);
  const [showSalonForm, setShowSalonForm] = useState(false);
  const [nuevoSalon, setNuevoSalon] = useState({
    codigo: '',
    edificio: '',
    capacidad: '',
    tipo: 'aula',
    equipamiento: '',
    estado: 'Disponible',
    recursos: 'Proyector, WiFi',
    ubicacion: '',
  });
  const [loadingSalon, setLoadingSalon] = useState(false);
  const [search, setSearch] = useState('');
  const [editSalonId, setEditSalonId] = useState(null);
  const [editSalonData, setEditSalonData] = useState(null);

  useEffect(() => {
    fetchSalones();
  }, []);

  const fetchSalones = async () => {
    try {
      const response = await fetch(`${API_BASE}/salones.php`);
      const data = await response.json();
      setSalones(data);
    } catch (error) {
      console.error('Error fetching salones:', error);
    }
  };

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
        setNuevoSalon({ codigo: '', edificio: '', capacidad: '', tipo: 'aula', equipamiento: '', estado: 'Disponible', recursos: 'Proyector, WiFi', ubicacion: '' });
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

  const handleEditClick = (salon) => {
    setEditSalonId(salon.id);
    setEditSalonData({ ...salon });
    setShowSalonForm(false);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este salón?')) return;
    try {
      const response = await fetch(`${API_BASE}/salones.php?id=${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchSalones();
        alert('Salón eliminado correctamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al eliminar el salón');
      }
    } catch (error) {
      console.error('Error eliminando salón:', error);
      alert('Error de conexión');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoadingSalon(true);
    try {
      const response = await fetch(`${API_BASE}/salones.php?id=${editSalonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editSalonData),
      });
      if (response.ok) {
        await fetchSalones();
        setEditSalonId(null);
        setEditSalonData(null);
        alert('Salón editado correctamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al editar el salón');
      }
    } catch (error) {
      console.error('Error editando salón:', error);
      alert('Error de conexión');
    } finally {
      setLoadingSalon(false);
    }
  };

  // Datos resumen (simulados)
  const totalSalones = salones.length;
  const capacidadTotal = salones.reduce((acc, s) => acc + (parseInt(s.capacidad) || 0), 0);
  const reservasHoy = 32; // Simulado
  const disponibles = salones.filter(s => s.estado === 'Disponible').length;

  // Filtro de búsqueda
  const salonesFiltrados = salones.filter(salon =>
    salon.codigo.toLowerCase().includes(search.toLowerCase()) ||
    (salon.edificio && salon.edificio.toLowerCase().includes(search.toLowerCase())) ||
    (salon.ubicacion && salon.ubicacion.toLowerCase().includes(search.toLowerCase()))
  );

  // Etiqueta de estado
  const getEstadoTag = estado => {
    if (estado === 'Disponible') return <span className="tag tag-disponible">Disponible</span>;
    if (estado === 'Ocupado') return <span className="tag tag-ocupado">Ocupado</span>;
    if (estado === 'Mantenimiento') return <span className="tag tag-mantenimiento">Mantenimiento</span>;
    return <span className="tag">{estado}</span>;
  };

  return (
    <div className="salones-bg">
      <div className="salones-panel">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Gestión de Salones</h2>
          <BackHomeButton className="small-btn" label="Inicio" />
        </div>
        <p>Sistema de administración de aulas y espacios universitarios</p>
        <div className="salones-resumen-cards">
          <div className="resumen-card">
            <div>Total Salones</div>
            <div className="resumen-icon">{ICONS.edificio}</div>
            <div className="resumen-value">{totalSalones}</div>
          </div>
          <div className="resumen-card">
            <div>Capacidad Total</div>
            <div className="resumen-icon">{ICONS.capacidad}</div>
            <div className="resumen-value">{capacidadTotal.toLocaleString()}</div>
          </div>
          <div className="resumen-card">
            <div>Reservas Hoy</div>
            <div className="resumen-icon">{ICONS.calendario}</div>
            <div className="resumen-value">{reservasHoy}</div>
          </div>
          <div className="resumen-card">
            <div>Disponibles</div>
            <div className="resumen-icon">{ICONS.estado}</div>
            <div className="resumen-value">{disponibles}</div>
          </div>
        </div>
        <div className="salones-actions">
          <input
            type="text"
            className="salones-search"
            placeholder="Buscar salones..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="button" className="btn-primary" onClick={() => setShowSalonForm(true)}>
            + Agregar Salón
          </button>
        </div>
        {showSalonForm && (
          <form onSubmit={handleCreateSalon} className="nuevo-salon-form">
            <h3 style={{marginBottom: '1rem', color: '#2c3e91'}}>Crear Salón</h3>
            <div className="form-group">
              <label>Código:</label>
              <input type="text" value={nuevoSalon.codigo} onChange={e => setNuevoSalon({...nuevoSalon, codigo: e.target.value})} required disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Edificio:</label>
              <input type="text" value={nuevoSalon.edificio} onChange={e => setNuevoSalon({...nuevoSalon, edificio: e.target.value})} required disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Ubicación:</label>
              <input type="text" value={nuevoSalon.ubicacion} onChange={e => setNuevoSalon({...nuevoSalon, ubicacion: e.target.value})} disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Capacidad:</label>
              <input type="number" min="1" value={nuevoSalon.capacidad} onChange={e => setNuevoSalon({...nuevoSalon, capacidad: e.target.value})} required disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Tipo:</label>
              <select value={nuevoSalon.tipo} onChange={e => setNuevoSalon({...nuevoSalon, tipo: e.target.value})} disabled={loadingSalon}>
                <option value="aula">Aula</option>
                <option value="laboratorio">Laboratorio</option>
                <option value="auditorio">Auditorio</option>
              </select>
            </div>
            <div className="form-group">
              <label>Recursos:</label>
              <input type="text" value={nuevoSalon.recursos} onChange={e => setNuevoSalon({...nuevoSalon, recursos: e.target.value})} disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Equipamiento:</label>
              <input type="text" value={nuevoSalon.equipamiento} onChange={e => setNuevoSalon({...nuevoSalon, equipamiento: e.target.value})} disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Estado:</label>
              <select value={nuevoSalon.estado} onChange={e => setNuevoSalon({...nuevoSalon, estado: e.target.value})} disabled={loadingSalon}>
                <option value="Disponible">Disponible</option>
                <option value="Ocupado">Ocupado</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </div>
            <div style={{display: 'flex', gap: '1rem', marginTop: '8px'}}>
              <button type="submit" className="btn-primary" disabled={loadingSalon}>Guardar</button>
              <button type="button" className="btn-secondary" onClick={() => setShowSalonForm(false)} disabled={loadingSalon}>Cancelar</button>
            </div>
          </form>
        )}
        <div className="salones-list">
          <table className="salones-table">
            <thead>
              <tr>
                <th>Salón</th>
                <th>Ubicación</th>
                <th>Capacidad</th>
                <th>Recursos</th>
                <th>Equipamiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {salonesFiltrados.map(salon => (
                <tr key={salon.id}>
                  <td><strong>{salon.codigo}</strong></td>
                  <td><span role="img" aria-label="ubicacion">📍</span> {salon.ubicacion || salon.edificio}</td>
                  <td><span className="icon-capacidad">👥</span> {salon.capacidad}</td>
                  <td>
                    {salon.recursos ? salon.recursos.split(',').map((r, i) => (
                      <span key={i} className="tag tag-recurso">{r.trim()}</span>
                    )) : <span className="tag tag-recurso">Sin recursos</span>}
                  </td>
                  <td>{salon.equipamiento || <span className="tag tag-recurso">Sin equipamiento</span>}</td>
                  <td>{getEstadoTag(salon.estado)}</td>
                  <td>
                    <button className="btn-icon" title="Editar" onClick={() => handleEditClick(salon)}><span role="img" aria-label="editar">✏️</span></button>
                    <button className="btn-icon" title="Eliminar" onClick={() => handleDeleteClick(salon.id)}><span role="img" aria-label="eliminar">🗑️</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editSalonId && (
          <form onSubmit={handleEditSubmit} className="nuevo-salon-form" style={{marginTop: '2rem'}}>
            <h3 style={{marginBottom: '1rem', color: '#2c3e91'}}>Editar Salón</h3>
            <div className="form-group">
              <label>Código:</label>
              <input type="text" value={editSalonData.codigo} onChange={e => setEditSalonData({...editSalonData, codigo: e.target.value})} required disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Edificio:</label>
              <input type="text" value={editSalonData.edificio} onChange={e => setEditSalonData({...editSalonData, edificio: e.target.value})} required disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Ubicación:</label>
              <input type="text" value={editSalonData.ubicacion} onChange={e => setEditSalonData({...editSalonData, ubicacion: e.target.value})} disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Capacidad:</label>
              <input type="number" min="1" value={editSalonData.capacidad} onChange={e => setEditSalonData({...editSalonData, capacidad: e.target.value})} required disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Tipo:</label>
              <select value={editSalonData.tipo} onChange={e => setEditSalonData({...editSalonData, tipo: e.target.value})} disabled={loadingSalon}>
                <option value="aula">Aula</option>
                <option value="laboratorio">Laboratorio</option>
                <option value="auditorio">Auditorio</option>
              </select>
            </div>
            <div className="form-group">
              <label>Recursos:</label>
              <input type="text" value={editSalonData.recursos} onChange={e => setEditSalonData({...editSalonData, recursos: e.target.value})} disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Equipamiento:</label>
              <input type="text" value={editSalonData.equipamiento} onChange={e => setEditSalonData({...editSalonData, equipamiento: e.target.value})} disabled={loadingSalon} />
            </div>
            <div className="form-group">
              <label>Estado:</label>
              <select value={editSalonData.estado} onChange={e => setEditSalonData({...editSalonData, estado: e.target.value})} disabled={loadingSalon}>
                <option value="Disponible">Disponible</option>
                <option value="Ocupado">Ocupado</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </div>
            <div style={{display: 'flex', gap: '1rem', marginTop: '8px'}}>
              <button type="submit" className="btn-primary" disabled={loadingSalon}>Guardar cambios</button>
              <button type="button" className="btn-secondary" onClick={() => {setEditSalonId(null); setEditSalonData(null);}} disabled={loadingSalon}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Salones;
