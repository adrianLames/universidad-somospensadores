import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './GestionCursos.css';

const GestionCursos = ({ user }) => {
  const [cursos, setCursos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [prerequisitos, setPrerequisitos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentCurso, setCurrentCurso] = useState({
    id: null,
    codigo: '',
    nombre: '',
    descripcion: '',
    creditos: '',
    programa_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);

  useEffect(() => {
    fetchCursos();
    fetchProgramas();
  }, []);

  const fetchCursos = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php`);
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Error fetching cursos:', error);
    }
  };

  const fetchProgramas = async () => {
    try {
      const response = await fetch(`${API_BASE}/programas.php`);
      const data = await response.json();
      setProgramas(data);
    } catch (error) {
      console.error('Error fetching programas:', error);
    }
  };

  const fetchPrerequisitos = async (cursoId) => {
    try {
      const response = await fetch(`${API_BASE}/prerequisitos.php?curso_id=${cursoId}`);
      const data = await response.json();
      setPrerequisitos(data);
    } catch (error) {
      console.error('Error fetching prerequisitos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = currentCurso.id ? 'PUT' : 'POST';
      const url = currentCurso.id 
        ? `${API_BASE}/cursos.php?id=${currentCurso.id}`
        : `${API_BASE}/cursos.php`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentCurso),
      });

      if (response.ok) {
        await fetchCursos();
        resetForm();
        alert('Curso guardado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al guardar el curso');
      }
    } catch (error) {
      console.error('Error saving curso:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentCurso({
      id: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      creditos: '',
      programa_id: ''
    });
    setShowForm(false);
  };

  const editCurso = (curso) => {
    setCurrentCurso(curso);
    setShowForm(true);
  };

  const deleteCurso = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este curso?')) {
      try {
        const response = await fetch(`${API_BASE}/cursos.php?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchCursos();
          alert('Curso eliminado exitosamente');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Error al eliminar el curso');
        }
      } catch (error) {
        console.error('Error deleting curso:', error);
        alert('Error de conexión');
      }
    }
  };

  const handleCursoSelect = (cursoId) => {
    setSelectedCurso(cursoId);
    fetchPrerequisitos(cursoId);
  };

  return (
    <div className="gestion-cursos">
      <h2>📖 Gestión de Cursos</h2>
      
      <button 
        className="btn-primary"
        onClick={() => setShowForm(true)}
      >
        ➕ Nuevo Curso
      </button>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{currentCurso.id ? '✏️ Editar' : '➕ Nuevo'} Curso</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Código:</label>
                <input
                  type="text"
                  value={currentCurso.codigo}
                  onChange={(e) => setCurrentCurso({...currentCurso, codigo: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={currentCurso.nombre}
                  onChange={(e) => setCurrentCurso({...currentCurso, nombre: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={currentCurso.descripcion}
                  onChange={(e) => setCurrentCurso({...currentCurso, descripcion: e.target.value})}
                  rows="3"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Créditos:</label>
                <input
                  type="number"
                  value={currentCurso.creditos}
                  onChange={(e) => setCurrentCurso({...currentCurso, creditos: e.target.value})}
                  required
                  min="1"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Programa:</label>
                <select
                  value={currentCurso.programa_id}
                  onChange={(e) => setCurrentCurso({...currentCurso, programa_id: e.target.value})}
                  disabled={loading}
                >
                  <option value="">Seleccionar programa</option>
                  {programas.map(programa => (
                    <option key={programa.id} value={programa.id}>
                      {programa.nombre}
                    </option>
                  ))}
                </select>
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

      <div className="cursos-list">
        {cursos.length === 0 ? (
          <div className="no-data">
            <p>No hay cursos registrados</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Créditos</th>
                <th>Programa</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map(curso => (
                <tr key={curso.id}>
                  <td><strong>{curso.codigo}</strong></td>
                  <td>{curso.nombre}</td>
                  <td>{curso.creditos}</td>
                  <td>{curso.programa_nombre || 'Sin programa'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => editCurso(curso)}>✏️ Editar</button>
                      <button onClick={() => deleteCurso(curso.id)}>🗑️ Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedCurso && (
        <div className="prerequisitos">
          <h2>Prerequisitos</h2>
          {prerequisitos.length > 0 ? (
            <ul>
              {prerequisitos.map(prerequisito => (
                <li key={prerequisito.id}>{prerequisito.nombre}</li>
              ))}
            </ul>
          ) : (
            <p>Este curso no tiene prerequisitos.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GestionCursos;