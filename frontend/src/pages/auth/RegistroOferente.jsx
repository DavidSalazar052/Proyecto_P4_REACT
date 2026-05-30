import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { apiFetch } from '../../AppProvider.jsx';

const camposIniciales = {
    username: '', clave: '', nombre: '', apellido: '',
    nacionalidad: '', telefono: '', correo: '', residencia: ''
};

export default function RegistroOferente() {
    const navigate = useNavigate();
    const [form, setForm] = useState(camposIniciales);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);
    const [cargando, setCargando] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setCargando(true);
        setError(null);
        try {
            const res = await apiFetch('/api/auth/registro/oferente', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Error al registrar.'); return; }
            setExito(data.mensaje);
            setTimeout(() => navigate('/pendiente'), 2000);
        } catch {
            setError('Error de conexión.');
        } finally {
            setCargando(false);
        }
    };

    const campos = [
        { name: 'username', label: 'Usuario', type: 'text', placeholder: 'Nombre de usuario' },
        { name: 'clave', label: 'Contraseña', type: 'password', placeholder: 'Contraseña' },
        { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Juan' },
        { name: 'apellido', label: 'Apellido', type: 'text', placeholder: 'Pérez' },
        { name: 'nacionalidad', label: 'Nacionalidad', type: 'text', placeholder: 'Costarricense' },
        { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: '88001122' },
        { name: 'correo', label: 'Correo electrónico', type: 'email', placeholder: 'juan@mail.com' },
        { name: 'residencia', label: 'Residencia', type: 'text', placeholder: 'Heredia' },
    ];

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Registro de Oferente</h2>
                {error && <div style={styles.error}>{error}</div>}
                {exito && <div style={styles.exito}>{exito}</div>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    {campos.map(f => (
                        <div key={f.name} style={styles.field}>
                            <label style={styles.label}>{f.label}</label>
                            <input
                                style={styles.input}
                                name={f.name}
                                type={f.type}
                                value={form[f.name]}
                                onChange={handleChange}
                                placeholder={f.placeholder}
                                required
                            />
                        </div>
                    ))}
                    <button style={styles.btn} type="submit" disabled={cargando}>
                        {cargando ? 'Registrando...' : 'Registrar oferente'}
                    </button>
                </form>
                <div style={styles.links}>
                    <Link to="/login">Ya tengo cuenta</Link>
                    {' · '}
                    <Link to="/">← Inicio</Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: '2rem 1rem' },
    card: { background: '#fff', borderRadius: 12, padding: '2.5rem 2rem', width: '100%', maxWidth: 480, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' },
    title: { textAlign: 'center', color: '#1e3a8a', marginBottom: '1.5rem' },
    error: { background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: 14 },
    exito: { background: '#dcfce7', color: '#16a34a', borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: 14 },
    form: { display: 'flex', flexDirection: 'column', gap: 12 },
    field: { display: 'flex', flexDirection: 'column', gap: 4 },
    label: { fontWeight: 600, color: '#374151', fontSize: 14 },
    input: { padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 },
    btn: { marginTop: 8, padding: '0.75rem', borderRadius: 8, background: '#1e3a8a', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' },
    links: { marginTop: '1rem', textAlign: 'center', fontSize: 14 },
};
