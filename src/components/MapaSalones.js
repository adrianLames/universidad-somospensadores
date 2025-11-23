import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
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

const MapaSalones = () => {
  // Coordenadas de la Universidad del Valle - Sede Santander de Quilichao
  const UNIVERSIDAD_VALLE_COORDS = {
    lat: 3.022922,
    lng: -76.482656
  };

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

        setSalones(salonesData || []);
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
        <div className="mapa-google">
          {!process.env.REACT_APP_GOOGLE_MAPS_API_KEY || error ? (
            <div className="mapa-error-config">
              <div className="error-content">
                <h3>⚠️ Error cargando Google Maps</h3>
                <p>Necesitas una API Key válida de Google Maps. Sigue estos pasos:</p>
                <ol>
                  <li>Ve a: <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                  <li>Crea un NUEVO proyecto</li>
                  <li>Habilita "Maps JavaScript API"</li>
                  <li>Crea una API Key en Credenciales</li>
                  <li>Reemplaza la clave en el archivo <code>.env</code>:
                    <br/><code>REACT_APP_GOOGLE_MAPS_API_KEY=Tu_Nueva_Clave_Aqui</code>
                  </li>
                  <li>Reinicia: <code>npm start</code></li>
                </ol>
                <p><strong>Error detectado:</strong> {error}</p>
              </div>
            </div>
          ) : (
            <LoadScript 
              googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
              onError={() => setError('Error al cargar Google Maps API. Verifica que tu API Key sea válida.')}
            >
              <GoogleMap
                mapContainerStyle={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px'
                }}
                center={UNIVERSIDAD_VALLE_COORDS}
                zoom={16}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  mapTypeControl: true,
                  fullscreenControl: true,
                  streetViewControl: true
                }}
              >
                {salonesFiltrados.map((salon, index) => {
                  const coords = generarCoordenadas(index, UNIVERSIDAD_VALLE_COORDS);
                  const color = obtenerColorMarcador(salon, horarios, filtro.diaSemana);
                  const markerInfo = obtenerInfoMarcadorCompleta(salon);

                  return (
                    <Marker
                      key={salon.id}
                      position={coords}
                      title={`${salon.codigo} - ${salon.edificio}`}
                      onClick={() => setSelectedMarker({ ...markerInfo, position: coords })}
                      icon={{
                        path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
                        scale: 2,
                        fillColor: color,
                        fillOpacity: 1,
                        strokeColor: '#fff',
                        strokeWeight: 2
                      }}
                    />
                  );
                })}

                {selectedMarker && selectedMarker.position && (
                  <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={() => setSelectedMarker(null)}
                    options={{
                      maxWidth: 400,
                      disableAutoPan: false
                    }}
                  >
                    <div className="info-window-contenido">
                      <div className="info-header">
                        <h3>{selectedMarker.codigo}</h3>
                        <span className="edificio-tag">{selectedMarker.edificio}</span>
                      </div>

                      <div className="info-details">
                        <p><strong>Tipo:</strong> {selectedMarker.tipo}</p>
                        <p><strong>Capacidad:</strong> {selectedMarker.capacidad} personas</p>
                        <p><strong>Ubicación:</strong> {selectedMarker.ubicacion || 'No especificada'}</p>
                        <p><strong>Estado:</strong> <span className={`estado ${selectedMarker.estado?.toLowerCase()}`}>{selectedMarker.estado}</span></p>

                        {selectedMarker.equipamiento && (
                          <p><strong>Equipamiento:</strong> {selectedMarker.equipamiento}</p>
                        )}
                      </div>

                      <div className="info-horarios">
                        <h4>📅 Clases Programadas</h4>
                        {selectedMarker.horarios && selectedMarker.horarios.length > 0 ? (
                          <div className="horarios-list">
                            {selectedMarker.horarios.map((horario, idx) => (
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
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          )}
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

export default MapaSalones;
