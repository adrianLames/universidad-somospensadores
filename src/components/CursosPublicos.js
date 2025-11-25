import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './Dashboard.css';
import BackHomeButton from './BackHomeButton';

const CursosPublicos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurso, setSelectedCurso] = useState(null);

  useEffect(() => {
    fetchCursosPublicos();
  }, []);

  const fetchCursosPublicos = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php`);
      const data = await response.json();
      // Filtrar solo cursos públicos y activos
      const cursosPublicos = data.filter(curso => 
        (curso.es_publico === 1 || curso.es_publico === true || curso.es_publico === '1') &&
        (curso.activo === 1 || curso.activo === true || curso.activo === '1')
      );
      setCursos(cursosPublicos);
    } catch (error) {
      console.error('Error fetching cursos públicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (curso) => {
    setSelectedCurso(curso);
  };

  const cerrarDetalle = () => {
    setSelectedCurso(null);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando cursos públicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
          <span style={{background:'#1a3c7b', color:'#fff', borderRadius:'50%', padding:'0.5rem', fontSize:'1.5rem'}}>
            📖
          </span>
          <h2 style={{margin:0, fontWeight:700}}>Cursos Públicos Disponibles</h2>
        </div>
        <BackHomeButton className="small-btn right" label="Inicio" />
      </div>

      {cursos.length === 0 ? (
        <div className="welcome-section">
          <p style={{textAlign: 'center', fontSize: '1.2rem', color: '#888'}}>
            No hay cursos públicos disponibles en este momento.
          </p>
        </div>
      ) : (
        <div className="cursos-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          padding: '1rem'
        }}>
          {cursos.map(curso => (
            <div key={curso.id} className="curso-card" style={{
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => handleVerDetalle(curso)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}>
              <div style={{marginBottom: '0.5rem'}}>
                <span style={{
                  background: '#1bbd7e',
                  color: '#fff',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  {curso.codigo}
                </span>
              </div>
              <h3 style={{margin: '0.8rem 0', color: '#1a3c7b', fontSize: '1.2rem'}}>{curso.nombre}</h3>
              <p style={{color: '#666', fontSize: '0.95rem', marginBottom: '1rem'}}>
                {curso.descripcion ? curso.descripcion.substring(0, 100) + '...' : 'Sin descripción'}
              </p>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#888'}}>
                <span>📚 {curso.creditos} créditos</span>
                <span>{curso.jornada === 'nocturna' ? '🌙 Nocturna' : '☀️ Diurna'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCurso && (
        <div className="modal" onClick={cerrarDetalle}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h3>📖 {selectedCurso.nombre}</h3>
              <button className="close-btn" onClick={cerrarDetalle}>×</button>
            </div>
            <div style={{padding: '1rem'}}>
              <div style={{marginBottom: '1rem'}}>
                <strong>Código:</strong> {selectedCurso.codigo}
              </div>
              <div style={{marginBottom: '1rem'}}>
                <strong>Créditos:</strong> {selectedCurso.creditos}
              </div>
              <div style={{marginBottom: '1rem'}}>
                <strong>Programa:</strong> {selectedCurso.programa_nombre || 'No especificado'}
              </div>
              <div style={{marginBottom: '1rem'}}>
                <strong>Jornada:</strong> {selectedCurso.jornada === 'nocturna' ? 'Nocturna' : 'Diurna'}
              </div>
              <div style={{marginBottom: '1rem'}}>
                <strong>Descripción:</strong>
                <p style={{marginTop: '0.5rem', color: '#666'}}>{selectedCurso.descripcion || 'Sin descripción disponible'}</p>
              </div>
              <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
                <button 
                  className="btn-primary"
                  onClick={cerrarDetalle}
                  style={{padding: '0.7rem 2rem'}}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CursosPublicos;
