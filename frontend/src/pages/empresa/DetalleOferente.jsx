import { useEffect, useContext, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

const BACKEND = 'http://localhost:8080';

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

export default function DetalleOferente() {
    const { puestoId, oferenteId } = useParams();
    const navigate = useNavigate();
    const { empresaState, setEmpresaState } = useContext(AppContext);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarDetalle();
    }, [puestoId, oferenteId]);

    async function cargarDetalle() {
        setCargando(true);
        setError(null);
        try {
            const res = await apiFetch(`/api/empresa/candidatos/${puestoId}/oferente/${oferenteId}`);
            if (!res.ok) throw new Error('No se pudo cargar el detalle del oferente');
            const data = await res.json();
            // data = { oferente, habilidades, tieneCv }
            setEmpresaState(prev => ({ ...prev, oferenteDetalle: data }));
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

    const det = empresaState.oferenteDetalle;

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
                            <Link className="nav-link" to="/empresa">Dashboard</Link>
                            <Link className="nav-link active" to="/empresa/puestos">Mis puestos</Link>
                            <Link className="nav-link" to="/empresa/puestos/nuevo">Publicar puesto</Link>
                            <button className="nav-link-login" onClick={cerrarSesion}>Salir</button>
                        </div>
                    </div>
                </nav>
            </section>

            <div className="container mt-5">
                <h2 className="fw-bold">Detalle del oferente</h2>

                {error && <div className="alert alert-danger">⚠️ {error}</div>}

                {cargando ? (
                    <p className="text-muted">Cargando...</p>
                ) : det ? (
                    <>
                        {/* Datos personales */}
                        <div className="card p-4 mb-4" style={{ maxWidth: 600 }}>
                            <h5 className="fw-bold mb-3">
                                {det.oferente.nombre} {det.oferente.apellido}
                            </h5>
                            <table className="table table-sm table-borderless mb-0">
                                <tbody>
                                    <tr>
                                        <td className="fw-bold text-muted" style={{ width: 160 }}>Correo</td>
                                        <td>{det.oferente.correo}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-bold text-muted">Teléfono</td>
                                        <td>{det.oferente.telefono}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-bold text-muted">Residencia</td>
                                        <td>{det.oferente.residencia}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-bold text-muted">Nacionalidad</td>
                                        <td>{det.oferente.nacionalidad}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Habilidades */}
                        <h5 className="fw-bold">Habilidades</h5>
                        {!det.habilidades?.length ? (
                            <p className="text-muted">Este oferente no ha registrado habilidades aún.</p>
                        ) : (
                            <table className="table table-sm table-bordered align-middle" style={{ maxWidth: 520 }}>
                                <thead className="table-dark">
                                    <tr>
                                        <th>Característica</th>
                                        <th className="text-center">Nivel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {det.habilidades.map(h => (
                                        <tr key={h.id}>
                                            <td>{h.caracteristicas?.nombre}</td>
                                            <td className="text-center">
                                                <Estrellas nivel={h.nivel} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* CV */}
                        <div className="mt-3">
                            {det.tieneCv ? (
                                <a
                                    href={`${BACKEND}/api/empresa/candidatos/cv/${oferenteId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-outline-primary"
                                >
                                    📄 Ver Currículum (PDF)
                                </a>
                            ) : (
                                <p className="text-muted fst-italic">
                                    Este oferente no ha subido su currículum aún.
                                </p>
                            )}
                        </div>

                        <Link to={`/empresa/candidatos/${puestoId}`} className="btn btn-secondary mt-4">
                            Volver
                        </Link>
                    </>
                ) : null}
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
