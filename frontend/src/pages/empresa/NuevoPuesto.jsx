import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router';
import { AppContext, apiFetch } from '../../AppProvider.jsx';

export default function NuevoPuesto() {
    const navigate = useNavigate();
    const { setEmpresaState } = useContext(AppContext);
    const [form, setForm] = useState({ descripcion: '', salario: '', tipo: 'PUBLICO' });
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setCargando(true);
        try {
            const res = await apiFetch('/api/empresa/puestos', {
                method: 'POST',
                body: JSON.stringify({
                    descripcion: form.descripcion,
                    salario: parseInt(form.salario),
                    tipo: form.tipo,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear el puesto');
            // Agregar el nuevo puesto al estado global de empresa
            setEmpresaState(prev => ({
                ...prev,
                puestos: [...prev.puestos, data],
            }));
            navigate('/empresa/puestos', { state: { exito: true } });
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
                            <Link className="nav-link" to="/empresa/puestos">Mis puestos</Link>
                            <Link className="nav-link active" to="/empresa/puestos/nuevo">Publicar puesto</Link>
                            <Link className="nav-link" to="/empresa/editar">Mi perfil</Link>
                            <button className="nav-link-login" onClick={cerrarSesion}>Salir</button>
                        </div>
                    </div>
                </nav>
            </section>

            <div className="container mt-5">
                <h2 className="fw-bold">Publicar nuevo puesto</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="card p-4" style={{ maxWidth: 600 }}>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">
                                Descripción del puesto <span className="text-danger">*</span>
                            </label>
                            <textarea
                                name="descripcion"
                                className="form-control"
                                rows={3}
                                placeholder="ej: Desarrollador Java Backend..."
                                value={form.descripcion}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">
                                Salario (₡) <span className="text-danger">*</span>
                            </label>
                            <input
                                type="number"
                                name="salario"
                                className="form-control"
                                placeholder="ej: 1500000"
                                min={0}
                                value={form.salario}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">
                                Tipo de publicación <span className="text-danger">*</span>
                            </label>
                            <select
                                name="tipo"
                                className="form-select"
                                value={form.tipo}
                                onChange={handleChange}
                                required
                            >
                                <option value="PUBLICO">Público — visible para todos</option>
                                <option value="PRIVADO">Privado — solo oferentes registrados</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={cargando}>
                            {cargando ? 'Creando...' : 'Crear puesto'}
                        </button>
                    </form>

                    <hr className="mt-4" />
                    <p className="text-muted small">
                        Después de crear el puesto podrás agregarle las características requeridas
                        desde la vista <strong>Habilidades</strong> en "Mis puestos".
                    </p>
                </div>
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
