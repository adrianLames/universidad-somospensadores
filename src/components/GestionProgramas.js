
import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './GestionProgramas.css';
import BackHomeButton from './BackHomeButton';

const GestionProgramas = ({ user }) => {
  const [programas, setProgramas] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('todos'); // 'todos', 'activos', 'inactivos'
  const [showForm, setShowForm] = useState(false);
  const [currentPrograma, setCurrentPrograma] = useState({
    id: null,
    codigo: '',
    nombre: '',
    descripcion: '',
    duracion_semestres: '',
    creditos_totales: '',
    facultad_id: '',
    activo: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFacultades();
    fetchProgramas();
  }, []);

  const fetchFacultades = async () => {
    try {
      const res = await fetch(`${API_BASE}/facultades.php`);
      const data = await res.json();
      const facultadesData = data.success ? data.data : (Array.isArray(data) ? data : []);
      setFacultades(facultadesData);
    } catch {
      setFacultades([]);
    }
  };

  const fetchProgramas = async () => {
    try {
      const response = await fetch(`${API_BASE}/programas.php?all=1`); // Cambia la API para devolver todos
      const data = await response.json();
      const programasData = data.success ? data.data : (Array.isArray(data) ? data : []);
      setProgramas(programasData);
    } catch (error) {
      console.error('Error fetching programas:', error);
      setProgramas([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = currentPrograma.id ? 'PUT' : 'POST';
      const url = currentPrograma.id 
        ? `${API_BASE}/programas.php?id=${currentPrograma.id}`
        : `${API_BASE}/programas.php`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentPrograma),
      });

      if (response.ok) {
        await fetchProgramas();
        resetForm();
        alert('Programa guardado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al guardar el programa');
      }
    } catch (error) {
      console.error('Error saving programa:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPrograma({
      id: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      duracion_semestres: '',
      creditos_totales: '',
      facultad_id: '',
      activo: true
    });
    setShowForm(false);
  };

  const editPrograma = (programa) => {
    setCurrentPrograma({
      ...programa,
      facultad_id: programa.facultad_id ? String(programa.facultad_id) : '',
      activo: programa.activo === undefined ? true : Boolean(Number(programa.activo))
    });
    setShowForm(true);
  };

  const deletePrograma = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este programa?')) {
      try {
        const response = await fetch(`${API_BASE}/programas.php?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchProgramas();
          alert('Programa eliminado exitosamente');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Error al eliminar el programa');
        }
      } catch (error) {
        console.error('Error deleting programa:', error);
        alert('Error de conexión');
      }
    }
  };

  return (
    <div className="gestion-programas">
      <div className="page-header">
        <h2>📚 Gestión de Programas Académicos</h2>
        <BackHomeButton className="small-btn right" label="Inicio" />
      </div>
      
      <button 
        className="btn-primary"
        onClick={() => setShowForm(true)}
      >
        ➕ Nuevo Programa
      </button>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{currentPrograma.id ? '✏️ Editar' : '➕ Nuevo'} Programa</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Código:</label>
                <input
                  type="text"
                  value={currentPrograma.codigo}
                  onChange={(e) => setCurrentPrograma({...currentPrograma, codigo: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={currentPrograma.nombre}
                  onChange={(e) => setCurrentPrograma({...currentPrograma, nombre: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Facultad:</label>
                <select
                  value={currentPrograma.facultad_id}
                  onChange={e => setCurrentPrograma({...currentPrograma, facultad_id: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="">Selecciona una facultad</option>
                  {facultades.map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={currentPrograma.descripcion}
                  onChange={(e) => setCurrentPrograma({...currentPrograma, descripcion: e.target.value})}
                  rows="3"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Duración (semestres):</label>
                <input
                  type="number"
                  value={currentPrograma.duracion_semestres}
                  onChange={(e) => setCurrentPrograma({...currentPrograma, duracion_semestres: e.target.value})}
                  required
                  min="1"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Créditos Totales:</label>
                <input
                  type="number"
                  value={currentPrograma.creditos_totales}
                  onChange={(e) => setCurrentPrograma({...currentPrograma, creditos_totales: e.target.value})}
                  required
                  min="1"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!!currentPrograma.activo}
                    onChange={e => setCurrentPrograma({...currentPrograma, activo: e.target.checked})}
                    disabled={loading}
                  />
                  {' '}Activo
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : '💾 Guardar'}
                </button>
                <button type="button" onClick={resetForm} disabled={loading}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="programas-list">
        <div style={{marginBottom:'1rem', display:'flex', gap:'1rem'}}>
          <label>Ver:
            <select value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)} style={{marginLeft:'0.5rem'}}>
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </label>
        </div>
        {programas.length === 0 ? (
          <div className="no-data">
            <p>No hay programas registrados</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Facultad</th>
                <th>Duración</th>
                <th>Créditos</th>
                <th>Activo</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programas
                .filter(programa => {
                  if (filtroActivo === 'activos') return String(programa.activo) === '1' || programa.activo === 1 || programa.activo === true;
                  if (filtroActivo === 'inactivos') return String(programa.activo) === '0' || programa.activo === 0 || programa.activo === false;
                  return true;
                })
                .map(programa => (
                <tr key={programa.id}>
                  <td><strong>{programa.codigo}</strong></td>
                  <td>{programa.nombre}</td>
                  <td>{programa.facultad_nombre || '-'}</td>
                  <td>{programa.duracion_semestres} semestres</td>
                  <td>{programa.creditos_totales} créditos</td>
                  <td>{String(programa.activo) === '1' || programa.activo === 1 || programa.activo === true ? 'Sí' : 'No'}</td>
                  <td>{programa.fecha_creacion ? new Date(programa.fecha_creacion).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => editPrograma(programa)}>✏️ Editar</button>
                      <button onClick={() => deletePrograma(programa.id)}>🗑️ Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GestionProgramas;