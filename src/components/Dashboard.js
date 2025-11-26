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



      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Panel de Control Principal</h2>
          <p>Bienvenido al Sistema de Gestión Universitaria SOMOSPENSADORES</p>
          <p>Selecciona una opción del menú superior para comenzar</p>
          
          <div className="feature-cards">
            {user.tipo === 'admin' && (
              <>
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
              </>
            )}
            {user.tipo === 'docente' && (
              <>
                <Link to="/asistencias" className="feature-card">
                  <h3>✅ Asistencias</h3>
                  <p>Registra y controla la asistencia de estudiantes</p>
                </Link>
                <Link to="/calificaciones" className="feature-card">
                  <h3>📊 Calificaciones</h3>
                  <p>Ingresa y gestiona las calificaciones</p>
                </Link>
                <Link to="/asignacion-profesores" className="feature-card">
                  <h3>📘 Asignación de Profesores</h3>
                  <p>Consulta y gestiona los cursos asignados</p>
                </Link>
              </>
            )}
            {user.tipo === 'estudiante' && (
              <>
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;