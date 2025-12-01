import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Importar componentes existentes
import GestionSemestre from './GestionSemestre';
import VincularProfesorMateria from './VincularProfesorMateria';
import Horarios from './Horarios';
import Salones from './Salones';
import AdminMapaSalones from './AdminMapaSalones';
import AdminMapaSalonesVisual from './AdminMapaSalonesVisual';
import Metricas from './Metricas';
import Reportes from './Reportes';

const DashboardAdmin = ({ user, onLogout }) => {
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
      title: 'Gestión de Usuarios',
      icon: '👥',
      items: [
        { name: 'Usuarios', view: 'usuarios', desc: 'Administra estudiantes, docentes y administradores' }
      ]
    },
    {
      title: 'Estructura Académica',
      icon: '🏛️',
      items: [
        { name: 'Facultades', view: 'facultades', desc: 'Crea, edita y elimina facultades académicas' },
        { name: 'Programas', view: 'programas', desc: 'Gestiona programas y planes de estudio' },
        { name: 'Cursos', view: 'cursos', desc: 'Administra la oferta académica de cursos' },
        { name: 'Prerequisitos', view: 'prerequisitos', desc: 'Gestiona las dependencias entre materias' }
      ]
    },
    {
      title: 'Gestión Semestral',
      icon: '📅',
      items: [
        { name: 'Gestión de Semestre', view: 'gestion-semestre', desc: 'Activa cursos para matrícula' },
        { name: 'Vincular Profesores', view: 'vincular-profesor-materia', desc: 'Vincula docentes con materias' },
        { name: 'Horarios', view: 'horarios', desc: 'Asigna horarios a cursos y docentes' }
      ]
    },
    {
      title: 'Infraestructura',
      icon: '🏫',
      items: [
        { name: 'Salones', view: 'salones', desc: 'Administra aulas y espacios universitarios' },
        { name: 'Mapa de Salones (Tabla)', view: 'admin-mapa-salones', desc: 'Gestiona salones en vista tabular' },
        { name: 'Mapa de Salones (Visual)', view: 'admin-mapa-salones-visual', desc: 'Gestiona salones de forma visual' }
      ]
    },
    {
      title: 'Reportes y Estadísticas',
      icon: '📊',
      items: [
        { name: 'Métricas', view: 'metricas', desc: 'Visualiza estadísticas del sistema' },
        { name: 'Reportes Académicos', view: 'reportes', desc: 'Genera reportes de asistencias, notas, matrículas' }
      ]
    }
  ];

  const handleMenuClick = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch(currentView) {
      case 'usuarios':
        return <div className="welcome-section"><h2>👥 Gestión de Usuarios</h2><p>Módulo en construcción. Usa la ruta /usuarios para acceder.</p><button className="btn-primary" onClick={() => navigate('/usuarios')}>Ir a Usuarios</button></div>;
      case 'facultades':
        return <div className="welcome-section"><h2>🏛️ Facultades</h2><p>Módulo en construcción. Usa la ruta /facultades para acceder.</p><button className="btn-primary" onClick={() => navigate('/facultades')}>Ir a Facultades</button></div>;
      case 'programas':
        return <div className="welcome-section"><h2>📚 Programas</h2><p>Módulo en construcción. Usa la ruta /programas para acceder.</p><button className="btn-primary" onClick={() => navigate('/programas')}>Ir a Programas</button></div>;
      case 'cursos':
        return <div className="welcome-section"><h2>📖 Cursos</h2><p>Módulo en construcción. Usa la ruta /cursos para acceder.</p><button className="btn-primary" onClick={() => navigate('/cursos')}>Ir a Cursos</button></div>;
      case 'prerequisitos':
        return <div className="welcome-section"><h2>🔗 Prerequisitos</h2><p>Módulo en construcción. Usa la ruta /prerequisitos para acceder.</p><button className="btn-primary" onClick={() => navigate('/prerequisitos')}>Ir a Prerequisitos</button></div>;
      case 'gestion-semestre':
        return <GestionSemestre user={user} />;
      case 'vincular-profesor-materia':
        return <VincularProfesorMateria user={user} />;
      case 'horarios':
        return <Horarios user={user} />;
      case 'salones':
        return <Salones user={user} />;
      case 'admin-mapa-salones':
        return <AdminMapaSalones user={user} />;
      case 'admin-mapa-salones-visual':
        return <AdminMapaSalonesVisual user={user} />;
      case 'metricas':
        return <Metricas user={user} />;
      case 'reportes':
        return <Reportes user={user} />;
      default:
        return (
          <div className="welcome-section">
            <h2>Panel de Control Administrador</h2>
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
          <h3>Panel Administrador</h3>
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

export default DashboardAdmin;
