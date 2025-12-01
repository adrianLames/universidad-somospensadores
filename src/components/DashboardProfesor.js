import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Importar componentes
import MisCursos from './MisCursos';
import Asistencias from './Asistencias';
import Calificaciones from './Calificaciones';
import EstudiantesPorCurso from './EstudiantesPorCurso';
import AsignacionProfesores from './AsignacionProfesores';

const DashboardProfesor = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [currentView, setCurrentView] = useState('home');

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuSections = [
    {
      title: 'Mis Cursos',
      icon: '📚',
      items: [
        { name: 'Cursos Asignados', view: 'mis-cursos', desc: 'Visualiza todos los cursos que impartes' },
        { name: 'Estudiantes por Materia', view: 'estudiantes-por-curso', desc: 'Visualiza estudiantes matriculados' },
        { name: 'Asignación de Profesores', view: 'asignacion-profesores', desc: 'Consulta y gestiona cursos asignados' }
      ]
    },
    {
      title: 'Evaluación',
      icon: '📝',
      items: [
        { name: 'Asistencias', view: 'asistencias', desc: 'Registra y controla la asistencia' },
        { name: 'Calificaciones', view: 'calificaciones', desc: 'Ingresa y gestiona las calificaciones' }
      ]
    }
  ];

  const handleMenuClick = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch(currentView) {
      case 'mis-cursos':
        return <MisCursos user={user} />;
      case 'asistencias':
        return <Asistencias user={user} />;
      case 'calificaciones':
        return <Calificaciones user={user} />;
      case 'estudiantes-por-curso':
        return <EstudiantesPorCurso user={user} />;
      case 'asignacion-profesores':
        return <AsignacionProfesores user={user} />;
      default:
        return (
          <div className="welcome-section">
            <h2>Panel de Control Profesor</h2>
            <p>Bienvenido al Sistema de Gestión Universitaria SOMOSPENSADORES</p>
            <p>Selecciona una opción del menú lateral para comenzar</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      {/* Overlay para cerrar el menú en móvil */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <button className="close-sidebar" onClick={toggleSidebar}>✕</button>
          <h3>Panel Profesor</h3>
        </div>
        <nav className="sidebar-nav">
          {menuSections.map((section, idx) => (
            <div key={idx} className="sidebar-section">
              <button 
                className="sidebar-section-title"
                onClick={() => toggleSection(idx)}
              >
                <span>{section.icon} {section.title}</span>
                <span className={`arrow ${expandedSections[idx] ? 'arrow-down' : ''}`}>›</span>
              </button>
              <div className={`sidebar-section-content ${expandedSections[idx] ? 'expanded' : ''}`}>
                {section.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx} 
                    className="sidebar-link"
                    onClick={() => handleMenuClick(item.view)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              ☰
            </button>
            <h1>🏫 Universidad SOMOSPENSADORES</h1>
          </div>
          <div className="user-info">
            <span>{getWelcomeMessage()} {user.nombres}</span>
            <span className={`user-role ${user.tipo}`}>{user.tipo.toUpperCase()}</span>
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </header>
        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardProfesor;
