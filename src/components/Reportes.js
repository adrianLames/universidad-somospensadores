import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import './Reportes.css';
import BackHomeButton from './BackHomeButton';

const Reportes = ({ user }) => {
  const [tipoReporte, setTipoReporte] = useState('');
  const [programas, setProgramas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [programaSeleccionado, setProgramaSeleccionado] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [jornada, setJornada] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [generando, setGenerando] = useState(false);
  const [datosReporte, setDatosReporte] = useState([]);

  useEffect(() => {
    fetchProgramas();
    fetchCursos();
  }, []);

  const fetchProgramas = async () => {
    try {
      const response = await fetch(`${API_BASE}/programas.php`);
      const data = await response.json();
      const programasData = data.success ? data.data : (Array.isArray(data) ? data : []);
      setProgramas(programasData);
    } catch (error) {
      console.error('Error fetching programas:', error);
      setProgramas([]);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await fetch(`${API_BASE}/cursos.php`);
      const result = await response.json();
      const data = result.success ? result.data : (Array.isArray(result) ? result : []);
      setCursos(data);
    } catch (error) {
      console.error('Error fetching cursos:', error);
      setCursos([]);
    }
  };

  const generarReporte = async () => {
    if (!tipoReporte) {
      alert('Por favor seleccione un tipo de reporte');
      return;
    }

    setGenerando(true);
    try {
      let endpoint = '';
      let params = new URLSearchParams();

      switch (tipoReporte) {
        case 'asistencias':
          endpoint = `${API_BASE}/asistencias.php`;
          if (cursoSeleccionado) params.append('curso_id', cursoSeleccionado);
          if (fechaInicio) params.append('fecha_inicio', fechaInicio);
          if (fechaFin) params.append('fecha_fin', fechaFin);
          break;
        case 'calificaciones':
          endpoint = `${API_BASE}/calificaciones.php`;
          if (cursoSeleccionado) params.append('curso_id', cursoSeleccionado);
          if (programaSeleccionado) params.append('programa_id', programaSeleccionado);
          break;
        case 'matriculas':
          endpoint = `${API_BASE}/matriculas.php`;
          if (programaSeleccionado) params.append('programa_id', programaSeleccionado);
          if (jornada) params.append('jornada', jornada);
          break;
        case 'estudiantes':
          endpoint = `${API_BASE}/estudiantes.php`;
          if (programaSeleccionado) params.append('programa_id', programaSeleccionado);
          break;
        case 'cursos':
          endpoint = `${API_BASE}/cursos.php`;
          if (programaSeleccionado) params.append('programa_id', programaSeleccionado);
          if (jornada) params.append('jornada', jornada);
          break;
        default:
          alert('Tipo de reporte no válido');
          setGenerando(false);
          return;
      }

      const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
      const response = await fetch(url);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Verificar el tipo de contenido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        throw new Error('La respuesta del servidor no es JSON válido');
      }
      
      const result = await response.json();
      
      // Manejar formato de respuesta {success: true, data: [...]} o array directo
      const data = result.success ? result.data : (Array.isArray(result) ? result : []);
      setDatosReporte(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte: ' + error.message);
      setDatosReporte([]);
    } finally {
      setGenerando(false);
    }
  };

  const exportarCSV = () => {
    if (!datosReporte || datosReporte.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = Object.keys(datosReporte[0]);
    const csvContent = [
      headers.join(','),
      ...datosReporte.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    if (!datosReporte || datosReporte.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Agregar clase especial para impresión
    document.body.classList.add('printing');
    
    // Esperar un momento para que se apliquen los estilos
    setTimeout(() => {
      window.print();
      // Remover la clase después de imprimir
      setTimeout(() => {
        document.body.classList.remove('printing');
      }, 100);
    }, 100);
  };

  const limpiarFiltros = () => {
    setTipoReporte('');
    setProgramaSeleccionado('');
    setCursoSeleccionado('');
    setJornada('');
    setFechaInicio('');
    setFechaFin('');
    setDatosReporte(null);
  };

  const renderTablaReporte = () => {
    if (!datosReporte || datosReporte.length === 0) {
      return <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No hay datos para mostrar</p>;
    }

    // Validar que el primer elemento exista y sea un objeto
    if (!datosReporte[0] || typeof datosReporte[0] !== 'object') {
      return <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No hay datos válidos para mostrar</p>;
    }

    const headers = Object.keys(datosReporte[0]);

    return (
      <div className="tabla-reporte-container">
        <div className="reporte-header no-print">
          <h3>Reporte de {tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}</h3>
          <div className="export-buttons">
            <button onClick={exportarCSV} className="btn-export">
              📊 Exportar CSV
            </button>
            <button onClick={exportarPDF} className="btn-export">
              📄 Exportar PDF
            </button>
          </div>
        </div>
        <div className="print-header" style={{ display: 'none' }}>
          <h2 style={{ margin: 0, padding: '10px 0', borderBottom: '2px solid #333' }}>
            Reporte de {tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}
          </h2>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            Generado el: {new Date().toLocaleString('es-ES')}
          </p>
        </div>
        <div className="tabla-scroll">
          <table className="tabla-reporte">
            <thead>
              <tr>
                {headers.map(header => (
                  <th key={header}>{header.replace(/_/g, ' ').toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datosReporte.map((row, index) => (
                <tr key={index}>
                  {headers.map(header => (
                    <td key={header}>{row[header] || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="reporte-footer">
          <p><strong>Total de registros:</strong> {datosReporte.length}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="reportes-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span style={{ background: '#1a3c7b', color: '#fff', borderRadius: '50%', padding: '0.5rem', fontSize: '1.5rem' }}>
            📊
          </span>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Reportes Académicos</h2>
        </div>
        <BackHomeButton className="small-btn right" label="Inicio" />
      </div>

      <div className="filtros-panel">
        <div className="filtros-grid">
          <div className="form-group">
            <label>Tipo de Reporte:</label>
            <select 
              value={tipoReporte} 
              onChange={e => setTipoReporte(e.target.value)}
              className="select-reporte"
            >
              <option value="">Seleccione un reporte</option>
              <option value="asistencias">Asistencias</option>
              <option value="calificaciones">Calificaciones</option>
              <option value="matriculas">Matrículas</option>
              <option value="estudiantes">Estudiantes</option>
              <option value="cursos">Cursos</option>
            </select>
          </div>

          {(tipoReporte === 'calificaciones' || tipoReporte === 'matriculas' || tipoReporte === 'estudiantes' || tipoReporte === 'cursos') && (
            <div className="form-group">
              <label>Programa:</label>
              <select 
                value={programaSeleccionado} 
                onChange={e => setProgramaSeleccionado(e.target.value)}
              >
                <option value="">Todos los programas</option>
                {programas.map(programa => (
                  <option key={programa.id} value={programa.id}>{programa.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {(tipoReporte === 'asistencias' || tipoReporte === 'calificaciones') && (
            <div className="form-group">
              <label>Curso:</label>
              <select 
                value={cursoSeleccionado} 
                onChange={e => setCursoSeleccionado(e.target.value)}
              >
                <option value="">Todos los cursos</option>
                {cursos
                  .filter(c => !programaSeleccionado || String(c.programa_id) === String(programaSeleccionado))
                  .map(curso => (
                    <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                  ))}
              </select>
            </div>
          )}

          {(tipoReporte === 'matriculas' || tipoReporte === 'cursos') && (
            <div className="form-group">
              <label>Jornada:</label>
              <select value={jornada} onChange={e => setJornada(e.target.value)}>
                <option value="">Todas las jornadas</option>
                <option value="diurna">Diurna</option>
                <option value="nocturna">Nocturna</option>
              </select>
            </div>
          )}

          {tipoReporte === 'asistencias' && (
            <>
              <div className="form-group">
                <label>Fecha Inicio:</label>
                <input 
                  type="date" 
                  value={fechaInicio} 
                  onChange={e => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Fecha Fin:</label>
                <input 
                  type="date" 
                  value={fechaFin} 
                  onChange={e => setFechaFin(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="acciones-panel">
          <button 
            onClick={generarReporte} 
            disabled={generando || !tipoReporte}
            className="btn-generar"
          >
            {generando ? '⏳ Generando...' : '🔍 Generar Reporte'}
          </button>
          <button onClick={limpiarFiltros} className="btn-limpiar">
            🔄 Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="reporte-resultado">
        {renderTablaReporte()}
      </div>
    </div>
  );
};

export default Reportes;
