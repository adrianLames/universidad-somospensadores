import React, { useState, useEffect } from 'react';
import './ProfesorMaterias.css';
import BackHomeButton from './BackHomeButton';
import { API_BASE } from '../config/api';

const ProfesorMaterias = ({ profesorId }) => {
    const [cursos, setCursos] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState('');
    const [editingAsignacion, setEditingAsignacion] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, curso_nombre: '' });
    const [docentes, setDocentes] = useState([]);
    const [selectedProfesor, setSelectedProfesor] = useState(profesorId || '');

    useEffect(() => {
        fetchCursos();
        fetchDocentes();
    }, []);

    useEffect(() => {
        if (selectedProfesor) fetchAsignaciones();
        else setAsignaciones([]);
    }, [selectedProfesor]);

    const fetchCursos = async () => {
        try {
            const response = await fetch(`${API_BASE}/cursos.php`);
            const data = await response.json();
            setCursos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching cursos:', error);
            setCursos([]);
        }
    };

    const fetchDocentes = async () => {
        try {
            const res = await fetch(`${API_BASE}/usuarios.php?tipo=docente`);
            const d = await res.json();
            // backend puede devolver {success: true, data: [...]}
            setDocentes(Array.isArray(d) ? d : (d.data || []));
        } catch (err) {
            console.error('Error fetching docentes:', err);
            setDocentes([]);
        }
    };

    const fetchAsignaciones = async () => {
        try {
            const id = selectedProfesor || profesorId;
            // Usar usuario_id en vez de docente_id
            const response = await fetch(`${API_BASE}/asignacion_docentes.php?usuario_id=${id}`);
            const data = await response.json();
            const lista = Array.isArray(data) ? data : (data.data || []);
            setAsignaciones(lista);
        } catch (error) {
            console.error('Error fetching asignaciones:', error);
            setAsignaciones([]);
        }
    };

    const handleAsignar = async () => {
        if (!selectedCurso) {
            alert('Por favor selecciona un curso.');
            return;
        }

        try {
            const usuarioParaAsignar = selectedProfesor || profesorId;
            const response = await fetch(`${API_BASE}/asignacion_docentes.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuario_id: usuarioParaAsignar,
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

    const startEdit = (asig) => {
        setEditingAsignacion({...asig});
    };

    const saveEdit = async () => {
        if (!editingAsignacion) return;
        try {
            const res = await fetch(`${API_BASE}/asignacion_docentes.php?id=${editingAsignacion.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ curso_id: editingAsignacion.curso_id, semestre: editingAsignacion.semestre, anio: editingAsignacion.anio })
            });
            if (res.ok) {
                alert('Asignación actualizada');
                fetchAsignaciones();
                setEditingAsignacion(null);
            } else {
                const j = await res.json();
                alert(j.message || 'Error actualizando');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        }
    };

    const openConfirmDelete = (asig) => {
        setConfirmDelete({ open: true, id: asig.id, curso_nombre: asig.curso_nombre });
    };

    const closeConfirm = () => setConfirmDelete({ open: false, id: null, curso_nombre: '' });

    const confirmDeleteAsignacion = async () => {
        if (!confirmDelete.id) return closeConfirm();
        try {
            const res = await fetch(`${API_BASE}/asignacion_docentes.php?id=${confirmDelete.id}`, { method: 'DELETE' });
            const json = await res.json();
            if (res.ok) {
                alert('Asignación eliminada');
                fetchAsignaciones();
            } else {
                alert(json.message || 'Error eliminando');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        } finally {
            closeConfirm();
        }
    };

    return (
        <div className="profesor-materias">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'}}>
                    <h1>Materias Asignadas</h1>
                    <BackHomeButton label="Inicio" />
                </div>
            {/* If componente usado sin prop `profesorId`, permitir elegir docente */}

            {/* Solo mostrar selector de profesor si no hay profesorId (admin) */}
            {!profesorId && (
                <div className="choose-profesor">
                    <label>Profesor:</label>
                    <select value={selectedProfesor} onChange={(e) => setSelectedProfesor(e.target.value)}>
                        <option value="">-- Selecciona un profesor --</option>
                        {docentes.map(d => (
                            <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>
                        ))}
                    </select>
                </div>
            )}

            <ul className="profesor-asignaciones">
                {asignaciones && asignaciones.length > 0 ? (
                    asignaciones.map(asignacion => (
                        <li key={asignacion.id} className="asignacion-item">
                            {/* Solo permitir editar/eliminar si no es modo profesor */}
                            {(!profesorId && editingAsignacion && editingAsignacion.id === asignacion.id) ? (
                                <div className="asignacion-edit">
                                    <select value={editingAsignacion.curso_id} onChange={(e) => setEditingAsignacion(prev => ({...prev, curso_id: e.target.value}))}>
                                        {cursos.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                    <input type="text" value={editingAsignacion.semestre} onChange={(e) => setEditingAsignacion(prev => ({...prev, semestre: e.target.value}))} />
                                    <input type="number" value={editingAsignacion.anio} onChange={(e) => setEditingAsignacion(prev => ({...prev, anio: e.target.value}))} />
                                    <button className="edit-btn" onClick={saveEdit}>Guardar</button>
                                    <button className="cancel-btn" onClick={() => setEditingAsignacion(null)}>Cancelar</button>
                                </div>
                            ) : (
                                <div className="asignacion-view">
                                    <div>
                                        <strong>{asignacion.materia || asignacion.curso_nombre}</strong>
                                        <div className="meta">{asignacion.semestre} • {asignacion.anio}</div>
                                    </div>
                                    {/* Solo mostrar acciones si no es modo profesor */}
                                    {!profesorId && (
                                        <div className="actions">
                                            <button className="edit-btn" onClick={() => startEdit(asignacion)}>Editar</button>
                                            <button className="delete-btn" onClick={() => openConfirmDelete(asignacion)}>Eliminar</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    ))
                ) : (
                    <li>{(selectedProfesor || profesorId) ? 'No hay materias asignadas para este profesor.' : 'Selecciona un profesor para ver sus materias.'}</li>
                )}
            </ul>


            {/* Solo permitir eliminar si no es modo profesor */}
            {!profesorId && confirmDelete.open && (
                <div className="confirm-modal">
                    <div className="confirm-content">
                        <h3>Eliminar asignación</h3>
                        <p>¿Seguro que quieres eliminar la asignación de <strong>{confirmDelete.curso_nombre}</strong>?</p>
                        <div className="confirm-actions">
                            <button className="confirm-btn cancel" onClick={closeConfirm}>Cancelar</button>
                            <button className="confirm-btn danger" onClick={confirmDeleteAsignacion}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Solo permitir asignar si no es modo profesor */}
            {!profesorId && (
                <>
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
                </>
            )}
        </div>
    );
};

export default ProfesorMaterias;