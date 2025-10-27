import React, { useState } from 'react';
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
      const res = await fetch('/api/usuarios.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tipo: 'estudiante', activo: 0 })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setForm({
          identificacion: '', nombres: '', apellidos: '', email: '', telefono: '', fecha_nacimiento: '', direccion: '', password: ''
        });
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-content" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center', color: '#12518c' }}>Registro de Usuario</h2>
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
        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroPublico;
