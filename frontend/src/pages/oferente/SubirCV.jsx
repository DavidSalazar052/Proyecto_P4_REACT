import { useEffect, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { AppContext, apiFetch, apiFetchForm } from '../../AppProvider.jsx';

const BACKEND = 'http://localhost:8080';

export default function SubirCV() {
    const { authState, oferenteState, setOferenteState } = useContext(AppContext);
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [subiendo, setSubiendo] = useState(false);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [archivo, setArchivo] = useState(null);

    useEffect(() => {
        verificarCV();
    }, []);

    async function verificarCV() {
        setCargando(true);
        try {
            const res = await apiFetch('/api/oferente/curriculum');
            if (res.status === 403) { navigate('/pendiente'); return; }
            if (!res.ok) throw new Error('Error al verificar estado del CV');
            const data = await res.json();
            setOferenteState(prev => ({ ...prev, tieneCv: data.tieneCv }));
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setMensaje(null);
        if (!archivo) { setError('Seleccioná un archivo PDF.'); return; }
        if (archivo.type !== 'application/pdf') { setError('Solo se aceptan archivos PDF.'); return; }
        if (archivo.size > 5 * 1024 * 1024) { setError('El archivo no puede superar 5 MB.'); return; }

        setSubiendo(true);
        try {
            const formData = new FormData();
            formData.append('archivo', archivo);
            const res = await apiFetchForm('/api/oferente/curriculum', formData);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMensaje(data.mensaje);
            setArchivo(null);
            // Reset file input
            document.getElementById('archivoInput').value = '';
            verificarCV();
        } catch (e) {
            setError(e.message);
        } finally {
            setSubiendo(false);
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
                            <Link className="nav-link" to="/oferente/habilidades">Mis Habilidades</Link>
                            <Link className="nav-link active" to="/oferente/curriculum">Mi CV</Link>
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

            <div className="container mt-5" style={{ maxWidth: 600 }}>
                <h2 className="fw-bold">Mi Currículum</h2>

                {error   && <div className="alert alert-danger">⚠️ {error}</div>}
                {mensaje && <div className="alert alert-success">✅ {mensaje}</div>}

                {cargando ? (
                    <p className="text-muted">Cargando...</p>
                ) : (
                    <>
                        {/* Estado actual del CV */}
                        <div className="card p-4 mb-4">
                            <h5 className="fw-bold">Estado del CV</h5>
                            {oferenteState.tieneCv ? (
                                <div>
                                    <p className="text-success mb-2">
                                        <strong>✓ CV cargado.</strong> Las empresas pueden consultarlo al revisar tu perfil.
                                    </p>
                                    <a
                                        href={`${BACKEND}/api/oferente/curriculum/ver`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        Ver mi CV actual
                                    </a>
                                </div>
                            ) : (
                                <p className="text-muted mb-0">Aún no has subido tu currículum.</p>
                            )}
                        </div>

                        {/* Formulario de subida */}
                        <div className="card p-4">
                            <h5 className="fw-bold">
                                {oferenteState.tieneCv ? 'Subir / reemplazar CV' : 'Subir CV'}
                            </h5>
                            <p className="text-muted small">
                                Solo se acepta formato <strong>PDF</strong>. Máximo 5 MB.
                            </p>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Archivo PDF</label>
                                    <input
                                        id="archivoInput"
                                        type="file"
                                        className="form-control"
                                        accept="application/pdf"
                                        onChange={e => setArchivo(e.target.files[0] || null)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={subiendo}
                                >
                                    {subiendo
                                        ? 'Subiendo...'
                                        : oferenteState.tieneCv ? 'Reemplazar CV' : 'Subir CV'}
                                </button>
                            </form>
                        </div>

                        <Link to="/oferente" className="btn btn-secondary mt-4">
                            Volver al Dashboard
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
