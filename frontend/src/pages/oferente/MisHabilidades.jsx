import { useEffect, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

function Estrellas({ nivel }) {
    return (
        <span>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ color: i <= nivel ? '#f5a623' : '#ccc', fontSize: 16 }}>★</span>
            ))}
            <small className="text-muted ms-1">({nivel}/5)</small>
        </span>
    );
}

export default function MisHabilidades() {
    const { authState, oferenteState, setOferenteState } = useContext(AppContext);
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [form, setForm] = useState({ caracteristicaId: '', nivel: '' });

    useEffect(() => {
        cargarHabilidades();
    }, []);

    async function cargarHabilidades() {
        setCargando(true);
        setError(null);
        try {
            const res = await apiFetch('/api/oferente/habilidades');
            if (res.status === 403) { navigate('/pendiente'); return; }
            if (!res.ok) throw new Error('Error al cargar habilidades');
            const data = await res.json();
            // data = { habilidades, caracteristicas }
            setOferenteState(prev => ({
                ...prev,
                habilidades: data.habilidades,
                caracteristicas: data.caracteristicas,
            }));
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }

    async function agregarHabilidad(e) {
        e.preventDefault();
        setError(null);
        setMensaje(null);
        try {
            const res = await apiFetch('/api/oferente/habilidades', {
                method: 'POST',
                body: JSON.stringify({
                    caracteristicaId: parseInt(form.caracteristicaId),
                    nivel: parseInt(form.nivel),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMensaje(data.mensaje);
            setForm({ caracteristicaId: '', nivel: '' });
            cargarHabilidades();
        } catch (e) {
            setError(e.message);
        }
    }

    async function eliminarHabilidad(id) {
        if (!confirm('¿Eliminar esta habilidad?')) return;
        setError(null);
        setMensaje(null);
        try {
            const res = await apiFetch(`/api/oferente/habilidades/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMensaje(data.mensaje);
            cargarHabilidades();
        } catch (e) {
            setError(e.message);
        }
    }

    async function cerrarSesion() {
        await apiFetch('/logout', { method: 'POST' });
        navigate('/login');
    }

    return (
        <div>
            <section className="Inicio">
                <nav className="navbar-custom">
                    <div className="navbar-inner">
                        <a href="/" className="navbar-brand">
                            <img src="https://cdn-icons-png.flaticon.com/512/86/86155.png"
                                 alt="icono" style={{ width: 36, height: 36, filter: 'brightness(0) invert(1)' }} />
                            <strong>Bolsa de Empleo</strong>
                        </a>
                        <div className="navbar-links">
                            <Link className="nav-link" to="/oferente">Dashboard</Link>
                            <Link className="nav-link active" to="/oferente/habilidades">Mis Habilidades</Link>
                            <Link className="nav-link" to="/oferente/curriculum">Mi CV</Link>
                            {authState.usuario && (
                                <span className="nav-link" style={{ color: '#f5a623', fontWeight: 'bold' }}>
                                    {authState.usuario.username}
                                </span>
                            )}
                            <button className="nav-link-login" onClick={cerrarSesion}>Salir</button>
                        </div>
                    </div>
                </nav>
            </section>

            <div className="container mt-5">
                <h2 className="fw-bold">Mis habilidades</h2>

                {error   && <div className="alert alert-danger">⚠️ {error}</div>}
                {mensaje && <div className="alert alert-success">✅ {mensaje}</div>}

                {cargando ? (
                    <p className="text-muted">Cargando...</p>
                ) : (
                    <div className="row g-4">
                        {/* Habilidades actuales */}
                        <div className="col-md-7">
                            <h5 className="mb-3">Características registradas</h5>
                            {!oferenteState.habilidades?.length ? (
                                <p className="text-muted">Aún no has agregado ninguna habilidad.</p>
                            ) : (
                                <table className="table table-sm table-bordered align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Característica</th>
                                            <th className="text-center">Nivel (1–5)</th>
                                            <th className="text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {oferenteState.habilidades.map(h => (
                                            <tr key={h.id}>
                                                <td>{h.caracteristicas?.nombre}</td>
                                                <td className="text-center">
                                                    <Estrellas nivel={h.nivel} />
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => eliminarHabilidad(h.id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Formulario agregar */}
                        <div className="col-md-5">
                            <div className="card p-4">
                                <h5 className="fw-bold">Agregar habilidad</h5>
                                <form onSubmit={agregarHabilidad}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Característica</label>
                                        <select
                                            className="form-select"
                                            value={form.caracteristicaId}
                                            onChange={e => setForm(prev => ({ ...prev, caracteristicaId: e.target.value }))}
                                            required
                                        >
                                            <option value="">-- Seleccioná --</option>
                                            {oferenteState.caracteristicas?.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Nivel (1–5)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min={1} max={5}
                                            placeholder="ej: 3"
                                            value={form.nivel}
                                            onChange={e => setForm(prev => ({ ...prev, nivel: e.target.value }))}
                                            required
                                        />
                                        <div className="form-text">
                                            1 = básico &nbsp;·&nbsp; 3 = intermedio &nbsp;·&nbsp; 5 = experto
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Agregar</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <Link to="/oferente" className="btn btn-secondary mt-4">Volver al Dashboard</Link>
            </div>

            <footer>
                <div className="footer-inner">
                    <span><strong>Bolsa de Empleo</strong> &copy; {new Date().getFullYear()}</span>
                    <span>Desarrollado con React &amp; Spring Boot</span>
                </div>
            </footer>
        </div>
    );
}
