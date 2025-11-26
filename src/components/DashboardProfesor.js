import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const DashboardProfesor = ({ user, onLogout }) => {
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
          <h2>Panel de Control Profesor</h2>
          <p>Bienvenido al Sistema de Gestión Universitaria SOMOSPENSADORES</p>
          <p>Selecciona una opción del menú superior para comenzar</p>
          <div className="feature-cards">
            <Link to="/asistencias" className="feature-card">
              <h3>✅ Asistencias</h3>
              <p>Registra y controla la asistencia de estudiantes</p>
            </Link>
            <Link to="/calificaciones" className="feature-card">
              <h3>📊 Calificaciones</h3>
              <p>Ingresa y gestiona las calificaciones</p>
            </Link>
            <Link to="/estudiantes-por-curso" className="feature-card">
              <h3>👥 Estudiantes por Materia</h3>
              <p>Visualiza todos los estudiantes matriculados en tus cursos</p>
            </Link>
            <Link to="/asignacion-profesores" className="feature-card">
              <h3>📘 Asignación de Profesores</h3>
              <p>Consulta y gestiona los cursos asignados</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardProfesor;
