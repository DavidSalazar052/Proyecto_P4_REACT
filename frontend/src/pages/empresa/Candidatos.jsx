import { useEffect, useContext, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function Candidatos() {
    const { puestoId } = useParams();
    const navigate = useNavigate();
    const { empresaState, setEmpresaState } = useContext(AppContext);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarCandidatos();
    }, [puestoId]);

    async function cargarCandidatos() {
        setCargando(true);
        setError(null);
        try {
            const res = await apiFetch(`/api/empresa/candidatos/${puestoId}`);
            if (!res.ok) throw new Error('No se pudo cargar la lista de candidatos');
            const data = await res.json();
            // data = { puesto, candidatos: [{ oferente, requisitosTotal, requisitosCumplidos, porcentaje }] }
            setEmpresaState(prev => ({ ...prev, candidatos: data }));
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }

    async function cerrarSesion() {
        await apiFetch('/logout', { method: 'POST' });
        navigate('/login');
    }

    function colorBarra(pct) {
        if (pct >= 75) return 'bg-success';
        if (pct >= 40) return 'bg-warning';
        return 'bg-danger';
    }

    const { candidatos } = empresaState;

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
                <h2 className="fw-bold">Candidatos para el puesto</h2>

                {candidatos?.puesto && (
                    <p className="text-muted">
                        <strong>Puesto:</strong> {candidatos.puesto.descripcion}
                    </p>
                )}

                {error && <div className="alert alert-danger">⚠️ {error}</div>}

                {cargando ? (
                    <p className="text-muted">Cargando candidatos...</p>
                ) : !candidatos?.candidatos?.length ? (
                    <p className="text-muted">No hay oferentes aprobados en el sistema aún.</p>
                ) : (
                    <table className="table table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>Oferente</th>
                                <th>Requisitos cumplidos</th>
                                <th>% Coincidencia</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidatos.candidatos.map(r => (
                                <tr key={r.oferente.id}>
                                    <td>{r.oferente.nombre} {r.oferente.apellido}</td>
                                    <td>{r.requisitosCumplidos} / {r.requisitosTotal}</td>
                                    <td>
                                        <div className="progress" style={{ height: 20 }}>
                                            <div
                                                className={`progress-bar ${colorBarra(r.porcentaje)}`}
                                                role="progressbar"
                                                style={{ width: `${r.porcentaje}%` }}
                                            >
                                                {r.porcentaje.toFixed(2)}%
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <Link
                                            to={`/empresa/candidatos/${puestoId}/oferente/${r.oferente.id}`}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Ver detalle
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <Link to="/empresa/puestos" className="btn btn-secondary mt-3">Volver</Link>
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
