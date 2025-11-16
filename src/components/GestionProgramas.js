import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './GestionProgramas.css';
import BackHomeButton from './BackHomeButton';

const GestionProgramas = ({ user }) => {
  const [programas, setProgramas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPrograma, setCurrentPrograma] = useState({
    id: null,
    codigo: '',
    nombre: '',
    descripcion: '',
    duracion_semestres: '',
    creditos_totales: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProgramas();
  }, []);

  const fetchProgramas = async () => {
    try {
      const response = await fetch(`${API_BASE}/programas.php`);
      const data = await response.json();
      setProgramas(data);
    } catch (error) {
      console.error('Error fetching programas:', error);
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
      creditos_totales: ''
    });
    setShowForm(false);
  };

  const editPrograma = (programa) => {
    setCurrentPrograma(programa);
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
                <th>Duración</th>
                <th>Créditos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programas.map(programa => (
                <tr key={programa.id}>
                  <td><strong>{programa.codigo}</strong></td>
                  <td>{programa.nombre}</td>
                  <td>{programa.duracion_semestres} semestres</td>
                  <td>{programa.creditos_totales} créditos</td>
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