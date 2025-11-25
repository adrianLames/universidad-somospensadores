

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
    <div className="modal-content" style={{ maxWidth: 400, margin: '2rem auto', background: '#1a1a1a', border: '1px solid #3a3a3a' }}>
      <h2 style={{ textAlign: 'center', color: '#d4af37', marginBottom: '1rem' }}>Registro Público</h2>
      {success && <div style={{ color: '#2ecc71', textAlign: 'center', marginBottom: '1rem', background: 'rgba(46, 204, 113, 0.1)', padding: '0.75rem', borderRadius: '6px' }}>¡Registro exitoso! Espera la activación por el administrador.</div>}
      {error && <div style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '1rem', background: 'rgba(255, 107, 107, 0.1)', padding: '0.75rem', borderRadius: '6px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label style={{ color: '#d4af37' }}>Identificación:</label>
          <input name="identificacion" value={form.identificacion} onChange={handleChange} required style={{ background: '#0f0f0f', color: '#ffffff', border: '1px solid #3a3a3a' }} />
        </div>
        <div className="form-group">
          <label style={{ color: '#d4af37' }}>Nombres:</label>
          <input name="nombres" value={form.nombres} onChange={handleChange} required style={{ background: '#0f0f0f', color: '#ffffff', border: '1px solid #3a3a3a' }} />
        </div>
        <div className="form-group">
          <label style={{ color: '#d4af37' }}>Apellidos:</label>
          <input name="apellidos" value={form.apellidos} onChange={handleChange} required style={{ background: '#0f0f0f', color: '#ffffff', border: '1px solid #3a3a3a' }} />
        </div>
        <div className="form-group">
          <label style={{ color: '#d4af37' }}>Email:</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ background: '#0f0f0f', color: '#ffffff', border: '1px solid #3a3a3a' }} />
        </div>
        <div className="form-group">
          <label style={{ color: '#d4af37' }}>Teléfono:</label>
          <input name="telefono" value={form.telefono} onChange={handleChange} style={{ background: '#0f0f0f', color: '#ffffff', border: '1px solid #3a3a3a' }} />
        </div>
        <div className="form-group">
          <label style={{ color: '#d4af37' }}>Contraseña:</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required style={{ background: '#0f0f0f', color: '#ffffff', border: '1px solid #3a3a3a' }} />
        </div>
        <div className="form-group">
          <label style={{ color: '#d4af37' }}>Confirmar Contraseña:</label>
          <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required style={{ background: '#0f0f0f', color: '#ffffff', border: '1px solid #3a3a3a' }} />
        </div>
        <div className="form-actions" style={{ justifyContent: 'center', gap: 8, display: 'flex' }}>
          <button type="submit" className="btn-save" disabled={loading} style={{ background: 'linear-gradient(135deg, #d4af37, #f0d070)', color: '#1a1a1a', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleBackToLogin} disabled={loading} style={{ background: '#2a2a2a', color: '#d4af37', border: '2px solid #d4af37', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Volver al Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroPublico;
