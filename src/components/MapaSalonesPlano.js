import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../config/api';
import {
  obtenerColorMarcador,
  filtrarHorariosPorDia,
  DIAS_SEMANA,
  obtenerDiaActual
} from '../utils/mapaSalonesUtils';
import './MapaSalonesPlano.css';

const MapaSalonesPlano = ({ user }) => {
  const [salones, setSalones] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagenCargada, setImagenCargada] = useState(false);
  const [posicionesGuardadas, setPosicionesGuardadas] = useState({});
  const [filtro, setFiltro] = useState({
    edificio: 'todos',
    diaSemana: obtenerDiaActual(),
    tipo: 'todos'
  });
  const [zoom, setZoom] = useState(1);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Cargar posiciones guardadas del localStorage
  useEffect(() => {
    const posicionesLS = localStorage.getItem('admin-mapa-posiciones');
    if (posicionesLS) {
      try {
        setPosicionesGuardadas(JSON.parse(posicionesLS));
      } catch (error) {
        console.error('Error al cargar posiciones:', error);
      }
    }
  }, []);

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
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setViewBox({ x: 0, y: 0, width: 1200, height: 800 });
  };

  // Funciones de pan/arrastre
  const handleMouseDown = (e) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;

    const dx = (e.clientX - panStart.x) / zoom;
    const dy = (e.clientY - panStart.y) / zoom;

    setViewBox(prev => ({
      ...prev,
      x: prev.x - dx,
      y: prev.y - dy
    }));

    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Obtener posición del marcador (igual que en AdminMapaSalonesPlano)
  const getSalonPosicion = (salon) => {
    if (posicionesGuardadas[salon.id]) {
      return posicionesGuardadas[salon.id];
    }
    // Posición por defecto basada en coordenadas del salón
    // Usamos el ID del salón como seed para que sea consistente
    const baseX = 600;
    const baseY = 400;
    const offsetX = ((salon.id * 37) % 400) - 200; // Seed basado en ID
    const offsetY = ((salon.id * 73) % 300) - 150; // Seed basado en ID
    return { x: baseX + offsetX, y: baseY + offsetY };
  };

  // Click en marcador
  const handleMarkerClick = (salon, e) => {
    e.stopPropagation();
    let horariosDelSalon = horarios.filter(h => h.salon_id === salon.id);
    let horariosDelDia = filtrarHorariosPorDia(horariosDelSalon, filtro.diaSemana);
    
    // Filtrar según tipo de usuario
    if (user && user.tipo === 'estudiante' && user.programa_id) {
      // Estudiantes solo ven clases de su programa
      horariosDelDia = horariosDelDia.filter(h => 
        h.curso_programa_id === parseInt(user.programa_id)
      );
    } else if (user && user.tipo === 'docente') {
      // Docentes solo ven sus clases asignadas
      horariosDelDia = horariosDelDia.filter(h => 
        h.docente_id === parseInt(user.id)
      );
    }
    // Admin ve todo
    
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
              <li>Guarda la imagen como: <code>public/images/campus-plano.jpg</code></li>
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
          >
            <svg
              ref={svgRef}
              className="mapa-svg"
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width / zoom} ${viewBox.height / zoom}`}
              preserveAspectRatio="xMidYMid meet"
              style={{
                width: '100%',
                height: '100%',
                cursor: isPanning ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                </filter>
              </defs>

              {/* Imagen del plano */}
              <image
                href="/images/campus-plano.jpg"
                x="0"
                y="0"
                width="1200"
                height="800"
                preserveAspectRatio="xMidYMid slice"
                onLoad={() => setImagenCargada(true)}
                onError={() => setImagenCargada(false)}
              />

              {/* Marcadores de salones */}
              {imagenCargada && salonesFiltrados.map((salon) => {
                  const pos = getSalonPosicion(salon);
                  const color = obtenerColorMarcador(salon, horarios, filtro.diaSemana);
                  const isSelected = selectedSalon?.id === salon.id;
                  
                  return (
                    <g
                      key={salon.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkerClick(salon, e);
                      }}
                      style={{ cursor: 'pointer', pointerEvents: 'all' }}
                    >
                      {/* Círculo del marcador */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? 20 : 16}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={isSelected ? 4 : 3}
                        opacity="0.95"
                        filter="url(#shadow)"
                      />
                      
                      {/* Etiqueta con código del salón */}
                      <text
                        x={pos.x}
                        y={pos.y - 28}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="700"
                        pointerEvents="none"
                        stroke="#000000"
                        strokeWidth="3"
                        paintOrder="stroke"
                      >
                        {salon.codigo}
                      </text>
                    </g>
                  );
                })}
            </svg>
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
