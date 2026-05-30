import { useEffect, useContext } from 'react';
import { Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function Inicio() {
    const { publicState, setPublicState } = useContext(AppContext);

    useEffect(() => {
        apiFetch('/api/root/puestos/recientes')
            .then(r => r.json())
            .then(data => setPublicState(prev => ({ ...prev, puestosRecientes: data })))
            .catch(() => {});
    }, []);

    return (
        <div style={styles.page}>
            {/* Hero */}
            <header style={styles.hero}>
                <h1 style={styles.heroTitle}>Bolsa de Empleo</h1>
                <p style={styles.heroSub}>Conectamos empresas con talento costarricense</p>
                <div style={styles.heroActions}>
                    <Link to="/buscar" style={styles.btnPrimary}>Buscar puestos</Link>
                    <Link to="/login" style={styles.btnSecondary}>Iniciar sesión</Link>
                </div>
            </header>

            {/* Puestos recientes */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Puestos recientes</h2>
                {publicState.puestosRecientes.length === 0 ? (
                    <p style={styles.empty}>No hay puestos disponibles en este momento.</p>
                ) : (
                    <div style={styles.grid}>
                        {publicState.puestosRecientes.map(p => (
                            <div key={p.id} style={styles.card}>
                                <div style={styles.cardBadge}>{p.tipo}</div>
                                <h3 style={styles.cardTitle}>{p.descripcion}</h3>
                                <p style={styles.cardEmpresa}>🏢 {p.empresa?.nombre ?? '—'}</p>
                                <p style={styles.cardLoc}>📍 {p.empresa?.localizacion ?? '—'}</p>
                                <p style={styles.cardSalario}>
                                    💵 ₡{p.salario?.toLocaleString('es-CR') ?? '—'}
                                </p>
                                <p style={styles.cardFecha}>📅 {p.fecha ?? '—'}</p>
                                <span style={{ ...styles.estado, background: p.estado === 'ACTIVO' ? '#dcfce7' : '#f1f5f9', color: p.estado === 'ACTIVO' ? '#16a34a' : '#64748b' }}>
                                    {p.estado}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA */}
            <section style={styles.cta}>
                <div style={styles.ctaBox}>
                    <h3>¿Sos una empresa?</h3>
                    <p>Registrá tu empresa y publicá puestos de trabajo.</p>
                    <Link to="/registro/empresa" style={styles.btnPrimary}>Registrar empresa</Link>
                </div>
                <div style={styles.ctaBox}>
                    <h3>¿Buscás empleo?</h3>
                    <p>Creá tu perfil y aplicá a los mejores puestos.</p>
                    <Link to="/registro/oferente" style={styles.btnPrimary}>Registrar perfil</Link>
                </div>
            </section>
        </div>
    );
}

const styles = {
    page: { fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc' },
    hero: { background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff', textAlign: 'center', padding: '5rem 1rem 4rem' },
    heroTitle: { fontSize: '2.8rem', margin: 0, fontWeight: 800 },
    heroSub: { fontSize: '1.2rem', marginTop: '0.75rem', opacity: 0.88 },
    heroActions: { marginTop: '2rem', display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
    btnPrimary: { background: '#fff', color: '#1e3a8a', borderRadius: 8, padding: '0.75rem 1.75rem', textDecoration: 'none', fontWeight: 700, fontSize: 16 },
    btnSecondary: { background: 'transparent', color: '#fff', borderRadius: 8, padding: '0.75rem 1.75rem', textDecoration: 'none', fontWeight: 700, fontSize: 16, border: '2px solid rgba(255,255,255,0.6)' },
    section: { maxWidth: 1100, margin: '3rem auto', padding: '0 1rem' },
    sectionTitle: { fontSize: '1.6rem', color: '#1e3a8a', marginBottom: '1.5rem' },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '2rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 },
    card: { background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', position: 'relative' },
    cardBadge: { position: 'absolute', top: 12, right: 12, background: '#eff6ff', color: '#1e40af', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700 },
    cardTitle: { margin: '0 0 0.5rem', color: '#1e293b', fontSize: '1.05rem', fontWeight: 700 },
    cardEmpresa: { margin: '4px 0', color: '#475569', fontSize: 14 },
    cardLoc: { margin: '4px 0', color: '#64748b', fontSize: 13 },
    cardSalario: { margin: '4px 0', color: '#0f766e', fontSize: 14, fontWeight: 600 },
    cardFecha: { margin: '4px 0 8px', color: '#94a3b8', fontSize: 13 },
    estado: { display: 'inline-block', borderRadius: 20, padding: '2px 12px', fontSize: 12, fontWeight: 700 },
    cta: { display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', padding: '3rem 1rem', background: '#e0f2fe' },
    ctaBox: { background: '#fff', borderRadius: 12, padding: '2rem', maxWidth: 320, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' },
};
