import React, { useEffect, useState, useRef } from 'react';
import './Metricas.css';
import { API_BASE } from '../config/api';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
Chart.register(...registerables);

const Metricas = () => {
  const [stats, setStats] = useState({
    usuarios_activos: 0,
    usuarios_inactivos: 0,
    docentes_activos: 0,
    docentes_inactivos: 0,
    estudiantes_activos: 0,
    estudiantes_inactivos: 0,
    cursos: 0,
    salones: 0,
    horarios: 0,
    matriculas: 0
  });

  const estudiantesChartRef = useRef();
  const docentesChartRef = useRef();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usuariosRes = await fetch(`${API_BASE}/usuarios.php?all=1`);
        const usuarios = await usuariosRes.json();
        const usuarios_activos = usuarios.filter(u => u.activo === 1).length;
        const usuarios_inactivos = usuarios.filter(u => u.activo === 0).length;

        const docentesRes = await fetch(`${API_BASE}/usuarios.php?tipo=docente&all=1`);
        const docentes = await docentesRes.json();
        const docentes_activos = docentes.filter(u => u.activo === 1).length;
        const docentes_inactivos = docentes.filter(u => u.activo === 0).length;

        const estudiantesRes = await fetch(`${API_BASE}/usuarios.php?tipo=estudiante&all=1`);
        const estudiantes = await estudiantesRes.json();
        const estudiantes_activos = estudiantes.filter(u => u.activo === 1).length;
        const estudiantes_inactivos = estudiantes.filter(u => u.activo === 0).length;

        const [cursosRes, salonesRes, horariosRes, matriculasRes] = await Promise.all([
          fetch(`${API_BASE}/cursos.php`),
          fetch(`${API_BASE}/salones.php`),
          fetch(`${API_BASE}/horarios.php`),
          fetch(`${API_BASE}/matriculas.php`)
        ]);
        const cursos = await cursosRes.json();
        const salones = await salonesRes.json();
        const horarios = await horariosRes.json();
        const matriculas = await matriculasRes.json();
        setStats({
          usuarios_activos,
          usuarios_inactivos,
          docentes_activos,
          docentes_inactivos,
          estudiantes_activos,
          estudiantes_inactivos,
          cursos: Array.isArray(cursos) ? cursos.length : 0,
          salones: Array.isArray(salones) ? salones.length : 0,
          horarios: Array.isArray(horarios) ? horarios.length : 0,
          matriculas: Array.isArray(matriculas) ? matriculas.length : 0
        });
      } catch (error) {
        setStats({
          usuarios_activos: 0,
          usuarios_inactivos: 0,
          docentes_activos: 0,
          docentes_inactivos: 0,
          estudiantes_activos: 0,
          estudiantes_inactivos: 0,
          cursos: 0,
          salones: 0,
          horarios: 0,
          matriculas: 0
        });
      }
    };
    fetchStats();
  }, []);

  const estudiantesData = {
    labels: ['Activos', 'Inactivos'],
    datasets: [
      {
        label: 'Estudiantes',
        data: [stats.estudiantes_activos, stats.estudiantes_inactivos],
        backgroundColor: ['#1976d2', '#bdbdbd'],
      },
    ],
  };
  const docentesData = {
    labels: ['Activos', 'Inactivos'],
    datasets: [
      {
        label: 'Docentes',
        data: [stats.docentes_activos, stats.docentes_inactivos],
        backgroundColor: ['#bdb76b', '#bdbdbd'],
      },
    ],
  };

  const exportToExcel = async () => {
    const wsData = [
      ['Entidad', 'Activos', 'Inactivos', 'Total'],
      ['Estudiantes', stats.estudiantes_activos, stats.estudiantes_inactivos, stats.estudiantes_activos + stats.estudiantes_inactivos],
      ['Docentes', stats.docentes_activos, stats.docentes_inactivos, stats.docentes_activos + stats.docentes_inactivos],
      ['Cursos', stats.cursos, '', stats.cursos],
      ['Salones', stats.salones, '', stats.salones],
      ['Horarios', stats.horarios, '', stats.horarios],
      ['Matrículas', stats.matriculas, '', stats.matriculas],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Métricas');

    const charts = [];
    if (estudiantesChartRef.current) {
      const url = estudiantesChartRef.current.toBase64Image();
      charts.push({name: 'Estudiantes', url});
    }
    if (docentesChartRef.current) {
      const url = docentesChartRef.current.toBase64Image();
      charts.push({name: 'Docentes', url});
    }
    if (charts.length > 0) {
      const wsImg = XLSX.utils.aoa_to_sheet([
        ['Gráfica', 'Imagen (base64)'],
        ...charts.map(c => [c.name, c.url]),
      ]);
      XLSX.utils.book_append_sheet(wb, wsImg, 'Gráficas');
    }
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'metricas_universidad.xlsx');
  };

  return (
    <div className="panel-metricas">
      <div className="metricas-barra-top">
        <div className="metricas-titulo">Métricas del Sistema</div>
        <div className="metricas-barra-botones">
          <a href="/" className="btn-inicio-metricas">
            <span className="btn-inicio-icon">←</span> <span className="btn-inicio-text">Inicio</span>
          </a>
          <button className="btn-excel-metricas" onClick={exportToExcel}>Exportar Excel</button>
        </div>
      </div>
      <div className="metricas-cards-grid">
        <div className="metricas-card estudiantes">
          <div className="metricas-card-icon">🎓</div>
          <div className="metricas-card-titulo">Estudiantes</div>
          <div className="metricas-card-valor">{stats.estudiantes_activos} <span className="metricas-card-label">Activos</span></div>
          <div className="metricas-card-bar">
            <div className="metricas-bar-activos" style={{width: `${stats.estudiantes_activos + stats.estudiantes_inactivos > 0 ? (stats.estudiantes_activos/(stats.estudiantes_activos+stats.estudiantes_inactivos))*100 : 0}%`}}></div>
          </div>
          <div className="metricas-card-label2">{stats.estudiantes_inactivos} inactivos</div>
        </div>
        <div className="metricas-card docentes">
          <div className="metricas-card-icon">🧑‍🏫</div>
          <div className="metricas-card-titulo">Docentes</div>
          <div className="metricas-card-valor">{stats.docentes_activos} <span className="metricas-card-label">Activos</span></div>
          <div className="metricas-card-bar" style={{background:'#fff'}}>
            <div className="metricas-bar-docentes" style={{width: `${stats.docentes_activos + stats.docentes_inactivos > 0 ? (stats.docentes_activos/(stats.docentes_activos+stats.docentes_inactivos))*100 : 0}%`}}></div>
          </div>
          <div className="metricas-card-label2">{stats.docentes_inactivos} inactivo</div>
        </div>
        <div className="metricas-card cursos">
          <div className="metricas-card-icon">📖</div>
          <div className="metricas-card-titulo">Cursos</div>
          <div className="metricas-card-valor">{stats.cursos} <span className="metricas-card-label">Totales</span></div>
          <div className="metricas-card-label2">Disponibles</div>
        </div>
        <div className="metricas-card salones">
          <div className="metricas-card-icon">🏫</div>
          <div className="metricas-card-titulo">Salones</div>
          <div className="metricas-card-valor">{stats.salones} <span className="metricas-card-label">Totales</span></div>
          <div className="metricas-card-label2">En uso</div>
        </div>
        <div className="metricas-card horarios">
          <div className="metricas-card-icon">🕐</div>
          <div className="metricas-card-titulo">Horarios</div>
          <div className="metricas-card-valor">{stats.horarios} <span className="metricas-card-label">Totales</span></div>
          <div className="metricas-card-label2">Configurados</div>
        </div>
        <div className="metricas-card matriculas">
          <div className="metricas-card-icon">🎓</div>
          <div className="metricas-card-titulo">Matrículas</div>
          <div className="metricas-card-valor">{stats.matriculas} <span className="metricas-card-label">Este período</span></div>
          <div className="metricas-card-label2">Pendientes</div>
        </div>
      </div>
      <div className="metricas-resumen-actividad">
        <div className="metricas-resumen-titulo">Resumen de Actividad</div>
        <div className="metricas-resumen-sub">Estado general del sistema educativo</div>
        <div className="metricas-resumen-cards">
          <div className="metricas-resumen-card green">
            <span className="dot green"></span> Total Activos
            <span className="metricas-resumen-value">{stats.usuarios_activos + stats.docentes_activos + stats.estudiantes_activos}</span>
          </div>
          <div className="metricas-resumen-card red">
            <span className="dot red"></span> Total Inactivos
            <span className="metricas-resumen-value">{stats.usuarios_inactivos + stats.docentes_inactivos + stats.estudiantes_inactivos}</span>
          </div>
          <div className="metricas-resumen-card blue">
            Recursos Totales
            <span className="metricas-resumen-value">{stats.cursos + stats.salones + stats.horarios}</span>
          </div>
          <div className="metricas-resumen-card orange">
            Utilización
            <span className="metricas-resumen-value">{stats.cursos + stats.salones + stats.horarios > 0 ? Math.round(((stats.usuarios_activos + stats.docentes_activos + stats.estudiantes_activos) / (stats.cursos + stats.salones + stats.horarios)) * 100) : 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metricas;
