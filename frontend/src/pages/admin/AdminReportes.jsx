import { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

const MESES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function AdminReportes() {
    const { adminState, setAdminState } = useContext(AppContext);
    const [anio, setAnio] = useState('');
    const [mes, setMes] = useState('');

    useEffect(() => {
        apiFetch('/api/admin/reportes/anios')
            .then(r => r.json())
            .then(data => {
                setAdminState(prev => ({ ...prev, aniosReporte: data }));
                if (data.length > 0) setAnio(String(data[data.length - 1]));
            })
            .catch(() => {});
    }, []);

    const generarPdf = () => {
        if (!anio || !mes) return;
        window.open(`http://localhost:8080/api/admin/reportes/pdf?anio=${anio}&mes=${mes}`, '_blank');
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <Link to="/admin" style={styles.back}>← Dashboard</Link>
                <h2 style={styles.title}>Reportes de Puestos</h2>
            </header>

            <div style={styles.body}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>📊 Generar reporte PDF</h3>
                    <p style={styles.desc}>
                        Seleccioná el año y mes para generar un reporte con todos los puestos registrados en ese período.
                    </p>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Año</label>
                            <select style={styles.select} value={anio} onChange={e => setAnio(e.target.value)}>
                                <option value="">— Seleccioná —</option>
                                {adminState.aniosReporte.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Mes</label>
                            <select style={styles.select} value={mes} onChange={e => setMes(e.target.value)}>
                                <option value="">— Seleccioná —</option>
                                {MESES.slice(1).map((m, i) => (
                                    <option key={i + 1} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        style={{ ...styles.btn, opacity: (!anio || !mes) ? 0.5 : 1 }}
                        onClick={generarPdf}
                        disabled={!anio || !mes}
                    >
                        📥 Descargar PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' },
    header: { background: '#1e3a8a', color: '#fff', padding: '1.5rem 2rem' },
    back: { color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, display: 'block', marginBottom: 6 },
    title: { margin: 0, fontSize: '1.4rem', fontWeight: 800 },
    body: { padding: '2rem' },
    card: { background: '#fff', borderRadius: 12, padding: '2rem', maxWidth: 500, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
    cardTitle: { margin: '0 0 0.75rem', color: '#1e3a8a', fontWeight: 700 },
    desc: { color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 },
    row: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: '1.5rem' },
    field: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
    label: { fontSize: 13, fontWeight: 600, color: '#374151' },
    select: { padding: '0.55rem 0.8rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 },
    btn: { padding: '0.75rem 1.5rem', borderRadius: 8, background: '#1e3a8a', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 15 },
};
