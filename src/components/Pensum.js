import React, { useEffect, useState, useCallback } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchCursos = useCallback(async () => {
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
      
      // Ya no necesitamos eliminar duplicados porque los códigos ahora son únicos
      // con sufijos _D (diurna) y _N (nocturna)
      setCursos(cursosFiltrados);
    } catch (error) {
      console.error('Error fetching cursos:', error);
      setCursos([]);
    }
  }, [user.jornada]);

  const fetchCalificaciones = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/calificaciones.php?estudiante_id=${user.id}`);
      const result = await res.json();
      // El API retorna {success, data}
      const data = result.success ? result.data : (Array.isArray(result) ? result : []);
      console.log('📊 Calificaciones del estudiante:', data);
      setCalificaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching calificaciones:', error);
      setCalificaciones([]);
    }
  }, [user.id]);

  const fetchMatriculas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/matriculas.php?estudiante_id=${user.id}`);
      const data = await res.json();
      setMatriculas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching matriculas:', error);
      setMatriculas([]);
    }
  }, [user.id]);

  const fetchPrerequisitos = useCallback(async () => {
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
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCursos(),
        fetchCalificaciones(),
        fetchMatriculas(),
        fetchPrerequisitos()
      ]);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, [fetchCursos, fetchCalificaciones, fetchMatriculas, fetchPrerequisitos]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Actualizar automáticamente cuando la ventana recupera el foco
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Pensum: Ventana enfocada, actualizando datos...');
      refreshData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshData]);

  // Actualizar cada 30 segundos cuando el componente está montado
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Pensum: Actualización automática (30s)');
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  // Estado de cada curso: aprobado, cursando, pendiente
  const getEstado = (curso) => {
    // Comparar como string y número para evitar problemas de tipo
    const calif = calificaciones.find(c => String(c.curso_id) === String(curso.id));
    
    // Si tiene calificación aprobada, mostrar como aprobado
    if (calif && calif.estado === 'aprobado') {
      return 'aprobado';
    }
    
    // Si está matriculado activamente (sin aprobar), mostrar como cursando
    const matricula = matriculas.find(m => String(m.curso_id) === String(curso.id) && m.estado === 'activa');
    if (matricula) {
      return 'cursando';
    }
    
    // Si no está matriculado ni aprobado, está pendiente
    return 'pendiente';
  };

  return (
    <div className="pensum-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem'}}>
        <h2>Pensum / Malla Curricular</h2>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <button 
            onClick={refreshData}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: loading ? '#95a5a6' : '#27ae60',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'all 0.3s'
            }}
          >
            {loading ? '🔄 Actualizando...' : '🔄 Actualizar'}
          </button>
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
      </div>
      {lastUpdate && (
        <div style={{
          fontSize: '0.85rem',
          color: '#95a5a6',
          marginBottom: '1rem',
          textAlign: 'right'
        }}>
          Última actualización: {lastUpdate.toLocaleTimeString('es-CO')}
        </div>
      )}
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
