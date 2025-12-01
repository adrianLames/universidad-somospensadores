import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';
import CursosPublicos from './CursosPublicos';

const DashboardPublico = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🏫 Universidad SOMOSPENSADORES</h1>
        <div className="user-info">
          {user && user.nombres ? (
            <>
              <span>{getWelcomeMessage()} {user.nombres}</span>
              <span className="user-role publico">PÚBLICO</span>
            </>
          ) : (
            <span>Bienvenido/a visitante</span>
          )}
          {onLogout && <button onClick={handleLogout}>Cerrar Sesión</button>}
        </div>
      </header>
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Panel Público</h2>
          <p>Explora los cursos abiertos disponibles y regístrate para obtener más beneficios</p>
          
          {/* Mostrar cursos públicos directamente */}
          <CursosPublicos />
          
          <div className="feature-cards" style={{marginTop: '2rem'}}>
            <Link to="/registro-publico" className="feature-card">
              <h3>📝 Registro de Usuario</h3>
              <p>Regístrate para acceder a más funcionalidades del sistema</p>
            </Link>
            <Link to="/mapa-salones-plano" className="feature-card">
              <h3>🗺️ Mapa del Campus</h3>
              <p>Explora la ubicación de salones y edificios</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPublico;
