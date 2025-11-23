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

// Función para crear iconos personalizados
const createCustomMarker = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
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
        font-size: 16px;
        margin-left: -16px;
        margin-top: -32px;
      "></div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const MapaSalonesLeaflet = () => {
  // Coordenadas de la Universidad del Valle - Sede Santander de Quilichao
  const UNIVERSIDAD_VALLE_COORDS = {
    lat: 3.022922,
    lng: -76.482656
  };

  const [salones, setSalones] = useState([]);
  const [horarios, setHorarios] = useState([]);
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

        // Convertir coordenadas a números
        const salonesConNumeros = (salonesData || []).map(s => ({
          ...s,
          latitud: parseFloat(s.latitud),
          longitud: parseFloat(s.longitud),
          visible: parseInt(s.visible) || 1,
          capacidad: parseInt(s.capacidad) || 0
        }));

        setSalones(salonesConNumeros);
        setHorarios(horariosData || []);
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

  // Filtrar salones según criterios (solo visibles)
  const salonesFiltrados = salones.filter(salon => {
    // Solo mostrar si es visible (por defecto visible si no está en la BD)
    if (salon.visible !== undefined && !salon.visible) {
      return false;
    }
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
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="mapa-salones-container">
      <div className="mapa-header">
        <h1>📍 Mapa de Salones - Universidad</h1>
        <p className="mapa-subtitle">Visualiza los salones, horarios de clase y profesores en el campus</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="mapa-filtros">
        <div className="filtro-grupo">
          <label htmlFor="edificio-filter">Edificio:</label>
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
          <label htmlFor="tipo-filter">Tipo de Salón:</label>
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
          <label htmlFor="dia-filter">Día:</label>
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
        <div className="mapa-google" style={{ position: 'relative', height: '100%' }}>
          <MapContainer
            center={[UNIVERSIDAD_VALLE_COORDS.lat, UNIVERSIDAD_VALLE_COORDS.lng]}
            zoom={18}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            className="leaflet-container-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              minZoom={10}
            />
            {salonesFiltrados.map((salon, index) => {
              // Usar coordenadas guardadas si existen, sino generar dinámicamente
              const coords = (salon.latitud && salon.longitud) 
                ? { lat: salon.latitud, lng: salon.longitud }
                : generarCoordenadas(index, UNIVERSIDAD_VALLE_COORDS);
              const color = obtenerColorMarcador(salon, horarios, filtro.diaSemana);
              const markerInfo = obtenerInfoMarcadorCompleta(salon);

              return (
                <Marker
                  key={salon.id}
                  position={[coords.lat, coords.lng]}
                  icon={createCustomMarker(color)}
                >
                  <Popup maxWidth={400}>
                    <div className="info-window-contenido">
                      <div className="info-header">
                        <h3>{markerInfo.codigo}</h3>
                        <span className="edificio-tag">{markerInfo.edificio}</span>
                      </div>

                      <div className="info-details">
                        <p><strong>Tipo:</strong> {markerInfo.tipo}</p>
                        <p><strong>Capacidad:</strong> {markerInfo.capacidad} personas</p>
                        <p><strong>Ubicación:</strong> {markerInfo.ubicacion || 'No especificada'}</p>
                        <p><strong>Estado:</strong> <span className={`estado ${markerInfo.estado?.toLowerCase()}`}>{markerInfo.estado}</span></p>

                        {markerInfo.equipamiento && (
                          <p><strong>Equipamiento:</strong> {markerInfo.equipamiento}</p>
                        )}
                      </div>

                      <div className="info-horarios">
                        <h4>📅 Clases Programadas</h4>
                        {markerInfo.horarios && markerInfo.horarios.length > 0 ? (
                          <div className="horarios-list">
                            {markerInfo.horarios.map((horario, idx) => (
                              <div key={idx} className="horario-item">
                                <div className="horario-dia">
                                  {horario.dia_semana}
                                </div>
                                <div className="horario-info">
                                  <p className="horario-tiempo">
                                    🕐 {horario.hora_inicio} - {horario.hora_fin}
                                  </p>
                                  <p className="curso-nombre">
                                    {horario.curso_nombre}
                                  </p>
                                  <p className="profesor-nombre">
                                    👨‍🏫 {horario.docente_nombres} {horario.docente_apellidos}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="sin-clases">No hay clases programadas</p>
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
          <div className="panel-header">
            <h3>📋 Salones en el Campus ({salonesFiltrados.length})</h3>
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
                          📚 {horariosDelSalon.length} clase(s) hoy
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
      </div>

      <div className="mapa-legenda">
        <h4>Leyenda</h4>
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

export default MapaSalonesLeaflet;
