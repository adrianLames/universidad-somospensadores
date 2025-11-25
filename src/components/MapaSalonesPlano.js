import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../config/api';
import {
  obtenerColorMarcador,
  filtrarHorariosPorDia,
  DIAS_SEMANA,
  obtenerDiaActual
} from '../utils/mapaSalonesUtils';
import './MapaSalonesPlano.css';
import BackHomeButton from './BackHomeButton';

const MapaSalonesPlano = () => {
  const [salones, setSalones] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagenCargada, setImagenCargada] = useState(false);
  const [filtro, setFiltro] = useState({
    edificio: 'todos',
    diaSemana: obtenerDiaActual(),
    tipo: 'todos'
  });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Cargar salones y horarios
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const salonesData = await apiRequest('salones.php');
        const horariosData = await apiRequest('horarios.php');

        setSalones(Array.isArray(salonesData) ? salonesData : []);
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

  // Filtrar salones
  const salonesFiltrados = salones.filter(salon => {
    if (filtro.edificio !== 'todos' && salon.edificio !== filtro.edificio) return false;
    if (filtro.tipo !== 'todos' && salon.tipo !== filtro.tipo) return false;
    return true;
  });

  // Obtener edificios y tipos únicos
  const edificios = ['todos', ...new Set(salones.map(s => s.edificio).filter(Boolean))];
  const tipos = ['todos', ...new Set(salones.map(s => s.tipo).filter(Boolean))];

  // Funciones de zoom
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Funciones de arrastre
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Click en marcador
  const handleMarkerClick = (salon, e) => {
    e.stopPropagation();
    const horariosDelSalon = horarios.filter(h => h.salon_id === salon.id);
    const horariosDelDia = filtrarHorariosPorDia(horariosDelSalon, filtro.diaSemana);
    
    setSelectedSalon({
      ...salon,
      horarios: horariosDelDia
    });
  };

  if (loading) {
    return (
      <div className="mapa-plano-container">
        <div className="loading">Cargando datos del campus...</div>
      </div>
    );
  }

  return (
    <div className="mapa-plano-container">
      <div className="mapa-plano-header">
        <div>
          <h1>🏫 Plano del Campus - Salones</h1>
          <p className="mapa-subtitle">Mapa interactivo con ubicación de salones y horarios</p>
        </div>
        <BackHomeButton label="Volver al Inicio" />
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {!imagenCargada && (
        <div className="imagen-placeholder">
          <div className="placeholder-content">
            <h3>📋 Plano del Campus No Disponible</h3>
            <p>Para visualizar el plano del campus con los salones:</p>
            <ol>
              <li>Convierte el archivo <code>campusV1.dwg</code> a imagen PNG/JPG</li>
              <li>Guarda la imagen como: <code>public/images/campus-plano.png</code></li>
              <li>Consulta el archivo <code>CONVERSION_PLANO.md</code> para instrucciones detalladas</li>
            </ol>
            <p className="nota-temporal">
              <strong>Nota:</strong> Mientras tanto, usa la vista de lista de salones abajo.
            </p>
          </div>
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
          <label htmlFor="tipo-filter">📚 Tipo:</label>
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

        <div className="filtro-info">
          <span className="salones-count">
            {salonesFiltrados.length} salón(es) encontrado(s)
          </span>
        </div>
      </div>

      <div className="mapa-plano-principal">
        <div className="plano-viewer">
          <div className="plano-controles">
            <button onClick={handleZoomIn} title="Acercar">🔍 +</button>
            <button onClick={handleZoomOut} title="Alejar">🔍 -</button>
            <button onClick={handleResetZoom} title="Restablecer">↺ Reset</button>
          </div>

          <div 
            className="plano-canvas-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div 
              className="plano-canvas"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
            >
              {/* Imagen del plano */}
              <img 
                src="/images/campus-plano.png" 
                alt="Plano del Campus"
                onLoad={() => setImagenCargada(true)}
                onError={() => {
                  setImagenCargada(false);
                  console.warn('No se pudo cargar la imagen del plano');
                }}
                draggable={false}
              />

              {/* Marcadores de salones */}
              {imagenCargada && salonesFiltrados.map((salon) => {
                // Solo mostrar si tiene coordenadas
                if (!salon.coord_x || !salon.coord_y) return null;

                const color = obtenerColorMarcador(salon, horarios, filtro.diaSemana);
                
                return (
                  <div
                    key={salon.id}
                    className="salon-marker"
                    style={{
                      left: `${salon.coord_x}px`,
                      top: `${salon.coord_y}px`,
                      backgroundColor: color,
                    }}
                    onClick={(e) => handleMarkerClick(salon, e)}
                    title={`${salon.codigo} - ${salon.edificio}`}
                  >
                    <span className="marker-label">{salon.codigo}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Información del salón seleccionado */}
          {selectedSalon && (
            <div className="salon-info-popup">
              <div className="info-popup-header">
                <h3>{selectedSalon.codigo}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedSalon(null)}
                >
                  ✕
                </button>
              </div>

              <div className="info-popup-content">
                <p><strong>Edificio:</strong> {selectedSalon.edificio}</p>
                <p><strong>Tipo:</strong> {selectedSalon.tipo}</p>
                <p><strong>Capacidad:</strong> {selectedSalon.capacidad} personas</p>
                <p><strong>Ubicación:</strong> {selectedSalon.ubicacion || 'No especificada'}</p>
                <p><strong>Estado:</strong> 
                  <span className={`estado-badge ${selectedSalon.estado?.toLowerCase()}`}>
                    {selectedSalon.estado}
                  </span>
                </p>

                <div className="info-horarios-section">
                  <h4>📅 Horarios - {filtro.diaSemana}</h4>
                  {selectedSalon.horarios && selectedSalon.horarios.length > 0 ? (
                    <div className="horarios-list-popup">
                      {selectedSalon.horarios.map((horario, idx) => (
                        <div key={idx} className="horario-item-popup">
                          <p className="horario-tiempo">
                            🕐 {horario.hora_inicio} - {horario.hora_fin}
                          </p>
                          <p className="curso-nombre">{horario.curso_nombre}</p>
                          <p className="profesor-nombre">
                            👨‍🏫 {horario.docente_nombres} {horario.docente_apellidos}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="sin-clases">No hay clases programadas</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral con lista de salones */}
        <div className="salones-panel-lateral">
          <h3>📋 Lista de Salones ({salonesFiltrados.length})</h3>
          
          <div className="salones-lista-scroll">
            {salonesFiltrados.map((salon) => {
              const horariosDelSalon = filtrarHorariosPorDia(
                horarios.filter(h => h.salon_id === salon.id),
                filtro.diaSemana
              );
              const color = obtenerColorMarcador(salon, horarios, filtro.diaSemana);

              return (
                <div
                  key={salon.id}
                  className={`salon-card-mini ${selectedSalon?.id === salon.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSalon({
                    ...salon,
                    horarios: horariosDelSalon
                  })}
                >
                  <div className="salon-card-header-mini">
                    <div className="marker-preview" style={{ backgroundColor: color }}></div>
                    <div>
                      <h4>{salon.codigo}</h4>
                      <p className="edificio-mini">{salon.edificio}</p>
                    </div>
                    <span className="capacidad-badge-mini">{salon.capacidad}</span>
                  </div>
                  
                  {horariosDelSalon.length > 0 && (
                    <p className="clases-mini">
                      📚 {horariosDelSalon.length} clase(s) hoy
                    </p>
                  )}

                  {!salon.coord_x && (
                    <p className="sin-coordenadas">⚠️ Sin ubicación en plano</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mapa-legenda">
        <h4>🎨 Leyenda</h4>
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
          <div className="legenda-item">
            <div className="legenda-marker" style={{ backgroundColor: '#95A5A6' }}></div>
            <span>Inactivo</span>
          </div>
        </div>
      </div>

      <div className="instrucciones-uso">
        <h4>💡 Cómo usar el mapa:</h4>
        <ul>
          <li>🖱️ <strong>Arrastra</strong> el plano para moverte</li>
          <li>🔍 <strong>Zoom</strong> con los botones + / -</li>
          <li>📍 <strong>Click</strong> en un marcador para ver detalles</li>
          <li>🔄 <strong>Filtros</strong> para buscar salones específicos</li>
        </ul>
      </div>
    </div>
  );
};

export default MapaSalonesPlano;
