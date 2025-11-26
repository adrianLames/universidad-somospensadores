import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiRequest } from '../config/api';
import BackHomeButton from './BackHomeButton';
import './AdminMapaSalonesVisual.css';

// Hook para capturar clicks en el mapa
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// Componente para marcadores arrastrables
const DraggableMarker = ({ salon, onDragEnd, onSelect, isSelected }) => {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onDragEnd(salon.id, lat, lng);
      }
    },
    click() {
      onSelect(salon);
    },
  };

  return (
    <Marker
      ref={markerRef}
      position={[salon.latitud || 3.022922, salon.longitud || -76.482656]}
      draggable={true}
      eventHandlers={eventHandlers}
      icon={L.divIcon({
        className: `custom-marker ${isSelected ? 'selected' : ''}`,
        html: `
          <div style="
            background-color: ${isSelected ? '#FF6B6B' : '#667eea'};
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
            cursor: move;
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
          <p><strong>Capacidad:</strong> {salon.capacidad}</p>
          <p><strong>Lat:</strong> {salon.latitud?.toFixed(6) || 'N/A'}</p>
          <p><strong>Lng:</strong> {salon.longitud?.toFixed(6) || 'N/A'}</p>
        </div>
      </Popup>
    </Marker>
  );
};

const AdminMapaSalonesVisual = ({ user }) => {
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);
  const [filtroVisibilidad, setFiltroVisibilidad] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState(0);

  const COORDS_BASE = {
    lat: 3.022922,
    lng: -76.482656
  };

  useEffect(() => {
    cargarSalones();
  }, []);

  const cargarSalones = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('salones.php');
      // Asegurar que todos los salones tengan un valor por defecto para visible
      const salonesConDefaults = (data || []).map(s => ({
        ...s,
        visible: s.visible !== undefined && s.visible !== null ? parseInt(s.visible) : 1,
        latitud: parseFloat(s.latitud) || 3.022922,
        longitud: parseFloat(s.longitud) || -76.482656,
        capacidad: parseInt(s.capacidad) || 0
      }));
      setSalones(salonesConDefaults);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar salones');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (salonId, lat, lng) => {
    const salonActualizado = salones.map(s =>
      s.id === salonId ? { ...s, latitud: lat, longitud: lng } : s
    );
    setSalones(salonActualizado);
    setCambiosPendientes(cambiosPendientes + 1);

    // Guardar automáticamente
    try {
      await apiRequest('salones.php', {
        method: 'PUT',
        body: JSON.stringify({
          id: salonId,
          latitud: lat,
          longitud: lng
        })
      });
      setCambiosPendientes(cambiosPendientes);
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const toggleVisibilidad = async (salonId) => {
    try {
      const salon = salones.find(s => s.id === salonId);
      const nuevoEstado = !salon.visible;
      
      console.log('Cambiando visibilidad:', { salonId, nuevoEstado });
      
      const response = await apiRequest('salones_visibilidad.php', {
        method: 'POST',
        body: JSON.stringify({
          salon_id: salonId,
          visible: nuevoEstado
        })
      });
      
      console.log('Respuesta:', response);

      // Actualizar estado local
      setSalones(salones.map(s =>
        s.id === salonId ? { ...s, visible: nuevoEstado } : s
      ));
      
      // Actualizar el salón seleccionado también
      if (salonSeleccionado?.id === salonId) {
        setSalonSeleccionado({
          ...salonSeleccionado,
          visible: nuevoEstado
        });
      }
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err);
      setError(`Error: ${err.message}`);
    }
  };

  const handleMapClick = (latlng) => {
    if (modoEdicion && salonSeleccionado) {
      handleDragEnd(salonSeleccionado.id, latlng.lat, latlng.lng);
      setSalonSeleccionado({
        ...salonSeleccionado,
        latitud: latlng.lat,
        longitud: latlng.lng
      });
    }
  };

  const salonesVisibles = salones.filter(s => {
    const cumpleBusqueda = s.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.edificio.toLowerCase().includes(busqueda.toLowerCase());
    
    if (filtroVisibilidad === 'visibles') return cumpleBusqueda && s.visible;
    if (filtroVisibilidad === 'ocultos') return cumpleBusqueda && !s.visible;
    return cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="admin-visual-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="admin-visual-container">
      <BackHomeButton />

      <div className="admin-visual-header">
        <h1>🗺️ Administración Visual - Mapa de Salones</h1>
        <p>Arrastra los marcadores para ajustar las posiciones de los salones</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="admin-visual-content">
        {/* Mapa */}
        <div className="mapa-section">
          <div className="mapa-controls">
            <div className="control-info">
              <span className="badge-info">
                ℹ️ Arrastra los marcadores para cambiar posiciones
              </span>
              {cambiosPendientes > 0 && (
                <span className="badge-cambios">
                  💾 {cambiosPendientes} cambio(s) guardado(s)
                </span>
              )}
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
            <MapClickHandler onMapClick={handleMapClick} />
            {salonesVisibles.map((salon) => (
              <DraggableMarker
                key={salon.id}
                salon={salon}
                onDragEnd={handleDragEnd}
                onSelect={() => setSalonSeleccionado(salon)}
                isSelected={salonSeleccionado?.id === salon.id}
              />
            ))}
          </MapContainer>
        </div>

        {/* Panel lateral */}
        <div className="panel-section">
          <div className="panel-header">
            <h3>📋 Salones</h3>
          </div>

          <div className="panel-controles">
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />

            <select
              value={filtroVisibilidad}
              onChange={(e) => setFiltroVisibilidad(e.target.value)}
              className="select-filtro"
            >
              <option value="todos">Todos ({salones.length})</option>
              <option value="visibles">
                Visibles ({salones.filter(s => s.visible).length})
              </option>
              <option value="ocultos">
                Ocultos ({salones.filter(s => !s.visible).length})
              </option>
            </select>
          </div>

          <div className="panel-salones">
            {salonesVisibles.map((salon) => (
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
                  <div className="salon-acciones">
                    <button
                      className={`btn-visibility ${salon.visible ? 'visible' : 'oculto'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibilidad(salon.id);
                      }}
                      title={salon.visible ? 'Ocultar' : 'Mostrar'}
                    >
                      {salon.visible ? '👁️' : '🚫'}
                    </button>
                  </div>
                </div>

                <div className="salon-details">
                  <div className="detail-item">
                    <span className="label">Tipo:</span>
                    <span className="value">{salon.tipo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Capacidad:</span>
                    <span className="value">{salon.capacidad}</span>
                  </div>
                  {salon.latitud && salon.longitud && (
                    <div className="detail-item coords">
                      <span className="label">Coordenadas:</span>
                      <span className="value coords-text">
                        {salon.latitud.toFixed(4)}, {salon.longitud.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                {salonSeleccionado?.id === salon.id && (
                  <div className="salon-acciones-expandidas">
                    <button
                      className={`btn-modo-edicion ${modoEdicion ? 'activo' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModoEdicion(!modoEdicion);
                      }}
                    >
                      {modoEdicion ? '✓ Edición Activa' : 'Editar Posición'}
                    </button>
                    <div className="instruccion">
                      {modoEdicion ? (
                        <small>💡 Haz clic en el mapa para establecer la posición</small>
                      ) : (
                        <small>💡 Arrastra el marcador o presiona "Editar Posición"</small>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="panel-stats">
            <div className="stat">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{salones.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Visibles:</span>
              <span className="stat-value">{salones.filter(s => s.visible).length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Ocultos:</span>
              <span className="stat-value">{salones.filter(s => !s.visible).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMapaSalonesVisual;
