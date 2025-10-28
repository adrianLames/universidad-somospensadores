import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './Horarios.css';

const Horarios = ({ user }) => {
  const [horarios, setHorarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [salones, setSalones] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentHorario, setCurrentHorario] = useState({
    docente_id: '',
    curso_id: '',
    salon_id: '',
    dia_semana: 'Lunes',
    hora_inicio: '08:00',
    hora_fin: '10:00'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHorarios();
    fetchCursos();
    fetchSalones();
    fetchDocentes();
  }, []);

  const fetchHorarios = async () => {
    try {
      const response = await fetch(`${API_BASE}/horarios.php`);
      const data = await response.json();
      setHorarios(data);
    } catch (error) {
      console.error('Error fetching horarios:', error);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php`);
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Error fetching cursos:', error);
    }
  };

  const fetchSalones = async () => {
    try {
      const response = await fetch(`${API_BASE}/salones.php`);
      const data = await response.json();
      setSalones(data);
    } catch (error) {
      console.error('Error fetching salones:', error);
    }
  };

  const fetchDocentes = async () => {
    try {
      const response = await fetch(`${API_BASE}/usuarios.php?tipo=docente`);
      const data = await response.json();
      setDocentes(data);
    } catch (error) {
      console.error('Error fetching docentes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/horarios.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentHorario),
      });

      if (response.ok) {
        await fetchHorarios();
        resetForm();
        alert('Horario asignado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al asignar el horario');
      }
    } catch (error) {
      console.error('Error saving horario:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentHorario({
      docente_id: '',
      curso_id: '',
      salon_id: '',
      dia_semana: 'Lunes',
      hora_inicio: '08:00',
      hora_fin: '10:00'
    });
    setShowForm(false);
  };

  const deleteHorario = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este horario?')) {
      try {
        const response = await fetch(`${API_BASE}/horarios.php?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchHorarios();
          alert('Horario eliminado exitosamente');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Error al eliminar el horario');
        }
      } catch (error) {
        console.error('Error deleting horario:', error);
        alert('Error de conexión');
      }
    }
  };

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="horarios">
      <h2>🕐 Asignación de Horarios</h2>
      
      <button 
        className="btn-primary"
        onClick={() => setShowForm(true)}
      >
        ➕ Nuevo Horario
      </button>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>➕ Nuevo Horario</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Docente:</label>
                <select
                  value={currentHorario.docente_id}
                  onChange={(e) => setCurrentHorario({...currentHorario, docente_id: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar docente</option>
                  {docentes.map(docente => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nombres} {docente.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Curso:</label>
                <select
                  value={currentHorario.curso_id}
                  onChange={(e) => setCurrentHorario({...currentHorario, curso_id: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.codigo} - {curso.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Salón:</label>
                <select
                  value={currentHorario.salon_id}
                  onChange={(e) => setCurrentHorario({...currentHorario, salon_id: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar salón</option>
                  {salones.map(salon => (
                    <option key={salon.id} value={salon.id}>
                      {salon.codigo} - {salon.edificio} (Capacidad: {salon.capacidad})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Día de la semana:</label>
                <select
                  value={currentHorario.dia_semana}
                  onChange={(e) => setCurrentHorario({...currentHorario, dia_semana: e.target.value})}
                  required
                  disabled={loading}
                >
                  {diasSemana.map(dia => (
                    <option key={dia} value={dia}>{dia}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hora de inicio:</label>
                <input
                  type="time"
                  value={currentHorario.hora_inicio}
                  onChange={(e) => setCurrentHorario({...currentHorario, hora_inicio: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Hora de fin:</label>
                <input
                  type="time"
                  value={currentHorario.hora_fin}
                  onChange={(e) => setCurrentHorario({...currentHorario, hora_fin: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Asignando...' : '🕐 Asignar'}
                </button>
                <button type="button" onClick={resetForm} disabled={loading}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="horarios-list">
        {horarios.length === 0 ? (
          <div className="no-data">
            <p>No hay horarios asignados</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Docente</th>
                <th>Salón</th>
                <th>Día</th>
                <th>Horario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map(horario => (
                <tr key={horario.id}>
                  <td>{horario.curso_nombre}</td>
                  <td>{horario.docente_nombres} {horario.docente_apellidos}</td>
                  <td>{horario.salon_codigo} - {horario.salon_edificio}</td>
                  <td>{horario.dia_semana}</td>
                  <td>{horario.hora_inicio} - {horario.hora_fin}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => deleteHorario(horario.id)}>🗑️ Eliminar</button>
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

export default Horarios;