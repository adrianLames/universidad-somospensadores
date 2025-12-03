import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './Dashboard.css';

const CursosPublicos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [showInscripcionForm, setShowInscripcionForm] = useState(false);
  const [inscripcionData, setInscripcionData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    identificacion: '',
    telefono: ''
  });
  const [inscripcionLoading, setInscripcionLoading] = useState(false);
  const [inscripcionMensaje, setInscripcionMensaje] = useState('');

  useEffect(() => {
    fetchCursosPublicos();
  }, []);

  const fetchCursosPublicos = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php`);
      const result = await response.json();
      
      console.log('📚 Respuesta API cursos.php:', result);
      
      // Manejar nuevo formato {success: true, data: [...]}
      const data = result.success ? result.data : (Array.isArray(result) ? result : []);
      
      console.log('📊 Total de cursos recibidos:', data.length);
      
      // Filtrar solo cursos públicos y activos
      const cursosPublicos = data.filter(curso => {
        const esPublico = curso.es_publico === 1 || curso.es_publico === true || curso.es_publico === '1';
        const esActivo = curso.activo === 1 || curso.activo === true || curso.activo === '1';
        console.log(`Curso ${curso.codigo}: es_publico=${curso.es_publico}, activo=${curso.activo}, pasa filtro=${esPublico && esActivo}`);
        return esPublico && esActivo;
      });
      
      console.log('✅ Cursos públicos filtrados:', cursosPublicos.length, cursosPublicos);
      setCursos(cursosPublicos);
    } catch (error) {
      console.error('Error fetching cursos públicos:', error);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (curso) => {
    setSelectedCurso(curso);
    setShowInscripcionForm(false);
    setInscripcionMensaje('');
  };

  const cerrarDetalle = () => {
    setSelectedCurso(null);
    setShowInscripcionForm(false);
    setInscripcionData({
      nombres: '',
      apellidos: '',
      email: '',
      identificacion: '',
      telefono: ''
    });
    setInscripcionMensaje('');
  };

  const handleInscribirse = () => {
    setShowInscripcionForm(true);
    setInscripcionMensaje('');
  };

  const handleInscripcionChange = (e) => {
    const { name, value } = e.target;
    setInscripcionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitInscripcion = async (e) => {
    e.preventDefault();
    setInscripcionLoading(true);
    setInscripcionMensaje('');

    try {
      // Primero, crear o buscar el usuario público
      const userResponse = await fetch(`${API_BASE}/usuarios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'publico',
          identificacion: inscripcionData.identificacion,
          nombres: inscripcionData.nombres,
          apellidos: inscripcionData.apellidos,
          email: inscripcionData.email,
          telefono: inscripcionData.telefono,
          password: inscripcionData.identificacion // Usar identificación como contraseña por defecto
        })
      });

      let userId;
      if (userResponse.ok) {
        const userData = await userResponse.json();
        userId = userData.id || userData.usuario_id;
      } else {
        // Si el usuario ya existe, obtener su ID
        const checkResponse = await fetch(`${API_BASE}/usuarios.php?identificacion=${inscripcionData.identificacion}`);
        const users = await checkResponse.json();
        const existingUser = Array.isArray(users) ? users.find(u => u.identificacion === inscripcionData.identificacion) : null;
        if (existingUser) {
          userId = existingUser.id;
        } else {
          throw new Error('No se pudo crear o encontrar el usuario');
        }
      }

      // Luego, crear la matrícula
      const matriculaResponse = await fetch(`${API_BASE}/matriculas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: userId,
          curso_id: selectedCurso.id,
          semestre: '1',
          anio: new Date().getFullYear()
        })
      });

      if (matriculaResponse.ok) {
        setInscripcionMensaje('¡Inscripción exitosa! Revisa tu correo para más información.');
        setTimeout(() => {
          cerrarDetalle();
        }, 3000);
      } else {
        const error = await matriculaResponse.json();
        setInscripcionMensaje(error.message || 'Error al realizar la inscripción');
      }
    } catch (error) {
      console.error('Error en inscripción:', error);
      setInscripcionMensaje('Error al procesar la inscripción. Por favor intenta nuevamente.');
    } finally {
      setInscripcionLoading(false);
    }
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
          <span style={{background:'#d4af37', color:'#1a1a1a', borderRadius:'50%', padding:'0.5rem', fontSize:'1.5rem'}}>
            📖
          </span>
          <h2 style={{margin:0, fontWeight:700, color: '#f0d070'}}>Cursos Públicos Disponibles</h2>
        </div>
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
              background: '#1a1a1a',
              border: '1px solid #3a3a3a',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => handleVerDetalle(curso)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(212, 175, 55, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.1)';
            }}>
              <div style={{marginBottom: '0.5rem'}}>
                <span style={{
                  background: '#d4af37',
                  color: '#1a1a1a',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  {curso.codigo}
                </span>
              </div>
              <h3 style={{margin: '0.8rem 0', color: '#f0d070', fontSize: '1.2rem'}}>{curso.nombre}</h3>
              <p style={{color: '#b0b0b0', fontSize: '0.95rem', marginBottom: '1rem'}}>
                {curso.descripcion ? curso.descripcion.substring(0, 100) + '...' : 'Sin descripción'}
              </p>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#a0a0a0'}}>
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
              <h3 style={{color: '#d4af37'}}>📖 {selectedCurso.nombre}</h3>
              <button className="close-btn" onClick={cerrarDetalle}>×</button>
            </div>
            <div style={{padding: '1rem', color: '#e0e0e0'}}>
              {!showInscripcionForm ? (
                <>
                  <div style={{marginBottom: '1rem'}}>
                    <strong style={{color: '#d4af37'}}>Código:</strong> {selectedCurso.codigo}
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <strong style={{color: '#d4af37'}}>Créditos:</strong> {selectedCurso.creditos}
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <strong style={{color: '#d4af37'}}>Programa:</strong> {selectedCurso.programa_nombre || 'No especificado'}
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <strong style={{color: '#d4af37'}}>Jornada:</strong> {selectedCurso.jornada === 'nocturna' ? 'Nocturna' : 'Diurna'}
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <strong style={{color: '#d4af37'}}>Descripción:</strong>
                    <p style={{marginTop: '0.5rem', color: '#b0b0b0'}}>{selectedCurso.descripcion || 'Sin descripción disponible'}</p>
                  </div>
                  <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem'}}>
                    <button 
                      className="btn-primary"
                      onClick={handleInscribirse}
                      style={{padding: '0.7rem 2rem'}}
                    >
                      ✏️ Inscribirse
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={cerrarDetalle}
                      style={{padding: '0.7rem 2rem', background: '#3a3a3a', color: '#d4af37'}}
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4 style={{color: '#f0d070', marginBottom: '1rem'}}>Formulario de Inscripción</h4>
                  {inscripcionMensaje && (
                    <div style={{
                      padding: '0.8rem',
                      marginBottom: '1rem',
                      borderRadius: '6px',
                      background: inscripcionMensaje.includes('exitosa') ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                      border: `1px solid ${inscripcionMensaje.includes('exitosa') ? '#2ecc71' : '#e74c3c'}`,
                      color: inscripcionMensaje.includes('exitosa') ? '#2ecc71' : '#e74c3c'
                    }}>
                      {inscripcionMensaje}
                    </div>
                  )}
                  <form onSubmit={handleSubmitInscripcion}>
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', color: '#d4af37'}}>Identificación *</label>
                      <input
                        type="text"
                        name="identificacion"
                        value={inscripcionData.identificacion}
                        onChange={handleInscripcionChange}
                        required
                        style={{width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #3a3a3a', background: '#1a1a1a', color: '#e0e0e0'}}
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', color: '#d4af37'}}>Nombres *</label>
                      <input
                        type="text"
                        name="nombres"
                        value={inscripcionData.nombres}
                        onChange={handleInscripcionChange}
                        required
                        style={{width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #3a3a3a', background: '#1a1a1a', color: '#e0e0e0'}}
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', color: '#d4af37'}}>Apellidos *</label>
                      <input
                        type="text"
                        name="apellidos"
                        value={inscripcionData.apellidos}
                        onChange={handleInscripcionChange}
                        required
                        style={{width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #3a3a3a', background: '#1a1a1a', color: '#e0e0e0'}}
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', color: '#d4af37'}}>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={inscripcionData.email}
                        onChange={handleInscripcionChange}
                        required
                        style={{width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #3a3a3a', background: '#1a1a1a', color: '#e0e0e0'}}
                      />
                    </div>
                    <div className="form-group" style={{marginBottom: '1rem'}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', color: '#d4af37'}}>Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={inscripcionData.telefono}
                        onChange={handleInscripcionChange}
                        style={{width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #3a3a3a', background: '#1a1a1a', color: '#e0e0e0'}}
                      />
                    </div>
                    <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem'}}>
                      <button 
                        type="submit"
                        className="btn-primary"
                        disabled={inscripcionLoading}
                        style={{padding: '0.7rem 2rem'}}
                      >
                        {inscripcionLoading ? 'Procesando...' : '✔️ Confirmar Inscripción'}
                      </button>
                      <button 
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowInscripcionForm(false)}
                        disabled={inscripcionLoading}
                        style={{padding: '0.7rem 2rem', background: '#3a3a3a', color: '#d4af37'}}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CursosPublicos;
