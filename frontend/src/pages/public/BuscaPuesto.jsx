import { useEffect, useContext, useState } from 'react';
import { AppContext, apiFetch } from '../../AppProvider.jsx';
import { Link } from 'react-router';

export default function BuscaPuesto() {
    const { publicState, setPublicState } = useContext(AppContext);
    const [seleccionados, setSeleccionados] = useState([]);
    const [buscando, setBuscando] = useState(false);

    useEffect(() => {
        apiFetch('/api/public/caracteristicas')
            .then(r => r.json())
            .then(data => setPublicState(prev => ({ ...prev, caracteristicas: data })))
            .catch(() => {});
    }, []);

    const toggleCaracteristica = id => {
        setSeleccionados(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const buscar = async () => {
        if (seleccionados.length === 0) return;
        setBuscando(true);
        try {
            const params = seleccionados.map(id => `ids=${id}`).join('&');
            const res = await apiFetch(`/api/public/puestos/buscar?${params}`);
            const data = await res.json();
            setPublicState(prev => ({ ...prev, resultadosBusqueda: data }));
        } catch {
        } finally {
            setBuscando(false);
        }
    };

    const { padres = [], hijos = {} } = publicState.caracteristicas;

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <Link to="/" style={styles.back}>← Inicio</Link>
                <h2 style={styles.title}>Buscar Puestos</h2>
                <p style={styles.sub}>Filtrá por habilidades requeridas</p>
            </div>

            <div style={styles.layout}>
                {/* Filtros */}
                <aside style={styles.sidebar}>
                    <h3 style={styles.sidebarTitle}>Características</h3>
                    {padres.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Cargando...</p>}
                    {padres.map(padre => (
                        <div key={padre.id} style={styles.grupo}>
                            <p style={styles.grupoTitle}>{padre.nombre}</p>
                            {(hijos[padre.id] || []).map(hijo => (
                                <label key={hijo.id} style={styles.checkLabel}>
                                    <input
                                        type="checkbox"
                                        checked={seleccionados.includes(hijo.id)}
                                        onChange={() => toggleCaracteristica(hijo.id)}
                                    />
                                    {hijo.nombre}
                                </label>
                            ))}
                        </div>
                    ))}
                    <button style={styles.btnBuscar} onClick={buscar} disabled={buscando || seleccionados.length === 0}>
                        {buscando ? 'Buscando...' : `Buscar (${seleccionados.length})`}
                    </button>
                    {seleccionados.length > 0 && (
                        <button style={styles.btnLimpiar} onClick={() => { setSeleccionados([]); setPublicState(prev => ({ ...prev, resultadosBusqueda: [] })); }}>
                            Limpiar filtros
                        </button>
                    )}
                </aside>

                {/* Resultados */}
                <main style={styles.main}>
                    {publicState.resultadosBusqueda.length === 0 ? (
                        <div style={styles.empty}>
                            <p>Seleccioná características y presioná <strong>Buscar</strong>.</p>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {publicState.resultadosBusqueda.map(p => (
                                <div key={p.id} style={styles.card}>
                                    <span style={styles.badge}>{p.tipo}</span>
                                    <h3 style={styles.cardTitle}>{p.descripcion}</h3>
                                    <p style={styles.cardMeta}>🏢 {p.empresa?.nombre ?? '—'}</p>
                                    <p style={styles.cardMeta}>📍 {p.empresa?.localizacion ?? '—'}</p>
                                    <p style={{ ...styles.cardMeta, color: '#0f766e', fontWeight: 600 }}>
                                        ₡{p.salario?.toLocaleString('es-CR') ?? '—'}
                                    </p>
                                    <p style={{ ...styles.cardMeta, color: '#94a3b8', fontSize: 12 }}>
                                        {p.fecha}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' },
    header: { background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff', padding: '2rem 2rem 1.5rem' },
    back: { color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14 },
    title: { margin: '0.5rem 0 0', fontSize: '1.8rem', fontWeight: 800 },
    sub: { margin: '0.25rem 0 0', opacity: 0.8 },
    layout: { display: 'flex', gap: 24, padding: '2rem', maxWidth: 1100, margin: '0 auto', alignItems: 'flex-start', flexWrap: 'wrap' },
    sidebar: { background: '#fff', borderRadius: 12, padding: '1.5rem', width: 240, flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
    sidebarTitle: { margin: '0 0 1rem', color: '#1e3a8a', fontSize: '1rem', fontWeight: 700 },
    grupo: { marginBottom: '1rem' },
    grupoTitle: { fontWeight: 700, color: '#374151', fontSize: 13, margin: '0 0 4px' },
    checkLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer', marginBottom: 4 },
    btnBuscar: { width: '100%', marginTop: 12, padding: '0.65rem', borderRadius: 8, background: '#1e3a8a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
    btnLimpiar: { width: '100%', marginTop: 8, padding: '0.5rem', borderRadius: 8, background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: 13 },
    main: { flex: 1, minWidth: 260 },
    empty: { background: '#fff', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#64748b', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 16 },
    card: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', position: 'relative' },
    badge: { background: '#eff6ff', color: '#1e40af', borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 700 },
    cardTitle: { margin: '0.5rem 0 0.4rem', color: '#1e293b', fontSize: '0.95rem', fontWeight: 700 },
    cardMeta: { margin: '3px 0', color: '#475569', fontSize: 13 },
};
