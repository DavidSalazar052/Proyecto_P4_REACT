import { useEffect, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function DashboardOferente() {
    const { authState, oferenteState, setOferenteState } = useContext(AppContext);
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        async function cargarPerfil() {
            try {
                const res = await apiFetch('/api/oferente/perfil');
                if (res.status === 403) {
                    navigate('/pendiente');
                    return;
                }
                if (!res.ok) return;
                const data = await res.json();
                setOferenteState(prev => ({ ...prev, perfil: data }));
            } catch (e) {
                console.error(e);
            } finally {
                setCargando(false);
            }
        }
        cargarPerfil();
    }, []);

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
                            <Link className="nav-link active" to="/oferente">Dashboard</Link>
                            <Link className="nav-link" to="/oferente/habilidades">Mis Habilidades</Link>
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
                {cargando ? (
                    <p className="text-muted">Cargando...</p>
                ) : (
                    <>
                        <h1 className="fw-bold">Oferente — Dashboard</h1>
                        <p className="text-muted">
                            {oferenteState.perfil
                                ? `Bienvenido, ${oferenteState.perfil.nombre} ${oferenteState.perfil.apellido}`
                                : 'Administrá tus habilidades y tu CV.'}
                        </p>

                        {oferenteState.perfil && (
                            <div className="card p-4 mb-4" style={{ maxWidth: 500 }}>
                                <h5 className="fw-bold mb-3">Mis datos</h5>
                                <table className="table table-sm table-borderless mb-0">
                                    <tbody>
                                        <tr>
                                            <td className="fw-bold text-muted" style={{ width: 140 }}>Correo</td>
                                            <td>{oferenteState.perfil.correo}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold text-muted">Teléfono</td>
                                            <td>{oferenteState.perfil.telefono}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold text-muted">Residencia</td>
                                            <td>{oferenteState.perfil.residencia}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold text-muted">Nacionalidad</td>
                                            <td>{oferenteState.perfil.nacionalidad}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="d-flex gap-3 mt-2">
                            <Link to="/oferente/habilidades" className="btn btn-primary">
                                Mis habilidades
                            </Link>
                            <Link to="/oferente/curriculum" className="btn btn-outline-primary">
                                Mi CV
                            </Link>
                        </div>
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
