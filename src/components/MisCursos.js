import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import './MisCursos.css';
import BackHomeButton from './BackHomeButton';

const MisCursos = ({ user }) => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('actual'); // actual, anteriores, todos
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMisCursos();
  }, [user]);

  const fetchMisCursos = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      if (user.tipo === 'estudiante') {
        // Obtener matrículas del estudiante
        const response = await fetch(`${API_BASE}/matriculas.php?estudiante_id=${user.id}`);
        const data = await response.json();
        // Asegurar que siempre sea un array
        setCursos(Array.isArray(data) ? data : []);
      } else if (user.tipo === 'docente') {
        // Obtener cursos asignados al docente
        const response = await fetch(`${API_BASE}/vinculaciones.php?docente_id=${user.id}`);
        const data = await response.json();
        // Asegurar que siempre sea un array
        setCursos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching cursos:', error);
      setCursos([]); // En caso de error, establecer array vacío
    } finally {
      setLoading(false);
    }
  };

  const getColorAleatorio = (index) => {
    const colores = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
      'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
      'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
    ];
    return colores[index % colores.length];
  };

  const filtrarCursos = () => {
    let cursosFiltrados = cursos;

    // Filtrar por búsqueda
    if (searchTerm) {
      cursosFiltrados = cursosFiltrados.filter(curso =>
        (curso.curso_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (curso.curso_codigo || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por vista
    if (vistaActual === 'actual') {
      const añoActual = new Date().getFullYear();
      cursosFiltrados = cursosFiltrados.filter(curso => {
        if (user.tipo === 'estudiante') {
          return curso.anio === añoActual && curso.estado === 'activa';
        } else {
          return curso.activo === 1 || curso.activo === '1';
        }
      });
    } else if (vistaActual === 'anteriores') {
      const añoActual = new Date().getFullYear();
      cursosFiltrados = cursosFiltrados.filter(curso => {
        if (user.tipo === 'estudiante') {
          return curso.anio < añoActual || curso.estado !== 'activa';
        } else {
          return curso.activo === 0 || curso.activo === '0';
        }
      });
    }

    return cursosFiltrados;
  };

  const cursosFiltrados = filtrarCursos();

  if (loading) {
    return (
      <div className="mis-cursos-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-cursos-container">
      <div className="mis-cursos-header">
        <div className="header-content">
          <h1>📚 Mis Cursos</h1>
          <BackHomeButton className="btn-back-home" label="Inicio" />
        </div>
        <p className="header-subtitle">
          {user.tipo === 'estudiante' 
            ? 'Cursos en los que estás matriculado' 
            : 'Cursos que impartes como docente'}
        </p>
      </div>

      <div className="cursos-controles">
        <div className="pestanas">
          <button 
            className={`pestana ${vistaActual === 'actual' ? 'activa' : ''}`}
            onClick={() => setVistaActual('actual')}
          >
            Semestre Actual
          </button>
          <button 
            className={`pestana ${vistaActual === 'anteriores' ? 'activa' : ''}`}
            onClick={() => setVistaActual('anteriores')}
          >
            Semestres Anteriores
          </button>
          <button 
            className={`pestana ${vistaActual === 'todos' ? 'activa' : ''}`}
            onClick={() => setVistaActual('todos')}
          >
            Todos
          </button>
        </div>

        <div className="buscador">
          <input
            type="text"
            placeholder="🔍 Buscar curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-buscar"
          />
        </div>
      </div>

      {cursosFiltrados.length === 0 ? (
        <div className="sin-cursos">
          <div className="sin-cursos-icono">📭</div>
          <h3>No hay cursos para mostrar</h3>
          <p>
            {vistaActual === 'actual' 
              ? 'No tienes cursos activos en este momento' 
              : 'No hay cursos en esta categoría'}
          </p>
        </div>
      ) : (
        <div className="cursos-grid">
          {cursosFiltrados.map((curso, index) => (
            <div key={curso.id || index} className="curso-card">
              <div 
                className="curso-card-header" 
                style={{ background: getColorAleatorio(index) }}
              >
                <div className="curso-overlay">
                  <h3 className="curso-titulo">{curso.curso_nombre}</h3>
                  <p className="curso-codigo">{curso.curso_codigo}</p>
                </div>
              </div>
              <div className="curso-card-body">
                <div className="curso-info-item">
                  <span className="info-label">📖 Programa:</span>
                  <span className="info-value">{curso.programa_nombre || '-'}</span>
                </div>
                <div className="curso-info-item">
                  <span className="info-label">⭐ Créditos:</span>
                  <span className="info-value">{curso.curso_creditos || curso.creditos || '-'}</span>
                </div>
                {user.tipo === 'estudiante' && (
                  <>
                    <div className="curso-info-item">
                      <span className="info-label">📅 Semestre:</span>
                      <span className="info-value">{curso.semestre || '-'}</span>
                    </div>
                    <div className="curso-info-item">
                      <span className="info-label">📆 Año:</span>
                      <span className="info-value">{curso.anio || '-'}</span>
                    </div>
                    <div className="curso-info-item">
                      <span className="info-label">📊 Estado:</span>
                      <span className={`badge ${curso.estado === 'activa' ? 'badge-activo' : 'badge-inactivo'}`}>
                        {curso.estado || '-'}
                      </span>
                    </div>
                  </>
                )}
                {user.tipo === 'docente' && (
                  <>
                    <div className="curso-info-item">
                      <span className="info-label">🕐 Jornada:</span>
                      <span className="info-value">{curso.jornada || '-'}</span>
                    </div>
                    <div className="curso-info-item">
                      <span className="info-label">👥 Estudiantes:</span>
                      <span className="info-value">{curso.total_estudiantes || 0}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="curso-card-footer">
                <button 
                  className="btn-ver-detalles"
                  onClick={() => navigate(`/curso/${curso.curso_id || curso.id}`)}
                >
                  Ver Detalles →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cursos-resumen">
        <div className="resumen-item">
          <span className="resumen-numero">{cursosFiltrados.length}</span>
          <span className="resumen-texto">
            {cursosFiltrados.length === 1 ? 'Curso' : 'Cursos'}
          </span>
        </div>
        {user.tipo === 'estudiante' && (
          <div className="resumen-item">
            <span className="resumen-numero">
              {cursosFiltrados.reduce((sum, c) => sum + (parseInt(c.curso_creditos || c.creditos) || 0), 0)}
            </span>
            <span className="resumen-texto">Créditos Totales</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisCursos;
