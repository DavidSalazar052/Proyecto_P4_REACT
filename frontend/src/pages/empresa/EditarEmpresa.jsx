import { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function EditarEmpresa() {
    const { empresaState, setEmpresaState } = useContext(AppContext);
    const [form, setForm] = useState({ nombre: '', localizacion: '', correo: '', telefono: '', descripcion: '' });
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiFetch('/api/empresa/perfil')
            .then(r => r.json())
            .then(data => {
                setEmpresaState(prev => ({ ...prev, perfil: data }));
                setForm({ nombre: data.nombre || '', localizacion: data.localizacion || '', correo: data.correo || '', telefono: data.telefono || '', descripcion: data.descripcion || '' });
            })
            .catch(() => {});
    }, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        const res = await apiFetch('/api/empresa/perfil', { method: 'PUT', body: JSON.stringify(form) });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        setMensaje(data.mensaje);
        setTimeout(() => setMensaje(null), 3000);
    };

    const campos = [
        { name: 'nombre', label: 'Nombre', placeholder: 'Nombre de la empresa' },
        { name: 'localizacion', label: 'Localización', placeholder: 'Ej: San José' },
        { name: 'correo', label: 'Correo', placeholder: 'info@empresa.com' },
        { name: 'telefono', label: 'Teléfono', placeholder: '88001122' },
    ];

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <Link to="/empresa" style={styles.back}>← Dashboard</Link>
                <h2 style={styles.title}>Editar Perfil de Empresa</h2>
            </header>
            <div style={styles.body}>
                <div style={styles.card}>
                    {error && <div style={styles.error}>{error}</div>}
                    {mensaje && <div style={styles.exito}>{mensaje}</div>}
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {campos.map(f => (
                            <div key={f.name} style={styles.field}>
                                <label style={styles.label}>{f.label}</label>
                                <input style={styles.input} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} />
                            </div>
                        ))}
                        <div style={styles.field}>
                            <label style={styles.label}>Descripción</label>
                            <textarea style={{ ...styles.input, minHeight: 80, resize: 'vertical' }} name="descripcion" value={form.descripcion} onChange={handleChange} />
                        </div>
                        <button style={styles.btn} type="submit">Guardar cambios</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' },
    header: { background: '#0f766e', color: '#fff', padding: '1.5rem 2rem' },
    back: { color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, display: 'block', marginBottom: 6 },
    title: { margin: 0, fontSize: '1.4rem', fontWeight: 800 },
    body: { padding: '2rem' },
    card: { background: '#fff', borderRadius: 12, padding: '2rem', maxWidth: 480, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
    error: { background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '0.5rem 1rem', marginBottom: 12, fontSize: 14 },
    exito: { background: '#dcfce7', color: '#16a34a', borderRadius: 8, padding: '0.5rem 1rem', marginBottom: 12, fontSize: 14 },
    form: { display: 'flex', flexDirection: 'column', gap: 12 },
    field: { display: 'flex', flexDirection: 'column', gap: 4 },
    label: { fontSize: 13, fontWeight: 600, color: '#374151' },
    input: { padding: '0.55rem 0.8rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 },
    btn: { marginTop: 8, padding: '0.7rem', borderRadius: 8, background: '#0f766e', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' },
};
