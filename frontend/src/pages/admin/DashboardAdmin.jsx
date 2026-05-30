import { useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function DashboardAdmin() {
    const { authState, setAuthState } = useContext(AppContext);
    const navigate = useNavigate();

    const logout = async () => {
        await apiFetch('/api/auth/logout', { method: 'POST' });
        setAuthState({ usuario: null, cargando: false, error: null });
        navigate('/login');
    };

    const menu = [
        { to: '/admin/empresas', icon: '🏢', label: 'Empresas pendientes' },
        { to: '/admin/oferentes', icon: '👤', label: 'Oferentes pendientes' },
        { to: '/admin/caracteristicas', icon: '🏷️', label: 'Características' },
        { to: '/admin/reportes', icon: '📊', label: 'Reportes PDF' },
    ];

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Panel Administrador</h1>
                    <p style={styles.sub}>Bienvenido, {authState.usuario?.username}</p>
                </div>
                <button style={styles.logoutBtn} onClick={logout}>Cerrar sesión</button>
            </header>

            <div style={styles.grid}>
                {menu.map(m => (
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
    header: { background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { margin: 0, fontSize: '1.8rem', fontWeight: 800 },
    sub: { margin: '0.25rem 0 0', opacity: 0.85 },
    logoutBtn: { background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 600 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20, padding: '2rem', maxWidth: 900, margin: '0 auto' },
    card: { background: '#fff', borderRadius: 14, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textDecoration: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', transition: 'box-shadow 0.2s' },
    cardIcon: { fontSize: 40 },
    cardLabel: { fontWeight: 700, color: '#1e3a8a', textAlign: 'center', fontSize: '1rem' },
};
