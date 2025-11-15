import React, { useState, useEffect } from 'react';
import './ProfesorMaterias.css';
import { API_BASE } from '../config/api';

const ProfesorMaterias = ({ profesorId }) => {
    const [cursos, setCursos] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState('');

    useEffect(() => {
        fetchCursos();
        fetchAsignaciones();
    }, [profesorId]);

    const fetchCursos = async () => {
        try {
            const response = await fetch(`${API_BASE}/asignacion_docentes.php`);
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setCursos(data.data);
            } else {
                setCursos([]);
            }
        } catch (error) {
            console.error('Error fetching cursos:', error);
            setCursos([]);
        }
    };

    const fetchAsignaciones = async () => {
        try {
            const response = await fetch(`${API_BASE}/asignacion_docentes.php?docente_id=${profesorId}`);
            const data = await response.json();
            setAsignaciones(data.data);
        } catch (error) {
            console.error('Error fetching asignaciones:', error);
        }
    };

    const handleAsignar = async () => {
        if (!selectedCurso) {
            alert('Por favor selecciona un curso.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/asignacion_docentes.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    docente_id: profesorId,
                    curso_id: selectedCurso,
                    semestre: '2025-1',
                    anio: 2025
                })
            });

            if (response.ok) {
                alert('Curso asignado exitosamente');
                fetchAsignaciones();
                setSelectedCurso('');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error al asignar el curso');
            }
        } catch (error) {
            console.error('Error asignando curso:', error);
            alert('Error de conexión');
        }
    };

    return (
        <div className="profesor-materias">
            <h1>Materias Asignadas</h1>
            <ul>
                {asignaciones && asignaciones.length > 0 ? (
                    asignaciones.map(asignacion => (
                        <li key={asignacion.id}>{asignacion.curso_nombre} (Semestre: {asignacion.semestre}, Año: {asignacion.anio})</li>
                    ))
                ) : (
                    <li>No tienes materias asignadas.</li>
                )}
            </ul>

            <h2>Asignar Nueva Materia</h2>
            <select
                value={selectedCurso}
                onChange={(e) => setSelectedCurso(e.target.value)}
            >
                <option value="">Seleccionar curso</option>
                {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                ))}
            </select>
            <button onClick={handleAsignar}>Asignar</button>
        </div>
    );
};

export default ProfesorMaterias;