import React, { useState, useEffect } from 'react';
import './AsignacionProfesores.css';

const AsignacionProfesores = () => {
    const [profesores, setProfesores] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [formData, setFormData] = useState({
        docente_id: '',
        curso_id: '',
        semestre: '',
        anio: new Date().getFullYear()
    });

    useEffect(() => {
        fetchProfesores();
        fetchCursos();
        fetchAsignaciones();
    }, []);

    const fetchProfesores = async () => {
        try {
            const response = await fetch('/api/usuarios.php?tipo=docente');
            const data = await response.json();
            setProfesores(data);
        } catch (error) {
            console.error('Error fetching profesores:', error);
        }
    };

    const fetchCursos = async () => {
        try {
            const response = await fetch('/api/cursos.php');
            const data = await response.json();
            setCursos(data);
        } catch (error) {
            console.error('Error fetching cursos:', error);
        }
    };

    const fetchAsignaciones = async () => {
        try {
            const response = await fetch('/api/asignacion_docentes.php');
            const data = await response.json();
            setAsignaciones(data);
        } catch (error) {
            console.error('Error fetching asignaciones:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/asignacion_docentes.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Asignación creada exitosamente');
                fetchAsignaciones();
                setFormData({
                    docente_id: '',
                    curso_id: '',
                    semestre: '',
                    anio: new Date().getFullYear()
                });
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error al crear la asignación');
            }
        } catch (error) {
            console.error('Error creating asignacion:', error);
            alert('Error de conexión');
        }
    };

    const actualizarPrerequisito = async () => {
        try {
            const response = await fetch('http://localhost/universidad-somospensadores/api/cursos.php', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    curso_id: 'ID_DE_CALCU',
                    prerequisito_id: 'ID_DE_MATBAS'
                })
            });

            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error updating prerequisito:', error);
        }
    };

    const duplicarAsignaciones = async () => {
        try {
            const response = await fetch('/api/asignacion_docentes.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `
                        INSERT INTO asignacion_docentes (docente_id, curso_id, semestre, anio)
                        SELECT docente_id, curso_id, '2025-2', 2025
                        FROM asignacion_docentes
                        WHERE semestre = '2025-1' AND anio = 2025;
                    `
                })
            });

            if (response.ok) {
                alert('Asignaciones duplicadas exitosamente');
                fetchAsignaciones();
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error al duplicar las asignaciones');
            }
        } catch (error) {
            console.error('Error duplicating asignaciones:', error);
            alert('Error de conexión');
        }
    };

    return (
        <div className="asignacion-profesores">
            <h1>Asignación de Profesores</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Profesor:</label>
                    <select
                        value={formData.docente_id}
                        onChange={(e) => setFormData({ ...formData, docente_id: e.target.value })}
                        required
                    >
                        <option value="">Seleccionar profesor</option>
                        {profesores.map(profesor => (
                            <option key={profesor.id} value={profesor.id}>
                                {profesor.nombres} {profesor.apellidos}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Curso:</label>
                    <select
                        value={formData.curso_id}
                        onChange={(e) => setFormData({ ...formData, curso_id: e.target.value })}
                        required
                    >
                        <option value="">Seleccionar curso</option>
                        {cursos.map(curso => (
                            <option key={curso.id} value={curso.id}>
                                {curso.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Semestre:</label>
                    <input
                        type="text"
                        value={formData.semestre}
                        onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Año:</label>
                    <input
                        type="number"
                        value={formData.anio}
                        onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                        required
                        min="2020"
                        max="2030"
                    />
                </div>
                <button type="submit">Asignar</button>
            </form>

            <h2>Asignaciones Existentes</h2>
            <ul>
                {asignaciones.map(asignacion => (
                    <li key={asignacion.id}>
                        Profesor: {asignacion.docente_nombre} - Curso: {asignacion.curso_nombre} - Semestre: {asignacion.semestre} - Año: {asignacion.anio}
                    </li>
                ))}
            </ul>

            <button onClick={duplicarAsignaciones}>Duplicar Asignaciones</button>
        </div>
    );
};

export default AsignacionProfesores;

