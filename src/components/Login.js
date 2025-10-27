import React, { useState } from 'react';
import { API_BASE } from '../config/api';
import './Login.css';
import RegistroPublico from './RegistroPublico';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };
  // Integración con el componente de registro público

  const [showRegister, setShowRegister] = useState(false);
  if (showRegister) {
  return <RegistroPublico onSwitchToLogin={() => setShowRegister(false)} />;
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Universidad SOMOSPENSADORES</h1>
        <h2>Sistema de Gestión Universitaria</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando Sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>
        <div className="demo-credentials">
          <p><strong>Credenciales de prueba:</strong></p>
          <p>Email: admin@universidad.edu</p>
          <p>Contraseña: admin123</p>
        </div>




// Y en tu formulario de login, agrega:
<div className="register-link">
  <p>¿No tienes cuenta? <button onClick={() => setShowRegister(true)}>Regístrate aquí</button></p>
</div>
      </div>
    </div>
  );
};

export default Login;