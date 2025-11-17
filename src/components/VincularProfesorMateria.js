
import React, { useEffect, useState } from 'react';
import './VincularProfesorMateria.css';
import { apiRequest } from '../config/api';
import BackHomeButton from './BackHomeButton';

function VincularProfesorMateria() {
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [profesorId, setProfesorId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Cargar profesores y materias al montar
  useEffect(() => {
    (async () => {
      try {
        // Consumir docentes desde la tabla `usuarios` (tipo = 'docente')
        const profs = await apiRequest('usuarios.php?tipo=docente');
        setProfesores(profs);
      } catch (e) {
        setProfesores([]);
      }

      try {
        const mats = await apiRequest('cursos.php');
        setMaterias(mats);
      } catch (e) {
        setMaterias([]);
      }
    })();
  }, []);

  const handleVincular = async (e) => {
    e.preventDefault();
    setMensaje('');
    if (!profesorId || !materiaId) {
      setMensaje('Selecciona profesor y materia.');
      return;
    }
    try {
      await apiRequest('vinculaciones.php', {
        method: 'POST',
        body: JSON.stringify({ docente_id: profesorId, curso_id: materiaId })
      });
      setMensaje('¡Vinculación exitosa!');
    } catch (err) {
      setMensaje(err?.message || 'Error de red o servidor.');
    }
  };

  return (
    <div className="vincular-profesor-materia">
      <div className="page-header">
        <h2>Vincular Profesor con Materia</h2>
        <BackHomeButton className="small-btn right" label="Inicio" />
      </div>
      <form onSubmit={handleVincular}>
        <div className="form-group">
          <label>Profesor:</label>
          <select value={profesorId} onChange={e => setProfesorId(e.target.value)}>
            <option value="">Selecciona un profesor</option>
            {profesores.map(prof => (
              <option key={prof.id} value={prof.id}>{prof.nombres} {prof.apellidos}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Materia:</label>
          <select value={materiaId} onChange={e => setMateriaId(e.target.value)}>
            <option value="">Selecciona una materia</option>
            {materias.map(mat => (
              <option key={mat.id} value={mat.id}>{mat.nombre}</option>
            ))}
          </select>
        </div>
        <button type="submit">Vincular</button>
      </form>
      {mensaje && <p className="mensaje-vinculacion">{mensaje}</p>}
    </div>
  );
}

export default VincularProfesorMateria;
