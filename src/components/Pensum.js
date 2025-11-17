import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';
import './Pensum.css';

const colores = {
  aprobado: '#2ecc71', // verde
  cursando: '#f1c40f', // amarillo
  pendiente: '#e74c3c', // rojo
};

const Pensum = ({ user }) => {
  const [cursos, setCursos] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [matriculas, setMatriculas] = useState([]);

  useEffect(() => {
    fetchCursos();
    fetchCalificaciones();
    fetchMatriculas();
  }, []);

  const fetchCursos = async () => {
    const res = await fetch(`${API_BASE}/cursos.php`);
    setCursos(await res.json());
  };

  const fetchCalificaciones = async () => {
    const res = await fetch(`${API_BASE}/calificaciones.php?estudiante_id=${user.id}`);
    setCalificaciones(await res.json());
  };

  const fetchMatriculas = async () => {
    const res = await fetch(`${API_BASE}/matriculas.php?estudiante_id=${user.id}`);
    setMatriculas(await res.json());
  };

  // Estado de cada curso: aprobado, cursando, pendiente
  const getEstado = (curso) => {
    // Comparar como string y número para evitar problemas de tipo
    const calif = calificaciones.find(c => String(c.curso_id) === String(curso.id));
    if (calif && calif.estado === 'aprobado') return 'aprobado';
    if (matriculas.find(m => String(m.curso_id) === String(curso.id) && m.estado === 'activa')) return 'cursando';
    return 'pendiente';
  };

  return (
    <div className="pensum-container">
      <h2>Pensum / Malla Curricular</h2>
      <div className="pensum-grid">
        {cursos.map(curso => {
          const estado = getEstado(curso);
          // Buscar el prerequisito si existe
          let prerequisito = null;
          if (curso.prerequisito_id) {
            prerequisito = cursos.find(c => String(c.id) === String(curso.prerequisito_id));
          }
          return (
            <div
              key={curso.id}
              className={`pensum-curso ${estado}`}
              style={{ background: colores[estado] }}
              title={curso.nombre}
            >
              <strong>{curso.codigo}</strong><br />
              {curso.nombre}
              {prerequisito && (
                <div className="pensum-prerequisito">
                  <small>Requisito: <b>{prerequisito.codigo} - {prerequisito.nombre}</b></small>
                </div>
              )}
              <div className="pensum-estado">{estado.toUpperCase()}</div>
            </div>
          );
        })}
      </div>
      <div className="leyenda">
        <span style={{background: colores.aprobado}}>Aprobado</span>
        <span style={{background: colores.cursando}}>Cursando</span>
        <span style={{background: colores.pendiente}}>Pendiente</span>
      </div>
    </div>
  );
};

export default Pensum;
