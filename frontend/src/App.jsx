import { useState, useEffect } from 'react';
import './index.css';

function App() {
    const [puestos, setPuestos] = useState([]);

    useEffect(() => {
        (async () => {
            const res = await fetch('/api/puestos/recientes');
            if (!res.ok) return;
            setPuestos(await res.json());
        })();
    }, []);

    return (
        <>
            {/* ── Sección Inicio con Navbar + Hero ── */}
            <section className="Inicio">
                <nav className="navbar-custom">
                    <div className="navbar-inner">
                        <span className="navbar-brand">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/86/86155.png"
                                alt="icono"
                                style={{ width: 50, height: 50, filter: 'brightness(0) invert(1)' }}
                            />
                            <strong> Bolsa de Empleo</strong>
                        </span>
                        <div className="navbar-links">
                            <a className="nav-link" href="#">Buscar Puesto</a>
                            <a className="nav-link" href="#">Empresas</a>
                            <a className="nav-link" href="#">Oferentes</a>
                            <a className="nav-link-login" href="#">Login</a>
                        </div>
                    </div>
                </nav>

                <div className="hero-content">
                    <p className="hero-eyebrow">¿Buscas tu próximo gran proyecto?</p>
                    <h1 className="hero-title">Encuentra tu próximo empleo</h1>
                </div>
            </section>

            {/* ── Búsqueda rápida ── */}
            <section className="busqueda-rapida">
                <div className="card">
                    <h5>Búsqueda rápida de puestos</h5>
                    <div className="busqueda-row">
                        <input
                            type="text"
                            placeholder="Ej: Desarrollador Java, Soporte Técnico..."
                        />
                        <button className="btn-primary">Buscar</button>
                    </div>
                </div>
            </section>

            {/* ── Últimos 5 puestos públicos ── */}
            <section className="contenedor-puestos">
                <h2>Últimos puestos públicos</h2>

                {puestos.length === 0 ? (
                    <p className="text-muted">
                        Aún no hay puestos públicos registrados. ¡Volvé pronto!
                    </p>
                ) : (
                    <div className="grid-puestos">
                        {puestos.map(p => (
                            <div className="card-puesto" key={p.id}>
                                <h3>{p.empresa?.nombre ?? 'Empresa'}</h3>
                                <p className="titulo">{p.descripcion}</p>
                                <p className="salario">₡ {p.salario}</p>
                                <div className="detalle">
                                    <p><strong>Tipo:</strong> {p.tipo}</p>
                                    <p><strong>Estado:</strong> {p.estado}</p>
                                    <p><strong>Fecha:</strong> {p.fecha}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Footer ── */}
            <footer>
                <div className="footer-inner">
                    <div>
                        <strong>Bolsa de Empleo</strong><br />
                        Estudiantes de Ingeniería en Sistemas de la UNA
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        Contacto: info@bolsaempleo.local<br />
                        Créditos: Universidad Nacional de Costa Rica
                    </div>
                </div>
            </footer>
        </>
    );
}

export default App;
