import { createContext, useState } from 'react';

/**
 * AppProvider — Context global de la app BolsaEmpleo.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  VERSIÓN JWT — diferencias respecto a la versión con sesiones:   ║
 * ║                                                                  ║
 * ║  1. El token JWT se guarda en localStorage al hacer login.       ║
 * ║  2. apiFetch() añade automáticamente el header:                  ║
 * ║       Authorization: Bearer <token>                              ║
 * ║  3. Ya NO se usa credentials: 'include' (no hay cookies).        ║
 * ║  4. Al montar la app, se lee el token de localStorage y se       ║
 * ║     decodifica para restaurar el estado del usuario sin hacer    ║
 * ║     un request adicional al servidor.                            ║
 * ║  5. Logout = simplemente eliminar el token del localStorage.     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const AppContext = createContext();

const BACKEND = 'http://localhost:8080';

// ── Clave usada para guardar el JWT en localStorage ───────────────
const TOKEN_KEY = 'bolsaEmpleo_jwt';

// ── Guarda el token en localStorage ──────────────────────────────
export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

// ── Lee el token desde localStorage ──────────────────────────────
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// ── Elimina el token de localStorage (logout) ────────────────────
export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * decodeJwt — decodifica el payload del JWT sin verificar la firma.
 * Solo para uso en el cliente (mostrar nombre, rol, etc.).
 * La verificación real la hace el backend en cada request.
 */
export function decodeJwt(token) {
    try {
        const payload = token.split('.')[1];
        // atob decodifica base64; reemplazamos caracteres URL-safe
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/**
 * apiFetch — wrapper de fetch que añade el Authorization header automáticamente.
 *
 * Uso:
 *   const res = await apiFetch('/api/empresa/perfil');
 *   const res = await apiFetch('/api/empresa/puestos', { method: 'POST', body: JSON.stringify(data) });
 */
export async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(BACKEND + url, {
        ...options,
        headers,
    });
    return response;
}

/**
 * apiFetchForm — para subir archivos (multipart/form-data).
 * NO incluye Content-Type para que el browser ponga el boundary.
 */
export async function apiFetchForm(url, formData) {
    const token = getToken();
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(BACKEND + url, {
        method: 'POST',
        headers,
        body: formData,
    });
    return response;
}

/**
 * initAuthFromToken — lee el token guardado en localStorage y
 * devuelve el estado inicial de autenticación.
 * Se llama UNA VEZ al montar la app para restaurar la sesión.
 */
function initAuthFromToken() {
    const token = getToken();
    if (!token) {
        return { usuario: null, cargando: false, error: null };
    }
    const claims = decodeJwt(token);
    if (!claims) {
        removeToken();
        return { usuario: null, cargando: false, error: null };
    }
    // Verifica que el token no haya expirado
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp && claims.exp < now) {
        removeToken();
        return { usuario: null, cargando: false, error: null };
    }
    // Token válido: restaura el usuario del payload
    return {
        usuario: {
            username: claims.username || claims.sub,
            rol:      claims.rol || (claims.scope && claims.scope[0]),
        },
        cargando: false,
        error: null,
    };
}

function AppProvider({ children }) {

    // ── Auth ─────────────────────────────────────────────────────────
    // Se inicializa leyendo el token de localStorage (si existe).
    const [authState, setAuthState] = useState(initAuthFromToken);

    // ── Público ──────────────────────────────────────────────────────
    const [publicState, setPublicState] = useState({
        puestosRecientes: [],
        resultadosBusqueda: [],
        caracteristicas: { padres: [], hijos: {} },
    });

    // ── Admin ────────────────────────────────────────────────────────
    const [adminState, setAdminState] = useState({
        empresasPendientes: [],
        oferentesPendientes: [],
        caracteristicas: { todas: [], padres: [], hijos: {} },
        aniosReporte: [],
    });

    // ── Empresa ──────────────────────────────────────────────────────
    const [empresaState, setEmpresaState] = useState({
        perfil: null,
        puestos: [],
        puestoActual: null,
        candidatos: null,
        oferenteDetalle: null,
    });

    // ── Oferente ─────────────────────────────────────────────────────
    const [oferenteState, setOferenteState] = useState({
        perfil: null,
        habilidades: [],
        caracteristicas: [],
        tieneCv: false,
    });

    return (
        <AppContext.Provider value={{
            BACKEND,
            authState,      setAuthState,
            publicState,    setPublicState,
            adminState,     setAdminState,
            empresaState,   setEmpresaState,
            oferenteState,  setOferenteState,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export { AppContext, AppProvider };
