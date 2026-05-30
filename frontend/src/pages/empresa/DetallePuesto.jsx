import { useEffect, useContext, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function DetallePuesto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { empresaState, setEmpresaState } = useContext(AppContext);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);
    const [form, setForm] = useState({ caracteristicaId: '', nivel: '' });

    useEffect(() => {
        cargarDetalle();
    }, [id]);

    async function cargarDetalle() {
        setCargando(true);
        setError(null);
        try {
            const res = await apiFetch(`/api/empresa/puestos/${id}`);
            if (!res.ok) throw new Error('Puesto no encontrado');
            const data = await res.json();
            // data = { puesto, habilidades, caracteristicas }
            setEmpresaState(prev => ({
                ...prev,
                puestoActual: data,
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
        setExito(null);
        try {
            const res = await apiFetch(`/api/empresa/puestos/${id}/habilidades`, {
                method: 'POST',
                body: JSON.stringify({
                    caracteristicaId: parseInt(form.caracteristicaId),
                    nivel: parseInt(form.nivel),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setExito('Habilidad agregada.');
            setForm({ caracteristicaId: '', nivel: '' });
            cargarDetalle();
        } catch (e) {
            setError(e.message);
        }
    }

    async function eliminarHabilidad(habId) {
        if (!confirm('¿Eliminar esta habilidad?')) return;
        setError(null);
        try {
            const res = await apiFetch(`/api/empresa/puestos/habilidades/${habId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar');
            setExito('Habilidad eliminada.');
            cargarDetalle();
        } catch (e) {
            setError(e.message);
        }
    }

    async function cerrarSesion() {
        await apiFetch('/logout', { method: 'POST' });
        navigate('/login');
    }

    const { puestoActual } = empresaState;

    return (
        <div>
            <section className="Inicio">
                <nav className="navbar-custom">
                    <div className="navbar-inner">
                        <a href="/frontend/src/pages/public" className="navbar-brand">
                            <img src="https://cdn-icons-png.flaticon.com/512/86/86155.png"
                                 alt="icono" style={{ width: 36, height: 36, filter: 'brightness(0) invert(1)' }} />
                            <strong>Bolsa de Empleo</strong>
                        </a>
                        <div className="navbar-links">
                            <Link className="nav-link" to="/empresa">Dashboard</Link>
                            <Link className="nav-link active" to="/empresa/puestos">Mis puestos</Link>
                            <Link className="nav-link" to="/empresa/puestos/nuevo">Publicar puesto</Link>
                            <button className="nav-link-login" onClick={cerrarSesion}>Salir</button>
                        </div>
                    </div>
                </nav>
            </section>

            <div className="container mt-5">
                <h2 className="fw-bold">Habilidades del puesto</h2>

                {cargando ? (
                    <p className="text-muted">Cargando...</p>
                ) : (
                    <>
                        {puestoActual?.puesto && (
                            <p className="text-muted">{puestoActual.puesto.descripcion}</p>
                        )}
                        {error  && <div className="alert alert-danger">⚠️ {error}</div>}
                        {exito  && <div className="alert alert-success">✅ {exito}</div>}

                        <div className="row">
                            {/* Habilidades actuales */}
                            <div className="col-md-7">
                                <h5>Características requeridas</h5>
                                {!puestoActual?.habilidades?.length ? (
                                    <p className="text-muted">Aún no se han agregado características a este puesto.</p>
                                ) : (
                                    <table className="table table-sm table-bordered">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Característica</th>
                                                <th>Nivel requerido</th>
                                                <th className="text-center">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {puestoActual.habilidades.map(h => (
                                                <tr key={h.id}>
                                                    <td>{h.habilidad?.nombre}</td>
                                                    <td>{h.nivel}</td>
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
                                    <h5 className="fw-bold">Agregar característica</h5>
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
                                                {puestoActual?.caracteristicas?.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Nivel requerido (1–5)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min={1} max={5}
                                                value={form.nivel}
                                                onChange={e => setForm(prev => ({ ...prev, nivel: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100">Agregar</button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <Link to="/empresa/puestos" className="btn btn-secondary mt-3">
                            Volver a mis puestos
                        </Link>
                    </>
                )}
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
