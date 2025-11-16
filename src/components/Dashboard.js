import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
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

      <nav className="dashboard-nav">
        <ul>
          {user.tipo === 'admin' && (
            <>
              <li><Link to="/usuarios">👥 Gestión de Usuarios</Link></li>
              <li><Link to="/programas">📚 Gestión de Programas</Link></li>
              <li><Link to="/cursos">📖 Gestión de Cursos</Link></li>
              <li><Link to="/horarios">🕐 Asignación de Horarios</Link></li>
              <li><Link to="/vincular-profesor-materia">🔗 Vincular Profesor - Materia</Link></li>
            </>
          )}
          {user.tipo === 'docente' && (
            <>
              <li><Link to="/asistencias">✅ Control de Asistencias</Link></li>
              <li><Link to="/calificaciones">📊 Registro de Calificaciones</Link></li>
              <li><Link to="/asignacion-profesores">📘 Asignación de Profesores</Link></li>
            </>
          )}
          {user.tipo === 'estudiante' && (
            <>
              <li><Link to="/matriculas">🎓 Matrículas</Link></li>
              <li><Link to="/calificaciones">📈 Ver Calificaciones</Link></li>
              <li><Link to="/asistencias">📅 Ver Asistencias</Link></li>
              <li><Link to="/pensum">🗂️ Pensum / Malla Curricular</Link></li>
            </>
          )}
        </ul>
      </nav>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Panel de Control Principal</h2>
          <p>Bienvenido al Sistema de Gestión Universitaria SOMOSPENSADORES</p>
          <p>Selecciona una opción del menú superior para comenzar</p>
          
          <div className="feature-cards">
            {user.tipo === 'admin' && (
              <>
                <div className="feature-card">
                  <h3>👥 Gestión de Usuarios</h3>
                  <p>Administra estudiantes, docentes y administradores</p>
                </div>
                <div className="feature-card">
                  <h3>📚 Programas Académicos</h3>
                  <p>Gestiona programas y planes de estudio</p>
                </div>
                <div className="feature-card">
                  <h3>📖 Cursos</h3>
                  <p>Administra la oferta académica de cursos</p>
                </div>
                <div className="feature-card">
                  <h3>🔗 Vincular Profesores</h3>
                  <p>Vincula docentes con las materias que impartirán</p>
                </div>
                <div className="feature-card">
                  <h3>🕐 Horarios</h3>
                  <p>Asigna horarios a cursos y docentes</p>
                </div>
              </>
            )}
            {user.tipo === 'docente' && (
              <>
                <div className="feature-card">
                  <h3>✅ Asistencias</h3>
                  <p>Registra y controla la asistencia de estudiantes</p>
                </div>
                <div className="feature-card">
                  <h3>📊 Calificaciones</h3>
                  <p>Ingresa y gestiona las calificaciones</p>
                </div>
              </>
            )}
            {user.tipo === 'estudiante' && (
              <>
                <div className="feature-card">
                  <h3>🎓 Matrículas</h3>
                  <p>Realiza tu matrícula en los cursos</p>
                </div>
                <div className="feature-card">
                  <h3>📈 Calificaciones</h3>
                  <p>Consulta tu rendimiento académico</p>
                </div>
                <div className="feature-card">
                  <h3>📅 Asistencias</h3>
                  <p>Revisa tu registro de asistencias</p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;