

import React, { useState } from 'react';
import { API_BASE } from '../config/api';
import { useNavigate } from 'react-router-dom';

const RegistroPublico = () => {
  const [form, setForm] = useState({
    identificacion: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    try {
      const urlencoded = new URLSearchParams();
      urlencoded.append('identificacion', form.identificacion);
      urlencoded.append('nombres', form.nombres);
      urlencoded.append('apellidos', form.apellidos);
      urlencoded.append('email', form.email);
      urlencoded.append('telefono', form.telefono);
      urlencoded.append('password', form.password);
      urlencoded.append('tipo', 'publico');
      const res = await fetch(`${API_BASE}/pendientes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlencoded.toString()
      });
      let data = null;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        try { data = await res.json(); } catch (err) { console.error('JSON parse error', err); }
      } else {
        const txt = await res.text();
        data = { error: txt };
      }
      if (res.ok) {
        setSuccess(true);
        setForm({ identificacion: '', nombres: '', apellidos: '', email: '', telefono: '', password: '', confirmPassword: '' });
      } else {
        setError(data && data.error ? data.error : 'Error al enviar registro público');
      }
    } catch (err) {
      setError('Error de conexión. Ver consola para más detalles.');
      console.error('Connection error sending registro publico', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="modal-content" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center', color: '#12518c' }}>Registro Público</h2>
      {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>¡Registro exitoso! Espera la activación por el administrador.</div>}
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
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
          <label>Contraseña:</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Confirmar Contraseña:</label>
          <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
        </div>
        <div className="form-actions" style={{ justifyContent: 'center', gap: 8, display: 'flex' }}>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleBackToLogin} disabled={loading}>
            Volver al Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroPublico;
