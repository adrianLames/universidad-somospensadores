import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../config/api';
import './AdminMapaSalonesPlano.css';

const AdminMapaSalonesPlano = ({ user }) => {
  // Estados
  const [salones, setSalones] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [arrastrandoMarcador, setArrastrandoMarcador] = useState(null);
  const [posicionesGuardadas, setPosicionesGuardadas] = useState({});
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [nuevoSalon, setNuevoSalon] = useState({
    codigo: '',
    edificio: '',
    tipo: 'aula',
    capacidad: 30,
    coordenada_x: 0,
    coordenada_y: 0
  });
  const [guardando, setGuardando] = useState(false);
  
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
    cargarHorarios();
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

  const cargarHorarios = async () => {
    try {
      const horariosData = await apiRequest('horarios.php');
      setHorarios(Array.isArray(horariosData) ? horariosData : []);
    } catch (err) {
      console.error('Error al cargar horarios:', err);
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



  // Obtener horarios de un salón específico filtrados por día y usuario
  const obtenerHorariosSalon = (salonId) => {
    let horariosFiltrados = horarios.filter(h => 
      h.salon_id === parseInt(salonId) && 
      h.dia_semana === diaSeleccionado
    );

    // Filtrar según tipo de usuario
    if (user && user.tipo === 'estudiante' && user.programa_id) {
      // Estudiantes solo ven clases de su programa
      horariosFiltrados = horariosFiltrados.filter(h => 
        h.curso_programa_id === parseInt(user.programa_id)
      );
    } else if (user && user.tipo === 'docente') {
      // Docentes solo ven sus clases asignadas
      horariosFiltrados = horariosFiltrados.filter(h => 
        h.docente_id === parseInt(user.id)
      );
    }
    // Admin ve todo

    return horariosFiltrados;
  };

  // Funciones para agregar salón
  const abrirModalAgregar = () => {
    setNuevoSalon({
      codigo: '',
      edificio: '',
      tipo: 'aula',
      capacidad: 30,
      coordenada_x: 0,
      coordenada_y: 0
    });
    setMostrarModalAgregar(true);
  };

  const cerrarModalAgregar = () => {
    setMostrarModalAgregar(false);
    setNuevoSalon({
      codigo: '',
      edificio: '',
      tipo: 'aula',
      capacidad: 30,
      coordenada_x: 0,
      coordenada_y: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoSalon(prev => ({
      ...prev,
      [name]: name === 'capacidad' || name === 'coordenada_x' || name === 'coordenada_y' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const guardarNuevoSalon = async () => {
    // Validaciones
    if (!nuevoSalon.codigo.trim()) {
      window.mostrarNotificacion('advertencia', 'El código del salón es requerido');
      return;
    }

    if (!nuevoSalon.edificio.trim()) {
      window.mostrarNotificacion('advertencia', 'El edificio es requerido');
      return;
    }

    try {
      setGuardando(true);
      
      const response = await apiRequest('salones.php', {
        method: 'POST',
        body: JSON.stringify({
          codigo: nuevoSalon.codigo.trim(),
          edificio: nuevoSalon.edificio.trim(),
          tipo: nuevoSalon.tipo,
          capacidad: nuevoSalon.capacidad,
          latitud: 3.022922, // Coordenada por defecto
          longitud: -76.482656, // Coordenada por defecto
          visible: true,
          ubicacion: '',
          recursos: '',
          equipamiento: '',
          estado: 'Disponible'
        })
      });

      if (response.message) {
        window.mostrarNotificacion('exito', 'Salón agregado exitosamente');
        await cargarDatos(); // Recargar la lista de salones
        cerrarModalAgregar();
      } else if (response.error) {
        window.mostrarNotificacion('error', response.error);
      }
    } catch (error) {
      console.error('Error al guardar salón:', error);
      window.mostrarNotificacion('error', 'Error al guardar el salón');
    } finally {
      setGuardando(false);
    }
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
            <button 
              className="btn-agregar-salon"
              onClick={abrirModalAgregar}
              title="Agregar nuevo salón"
            >
              + Agregar
            </button>
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

            <select
              className="filter-select"
              value={diaSeleccionado}
              onChange={(e) => setDiaSeleccionado(e.target.value)}
              title="Filtrar horarios por día"
            >
              <option value="Lunes">📅 Lunes</option>
              <option value="Martes">📅 Martes</option>
              <option value="Miércoles">📅 Miércoles</option>
              <option value="Jueves">📅 Jueves</option>
              <option value="Viernes">📅 Viernes</option>
              <option value="Sábado">📅 Sábado</option>
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
                      if (!modoEdicion) {
                        // Si ya está seleccionado, deseleccionar; si no, seleccionar
                        setSalonSeleccionado(isSelected ? null : salon);
                      }
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
                      fill={isSelected ? '#d4af37' : '#4A90E2'}
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

                    {/* Popup de información cuando está seleccionado */}
                    {isSelected && !modoEdicion && (
                      <g>
                        {(() => {
                          const horariosSalon = obtenerHorariosSalon(salon.id);
                          const alturaBase = 115;
                          const alturaExtra = horariosSalon.length > 0 ? (horariosSalon.length * 15) + 10 : 0;
                          const alturaTotal = alturaBase + alturaExtra;
                          
                          return (
                            <>
                              <rect
                                x={pos.x + 30}
                                y={pos.y - 60}
                                width="220"
                                height={alturaTotal}
                                fill="rgba(26, 35, 50, 0.95)"
                                stroke="#d4af37"
                                strokeWidth="2"
                                rx="8"
                                filter="url(#shadow)"
                              />
                              <text
                                x={pos.x + 40}
                                y={pos.y - 40}
                                fill="#f0d070"
                                fontSize="12"
                                fontWeight="bold"
                                pointerEvents="none"
                              >
                                {salon.codigo}
                              </text>
                              <text
                                x={pos.x + 40}
                                y={pos.y - 25}
                                fill="#cbd5e0"
                                fontSize="10"
                                pointerEvents="none"
                              >
                                {salon.edificio || 'Sin edificio'}
                              </text>
                              <text
                                x={pos.x + 40}
                                y={pos.y - 10}
                                fill="#a0aec0"
                                fontSize="9"
                                pointerEvents="none"
                              >
                                Tipo: {salon.tipo || 'N/A'}
                              </text>
                              <text
                                x={pos.x + 40}
                                y={pos.y + 5}
                                fill="#a0aec0"
                                fontSize="9"
                                pointerEvents="none"
                              >
                                Capacidad: {salon.capacidad || 0}
                              </text>
                              <text
                                x={pos.x + 40}
                                y={pos.y + 20}
                                fill={salon.estado === 'Disponible' ? '#86efac' : salon.estado === 'Ocupado' ? '#fca5a5' : '#fcd34d'}
                                fontSize="9"
                                fontWeight="600"
                                pointerEvents="none"
                              >
                                Estado: {salon.estado || 'Disponible'}
                              </text>
                              
                              {/* Mostrar horarios asignados */}
                              {horariosSalon.length > 0 && (
                                <>
                                  <text
                                    x={pos.x + 40}
                                    y={pos.y + 38}
                                    fill="#d4af37"
                                    fontSize="10"
                                    fontWeight="bold"
                                    pointerEvents="none"
                                  >
                                    Horarios asignados:
                                  </text>
                                  {horariosSalon.map((horario, idx) => (
                                    <g key={idx}>
                                      <text
                                        x={pos.x + 40}
                                        y={pos.y + 52 + (idx * 15)}
                                        fill="#94a3b8"
                                        fontSize="8"
                                        pointerEvents="none"
                                      >
                                        {horario.dia_semana}: {horario.curso_nombre || 'Curso'}
                                      </text>
                                      <text
                                        x={pos.x + 45}
                                        y={pos.y + 62 + (idx * 15)}
                                        fill="#64748b"
                                        fontSize="7"
                                        pointerEvents="none"
                                      >
                                        {horario.hora_inicio} - {horario.hora_fin}
                                      </text>
                                    </g>
                                  ))}
                                </>
                              )}
                              
                              <text
                                x={pos.x + 40}
                                y={pos.y + alturaTotal - 22}
                                fill="#d4af37"
                                fontSize="8"
                                pointerEvents="none"
                              >
                                Click para cerrar
                              </text>
                            </>
                          );
                        })()}
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Modal para agregar salón */}
      {mostrarModalAgregar && (
        <div className="modal-overlay" onClick={cerrarModalAgregar}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Agregar Nuevo Salón</h2>
              <button className="btn-close-modal" onClick={cerrarModalAgregar}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="codigo">Código del Salón *</label>
                <input
                  type="text"
                  id="codigo"
                  name="codigo"
                  value={nuevoSalon.codigo}
                  onChange={handleInputChange}
                  placeholder="Ej: A101, B205, LAB1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edificio">Edificio *</label>
                <input
                  type="text"
                  id="edificio"
                  name="edificio"
                  value={nuevoSalon.edificio}
                  onChange={handleInputChange}
                  placeholder="Ej: Bloque A, Campus Central"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tipo">Tipo</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={nuevoSalon.tipo}
                    onChange={handleInputChange}
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
                    name="capacidad"
                    value={nuevoSalon.capacidad}
                    onChange={handleInputChange}
                    min="1"
                    max="500"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="coordenada_x">Coordenada X</label>
                  <input
                    type="number"
                    id="coordenada_x"
                    name="coordenada_x"
                    value={nuevoSalon.coordenada_x}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="coordenada_y">Coordenada Y</label>
                  <input
                    type="number"
                    id="coordenada_y"
                    name="coordenada_y"
                    value={nuevoSalon.coordenada_y}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-note">
                💡 Nota: Después de agregar el salón, puedes ajustar su posición en el mapa activando el modo edición.
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={cerrarModalAgregar}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button 
                className="btn-guardar"
                onClick={guardarNuevoSalon}
                disabled={guardando || !nuevoSalon.codigo.trim() || !nuevoSalon.edificio.trim()}
              >
                {guardando ? 'Guardando...' : '✓ Guardar Salón'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMapaSalonesPlano;
