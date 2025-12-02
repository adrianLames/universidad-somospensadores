import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../config/api';
import './AdminMapaSalonesPlano.css';

const AdminMapaSalonesPlano = ({ user }) => {
  // Estados
  const [salones, setSalones] = useState([]);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [arrastrandoMarcador, setArrastrandoMarcador] = useState(null);
  const [posicionesGuardadas, setPosicionesGuardadas] = useState({});
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  
  // Estados para pan y zoom
  const [zoom, setZoom] = useState(1);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef(null);
  const [imagenPlano, setImagenPlano] = useState(null);

  // Cargar datos
  useEffect(() => {
    cargarDatos();
    cargarImagenPlano();
    cargarPosicionesGuardadas();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const salonesData = await apiRequest('salones.php');
      setSalones(Array.isArray(salonesData) ? salonesData : []);
    } catch (err) {
      console.error('Error al cargar salones:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarImagenPlano = () => {
    const img = new Image();
    img.src = `${process.env.PUBLIC_URL}/images/campus-plano.jpg`;
    img.onload = () => {
      setImagenPlano(img.src);
    };
    img.onerror = () => {
      console.error('Error al cargar la imagen del plano');
    };
  };

  const cargarPosicionesGuardadas = () => {
    const guardadas = localStorage.getItem('admin-mapa-posiciones');
    if (guardadas) {
      setPosicionesGuardadas(JSON.parse(guardadas));
    }
  };

  const guardarPosicionMarcador = (salonId, x, y) => {
    const nuevasPosiciones = {
      ...posicionesGuardadas,
      [salonId]: { x, y }
    };
    setPosicionesGuardadas(nuevasPosiciones);
    localStorage.setItem('admin-mapa-posiciones', JSON.stringify(nuevasPosiciones));
  };

  // Obtener posición del marcador
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

  // Manejadores de arrastre de marcadores
  const handleMarcadorMouseDown = (salon, e) => {
    e.stopPropagation(); // Siempre prevenir propagación
    if (!modoEdicion) return;
    setArrastrandoMarcador(salon.id);
  };

  const handleSVGMouseMove = (e) => {
    if (!arrastrandoMarcador || !modoEdicion || !svgRef.current) return;

    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    
    const svgCoords = point.matrixTransform(svg.getScreenCTM().inverse());
    
    // Solo actualizar la posición del marcador que se está arrastrando
    setPosicionesGuardadas(prev => {
      const nuevasPosiciones = {
        ...prev,
        [arrastrandoMarcador]: { x: svgCoords.x, y: svgCoords.y }
      };
      return nuevasPosiciones;
    });
  };

  const handleMarcadorMouseUp = () => {
    if (arrastrandoMarcador) {
      // Guardar en localStorage cuando se suelta el marcador
      // Usamos un pequeño timeout para asegurar que el estado se haya actualizado
      setTimeout(() => {
        setPosicionesGuardadas(prev => {
          localStorage.setItem('admin-mapa-posiciones', JSON.stringify(prev));
          return prev;
        });
      }, 0);
    }
    setArrastrandoMarcador(null);
  };

  // Manejadores de zoom y pan
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleMouseDown = (e) => {
    if (modoEdicion) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isPanning || modoEdicion) return;

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

  const handleResetView = () => {
    setViewBox({ x: 0, y: 0, width: 1200, height: 800 });
    setZoom(1);
  };

  const resetearPosiciones = () => {
    if (window.confirm('¿Estás seguro de resetear todas las posiciones de los marcadores?')) {
      setPosicionesGuardadas({});
      localStorage.removeItem('admin-mapa-posiciones');
    }
  };

  // Filtrar salones
  const salonesFiltrados = salones.filter(salon => {
    const coincideBusqueda = salon.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                             salon.edificio?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo === 'todos' || salon.tipo === filtroTipo;
    return coincideBusqueda && coincideTipo;
  });

  const tipos = ['todos', ...new Set(salones.map(s => s.tipo).filter(Boolean))];

  if (loading) {
    return (
      <div className="admin-mapa-plano-container">
        <div className="loading">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className="admin-mapa-plano-container">
      <div className="header-mapa">
        <div className="header-content">
          <button className="btn-volver" onClick={() => window.history.back()}>
            ← Volver
          </button>
          <div className="header-title">
            <h1>🗺️ Administración Visual - Mapa de Salones</h1>
            <p className="subtitle">Arrastra los marcadores para ajustar las posiciones de los salones</p>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Panel lateral de salones */}
        <div className="panel-lateral">
          <div className="panel-header">
            <h3>🏫 Salones</h3>
          </div>

          <div className="panel-controles">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <select
              className="filter-select"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              {tipos.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo === 'todos' ? `Todos (${salones.length})` : tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="salones-list">
            {salonesFiltrados.map(salon => (
              <div
                key={salon.id}
                className={`salon-item ${salonSeleccionado?.id === salon.id ? 'selected' : ''}`}
                onClick={() => setSalonSeleccionado(salon)}
              >
                <div className="salon-icon">
                  <span className="icon-number">{salon.codigo?.charAt(0) || '?'}</span>
                </div>
                <div className="salon-info">
                  <div className="salon-codigo">{salon.codigo}</div>
                  <div className="salon-details">
                    <span className="detail-item">{salon.edificio || 'Sin edificio'}</span>
                    <span className="detail-separator">•</span>
                    <span className="detail-item">Tipo: {salon.tipo || 'N/A'}</span>
                  </div>
                  <div className="salon-capacity">
                    Capacidad: {salon.capacidad || 0}
                  </div>
                  {posicionesGuardadas[salon.id] && (
                    <div className="salon-coords">
                      Coordenadas: {posicionesGuardadas[salon.id].x.toFixed(2)}, {posicionesGuardadas[salon.id].y.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="panel-footer">
            <div className="stats">
              <div className="stat-item">
                <strong>TOTAL:</strong>
                <span>{salones.length}</span>
              </div>
              <div className="stat-item">
                <strong>VISIBLES:</strong>
                <span>{salonesFiltrados.length}</span>
              </div>
              <div className="stat-item">
                <strong>OCULTOS:</strong>
                <span>{salones.length - salonesFiltrados.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Área del mapa */}
        <div className="mapa-area">
          <div className="mapa-toolbar">
            <div className="toolbar-left">
              <div className={`modo-badge ${modoEdicion ? 'activo' : ''}`}>
                📍 {modoEdicion ? 'Arrastra los marcadores para cambiar posiciones' : 'Haz clic en los marcadores para ver detalles'}
              </div>
            </div>
            
            <div className="toolbar-right">
              <button
                className={`btn-modo ${modoEdicion ? 'activo' : ''}`}
                onClick={() => setModoEdicion(!modoEdicion)}
                title={modoEdicion ? 'Desactivar modo edición' : 'Activar modo edición'}
              >
                {modoEdicion ? '🔓 Edición' : '🔒 Modo Edición'}
              </button>
              {modoEdicion && (
                <button
                  className="btn-reset"
                  onClick={resetearPosiciones}
                  title="Resetear todas las posiciones"
                >
                  🔄 Reset
                </button>
              )}
              <button
                className="btn-center"
                onClick={handleResetView}
                title="Centrar vista"
              >
                🎯
              </button>
              <button
                className="btn-zoom"
                onClick={handleZoomIn}
                title="Acercar"
              >
                +
              </button>
              <button
                className="btn-zoom"
                onClick={handleZoomOut}
                title="Alejar"
              >
                -
              </button>
            </div>
          </div>

          <div className="mapa-canvas">
            <svg
              ref={svgRef}
              className="plano-svg"
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width / zoom} ${viewBox.height / zoom}`}
              onMouseDown={!modoEdicion ? handleMouseDown : undefined}
              onMouseMove={(e) => {
                if (modoEdicion) {
                  handleSVGMouseMove(e);
                } else if (isPanning) {
                  handleMouseMove(e);
                }
              }}
              onMouseUp={modoEdicion ? handleMarcadorMouseUp : handleMouseUp}
              onMouseLeave={modoEdicion ? handleMarcadorMouseUp : handleMouseUp}
              style={{ cursor: modoEdicion ? 'crosshair' : (isPanning ? 'grabbing' : 'grab') }}
            >
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

              {/* Imagen del plano */}
              {imagenPlano && (
                <image
                  href={imagenPlano}
                  x="0"
                  y="0"
                  width="1200"
                  height="800"
                  preserveAspectRatio="xMidYMid slice"
                />
              )}

              {/* Marcadores de salones */}
              {salonesFiltrados.map((salon) => {
                const pos = getSalonPosicion(salon);
                const isSelected = salonSeleccionado?.id === salon.id;
                const isBeingDragged = arrastrandoMarcador === salon.id;

                return (
                  <g
                    key={salon.id}
                    onMouseDown={(e) => handleMarcadorMouseDown(salon, e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!modoEdicion) setSalonSeleccionado(salon);
                    }}
                    style={{ 
                      cursor: modoEdicion ? 'move' : 'pointer',
                      pointerEvents: 'all'
                    }}
                  >
                    {/* Círculo del marcador */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 20 : 16}
                      fill={isSelected ? '#667eea' : '#4A90E2'}
                      stroke={isBeingDragged ? '#FFD700' : '#fff'}
                      strokeWidth={isSelected ? 4 : 3}
                      opacity={isBeingDragged ? 1 : 0.95}
                      filter={isBeingDragged ? 'url(#shadow)' : ''}
                    />
                    
                    {/* Borde dorado si está en modo edición */}
                    {modoEdicion && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="24"
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        opacity="0.6"
                      />
                    )}
                    
                    {/* Número dentro del círculo */}
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={isSelected ? "14" : "12"}
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {salon.codigo?.match(/\d+/)?.[0] || salon.codigo?.charAt(0) || '?'}
                    </text>

                    {/* Etiqueta con código del salón */}
                    <text
                      x={pos.x}
                      y={pos.y - 28}
                      textAnchor="middle"
                      fill="#333"
                      fontSize="11"
                      fontWeight="600"
                      pointerEvents="none"
                      style={{ textShadow: '0 1px 3px white, 0 0 5px white' }}
                    >
                      {salon.codigo}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMapaSalonesPlano;
