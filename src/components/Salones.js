import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { mostrarExito, mostrarError, mostrarAdvertencia } from '../utils/notificaciones';
import './Salones.css';

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
    capacidad: 30,
    tipo: 'aula',
    equipamiento: '',
    estado: 'Disponible',
    recursos: '',
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
    
    // Validaciones
    if (!nuevoSalon.codigo.trim()) {
      mostrarAdvertencia('El código del salón es requerido');
      return;
    }
    if (!nuevoSalon.edificio.trim()) {
      mostrarAdvertencia('El edificio es requerido');
      return;
    }
    
    setLoadingSalon(true);
    try {
      const response = await fetch(`${API_BASE}/salones.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...nuevoSalon,
          latitud: 3.022922,
          longitud: -76.482656,
          visible: true
        }),
      });
      
      const data = await response.json();
      
      if (response.ok || data.message) {
        await fetchSalones();
        setShowSalonForm(false);
        setNuevoSalon({ codigo: '', edificio: '', capacidad: 30, tipo: 'aula', equipamiento: '', estado: 'Disponible', recursos: '', ubicacion: '' });
        mostrarExito('Salón creado correctamente');
      } else {
        mostrarError(data.error || 'Error al crear el salón');
      }
    } catch (error) {
      console.error('Error creando salón:', error);
      mostrarError('Error de conexión');
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
        mostrarExito('Salón eliminado correctamente');
      } else {
        const errorData = await response.json();
        mostrarError(errorData.error || 'Error al eliminar el salón');
      }
    } catch (error) {
      console.error('Error eliminando salón:', error);
      mostrarError('Error de conexión');
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
        mostrarExito('Salón editado correctamente');
      } else {
        const errorData = await response.json();
        mostrarError(errorData.error || 'Error al editar el salón');
      }
    } catch (error) {
      console.error('Error editando salón:', error);
      mostrarError('Error de conexión');
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
        <h2>Gestión de Salones</h2>
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
          <button type="button" className="btn-agregar-salon" onClick={() => setShowSalonForm(true)}>
            + Agregar Salón
          </button>
        </div>

        {/* Modal para agregar salón */}
        {showSalonForm && (
          <div className="modal-overlay" onClick={() => setShowSalonForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>➕ Agregar Nuevo Salón</h2>
                <button className="btn-close-modal" onClick={() => setShowSalonForm(false)}>×</button>
              </div>
              
              <form onSubmit={handleCreateSalon}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="codigo">Código del Salón *</label>
                    <input
                      type="text"
                      id="codigo"
                      value={nuevoSalon.codigo}
                      onChange={e => setNuevoSalon({...nuevoSalon, codigo: e.target.value})}
                      placeholder="Ej: A101, B205, LAB1"
                      required
                      disabled={loadingSalon}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edificio">Edificio *</label>
                    <input
                      type="text"
                      id="edificio"
                      value={nuevoSalon.edificio}
                      onChange={e => setNuevoSalon({...nuevoSalon, edificio: e.target.value})}
                      placeholder="Ej: Bloque A, Campus Central"
                      required
                      disabled={loadingSalon}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ubicacion">Ubicación</label>
                    <input
                      type="text"
                      id="ubicacion"
                      value={nuevoSalon.ubicacion}
                      onChange={e => setNuevoSalon({...nuevoSalon, ubicacion: e.target.value})}
                      placeholder="Ej: Piso 2, Ala Norte"
                      disabled={loadingSalon}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="tipo">Tipo</label>
                      <select
                        id="tipo"
                        value={nuevoSalon.tipo}
                        onChange={e => setNuevoSalon({...nuevoSalon, tipo: e.target.value})}
                        disabled={loadingSalon}
                      >
                        <option value="aula">Aula</option>
                        <option value="laboratorio">Laboratorio</option>
                        <option value="auditorio">Auditorio</option>
                        <option value="sala">Sala</option>
                        <option value="oficina">Oficina</option>
                        <option value="institucional">Institucional (Biblioteca, Cafetería, etc.)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="capacidad">Capacidad</label>
                      <input
                        type="number"
                        id="capacidad"
                        min="1"
                        max="500"
                        value={nuevoSalon.capacidad}
                        onChange={e => setNuevoSalon({...nuevoSalon, capacidad: parseInt(e.target.value) || 0})}
                        disabled={loadingSalon}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="recursos">Recursos</label>
                    <input
                      type="text"
                      id="recursos"
                      value={nuevoSalon.recursos}
                      onChange={e => setNuevoSalon({...nuevoSalon, recursos: e.target.value})}
                      placeholder="Ej: Proyector, Pizarra digital, WiFi"
                      disabled={loadingSalon}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="equipamiento">Equipamiento</label>
                    <input
                      type="text"
                      id="equipamiento"
                      value={nuevoSalon.equipamiento}
                      onChange={e => setNuevoSalon({...nuevoSalon, equipamiento: e.target.value})}
                      placeholder="Ej: 30 sillas, aire acondicionado"
                      disabled={loadingSalon}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="estado">Estado</label>
                    <select
                      id="estado"
                      value={nuevoSalon.estado}
                      onChange={e => setNuevoSalon({...nuevoSalon, estado: e.target.value})}
                      disabled={loadingSalon}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Ocupado">Ocupado</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn-cancelar"
                    onClick={() => setShowSalonForm(false)}
                    disabled={loadingSalon}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="btn-guardar"
                    disabled={loadingSalon || !nuevoSalon.codigo.trim() || !nuevoSalon.edificio.trim()}
                  >
                    {loadingSalon ? 'Guardando...' : '✓ Guardar Salón'}
                  </button>
                </div>
              </form>
            </div>
          </div>
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

        {/* Modal para editar salón */}
        {editSalonId && (
          <div className="modal-overlay" onClick={() => { setEditSalonId(null); setEditSalonData(null); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✏️ Editar Salón</h2>
                <button className="btn-close-modal" onClick={() => { setEditSalonId(null); setEditSalonData(null); }}>×</button>
              </div>
              
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="edit-codigo">Código del Salón *</label>
                    <input
                      type="text"
                      id="edit-codigo"
                      value={editSalonData.codigo}
                      onChange={e => setEditSalonData({...editSalonData, codigo: e.target.value})}
                      required
                      disabled={loadingSalon}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-edificio">Edificio *</label>
                    <input
                      type="text"
                      id="edit-edificio"
                      value={editSalonData.edificio}
                      onChange={e => setEditSalonData({...editSalonData, edificio: e.target.value})}
                      required
                      disabled={loadingSalon}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-ubicacion">Ubicación</label>
                    <input
                      type="text"
                      id="edit-ubicacion"
                      value={editSalonData.ubicacion || ''}
                      onChange={e => setEditSalonData({...editSalonData, ubicacion: e.target.value})}
                      disabled={loadingSalon}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-tipo">Tipo</label>
                      <select
                        id="edit-tipo"
                        value={editSalonData.tipo}
                        onChange={e => setEditSalonData({...editSalonData, tipo: e.target.value})}
                        disabled={loadingSalon}
                      >
                        <option value="aula">Aula</option>
                        <option value="laboratorio">Laboratorio</option>
                        <option value="auditorio">Auditorio</option>
                        <option value="sala">Sala</option>
                        <option value="oficina">Oficina</option>
                        <option value="institucional">Institucional (Biblioteca, Cafetería, etc.)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-capacidad">Capacidad</label>
                      <input
                        type="number"
                        id="edit-capacidad"
                        min="1"
                        max="500"
                        value={editSalonData.capacidad}
                        onChange={e => setEditSalonData({...editSalonData, capacidad: parseInt(e.target.value) || 0})}
                        disabled={loadingSalon}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-recursos">Recursos</label>
                    <input
                      type="text"
                      id="edit-recursos"
                      value={editSalonData.recursos || ''}
                      onChange={e => setEditSalonData({...editSalonData, recursos: e.target.value})}
                      placeholder="Ej: Proyector, Pizarra digital, WiFi"
                      disabled={loadingSalon}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-equipamiento">Equipamiento</label>
                    <input
                      type="text"
                      id="edit-equipamiento"
                      value={editSalonData.equipamiento || ''}
                      onChange={e => setEditSalonData({...editSalonData, equipamiento: e.target.value})}
                      placeholder="Ej: 30 sillas, aire acondicionado"
                      disabled={loadingSalon}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-estado">Estado</label>
                    <select
                      id="edit-estado"
                      value={editSalonData.estado}
                      onChange={e => setEditSalonData({...editSalonData, estado: e.target.value})}
                      disabled={loadingSalon}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Ocupado">Ocupado</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn-cancelar"
                    onClick={() => { setEditSalonId(null); setEditSalonData(null); }}
                    disabled={loadingSalon}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="btn-guardar"
                    disabled={loadingSalon}
                  >
                    {loadingSalon ? 'Guardando...' : '✓ Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salones;
