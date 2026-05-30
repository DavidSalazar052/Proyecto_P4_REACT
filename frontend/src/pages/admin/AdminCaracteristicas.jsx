import { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function AdminCaracteristicas() {
    const { adminState, setAdminState } = useContext(AppContext);
    const [form, setForm] = useState({ nombre: '', padreId: '' });
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const cargar = () =>
        apiFetch('/api/admin/caracteristicas')
            .then(r => r.json())
            .then(data => setAdminState(prev => ({ ...prev, caracteristicas: { todas: data.todas, padres: data.padres, hijos: data.hijos } })))
            .catch(() => {});

    useEffect(() => { cargar(); }, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        setMensaje(null);
        const body = { nombre: form.nombre, padreId: form.padreId ? parseInt(form.padreId) : null };
        const res = await apiFetch('/api/admin/caracteristicas', { method: 'POST', body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        setMensaje(data.mensaje);
        setForm({ nombre: '', padreId: '' });
        cargar();
        setTimeout(() => setMensaje(null), 3000);
    };

    const { padres = [], hijos = {}, todas = [] } = adminState.caracteristicas;

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <Link to="/admin" style={styles.back}>← Dashboard</Link>
                <h2 style={styles.title}>Gestión de Características</h2>
            </header>

            <div style={styles.layout}>
                {/* Formulario */}
                <div style={styles.formCard}>
                    <h3 style={styles.cardTitle}>Nueva característica</h3>
                    {error && <div style={styles.error}>{error}</div>}
                    {mensaje && <div style={styles.exito}>{mensaje}</div>}
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <label style={styles.label}>Nombre *</label>
                        <input
                            style={styles.input}
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Python"
                            required
                        />
                        <label style={styles.label}>Categoría padre (opcional)</label>
                        <select style={styles.input} name="padreId" value={form.padreId} onChange={handleChange}>
                            <option value="">— Sin padre (raíz) —</option>
                            {padres.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                        <button style={styles.btn} type="submit">Crear característica</button>
                    </form>
                </div>

                {/* Árbol */}
                <div style={styles.arbolCard}>
                    <h3 style={styles.cardTitle}>Árbol de características</h3>
                    {padres.length === 0 ? (
                        <p style={{ color: '#94a3b8' }}>No hay características aún.</p>
                    ) : (
                        padres.map(padre => (
                            <div key={padre.id} style={styles.grupo}>
                                <p style={styles.grupoTitle}>📁 {padre.nombre}</p>
                                {(hijos[padre.id] || []).map(hijo => (
                                    <p key={hijo.id} style={styles.hijo}>└ {hijo.nombre}</p>
                                ))}
                            </div>
                        ))
                    )}
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
    layout: { display: 'flex', gap: 24, padding: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' },
    formCard: { background: '#fff', borderRadius: 12, padding: '1.5rem', width: 320, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
    arbolCard: { background: '#fff', borderRadius: 12, padding: '1.5rem', flex: 1, minWidth: 260, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
    cardTitle: { margin: '0 0 1rem', color: '#1e3a8a', fontWeight: 700 },
    error: { background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '0.5rem 1rem', marginBottom: 12, fontSize: 14 },
    exito: { background: '#dcfce7', color: '#16a34a', borderRadius: 8, padding: '0.5rem 1rem', marginBottom: 12, fontSize: 14 },
    form: { display: 'flex', flexDirection: 'column', gap: 10 },
    label: { fontSize: 13, fontWeight: 600, color: '#374151' },
    input: { padding: '0.55rem 0.8rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 },
    btn: { marginTop: 8, padding: '0.65rem', borderRadius: 8, background: '#1e3a8a', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' },
    grupo: { marginBottom: '1rem' },
    grupoTitle: { margin: '0 0 4px', fontWeight: 700, color: '#1e293b' },
    hijo: { margin: '2px 0 2px 16px', color: '#475569', fontSize: 14 },
};
