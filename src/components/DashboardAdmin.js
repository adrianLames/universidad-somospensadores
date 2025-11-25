import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const DashboardAdmin = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
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
          <span>{getWelcomeMessage()} {user.nombres}</span>
          <span className={`user-role ${user.tipo}`}>{user.tipo.toUpperCase()}</span>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Panel de Control Administrador</h2>
          <p>Bienvenido al Sistema de Gestión Universitaria SOMOSPENSADORES</p>
          <p>Selecciona una opción del menú superior para comenzar</p>
          <div className="feature-cards">
            <Link to="/usuarios" className="feature-card">
              <h3>👥 Nueva Gestión de Usuarios</h3>
              <p>Administra estudiantes, docentes y administradores con la nueva interfaz</p>
            </Link>
            <Link to="/facultades" className="feature-card">
              <h3>🏛️ Facultades Académicas</h3>
              <p>Crea, edita y elimina facultades académicas</p>
            </Link>
            <Link to="/programas" className="feature-card">
              <h3>📚 Programas Académicos</h3>
              <p>Gestiona programas y planes de estudio</p>
            </Link>
            <Link to="/cursos" className="feature-card">
              <h3>📖 Cursos</h3>
              <p>Administra la oferta académica de cursos</p>
            </Link>
            <Link to="/vincular-profesor-materia" className="feature-card">
              <h3>🔗 Vincular Profesores</h3>
              <p>Vincula docentes con las materias que impartirán</p>
            </Link>
            <Link to="/horarios" className="feature-card">
              <h3>🕐 Horarios</h3>
              <p>Asigna horarios a cursos y docentes</p>
            </Link>
            <Link to="/salones" className="feature-card">
              <h3>🏫 Salones</h3>
              <p>Administra aulas y espacios universitarios</p>
            </Link>
            <Link to="/admin-mapa-salones" className="feature-card">
              <h3>🗺️ Mapa de Salones (Tabla)</h3>
              <p>Gestiona salones y coordenadas en vista tabular</p>
            </Link>
            <Link to="/admin-mapa-salones-visual" className="feature-card">
              <h3>🗺️ Mapa de Salones (Visual)</h3>
              <p>Gestiona salones de forma visual e interactiva en el mapa</p>
            </Link>
            <Link to="/metricas" className="feature-card">
              <h3>📊 Métricas</h3>
              <p>Visualiza estadísticas y datos globales del sistema</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
