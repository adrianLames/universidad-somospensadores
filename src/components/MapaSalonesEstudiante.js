import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiRequest } from '../config/api';
import {
  generarCoordenadas,
  obtenerColorMarcador,
  obtenerInfoMarcador,
  filtrarHorariosPorDia,
  DIAS_SEMANA,
  obtenerDiaActual
} from '../utils/mapaSalonesUtils';
import './MapaSalones.css';

// Coordenadas de la Universidad del Valle (Meléndez)
const UNIVERSIDAD_VALLE_COORDS = {
  lat: 3.3749,
  lng: -76.5321
};

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Crear iconos personalizados por color
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const MapaSalonesEstudiante = () => {
  const [salones, setSalones] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState({
    edificio: 'todos',
    diaSemana: obtenerDiaActual(),
    tipo: 'todos'
  });

  // Cargar salones y horarios
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const salonesData = await apiRequest('salones.php');
        const horariosData = await apiRequest('horarios.php');

        // Agregar coordenadas a cada salón
        const salonesConCoordenadas = (Array.isArray(salonesData) ? salonesData : []).map((salon, index) => ({
          ...salon,
          coordenadas: generarCoordenadas(index, UNIVERSIDAD_VALLE_COORDS)
        }));

        setSalones(salonesConCoordenadas);
        setHorarios(Array.isArray(horariosData) ? horariosData : []);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos de salones y horarios');
        setSalones([]);
        setHorarios([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Obtener información completa del marcador
  const obtenerInfoMarcadorCompleta = useCallback((salon) => {
    return obtenerInfoMarcador(salon, horarios);
  }, [horarios]);

  // Filtrar salones según criterios
  const salonesFiltrados = salones.filter(salon => {
    if (filtro.edificio !== 'todos' && salon.edificio !== filtro.edificio) {
      return false;
    }
    if (filtro.tipo !== 'todos' && salon.tipo !== filtro.tipo) {
      return false;
    }
    return true;
  });

  // Obtener edificios y tipos únicos
  const edificios = ['todos', ...new Set(salones.map(s => s.edificio))];
  const tipos = ['todos', ...new Set(salones.map(s => s.tipo))];

  if (loading) {
    return (
      <div className="mapa-salones-container">
        <div className="loading">Cargando mapa de salones...</div>
      </div>
    );
  }

  return (
    <div className="mapa-salones-container">
      <div className="mapa-header">
        <h1>🗺️ Mapa de Salones - Campus Universitario</h1>
        <p className="mapa-subtitle">Explora los salones y encuentra tus clases programadas</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="mapa-filtros">
        <div className="filtro-grupo">
          <label htmlFor="edificio-filter">🏢 Edificio:</label>
          <select
            id="edificio-filter"
            value={filtro.edificio}
            onChange={(e) => setFiltro({ ...filtro, edificio: e.target.value })}
          >
            {edificios.map((ed) => (
              <option key={ed} value={ed}>
                {ed === 'todos' ? 'Todos los edificios' : ed}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label htmlFor="tipo-filter">📚 Tipo de Salón:</label>
          <select
            id="tipo-filter"
            value={filtro.tipo}
            onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
          >
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo === 'todos' ? 'Todos los tipos' : tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label htmlFor="dia-filter">📅 Día:</label>
          <select
            id="dia-filter"
            value={filtro.diaSemana}
            onChange={(e) => setFiltro({ ...filtro, diaSemana: e.target.value })}
          >
            {DIAS_SEMANA.map((dia) => (
              <option key={dia} value={dia}>
                {dia}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mapa-contenedor-principal">
        <div className="mapa-google">
          <MapContainer
            center={[UNIVERSIDAD_VALLE_COORDS.lat, UNIVERSIDAD_VALLE_COORDS.lng]}
            zoom={17}
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {salonesFiltrados.map((salon) => {
              const color = obtenerColorMarcador(salon, horarios, filtro.diaSemana);
              const customIcon = createCustomIcon(color);
              
              return (
                <Marker
                  key={salon.id}
                  position={[salon.coordenadas.lat, salon.coordenadas.lng]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedMarker(obtenerInfoMarcadorCompleta(salon));
                    }
                  }}
                >
                  <Popup>
                    <div className="info-window-contenido">
                      <div className="info-header">
                        <h3>{salon.codigo}</h3>
                        <span className="edificio-tag">{salon.edificio}</span>
                      </div>

                      <div className="info-details">
                        <p><strong>Tipo:</strong> {salon.tipo}</p>
                        <p><strong>Capacidad:</strong> {salon.capacidad} personas</p>
                        <p><strong>Ubicación:</strong> {salon.ubicacion || 'No especificada'}</p>
                        <p>
                          <strong>Estado:</strong>{' '}
                          <span className={`estado ${salon.estado?.toLowerCase()}`}>
                            {salon.estado}
                          </span>
                        </p>
                        {salon.equipamiento && (
                          <p><strong>Equipamiento:</strong> {salon.equipamiento}</p>
                        )}
                      </div>

                      <div className="info-horarios">
                        <h4>📅 Clases Programadas ({filtro.diaSemana})</h4>
                        {horarios.filter(h => h.salon_id === salon.id && h.dia_semana === filtro.diaSemana).length > 0 ? (
                          <div className="horarios-list">
                            {horarios
                              .filter(h => h.salon_id === salon.id && h.dia_semana === filtro.diaSemana)
                              .map((horario, idx) => (
                                <div key={idx} className="horario-item">
                                  <div className="horario-dia">{horario.dia_semana}</div>
                                  <div className="horario-info">
                                    <p className="horario-tiempo">
                                      🕐 {horario.hora_inicio} - {horario.hora_fin}
                                    </p>
                                    <p className="curso-nombre">{horario.curso_nombre}</p>
                                    <p className="profesor-nombre">
                                      👨‍🏫 {horario.docente_nombres} {horario.docente_apellidos}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="sin-clases">No hay clases programadas para {filtro.diaSemana}</p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div className="mapa-panel-info">
          {selectedMarker ? (
            <div className="salon-detalle-completo">
              <div className="detalle-header">
                <div>
                  <h3>{selectedMarker.codigo}</h3>
                  <span className="edificio-tag">{selectedMarker.edificio}</span>
                </div>
                <button className="btn-cerrar" onClick={() => setSelectedMarker(null)}>✕</button>
              </div>

              <div className="info-details">
                <div className="info-item">
                  <strong>Tipo:</strong> {selectedMarker.tipo}
                </div>
                <div className="info-item">
                  <strong>Capacidad:</strong> {selectedMarker.capacidad} personas
                </div>
                <div className="info-item">
                  <strong>Ubicación:</strong> {selectedMarker.ubicacion || 'No especificada'}
                </div>
                <div className="info-item">
                  <strong>Estado:</strong> 
                  <span className={`estado ${selectedMarker.estado?.toLowerCase()}`}>
                    {selectedMarker.estado}
                  </span>
                </div>

                {selectedMarker.equipamiento && (
                  <div className="info-item">
                    <strong>Equipamiento:</strong> {selectedMarker.equipamiento}
                  </div>
                )}
              </div>

              <div className="info-horarios">
                <h4>📅 Clases Programadas ({filtro.diaSemana})</h4>
                {selectedMarker.horarios && selectedMarker.horarios.length > 0 ? (
                  <div className="horarios-list">
                    {selectedMarker.horarios
                      .filter(h => h.dia_semana === filtro.diaSemana)
                      .map((horario, idx) => (
                      <div key={idx} className="horario-item">
                        <div className="horario-tiempo">
                          🕐 {horario.hora_inicio} - {horario.hora_fin}
                        </div>
                        <div className="horario-curso">
                          {horario.curso_nombre}
                        </div>
                        <div className="horario-profesor">
                          👨‍🏫 {horario.docente_nombres} {horario.docente_apellidos}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="sin-clases">No hay clases programadas para {filtro.diaSemana}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="panel-inicial">
              <div className="panel-header">
                <h3>📋 Salones en el Campus</h3>
              </div>

              <div className="salones-lista">
                {salonesFiltrados.length > 0 ? (
                  salonesFiltrados.map((salon) => {
                    const horariosDelSalon = filtrarHorariosPorDia(
                      horarios.filter(h => h.salon_id === salon.id),
                      filtro.diaSemana
                    );

                    return (
                      <div
                        key={salon.id}
                        className={`salon-card ${horariosDelSalon.length > 0 ? 'con-clases' : ''}`}
                        onClick={() => setSelectedMarker(obtenerInfoMarcadorCompleta(salon))}
                      >
                        <div className="salon-card-header">
                          <h4>{salon.codigo}</h4>
                          <span className="capacidad-badge">{salon.capacidad}</span>
                        </div>
                        <p className="salon-edificio">{salon.edificio}</p>
                        <p className="salon-tipo">{salon.tipo}</p>

                        {horariosDelSalon.length > 0 && (
                          <div className="clases-resumen">
                            <p className="clases-count">
                              📚 {horariosDelSalon.length} clase(s) - {filtro.diaSemana}
                            </p>
                          </div>
                        )}

                        <div className="salon-estado">
                          <span className={`estado-badge ${salon.estado?.toLowerCase()}`}>
                            {salon.estado}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="sin-resultados">No hay salones que coincidan con los filtros</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mapa-legenda">
        <h4>Leyenda del Mapa</h4>
        <div className="legenda-items">
          <div className="legenda-item">
            <div className="legenda-marker" style={{ backgroundColor: '#FF6B6B' }}></div>
            <span>Salón con clases hoy</span>
          </div>
          <div className="legenda-item">
            <div className="legenda-marker" style={{ backgroundColor: '#4ECDC4' }}></div>
            <span>Salón disponible</span>
          </div>
          <div className="legenda-item">
            <div className="legenda-marker" style={{ backgroundColor: '#FFD93D' }}></div>
            <span>En mantenimiento</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaSalonesEstudiante;
