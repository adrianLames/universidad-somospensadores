import React, { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';
import {
  obtenerColorMarcadorPorHorarios,
  filtrarHorariosPorDia,
  DIAS_SEMANA,
  obtenerDiaActual
} from '../utils/mapaSalonesUtils';
import './PlanoUnivalle.css';

const PlanoUnivalle = () => {
  const [salones, setSalones] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagenPlano, setImagenPlano] = useState(null);
  const [imagenCargada, setImagenCargada] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [marcadorSeleccionado, setMarcadorSeleccionado] = useState(null);
  const [arrastrandoMarcador, setArrastrandoMarcador] = useState(null);
  const [posicionesGuardadas, setPosicionesGuardadas] = useState({});
  const [filtro, setFiltro] = useState({
    edificio: 'todos',
    diaSemana: obtenerDiaActual(),
    tipo: 'todos'
  });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.5);

  // Estructura del campus - Definición de edificios
  const edificiosCampus = {
    'Edificio A': { x: 100, y: 100, width: 250, height: 200, color: '#3498db' },
    'Edificio B': { x: 400, y: 100, width: 250, height: 200, color: '#e74c3c' },
    'Edificio C': { x: 700, y: 100, width: 250, height: 200, color: '#2ecc71' },
    'Edificio D': { x: 100, y: 350, width: 250, height: 200, color: '#f39c12' },
    'Edificio E': { x: 400, y: 350, width: 250, height: 200, color: '#9b59b6' },
    'Biblioteca': { x: 700, y: 350, width: 250, height: 200, color: '#1abc9c' },
    'Auditorio': { x: 250, y: 600, width: 400, height: 150, color: '#34495e' },
  };

  // Áreas verdes y espacios comunes
  const areasVerdes = [
    { x: 380, y: 330, width: 40, height: 40, label: '🌳' },
    { x: 680, y: 330, width: 40, height: 40, label: '🌳' },
    { x: 500, y: 570, width: 80, height: 30, label: '⛲' },
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const salonesData = await apiRequest('salones.php');
        const horariosData = await apiRequest('horarios.php');

        setSalones(Array.isArray(salonesData) ? salonesData : []);
        setHorarios(Array.isArray(horariosData) ? horariosData : []);
        setError(null);
        
        // Cargar posiciones guardadas del localStorage
        const posicionesGuardadasLocal = localStorage.getItem('posiciones-marcadores-plano');
        if (posicionesGuardadasLocal) {
          setPosicionesGuardadas(JSON.parse(posicionesGuardadasLocal));
        }
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
    cargarImagenPlano();
  }, []);

  // Cargar imagen del plano si existe
  const cargarImagenPlano = () => {
    const imageFormats = ['png', 'jpg', 'jpeg'];
    let imagenEncontrada = false;
    
    const tryLoadImage = (format, index) => {
      if (imagenEncontrada) return;
      
      const img = new Image();
      const imagePath = `${process.env.PUBLIC_URL}/images/campus-plano.${format}`;
      img.src = imagePath;
      
      console.log(`Intentando cargar imagen: ${imagePath}`);
      
      img.onload = () => {
        if (!imagenEncontrada) {
          console.log(`✅ Imagen cargada exitosamente: ${imagePath}`);
          imagenEncontrada = true;
          setImagenPlano(imagePath);
          setImagenCargada(true);
        }
      };
      
      img.onerror = () => {
        console.log(`❌ No se pudo cargar: ${imagePath}`);
        if (index === imageFormats.length - 1 && !imagenEncontrada) {
          // Si ninguna imagen se cargó, usar SVG
          console.log('ℹ️ No se encontró imagen del campus, usando SVG fallback');
          setImagenCargada(false);
        }
      };
    };
    
    imageFormats.forEach((format, index) => {
      tryLoadImage(format, index);
    });
  };

  // Asignar posiciones a salones según su edificio O posiciones guardadas
  const getSalonPosicion = (salon) => {
    // Si hay una posición guardada, usarla
    if (posicionesGuardadas[salon.id]) {
      return posicionesGuardadas[salon.id];
    }
    
    // Si no, calcular posición por defecto basada en edificio
    const edificio = edificiosCampus[salon.edificio];
    if (!edificio) return { x: 100, y: 100 }; // Posición por defecto

    const salonesDelEdificio = salones.filter(s => s.edificio === salon.edificio);
    const index = salonesDelEdificio.findIndex(s => s.id === salon.id);
    const totalSalones = salonesDelEdificio.length;
    
    const cols = Math.ceil(Math.sqrt(totalSalones));
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    const cellWidth = edificio.width / cols;
    const cellHeight = edificio.height / Math.ceil(totalSalones / cols);
    
    return {
      x: edificio.x + (col * cellWidth) + (cellWidth / 2),
      y: edificio.y + (row * cellHeight) + (cellHeight / 2),
    };
  };

  // Guardar posición de marcador
  const guardarPosicionMarcador = (salonId, x, y) => {
    const nuevasPosiciones = {
      ...posicionesGuardadas,
      [salonId]: { x, y }
    };
    setPosicionesGuardadas(nuevasPosiciones);
    localStorage.setItem('posiciones-marcadores-plano', JSON.stringify(nuevasPosiciones));
  };

  // Manejar arrastre de marcador
  const handleMarcadorMouseDown = (salon, e) => {
    if (!modoEdicion) return;
    
    e.stopPropagation();
    setArrastrandoMarcador(salon.id);
    setMarcadorSeleccionado(salon.id);
  };

  const handleSVGMouseMove = (e) => {
    if (!arrastrandoMarcador || !modoEdicion) return;

    const svg = e.currentTarget;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    
    const svgCoords = point.matrixTransform(svg.getScreenCTM().inverse());
    
    guardarPosicionMarcador(arrastrandoMarcador, svgCoords.x, svgCoords.y);
  };

  const handleMarcadorMouseUp = () => {
    setArrastrandoMarcador(null);
  };

  // Resetear posiciones de marcadores
  const resetearPosiciones = () => {
    if (window.confirm('¿Estás seguro de resetear todas las posiciones de los marcadores?')) {
      setPosicionesGuardadas({});
      localStorage.removeItem('posiciones-marcadores-plano');
    }
  };

  // Filtrar salones
  const salonesFiltrados = salones.filter(salon => {
    if (filtro.edificio !== 'todos' && salon.edificio !== filtro.edificio) return false;
    if (filtro.tipo !== 'todos' && salon.tipo !== filtro.tipo) return false;
    return true;
  });

  // Obtener edificios y tipos únicos
  const edificios = ['todos', ...new Set(salones.map(s => s.edificio).filter(Boolean))];
  const tipos = ['todos', ...new Set(salones.map(s => s.tipo).filter(Boolean))];

  // Zoom y Pan
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setViewBox({ x: 0, y: 0, width: 1200, height: 800 });
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Click izquierdo
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = (e.clientX - panStart.x) / zoom;
      const dy = (e.clientY - panStart.y) / zoom;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy
      }));
      
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMarkerClick = (salon) => {
    const horariosDelSalon = horarios.filter(h => h.salon_id === salon.id);
    const horariosDelDia = filtrarHorariosPorDia(horariosDelSalon, filtro.diaSemana);
    
    setSelectedSalon({
      ...salon,
      horarios: horariosDelDia
    });
  };

  if (loading) {
    return (
      <div className="plano-univalle-container">
        <div className="loading">Cargando plano del campus...</div>
      </div>
    );
  }

  return (
    <div className="plano-univalle-container">
      <div className="plano-header">
        <div>
          <h1>🏛️ Universidad del Valle - Plano Interactivo</h1>
          <p className="plano-subtitle">Campus Meléndez - Sede Cali</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {!imagenCargada && (
        <div className="info-message">
          ℹ️ Mostrando plano esquemático. Para ver el plano oficial del campus, convierte el PDF 
          <code>campus-plano.pdf</code> a imagen PNG y guárdalo en <code>public/images/campus-plano.png</code>
          <br />
          <small>Consulta <code>CONVERTIR_PDF_A_IMAGEN.md</code> para instrucciones detalladas.</small>
        </div>
      )}

      {/* Menú lateral de edición y controles */}
      <div 
        className={`sidebar-edicion ${sidebarAbierto || modoEdicion ? 'abierto' : ''}`}
        onClick={(e) => {
          if (e.target.classList.contains('sidebar-edicion') && e.target === e.currentTarget) {
            return;
          }
        }}
      >
        <button 
          className="btn-toggle-sidebar"
          onClick={() => setSidebarAbierto(!sidebarAbierto)}
          title={sidebarAbierto ? 'Cerrar panel' : 'Abrir panel'}
        >
          {sidebarAbierto || modoEdicion ? '✕' : '✏️'}
        </button>
        
        <div className="sidebar-header">
          <h3>✏️ Panel de Control</h3>
        </div>
        
        <div className="sidebar-contenido">
          {/* Botón de modo edición */}
          <div className="sidebar-seccion">
            <h4 className="sidebar-titulo">🔒 Modo Edición</h4>
            <button
              className={`btn-toggle-edicion ${modoEdicion ? 'activo' : ''}`}
              onClick={() => setModoEdicion(!modoEdicion)}
            >
              {modoEdicion ? (
                <>
                  <span className="icono">🔓</span>
                  <span className="texto">Modo ACTIVO</span>
                </>
              ) : (
                <>
                  <span className="icono">🔒</span>
                  <span className="texto">Activar Edición</span>
                </>
              )}
            </button>
          </div>

          {modoEdicion && (
            <>
              <div className="sidebar-instrucciones">
                <div className="instruccion-item">
                  <span className="icono-instruccion">👆</span>
                  <p>Arrastra los marcadores sobre el plano real</p>
                </div>
                <div className="instruccion-item">
                  <span className="icono-instruccion">💾</span>
                  <p>Las posiciones se guardan automáticamente</p>
                </div>
                <div className="instruccion-item">
                  <span className="icono-instruccion">⭕</span>
                  <p>Borde dorado punteado indica modo edición</p>
                </div>
              </div>

              <button
                className="btn-resetear-sidebar"
                onClick={resetearPosiciones}
              >
                <span className="icono">🔄</span>
                <span className="texto">Resetear Posiciones</span>
              </button>
              
              <div className="sidebar-divisor"></div>
            </>
          )}

          {/* Filtros */}
          <div className="sidebar-seccion">
            <h4 className="sidebar-titulo">🔍 Filtros</h4>
            
            <div className="filtro-grupo-sidebar">
              <label htmlFor="edificio-filter">🏫 Edificio</label>
              <select
                id="edificio-filter"
                value={filtro.edificio}
                onChange={(e) => setFiltro({ ...filtro, edificio: e.target.value })}
              >
                {edificios.map((ed) => (
                  <option key={ed} value={ed}>
                    {ed === 'todos' ? 'Todos' : ed}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo-sidebar">
              <label htmlFor="tipo-filter">📚 Tipo</label>
              <select
                id="tipo-filter"
                value={filtro.tipo}
                onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
              >
                {tipos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo === 'todos' ? 'Todos' : tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo-sidebar">
              <label htmlFor="dia-filter">📅 Día</label>
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

            <div className="filtro-resultado">
              <span className="badge-resultado">
                📍 {salonesFiltrados.length} salón(es)
              </span>
            </div>
          </div>

          <div className="sidebar-divisor"></div>

          {/* Controles de zoom */}
          <div className="sidebar-seccion">
            <h4 className="sidebar-titulo">🔍 Zoom y Vista</h4>
            
            <div className="zoom-controls-sidebar">
              <button onClick={handleZoomIn} className="zoom-btn-sidebar" title="Acercar">
                <span>🔍+</span>
              </button>
              <span className="zoom-level-sidebar">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomOut} className="zoom-btn-sidebar" title="Alejar">
                <span>🔍-</span>
              </button>
            </div>
            
            <button onClick={handleResetView} className="btn-reset-view" title="Restablecer vista">
              <span className="icono">🎯</span>
              <span className="texto">Centrar Vista</span>
            </button>
          </div>
        </div>
      </div>

      <div className="plano-canvas-wrapper">
        <svg
          className="plano-svg"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width / zoom} ${viewBox.height / zoom}`}
          onMouseDown={!modoEdicion ? handleMouseDown : undefined}
          onMouseMove={modoEdicion ? handleSVGMouseMove : handleMouseMove}
          onMouseUp={modoEdicion ? handleMarcadorMouseUp : handleMouseUp}
          onMouseLeave={modoEdicion ? handleMarcadorMouseUp : handleMouseUp}
          style={{ cursor: modoEdicion ? 'crosshair' : (isPanning ? 'grabbing' : 'grab') }}
        >
          {/* Definiciones de filtros y efectos */}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Imagen del plano si está disponible */}
          {imagenCargada && imagenPlano ? (
            <image
              href={imagenPlano}
              x="0"
              y="0"
              width="1200"
              height="800"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <>
              {/* Fondo del campus SVG (fallback) */}
              <rect x="0" y="0" width="1200" height="800" fill="#e8f5e9" />
              
              {/* Caminos y vías */}
              <rect x="0" y="310" width="1200" height="30" fill="#95a5a6" opacity="0.7" />
              <rect x="360" y="0" width="30" height="800" fill="#95a5a6" opacity="0.7" />
              <rect x="670" y="0" width="30" height="800" fill="#95a5a6" opacity="0.7" />
          
              {/* Áreas verdes */}
              {areasVerdes.map((area, idx) => (
                <g key={`area-${idx}`}>
                  <rect
                    x={area.x}
                    y={area.y}
                    width={area.width}
                    height={area.height}
                    fill="#4caf50"
                    opacity="0.3"
                    rx="5"
                  />
                  <text
                    x={area.x + area.width / 2}
                    y={area.y + area.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="24"
                  >
                    {area.label}
                  </text>
                </g>
              ))}

              {/* Edificios */}
              {Object.entries(edificiosCampus).map(([nombre, edificio]) => (
                <g key={nombre}>
                  {/* Rectángulo del edificio */}
                  <rect
                    x={edificio.x}
                    y={edificio.y}
                    width={edificio.width}
                    height={edificio.height}
                    fill={edificio.color}
                    opacity="0.3"
                    stroke={edificio.color}
                    strokeWidth="3"
                    rx="8"
                  />
                  {/* Nombre del edificio */}
                  <text
                    x={edificio.x + edificio.width / 2}
                    y={edificio.y + 20}
                    textAnchor="middle"
                    fill="#2c3e50"
                    fontSize="16"
                    fontWeight="bold"
                  >
                    {nombre}
                  </text>
                  {/* Borde decorativo */}
                  <rect
                    x={edificio.x + 5}
                    y={edificio.y + 5}
                    width={edificio.width - 10}
                    height={edificio.height - 10}
                    fill="none"
                    stroke={edificio.color}
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                    rx="5"
                  />
                </g>
              ))}
            </>
          )}

          {/* Marcadores de salones */}
          {salonesFiltrados.map((salon) => {
            const pos = getSalonPosicion(salon);
            if (!pos) return null;

            const horariosDelSalon = horarios.filter(h => h.salon_id === salon.id);
            const horariosDelDia = filtrarHorariosPorDia(horariosDelSalon, filtro.diaSemana);
            const color = obtenerColorMarcadorPorHorarios(horariosDelDia);
            const isSelected = selectedSalon?.id === salon.id || marcadorSeleccionado === salon.id;
            const isBeingDragged = arrastrandoMarcador === salon.id;

            return (
              <g
                key={salon.id}
                onMouseDown={(e) => handleMarcadorMouseDown(salon, e)}
                onClick={() => !modoEdicion && handleMarkerClick(salon)}
                style={{ 
                  cursor: modoEdicion ? 'move' : 'pointer',
                  pointerEvents: 'all'
                }}
              >
                {/* Círculo del marcador */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 16 : 12}
                  fill={color}
                  stroke={isBeingDragged ? '#FFD700' : '#fff'}
                  strokeWidth={isSelected ? 4 : 3}
                  opacity={isBeingDragged ? 1 : 0.95}
                  filter={isBeingDragged ? 'url(#shadow)' : ''}
                />
                
                {/* Anillo exterior si está en modo edición */}
                {modoEdicion && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="20"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.6"
                  />
                )}
                
                {/* Pulso si está seleccionado */}
                {isSelected && !modoEdicion && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="20"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="20"
                      to="30"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Código del salón */}
                <text
                  x={pos.x}
                  y={pos.y + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#2c3e50"
                  fontWeight="bold"
                >
                  {salon.codigo}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Panel de información del salón seleccionado */}
      {selectedSalon && (
        <div className="salon-info-panel">
          <div className="salon-info-header">
            <h3>📍 {selectedSalon.codigo} - {selectedSalon.edificio}</h3>
            <button
              className="close-btn"
              onClick={() => setSelectedSalon(null)}
            >
              ✕
            </button>
          </div>
          <div className="salon-info-body">
            <div className="info-row">
              <span className="info-label">Tipo:</span>
              <span className="info-value">{selectedSalon.tipo}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Capacidad:</span>
              <span className="info-value">{selectedSalon.capacidad} personas</span>
            </div>
            {selectedSalon.equipamiento && (
              <div className="info-row">
                <span className="info-label">Equipamiento:</span>
                <span className="info-value">{selectedSalon.equipamiento}</span>
              </div>
            )}
            <div className="horarios-section">
              <h4>Horarios para {filtro.diaSemana}</h4>
              {selectedSalon.horarios && selectedSalon.horarios.length > 0 ? (
                <ul className="horarios-list">
                  {selectedSalon.horarios.map((horario, idx) => (
                    <li key={idx} className="horario-item">
                      <span className="horario-tiempo">
                        {horario.hora_inicio} - {horario.hora_fin}
                      </span>
                      <span className="horario-curso">
                        {horario.curso_nombre || 'Sin asignar'}
                      </span>
                      {horario.docente_nombre && (
                        <span className="horario-docente">
                          👨‍🏫 {horario.docente_nombre}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-horarios">Sin horarios programados</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="plano-leyenda">
        <h4>Leyenda</h4>
        <div className="leyenda-items">
          <div className="leyenda-item">
            <span className="leyenda-color" style={{ background: '#2ecc71' }}></span>
            <span>Disponible</span>
          </div>
          <div className="leyenda-item">
            <span className="leyenda-color" style={{ background: '#e74c3c' }}></span>
            <span>Ocupado</span>
          </div>
          <div className="leyenda-item">
            <span className="leyenda-color" style={{ background: '#f39c12' }}></span>
            <span>Parcialmente ocupado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanoUnivalle;
