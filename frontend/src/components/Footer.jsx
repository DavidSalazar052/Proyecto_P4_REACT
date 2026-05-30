export default function Footer() {
    return (
        <footer>
            <div className="footer-inner">
                <span><strong>Bolsa de Empleo</strong> &copy; {new Date().getFullYear()}</span>
                <span>Desarrollado con React &amp; Spring Boot</span>
            </div>
        </footer>
    );
}
