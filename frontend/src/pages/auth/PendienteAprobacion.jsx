import { Link } from 'react-router';

export default function PendienteAprobacion() {
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.icon}>⏳</div>
                <h2 style={styles.title}>Cuenta pendiente de aprobación</h2>
                <p style={styles.texto}>
                    Tu cuenta ha sido registrada exitosamente. Un administrador debe aprobarla
                    antes de que puedas iniciar sesión. Esto puede tomar algunas horas.
                </p>
                <Link to="/login" style={styles.btn}>Ir al inicio de sesión</Link>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
    card: { background: '#fff', borderRadius: 12, padding: '3rem 2rem', maxWidth: 420, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' },
    icon: { fontSize: 56, marginBottom: '1rem' },
    title: { color: '#1e3a8a', marginBottom: '1rem' },
    texto: { color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' },
    btn: { display: 'inline-block', background: '#1e3a8a', color: '#fff', borderRadius: 8, padding: '0.75rem 1.5rem', textDecoration: 'none', fontWeight: 700 },
};
