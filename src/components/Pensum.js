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
  const [prerequisitosMap, setPrerequisitosMap] = useState({});

  useEffect(() => {
    fetchCursos();
    fetchCalificaciones();
    fetchMatriculas();
    fetchPrerequisitos();
  }, []);

  const fetchCursos = async () => {
    try {
      const res = await fetch(`${API_BASE}/cursos.php`);
      const data = await res.json();
      
      let allCursos = [];
      if (data.success && Array.isArray(data.data)) {
        allCursos = data.data;
      } else if (Array.isArray(data)) {
        allCursos = data;
      }
      
      // Filtrar cursos por la jornada del estudiante
      const cursosFiltrados = allCursos.filter(curso => {
        // Si el usuario tiene jornada definida, filtrar por ella
        if (user.jornada) {
          return curso.jornada === user.jornada;
        }
        // Si no tiene jornada, mostrar todos
        return true;
      });
      
      // Eliminar duplicados por código (tomar solo el primero de cada código)
      const cursosUnicos = [];
      const codigosVistos = new Set();
      
      cursosFiltrados.forEach(curso => {
        // Extraer código base (sin sufijos como _PROG1, _AL, etc.)
        const codigoBase = curso.codigo.split('_')[0];
        const key = `${codigoBase}-${curso.nombre}`;
        
        if (!codigosVistos.has(key)) {
          codigosVistos.add(key);
          cursosUnicos.push(curso);
        }
      });
      
      setCursos(cursosUnicos);
    } catch (error) {
      console.error('Error fetching cursos:', error);
      setCursos([]);
    }
  };

  const fetchCalificaciones = async () => {
    try {
      const res = await fetch(`${API_BASE}/calificaciones.php?estudiante_id=${user.id}`);
      const data = await res.json();
      setCalificaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching calificaciones:', error);
      setCalificaciones([]);
    }
  };

  const fetchMatriculas = async () => {
    try {
      const res = await fetch(`${API_BASE}/matriculas.php?estudiante_id=${user.id}`);
      const data = await res.json();
      setMatriculas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching matriculas:', error);
      setMatriculas([]);
    }
  };

  const fetchPrerequisitos = async () => {
    try {
      const res = await fetch(`${API_BASE}/prerequisitos.php`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        const map = {};
        data.data.forEach(row => {
          if (!map[row.curso_id]) {
            map[row.curso_id] = [];
          }
          map[row.curso_id].push({
            id: row.prerequisito_id,
            nombre: row.prerequisito_nombre
          });
        });
        setPrerequisitosMap(map);
      }
    } catch (error) {
      console.error('Error fetching prerequisitos:', error);
    }
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
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h2>Pensum / Malla Curricular</h2>
        {user.jornada && (
          <div style={{
            padding: '0.5rem 1rem',
            background: user.jornada === 'diurna' ? '#f39c12' : '#3498db',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}>
            {user.jornada === 'diurna' ? '☀️ Jornada Diurna' : '🌙 Jornada Nocturna'}
          </div>
        )}
      </div>
      {cursos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#f8f9fa',
          borderRadius: '12px',
          color: '#6c757d'
        }}>
          <p style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>📚 No hay cursos disponibles</p>
          <p>No se encontraron cursos para tu jornada ({user.jornada || 'sin definir'})</p>
        </div>
      ) : (
        <div className="pensum-grid">{cursos.map(curso => {
          const estado = getEstado(curso);
          const prerequisitos = prerequisitosMap[curso.id] || [];
          
          return (
            <div
              key={curso.id}
              className={`pensum-curso ${estado}`}
              style={{ background: colores[estado] }}
              title={curso.nombre}
            >
              <strong>{curso.codigo}</strong><br />
              <span className="curso-nombre">{curso.nombre}</span>
              {prerequisitos.length > 0 && (
                <div className="pensum-prerequisito">
                  <small>
                    <strong>Requisitos:</strong><br />
                    {prerequisitos.map((prereq, idx) => (
                      <span key={prereq.id}>
                        {prereq.nombre}
                        {idx < prerequisitos.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </small>
                </div>
              )}
              <div className="pensum-estado">{estado.toUpperCase()}</div>
            </div>
          );
        })}
        </div>
      )}
      <div className="leyenda">
        <span style={{background: colores.aprobado}}>Aprobado</span>
        <span style={{background: colores.cursando}}>Cursando</span>
        <span style={{background: colores.pendiente}}>Pendiente</span>
      </div>
    </div>
  );
};

export default Pensum;
