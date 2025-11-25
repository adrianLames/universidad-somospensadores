import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const DashboardPublico = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🏫 Universidad SOMOSPENSADORES</h1>
        <div className="user-info">
          {user && user.nombres ? <span>Bienvenido/a {user.nombres}</span> : <span>Bienvenido/a visitante</span>}
          <span className="user-role publico">PÚBLICO</span>
          {onLogout && <button onClick={handleLogout}>Cerrar Sesión</button>}
        </div>
      </header>
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Panel Público</h2>
          <p>Accede a los cursos públicos disponibles y regístrate para obtener más beneficios.</p>
          <div className="feature-cards">
            <Link to="/cursos-publicos" className="feature-card">
              <h3>📖 Cursos Públicos</h3>
              <p>Consulta la oferta de cursos abiertos al público</p>
            </Link>
            <Link to="/registro-publico" className="feature-card">
              <h3>📝 Registro Externo</h3>
              <p>Regístrate para acceder a más funcionalidades</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPublico;
