import React, { useState } from 'react';
import { API_BASE } from '../config/api';
import './GestionUsuarios.css';

const RegistroPublico = ({ onSuccess }) => {
  const [form, setForm] = useState({
    identificacion: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    direccion: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const url = `${API_BASE}/usuarios.php`;
      const payload = { ...form, tipo: 'estudiante' };
      
      console.log('Intentando conectar a:', url);
      console.log('Datos a enviar:', payload);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('Respuesta recibida:', res.status, res.statusText);
      
      const responseText = await res.text();
      console.log('Texto de respuesta:', responseText);
      
      if (!res.ok) {
        console.error('Error del servidor:', responseText);
        setError(`Error ${res.status}: ${res.statusText}`);
        return;
      }
      
      const data = JSON.parse(responseText);
      console.log('Datos recibidos:', data);
      
      setSuccess(true);
      setForm({
        identificacion: '', nombres: '', apellidos: '', email: '', telefono: '', fecha_nacimiento: '', direccion: '', password: ''
      });
    } catch (err) {
      console.error('Error completo:', err);
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-content" style={{ maxWidth: 400, margin: '2rem auto' }}>
        <h2 style={{ textAlign: 'center', color: '#12518c' }}>¡Registro Exitoso!</h2>
        <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem', padding: '1rem', background: '#d4edda', borderRadius: '5px' }}>
          Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión con tus credenciales.
        </div>
        <div className="form-actions" style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={onSuccess} style={{ padding: '0.75rem 2rem', background: '#12518c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}>
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-content" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center', color: '#12518c' }}>Registro de Usuario</h2>
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', padding: '1rem', background: '#f8d7da', borderRadius: '5px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Identificación:</label>
          <input name="identificacion" value={form.identificacion} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Nombres:</label>
          <input name="nombres" value={form.nombres} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Apellidos:</label>
          <input name="apellidos" value={form.apellidos} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Teléfono:</label>
          <input name="telefono" value={form.telefono} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Fecha de Nacimiento:</label>
          <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Dirección:</label>
          <textarea name="direccion" value={form.direccion} onChange={handleChange} rows="2" />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button type="button" onClick={onSuccess} style={{ padding: '0.5rem 1rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Volver al Login
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroPublico;
