import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppProvider, AppContext } from './AppProvider.jsx';

// ── Páginas públicas ─────────────────────────────────────────────────
import Login            from './pages/auth/Login.jsx';
import RegistroEmpresa  from './pages/auth/RegistroEmpresa.jsx';
import RegistroOferente from './pages/auth/RegistroOferente.jsx';
import PendienteAprobacion from './pages/auth/PendienteAprobacion.jsx';
import Inicio           from './pages/public/Inicio.jsx';
import BuscaPuesto      from './pages/public/BuscaPuesto.jsx';

// ── Páginas Admin ────────────────────────────────────────────────────
import DashboardAdmin       from './pages/admin/DashboardAdmin.jsx';
import EmpresasPendientes   from './pages/admin/EmpresasPendientes.jsx';
import OferentesPendientes  from './pages/admin/OferentesPendientes.jsx';
import AdminCaracteristicas from './pages/admin/AdminCaracteristicas.jsx';
import AdminReportes        from './pages/admin/AdminReportes.jsx';

// ── Páginas Empresa ──────────────────────────────────────────────────
import DashboardEmpresa from './pages/empresa/DashboardEmpresa.jsx';
import EditarEmpresa    from './pages/empresa/EditarEmpresa.jsx';
import MisPuestos       from './pages/empresa/MisPuestos.jsx';
import NuevoPuesto      from './pages/empresa/NuevoPuesto.jsx';
import DetallePuesto    from './pages/empresa/DetallePuesto.jsx';
import Candidatos       from './pages/empresa/Candidatos.jsx';
import DetalleOferente  from './pages/empresa/DetalleOferente.jsx';

// ── Páginas Oferente ─────────────────────────────────────────────────
import DashboardOferente from './pages/oferente/DashboardOferente.jsx';
import MisHabilidades    from './pages/oferente/MisHabilidades.jsx';
import SubirCV           from './pages/oferente/SubirCV.jsx';

/**
 * ProtectedRoute — redirige si el rol no coincide.
 *
 * Con JWT no necesitamos llamar a /api/auth/me al montar:
 * el AppProvider ya restaura el estado desde localStorage.
 * Por eso se eliminó el useEffect que hacía ese request.
 */
function ProtectedRoute({ rol, children }) {
    const { authState } = useContext(AppContext);
    if (authState.cargando) return <p>Cargando...</p>;
    if (!authState.usuario) return <Navigate to="/login" replace />;
    if (rol && authState.usuario.rol !== rol) return <Navigate to="/" replace />;
    return children;
}

/**
 * AppRoutes — rutas de la aplicación.
 *
 * NOTA JWT: Ya no hay useEffect aquí para verificar sesión.
 * El AppProvider se encarga de leer el token de localStorage
 * y restaurar authState al inicializar.
 */
function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ── Públicas ───────────────────────────────────────────── */}
                <Route path="/"              element={<Inicio />} />
                <Route path="/buscar"        element={<BuscaPuesto />} />
                <Route path="/login"         element={<Login />} />
                <Route path="/registro/empresa"  element={<RegistroEmpresa />} />
                <Route path="/registro/oferente" element={<RegistroOferente />} />
                <Route path="/pendiente"     element={<PendienteAprobacion />} />

                {/* ── Admin ──────────────────────────────────────────────── */}
                <Route path="/admin" element={<ProtectedRoute rol="ADM"><DashboardAdmin /></ProtectedRoute>} />
                <Route path="/admin/empresas"        element={<ProtectedRoute rol="ADM"><EmpresasPendientes /></ProtectedRoute>} />
                <Route path="/admin/oferentes"       element={<ProtectedRoute rol="ADM"><OferentesPendientes /></ProtectedRoute>} />
                <Route path="/admin/caracteristicas" element={<ProtectedRoute rol="ADM"><AdminCaracteristicas /></ProtectedRoute>} />
                <Route path="/admin/reportes"        element={<ProtectedRoute rol="ADM"><AdminReportes /></ProtectedRoute>} />

                {/* ── Empresa ────────────────────────────────────────────── */}
                <Route path="/empresa"           element={<ProtectedRoute rol="EMP"><DashboardEmpresa /></ProtectedRoute>} />
                <Route path="/empresa/editar"    element={<ProtectedRoute rol="EMP"><EditarEmpresa /></ProtectedRoute>} />
                <Route path="/empresa/puestos"   element={<ProtectedRoute rol="EMP"><MisPuestos /></ProtectedRoute>} />
                <Route path="/empresa/puestos/nuevo" element={<ProtectedRoute rol="EMP"><NuevoPuesto /></ProtectedRoute>} />
                <Route path="/empresa/puestos/:id"   element={<ProtectedRoute rol="EMP"><DetallePuesto /></ProtectedRoute>} />
                <Route path="/empresa/candidatos/:puestoId" element={<ProtectedRoute rol="EMP"><Candidatos /></ProtectedRoute>} />
                <Route path="/empresa/candidatos/:puestoId/oferente/:oferenteId"
                       element={<ProtectedRoute rol="EMP"><DetalleOferente /></ProtectedRoute>} />

                {/* ── Oferente ───────────────────────────────────────────── */}
                <Route path="/oferente"             element={<ProtectedRoute rol="OFE"><DashboardOferente /></ProtectedRoute>} />
                <Route path="/oferente/habilidades" element={<ProtectedRoute rol="OFE"><MisHabilidades /></ProtectedRoute>} />
                <Route path="/oferente/curriculum"  element={<ProtectedRoute rol="OFE"><SubirCV /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return (
        <AppProvider>
            <AppRoutes />
        </AppProvider>
    );
}

export default App;
