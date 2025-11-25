import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const DashboardEstudiante = ({ user, onLogout }) => {
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
          <h2>Panel de Control Estudiante</h2>
          <p>Bienvenido al Sistema de Gestión Universitaria SOMOSPENSADORES</p>
          <p>Selecciona una opción del menú superior para comenzar</p>
          <div className="feature-cards">
            <Link to="/matriculas" className="feature-card">
              <h3>🎓 Matrículas</h3>
              <p>Realiza tu matrícula en los cursos</p>
            </Link>
            <Link to="/calificaciones" className="feature-card">
              <h3>📈 Calificaciones</h3>
              <p>Consulta tu rendimiento académico</p>
            </Link>
            <Link to="/asistencias" className="feature-card">
              <h3>📅 Asistencias</h3>
              <p>Revisa tu registro de asistencias</p>
            </Link>
            <Link to="/mapa-salones" className="feature-card">
              <h3>📍 Mapa de Salones</h3>
              <p>Visualiza los salones, horarios y profesores en el campus</p>
            </Link>
            <Link to="/pensum" className="feature-card">
              <h3>🗂️ Pensum / Malla Curricular</h3>
              <p>Consulta tu plan de estudios y materias pendientes</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardEstudiante;
