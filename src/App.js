import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GestionCursos from './components/GestionCursos';
import NuevaGestionUsuarios from './components/NuevaGestionUsuarios';
import GestionProgramas from './components/GestionProgramas';
import GestionFacultades from './components/GestionFacultades';
import Matriculas from './components/Matriculas';
import Asistencias from './components/Asistencias';
import Calificaciones from './components/Calificaciones';
import Horarios from './components/Horarios';
import ProfesorMaterias from './components/ProfesorMaterias';
import Pensum from './components/Pensum';
import VincularProfesorMateria from './components/VincularProfesorMateria';
import Salones from './components/Salones';
import Metricas from './components/Metricas';
import MapaSalonesLeaflet from './components/MapaSalonesLeaflet';
import AdminMapaSalones from './components/AdminMapaSalones';
import AdminMapaSalonesVisual from './components/AdminMapaSalonesVisual';

import EditarUsuarios from './components/EditarUsuarios';
import { API_BASE } from './config/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Inicializar base de datos al cargar la aplicación
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const response = await fetch(`${API_BASE}/init.php`);
      const result = await response.json();
      console.log(result.message);
      setDbInitialized(true);
      
      // Verificar si hay un usuario logueado
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Inicializando sistema...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
            <Route path="/cursos" element={<GestionCursos user={user} />} />
            <Route path="/usuarios" element={<NuevaGestionUsuarios user={user} />} />
            <Route path="/facultades" element={<GestionFacultades />} />
            <Route path="/programas" element={<GestionProgramas user={user} />} />
            <Route path="/matriculas" element={<Matriculas user={user} />} />
            <Route path="/asistencias" element={<Asistencias user={user} />} />
            <Route path="/calificaciones" element={<Calificaciones user={user} />} />
            <Route path="/horarios" element={<Horarios user={user} />} />
            <Route path="/asignacion-profesores" element={<ProfesorMaterias profesorId={user.id} />} />
            <Route path="/vincular-profesor-materia" element={<VincularProfesorMateria />} />
            <Route path="/pensum" element={<Pensum user={user} />} />
            <Route path="/editar-usuarios" element={<EditarUsuarios />} />
            <Route path="/salones" element={<Salones />} />
            <Route path="/admin-mapa-salones" element={<AdminMapaSalones user={user} />} />
            <Route path="/admin-mapa-salones-visual" element={<AdminMapaSalonesVisual user={user} />} />
            <Route path="/mapa-salones" element={<MapaSalonesLeaflet />} />
            <Route path="/metricas" element={<Metricas />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;