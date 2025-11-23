
import React, { useState, useEffect } from 'react';
import { API_BASE, getFacultades, getProgramasByFacultad } from '../config/api';
import { useNavigate } from 'react-router-dom';

const RegistroPublico = (props) => {
  const { onSuccess, onSwitchToLogin } = props;
  const [form, setForm] = useState({
    tipo: 'estudiante',
    identificacion: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    direccion: '',
    facultad: '',
    programa_id: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [facultades, setFacultades] = useState([]);
  const [programasFiltrados, setProgramasFiltrados] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
  };

  useEffect(() => {
    (async () => {
      try {
        const f = await getFacultades();
        setFacultades(Array.isArray(f) ? f : []);
      } catch (err) {
        console.error('Error cargando facultades', err);
      }
    })();
  }, []);

  const handleFacultadChange = async (e) => {
    const facultad = e.target.value;
    setForm(prev => ({ ...prev, facultad, programa_id: '' }));
    if (!facultad) {
      setProgramasFiltrados([]);
      return;
    }
    try {
      const progs = await getProgramasByFacultad(facultad);
      setProgramasFiltrados(Array.isArray(progs) ? progs : []);
    } catch (err) {
      console.error('Error cargando programas por facultad', err);
      setProgramasFiltrados([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // Enviar como form urlencoded para evitar preflight CORS (Content-Type simple)
      const urlencoded = new URLSearchParams();
      Object.keys(form).forEach(k => {
        if (form[k] !== undefined && form[k] !== null) urlencoded.append(k, form[k]);
      });
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
        // server returned non-json (php error or plain text)
        const txt = await res.text();
        console.warn('Server response (non-json):', txt);
        data = { error: txt };
      }

      if (res.ok) {
        setSuccess(true);
        setForm({
          tipo: 'estudiante', identificacion: '', nombres: '', apellidos: '', email: '', telefono: '', fecha_nacimiento: '', direccion: '', facultad: '', programa_id: '', password: ''
        });
        if (onSuccess) onSuccess();
        } else {
        setError(data && data.error ? data.error : 'Error al enviar registro a pendientes');
      }
    } catch (err) {
      setError('Error de conexión. Ver consola para más detalles.');
      console.error('Connection error sending registro publico', err);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const handleBackToLogin = () => {
    if (typeof onSwitchToLogin === 'function') {
      onSwitchToLogin();
    } else {
      navigate('/login');
    }
  };
  return (
    <div className="modal-content" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center', color: '#12518c' }}>Registro de Usuario</h2>
      {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>¡Registro exitoso! Espera la activación por el administrador.</div>}
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de Usuario:</label>
          <select name="tipo" value={form.tipo} onChange={handleChange}>
            <option value="estudiante">🎓 Estudiante</option>
            <option value="docente">👨‍🏫 Docente</option>
            <option value="admin">⚙️ Administrador</option>
          </select>
        </div>
        <div className="form-group">
          <label>Facultad:</label>
          <select name="facultad" value={form.facultad || ''} onChange={handleFacultadChange}>
            <option value="">Selecciona una facultad</option>
            {facultades.map(f => (
              <option key={f.id} value={f.id}>{f.nombre}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Programa:</label>
          <select name="programa_id" value={form.programa_id || ''} onChange={handleChange} disabled={!form.facultad}>
            <option value="">{form.facultad ? 'Selecciona un programa' : 'Primero selecciona una facultad'}</option>
            {programasFiltrados.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
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
