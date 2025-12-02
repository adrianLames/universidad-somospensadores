import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Importar componentes
import MisCursos from './MisCursos';
import Matriculas from './Matriculas';
import Calificaciones from './Calificaciones';
import Asistencias from './Asistencias';
import MapaSalonesVisualEstudiante from './MapaSalonesVisualEstudiante';
import MapaSalonesPlano from './MapaSalonesPlano';
import Pensum from './Pensum';

const DashboardEstudiante = ({ user, onLogout }) => {
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
      title: 'Académico',
      icon: '📚',
      items: [
        { name: 'Mis Cursos', view: 'mis-cursos', desc: 'Visualiza todos tus cursos' },
        { name: 'Matrículas', view: 'matriculas', desc: 'Realiza tu matrícula' },
        { name: 'Pensum / Malla Curricular', view: 'pensum', desc: 'Consulta tu plan de estudios' }
      ]
    },
    {
      title: 'Rendimiento',
      icon: '📊',
      items: [
        { name: 'Calificaciones', view: 'calificaciones', desc: 'Consulta tu rendimiento académico' },
        { name: 'Asistencias', view: 'asistencias', desc: 'Revisa tu registro de asistencias' }
      ]
    },
    {
      title: 'Campus',
      icon: '🗺️',
      items: [
        { name: 'Mapa Visual del Campus', view: 'mapa-visual', desc: 'Explora el campus visualmente' },
        { name: 'Mapa Plano del Campus', view: 'mapa-plano', desc: 'Visualiza salones en el plano' }
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
      case 'matriculas':
        return <Matriculas user={user} />;
      case 'calificaciones':
        return <Calificaciones user={user} />;
      case 'asistencias':
        return <Asistencias user={user} />;
      case 'mapa-visual':
        return <MapaSalonesVisualEstudiante />;
      case 'mapa-plano':
        return <MapaSalonesPlano user={user} />;
      case 'pensum':
        return <Pensum user={user} />;
      default:
        return (
          <div className="welcome-section">
            <h2>Panel de Control Estudiante</h2>
            <p>Bienvenido al Sistema de Gestión Universitaria SOMOSPENSADORES</p>
            <p>Selecciona una opción del menú lateral para comenzar</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      {/* Overlay para cerrar el menú */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="close-sidebar" onClick={toggleSidebar}>✕</button>
          <h3>Panel Estudiante</h3>
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
      <div className={`dashboard-content ${sidebarOpen ? 'shifted' : ''}`}>
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

export default DashboardEstudiante;
