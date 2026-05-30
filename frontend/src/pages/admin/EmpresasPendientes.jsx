import { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function EmpresasPendientes() {
    const { adminState, setAdminState } = useContext(AppContext);
    const [mensaje, setMensaje] = useState(null);

    const cargar = () =>
        apiFetch('/api/admin/empresas/pendientes')
            .then(r => r.json())
            .then(data => setAdminState(prev => ({ ...prev, empresasPendientes: data })))
            .catch(() => {});

    useEffect(() => { cargar(); }, []);

    const aprobar = async id => {
        const res = await apiFetch(`/api/admin/empresas/${id}/aprobar`, { method: 'POST' });
        const data = await res.json();
        setMensaje(data.mensaje || data.error);
        cargar();
        setTimeout(() => setMensaje(null), 3000);
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <Link to="/admin" style={styles.back}>← Dashboard</Link>
                <h2 style={styles.title}>Empresas pendientes de aprobación</h2>
            </header>
            {mensaje && <div style={styles.toast}>{mensaje}</div>}
            <div style={styles.body}>
                {adminState.empresasPendientes.length === 0 ? (
                    <p style={styles.empty}>No hay empresas pendientes.</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {['ID', 'Nombre', 'Localización', 'Correo', 'Teléfono', 'Descripción', 'Acción'].map(h => (
                                    <th key={h} style={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {adminState.empresasPendientes.map(e => (
                                <tr key={e.id} style={styles.tr}>
                                    <td style={styles.td}>{e.id}</td>
                                    <td style={styles.td}>{e.nombre}</td>
                                    <td style={styles.td}>{e.localizacion}</td>
                                    <td style={styles.td}>{e.correo}</td>
                                    <td style={styles.td}>{e.telefono}</td>
                                    <td style={styles.td}>{e.descripcion}</td>
                                    <td style={styles.td}>
                                        <button style={styles.btnAprobar} onClick={() => aprobar(e.id)}>
                                            ✅ Aprobar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' },
    header: { background: '#1e3a8a', color: '#fff', padding: '1.5rem 2rem' },
    back: { color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, display: 'block', marginBottom: 6 },
    title: { margin: 0, fontSize: '1.4rem', fontWeight: 800 },
    toast: { background: '#dcfce7', color: '#16a34a', padding: '0.75rem 2rem', fontWeight: 600 },
    body: { padding: '2rem', overflowX: 'auto' },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '3rem' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
    th: { background: '#1e3a8a', color: '#fff', padding: '0.75rem 1rem', textAlign: 'left', fontSize: 13, fontWeight: 700 },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '0.75rem 1rem', color: '#374151', fontSize: 14 },
    btnAprobar: { background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
};
