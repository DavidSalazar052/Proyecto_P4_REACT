import { useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function DashboardEmpresa() {
    const { authState, setAuthState, empresaState, setEmpresaState } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        apiFetch('/api/empresa/perfil')
            .then(r => {
                if (r.status === 403) navigate('/pendiente');
                return r.json();
            })
            .then(data => setEmpresaState(prev => ({ ...prev, perfil: data })))
            .catch(() => {});
    }, []);

    const logout = async () => {
        await apiFetch('/api/auth/logout', { method: 'POST' });
        setAuthState({ usuario: null, cargando: false, error: null });
        navigate('/login');
    };

    const { perfil } = empresaState;

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Panel Empresa</h1>
                    <p style={styles.sub}>{perfil?.nombre ?? authState.usuario?.username}</p>
                </div>
                <button style={styles.logoutBtn} onClick={logout}>Cerrar sesión</button>
            </header>

            {perfil && (
                <div style={styles.perfilCard}>
                    <p>📍 {perfil.localizacion}</p>
                    <p>📧 {perfil.correo}</p>
                    <p>📞 {perfil.telefono}</p>
                    {perfil.descripcion && <p>📄 {perfil.descripcion}</p>}
                </div>
            )}

            <div style={styles.grid}>
                {[
                    { to: '/empresa/puestos', icon: '💼', label: 'Mis puestos' },
                    { to: '/empresa/puestos/nuevo', icon: '➕', label: 'Nuevo puesto' },
                    { to: '/empresa/editar', icon: '✏️', label: 'Editar perfil' },
                ].map(m => (
                    <Link key={m.to} to={m.to} style={styles.card}>
                        <span style={styles.cardIcon}>{m.icon}</span>
                        <span style={styles.cardLabel}>{m.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' },
    header: { background: 'linear-gradient(135deg,#0f766e,#0d9488)', color: '#fff', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { margin: 0, fontSize: '1.8rem', fontWeight: 800 },
    sub: { margin: '0.25rem 0 0', opacity: 0.85 },
    logoutBtn: { background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 600 },
    perfilCard: { background: '#fff', borderRadius: 12, padding: '1.25rem 2rem', margin: '1.5rem 2rem 0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: 16 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20, padding: '2rem', maxWidth: 800, margin: '0 auto' },
    card: { background: '#fff', borderRadius: 14, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textDecoration: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
    cardIcon: { fontSize: 36 },
    cardLabel: { fontWeight: 700, color: '#0f766e', textAlign: 'center' },
};
