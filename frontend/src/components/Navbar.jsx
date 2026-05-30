export default function Navbar({ transparent = false }) {
    return (
        <nav className="navbar-custom">
            <div className="navbar-inner">
                <a href="/public" className="navbar-brand">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/86/86155.png"
                        alt="icono"
                        style={{ width: 36, height: 36, filter: 'brightness(0) invert(1)' }}
                    />
                    <strong>Bolsa de Empleo</strong>
                </a>
                <div className="navbar-links">
                    <a className="nav-link" href="/public">Inicio</a>
                    <a className="nav-link" href="/buscar">Buscar Puestos</a>
                    <a className="nav-link-login" href="/login">Iniciar sesión</a>
                </div>
            </div>
        </nav>
    );
}
