import { useEffect, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function MisPuestos() {
    const { empresaState, setEmpresaState, authState } = useContext(AppContext);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarPuestos();
    }, []);

    async function cargarPuestos() {
        setCargando(true);
        try {
            const res = await apiFetch('/api/empresa/puestos');
            if (res.status === 403) {
                navigate('/pendiente');
                return;
            }
            if (!res.ok) throw new Error('Error al cargar puestos');
            const data = await res.json();
            setEmpresaState(prev => ({ ...prev, puestos: data }));
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }

    async function desactivarPuesto(id) {
        if (!confirm('¿Desactivar este puesto?')) return;
        try {
            const res = await apiFetch(`/api/empresa/puestos/${id}/desactivar`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setExito('Puesto desactivado correctamente.');
            cargarPuestos();
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
            {/* Navbar */}
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
                            <Link className="nav-link" to="/empresa/editar">Mi perfil</Link>
                            <button className="nav-link-login" onClick={cerrarSesion}>Salir</button>
                        </div>
                    </div>
                </nav>
            </section>

            <div className="container mt-5">
                {exito && <div className="alert alert-success">✅ {exito}</div>}
                {error && <div className="alert alert-danger">⚠️ {error}</div>}

                <h2 className="fw-bold">Mis puestos</h2>

                <Link to="/empresa/puestos/nuevo" className="btn btn-primary mb-3">
                    Publicar puesto
                </Link>

                {cargando ? (
                    <p className="text-muted">Cargando puestos...</p>
                ) : empresaState.puestos.length === 0 ? (
                    <p className="text-muted">Aún no tenés puestos publicados.</p>
                ) : (
                    <table className="table table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Descripción</th>
                                <th>Salario</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empresaState.puestos.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.descripcion}</td>
                                    <td>₡ {p.salario?.toLocaleString()}</td>
                                    <td>{p.tipo}</td>
                                    <td>
                                        <span className={`badge ${p.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`}>
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td className="d-flex gap-2">
                                        {p.estado === 'ACTIVO' && (
                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() => desactivarPuesto(p.id)}
                                            >
                                                Desactivar
                                            </button>
                                        )}
                                        <Link
                                            to={`/empresa/candidatos/${p.id}`}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Candidatos
                                        </Link>
                                        <Link
                                            to={`/empresa/puestos/${p.id}`}
                                            className="btn btn-sm btn-outline-secondary"
                                        >
                                            Habilidades
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
