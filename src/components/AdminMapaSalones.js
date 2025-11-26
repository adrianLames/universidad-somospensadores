import React, { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';
import BackHomeButton from './BackHomeButton';
import './AdminMapaSalones.css';

const AdminMapaSalones = ({ user }) => {
  const [salones, setSalones] = useState([]);
  const [salonesVisibles, setSalonesVisibles] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [salonEdit, setSalonEdit] = useState(null);
  const [coordenadas, setCoordenadas] = useState({ latitud: '', longitud: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const salonesData = await apiRequest('salones.php');
      
      // Convertir coordenadas a números y normalizar visible
      const salonesConNumeros = (salonesData || []).map(s => ({
        ...s,
        latitud: parseFloat(s.latitud),
        longitud: parseFloat(s.longitud),
        visible: parseInt(s.visible) || 1,
        capacidad: parseInt(s.capacidad) || 0,
        id: parseInt(s.id)
      }));
      
      setSalones(salonesConNumeros);
      
      // Crear un set de visibles basado en el campo visible
      const visiblesSet = new Set(
        salonesConNumeros.filter(s => s.visible === 1).map(s => s.id)
      );
      setSalonesVisibles(visiblesSet);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los salones');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibilidad = async (salonId) => {
    const nuevasVisibles = new Set(salonesVisibles);
    if (nuevasVisibles.has(salonId)) {
      nuevasVisibles.delete(salonId);
    } else {
      nuevasVisibles.add(salonId);
    }
    setSalonesVisibles(nuevasVisibles);

    // Guardar en BD
    try {
      await apiRequest('salones_visibilidad.php', {
        method: 'POST',
        body: JSON.stringify({
          salon_id: salonId,
          visible: nuevasVisibles.has(salonId)
        })
      });
    } catch (err) {
      console.error('Error al guardar visibilidad:', err);
    }
  };

  const toggleTodoVisibles = () => {
    if (salonesVisibles.size === salones.length) {
      setSalonesVisibles(new Set());
    } else {
      setSalonesVisibles(new Set(salones.map(s => s.id)));
    }
  };

  const abrirEditorCoordenadas = (salon) => {
    setSalonEdit(salon);
    setCoordenadas({
      latitud: salon.latitud || '',
      longitud: salon.longitud || ''
    });
  };

  const guardarCoordenadas = async () => {
    try {
      await apiRequest('salones.php', {
        method: 'PUT',
        body: JSON.stringify({
          id: salonEdit.id,
          latitud: parseFloat(coordenadas.latitud),
          longitud: parseFloat(coordenadas.longitud)
        })
      });
      
      setSalones(salones.map(s => 
        s.id === salonEdit.id 
          ? { ...s, latitud: parseFloat(coordenadas.latitud), longitud: parseFloat(coordenadas.longitud) }
          : s
      ));
      setSalonEdit(null);
      setError(null);
    } catch (err) {
      console.error('Error al guardar coordenadas:', err);
      setError('Error al guardar las coordenadas');
    }
  };

  const saloneFiltrados = salones.filter(salon => {
    const coincideBusqueda = 
      salon.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      salon.edificio.toLowerCase().includes(busqueda.toLowerCase());
    
    if (filtro === 'visibles') return coincideBusqueda && salonesVisibles.has(salon.id);
    if (filtro === 'ocultos') return coincideBusqueda && !salonesVisibles.has(salon.id);
    return coincideBusqueda;
  });

  if (loading) {
    return (
      <div className="admin-mapa-container">
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="admin-mapa-container">
      <BackHomeButton />
      
      <div className="admin-mapa-header">
        <h1>⚙️ Administración - Mapa de Salones</h1>
        <p>Gestiona la visibilidad y posiciones de los salones en el mapa para estudiantes</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="admin-mapa-controles">
        <div className="control-grupo">
          <label>Buscar salón:</label>
          <input
            type="text"
            placeholder="Código, edificio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
        </div>

        <div className="control-grupo">
          <label>Filtro:</label>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="select-filtro"
          >
            <option value="todos">Todos ({salones.length})</option>
            <option value="visibles">Visibles ({salonesVisibles.size})</option>
            <option value="ocultos">Ocultos ({salones.length - salonesVisibles.size})</option>
          </select>
        </div>

        <button
          onClick={toggleTodoVisibles}
          className="btn-toggle-all"
        >
          {salonesVisibles.size === salones.length ? '👁️ Ocultar todos' : '👁️ Mostrar todos'}
        </button>
      </div>

      <div className="admin-mapa-contenedor">
        <div className="salones-tabla">
          <div className="tabla-header">
            <div className="col-visible">Visible</div>
            <div className="col-codigo">Código</div>
            <div className="col-edificio">Edificio</div>
            <div className="col-tipo">Tipo</div>
            <div className="col-capacidad">Capacidad</div>
            <div className="col-coordenadas">Coordenadas</div>
            <div className="col-acciones">Acciones</div>
          </div>

          <div className="tabla-body">
            {saloneFiltrados.length > 0 ? (
              saloneFiltrados.map((salon) => (
                <div key={salon.id} className="tabla-fila">
                  <div className="col-visible">
                    <input
                      type="checkbox"
                      checked={salonesVisibles.has(salon.id)}
                      onChange={() => toggleVisibilidad(salon.id)}
                      className="checkbox-visible"
                    />
                  </div>
                  <div className="col-codigo">{salon.codigo}</div>
                  <div className="col-edificio">{salon.edificio}</div>
                  <div className="col-tipo">{salon.tipo}</div>
                  <div className="col-capacidad">{salon.capacidad}</div>
                  <div className="col-coordenadas">
                    {salon.latitud && salon.longitud ? (
                      <span className="coords-badge">
                        {salon.latitud.toFixed(4)}, {salon.longitud.toFixed(4)}
                      </span>
                    ) : (
                      <span className="coords-vacia">Sin coordenadas</span>
                    )}
                  </div>
                  <div className="col-acciones">
                    <button
                      onClick={() => abrirEditorCoordenadas(salon)}
                      className="btn-editar-coords"
                      title="Editar coordenadas"
                    >
                      📍 Editar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="tabla-vacia">No hay salones que coincidan con la búsqueda</div>
            )}
          </div>
        </div>

        <div className="panel-informacion">
          <div className="info-header">
            <h3>📊 Estadísticas</h3>
          </div>
          <div className="info-stats">
            <div className="stat-item">
              <span className="stat-label">Total de salones:</span>
              <span className="stat-valor">{salones.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Salones visibles:</span>
              <span className="stat-valor">{salonesVisibles.size}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Salones ocultos:</span>
              <span className="stat-valor">{salones.length - salonesVisibles.size}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Con coordenadas:</span>
              <span className="stat-valor">{salones.filter(s => s.latitud && s.longitud).length}</span>
            </div>
          </div>

          <div className="info-instrucciones">
            <h4>📋 Instrucciones</h4>
            <ul>
              <li>✓ Marca los salones que deseas mostrar a los estudiantes</li>
              <li>✓ Usa el botón "Editar" para ajustar las coordenadas exactas</li>
              <li>✓ Los cambios se guardan automáticamente</li>
              <li>✓ Solo los salones marcados aparecerán en el mapa de estudiantes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Edición de Coordenadas */}
      {salonEdit && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h2>Editar Coordenadas - {salonEdit.codigo}</h2>
              <button
                onClick={() => setSalonEdit(null)}
                className="btn-cerrar"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grupo">
                <label htmlFor="latitud">Latitud:</label>
                <input
                  id="latitud"
                  type="number"
                  step="0.000001"
                  placeholder="3.022922"
                  value={coordenadas.latitud}
                  onChange={(e) => setCoordenadas({ ...coordenadas, latitud: e.target.value })}
                  className="input-coordenada"
                />
                <small>Ej: 3.022922</small>
              </div>

              <div className="form-grupo">
                <label htmlFor="longitud">Longitud:</label>
                <input
                  id="longitud"
                  type="number"
                  step="0.000001"
                  placeholder="-76.482656"
                  value={coordenadas.longitud}
                  onChange={(e) => setCoordenadas({ ...coordenadas, longitud: e.target.value })}
                  className="input-coordenada"
                />
                <small>Ej: -76.482656</small>
              </div>

              <div className="ayuda-coords">
                <p>💡 Puedes obtener las coordenadas desde Google Maps (clic derecho → Coordenadas)</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSalonEdit(null)}
                className="btn-cancelar"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCoordenadas}
                className="btn-guardar"
              >
                Guardar Coordenadas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMapaSalones;
