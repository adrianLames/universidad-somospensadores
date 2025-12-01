import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiRequest } from '../config/api';
import './AdminMapaSalonesVisual.css';

const MapaSalonesVisualEstudiante = () => {
  const [salones, setSalones] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEdificio, setFiltroEdificio] = useState('todos');

  const COORDS_BASE = {
    lat: 3.022922,
    lng: -76.482656
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [salonesData, horariosData] = await Promise.all([
        apiRequest('salones.php'),
        apiRequest('horarios.php')
      ]);

      // Filtrar solo salones visibles
      const salonesVisibles = (salonesData || [])
        .filter(s => s.visible == 1 || s.visible === true)
        .map(s => ({
          ...s,
          latitud: parseFloat(s.latitud) || 3.022922,
          longitud: parseFloat(s.longitud) || -76.482656,
          capacidad: parseInt(s.capacidad) || 0
        }));

      setSalones(salonesVisibles);
      setHorarios(Array.isArray(horariosData) ? horariosData : []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar salones');
    } finally {
      setLoading(false);
    }
  };

  const obtenerHorariosSalon = (salonId) => {
    return horarios.filter(h => h.salon_id === salonId);
  };

  const edificios = ['todos', ...new Set(salones.map(s => s.edificio))];

  const salonesFiltrados = salones.filter(s => {
    const cumpleBusqueda = s.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.edificio.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleEdificio = filtroEdificio === 'todos' || s.edificio === filtroEdificio;
    return cumpleBusqueda && cumpleEdificio;
  });

  if (loading) {
    return (
      <div className="admin-visual-container">
        <div className="loading">Cargando mapa de salones...</div>
      </div>
    );
  }

  return (
    <div className="admin-visual-container">
      <div className="admin-visual-header">
        <h1>🗺️ Mapa Visual del Campus - Salones</h1>
        <p>Explora la ubicación de los salones en el campus universitario</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="admin-visual-content">
        {/* Mapa */}
        <div className="mapa-section">
          <div className="mapa-controls">
            <div className="control-info">
              <span className="badge-info">
                📍 Haz clic en los marcadores para ver información del salón
              </span>
              <span className="badge-cambios">
                {salonesFiltrados.length} salones disponibles
              </span>
            </div>
          </div>

          <MapContainer
            center={[COORDS_BASE.lat, COORDS_BASE.lng]}
            zoom={18}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            className="leaflet-container-admin"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              minZoom={10}
            />
            
            {salonesFiltrados.map((salon) => {
              const horariosDelSalon = obtenerHorariosSalon(salon.id);
              const tieneClases = horariosDelSalon.length > 0;
              
              return (
                <Marker
                  key={salon.id}
                  position={[salon.latitud, salon.longitud]}
                  eventHandlers={{
                    click: () => setSalonSeleccionado(salon)
                  }}
                  icon={L.divIcon({
                    className: `custom-marker ${salonSeleccionado?.id === salon.id ? 'selected' : ''}`,
                    html: `
                      <div style="
                        background-color: ${salonSeleccionado?.id === salon.id ? '#FF6B6B' : (tieneClases ? '#4ECDC4' : '#667eea')};
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: white;
                        font-size: 14px;
                        margin-left: -16px;
                        margin-top: -32px;
                        cursor: pointer;
                      ">${salon.codigo.charAt(0)}</div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                  })}
                >
                  <Popup>
                    <div className="popup-salon">
                      <h4>{salon.codigo}</h4>
                      <p><strong>Edificio:</strong> {salon.edificio}</p>
                      <p><strong>Tipo:</strong> {salon.tipo}</p>
                      <p><strong>Capacidad:</strong> {salon.capacidad} personas</p>
                      {salon.ubicacion && (
                        <p><strong>Ubicación:</strong> {salon.ubicacion}</p>
                      )}
                      {salon.equipamiento && (
                        <p><strong>Equipamiento:</strong> {salon.equipamiento}</p>
                      )}
                      {horariosDelSalon.length > 0 && (
                        <div className="horarios-popup">
                          <p><strong>📅 Clases programadas:</strong></p>
                          <small>{horariosDelSalon.length} clase(s)</small>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Panel lateral */}
        <div className="panel-section">
          <div className="panel-header">
            <h3>📋 Salones del Campus</h3>
          </div>

          <div className="panel-controles">
            <input
              type="text"
              placeholder="Buscar salón o edificio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />

            <select
              value={filtroEdificio}
              onChange={(e) => setFiltroEdificio(e.target.value)}
              className="select-filtro"
            >
              <option value="todos">Todos los edificios</option>
              {edificios.filter(e => e !== 'todos').map(edificio => (
                <option key={edificio} value={edificio}>
                  {edificio}
                </option>
              ))}
            </select>
          </div>

          <div className="panel-salones">
            {salonesFiltrados.map((salon) => {
              const horariosDelSalon = obtenerHorariosSalon(salon.id);
              
              return (
                <div
                  key={salon.id}
                  className={`salon-item ${salonSeleccionado?.id === salon.id ? 'selected' : ''}`}
                  onClick={() => setSalonSeleccionado(salon)}
                >
                  <div className="salon-item-header">
                    <div className="salon-info">
                      <h4>{salon.codigo}</h4>
                      <p className="salon-edificio">{salon.edificio}</p>
                    </div>
                    <div className="salon-badge">
                      {horariosDelSalon.length > 0 ? (
                        <span className="badge-clases">📚 {horariosDelSalon.length}</span>
                      ) : (
                        <span className="badge-disponible">✓</span>
                      )}
                    </div>
                  </div>

                  <div className="salon-details">
                    <div className="detail-item">
                      <span className="label">Tipo:</span>
                      <span className="value">{salon.tipo}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Capacidad:</span>
                      <span className="value">{salon.capacidad} personas</span>
                    </div>
                    {salon.equipamiento && (
                      <div className="detail-item">
                        <span className="label">Equipamiento:</span>
                        <span className="value">{salon.equipamiento}</span>
                      </div>
                    )}
                  </div>

                  {salonSeleccionado?.id === salon.id && horariosDelSalon.length > 0 && (
                    <div className="salon-horarios-detalle">
                      <h5>📅 Horarios de Clase</h5>
                      <div className="horarios-lista-mini">
                        {horariosDelSalon.slice(0, 3).map((horario, idx) => (
                          <div key={idx} className="horario-mini">
                            <span className="dia-horario">{horario.dia_semana}</span>
                            <span className="hora-horario">
                              {horario.hora_inicio} - {horario.hora_fin}
                            </span>
                          </div>
                        ))}
                        {horariosDelSalon.length > 3 && (
                          <small className="mas-horarios">
                            +{horariosDelSalon.length - 3} más...
                          </small>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {salonesFiltrados.length === 0 && (
              <div className="sin-resultados">
                <p>No se encontraron salones con los filtros aplicados</p>
              </div>
            )}
          </div>

          <div className="panel-stats">
            <div className="stat">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{salones.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Visibles:</span>
              <span className="stat-value">{salonesFiltrados.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Ocultos:</span>
              <span className="stat-value">{salones.length - salonesFiltrados.length}</span>
            </div>
          </div>

          <div className="leyenda-mapa">
            <h5>Leyenda</h5>
            <div className="leyenda-items">
              <div className="leyenda-item">
                <div className="color-box" style={{ backgroundColor: '#4ECDC4' }}></div>
                <span>Con clases programadas</span>
              </div>
              <div className="leyenda-item">
                <div className="color-box" style={{ backgroundColor: '#667eea' }}></div>
                <span>Sin clases</span>
              </div>
              <div className="leyenda-item">
                <div className="color-box" style={{ backgroundColor: '#FF6B6B' }}></div>
                <span>Salón seleccionado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaSalonesVisualEstudiante;
