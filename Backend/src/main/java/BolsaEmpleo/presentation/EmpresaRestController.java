package BolsaEmpleo.presentation;

import BolsaEmpleo.data.UsuarioRepository;
import BolsaEmpleo.logic.Base.Empresa;
import BolsaEmpleo.logic.Base.Oferente;
import BolsaEmpleo.logic.Base.Usuario;
import BolsaEmpleo.logic.OferenteHabilidades;
import BolsaEmpleo.logic.Puesto;
import BolsaEmpleo.logic.PuestoHabilidades;
import BolsaEmpleo.logic.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  EmpresaRestController  (antes: EmpresaController)              ║
 * ║  Protegido por hasRole("EMP") vía SecurityConfig.               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * RUTAS:
 *  GET  /api/empresa/perfil                         → datos de la empresa logueada
 *  PUT  /api/empresa/perfil                         → editar empresa
 *  GET  /api/empresa/puestos                        → mis puestos
 *  POST /api/empresa/puestos                        → crear puesto
 *  GET  /api/empresa/puestos/{id}                   → detalle de un puesto
 *  POST /api/empresa/puestos/{id}/desactivar        → desactivar puesto
 *  POST /api/empresa/puestos/{id}/habilidades       → agregar habilidad a puesto
 *  DELETE /api/empresa/puestos/habilidades/{habId}  → eliminar habilidad de puesto
 *  GET  /api/empresa/candidatos/{puestoId}          → candidatos rankeados
 *  GET  /api/empresa/candidatos/{puestoId}/oferente/{oferenteId} → detalle oferente
 *  GET  /api/empresa/candidatos/cv/{oferenteId}     → descargar CV (PDF bytes)
 */
@RestController
@RequestMapping("/api/empresa")
public class EmpresaRestController {

    @Autowired private Service           service;
    @Autowired private UsuarioRepository usuarioRepo;

    // Helper: obtiene la Empresa del usuario autenticado
    private Empresa getEmpresa(Principal principal) {
        Usuario u = usuarioRepo.findByUsernameOnly(principal.getName());
        return service.empresaByUsuario(u.getId());
    }

    // ── GET /api/empresa/perfil ──────────────────────────────────────
    //
    // Response 200:
    // {
    //   "id": 1, "nombre": "TechCR", "localizacion": "SJ",
    //   "correo": "info@tech.com", "telefono": "88001122",
    //   "descripcion": "...", "aprobada": true
    // }
    // Response 403: { "error": "Empresa pendiente de aprobación." }
    @GetMapping("/perfil")
    public ResponseEntity<?> perfil(Principal principal) {
        Empresa empresa = getEmpresa(principal);
        if (!empresa.isAprobada()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Empresa pendiente de aprobación.", "estado", "PENDIENTE"));
        }
        return ResponseEntity.ok(empresa);
    }

    // ── PUT /api/empresa/perfil ──────────────────────────────────────
    //
    // Request body (JSON):
    // {
    //   "nombre": "NuevoNombre", "localizacion": "Alajuela",
    //   "correo": "nuevo@mail.com", "telefono": "70001122",
    //   "descripcion": "Nueva descripción"
    // }
    //
    // Response 200: { "mensaje": "Empresa actualizada." }
    // Response 400: { "error": "..." }
    @PutMapping("/perfil")
    public ResponseEntity<?> actualizarPerfil(
            @RequestBody Map<String, String> body,
            Principal principal) {
        try {
            Empresa empresa = getEmpresa(principal);
            empresa.setNombre(body.get("nombre"));
            empresa.setLocalizacion(body.get("localizacion"));
            empresa.setCorreo(body.get("correo"));
            empresa.setTelefono(body.get("telefono"));
            empresa.setDescripcion(body.get("descripcion"));
            service.empresaUpdate(empresa);
            return ResponseEntity.ok(Map.of("mensaje", "Empresa actualizada."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/empresa/puestos ─────────────────────────────────────
    //
    // Response 200:
    // [
    //   {
    //     "id": 10, "descripcion": "Dev Backend", "salario": 1500000,
    //     "tipo": "PUBLICO", "estado": "ACTIVO", "fecha": "2025-05-01",
    //     "empresa": { "id": 1, "nombre": "TechCR", ... }
    //   }, ...
    // ]
    @GetMapping("/puestos")
    public ResponseEntity<List<Puesto>> misPuestos(Principal principal) {
        Empresa empresa = getEmpresa(principal);
        return ResponseEntity.ok(service.puestosByEmpresa(empresa.getId()));
    }

    // ── POST /api/empresa/puestos ────────────────────────────────────
    //
    // Request body (JSON):
    // { "descripcion": "Dev Backend", "salario": 1500000, "tipo": "PUBLICO" }
    //
    // Response 201: { "mensaje": "Puesto creado." }
    // Response 400: { "error": "..." }
    @PostMapping("/puestos")
    public ResponseEntity<?> crearPuesto(
            @RequestBody Map<String, Object> body,
            Principal principal) {
        try {
            Empresa empresa     = getEmpresa(principal);
            String  descripcion = (String) body.get("descripcion");
            Integer salario     = Integer.valueOf(body.get("salario").toString());
            String  tipo        = (String) body.get("tipo");
            service.crearPuesto(empresa, descripcion, salario, tipo);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Puesto creado."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/empresa/puestos/{id} ────────────────────────────────
    //
    // Response 200: { "id":10, "descripcion":"...", habilidades:[...], ... }
    // Note: habilidades son PuestoHabilidades (id, nivel, habilidad:{id,nombre})
    @GetMapping("/puestos/{id}")
    public ResponseEntity<?> detallePuesto(@PathVariable Integer id) {
        try {
            Puesto              puesto     = service.PuestoRead(id);
            List<PuestoHabilidades> habs   = service.habilidadesByPuesto(id);
            return ResponseEntity.ok(Map.of("puesto", puesto, "habilidades", habs,
                    "caracteristicas", service.findAll_Caracteristicas()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/empresa/puestos/{id}/desactivar ────────────────────
    //
    // Response 200: { "mensaje": "Puesto desactivado." }
    @PostMapping("/puestos/{id}/desactivar")
    public ResponseEntity<?> desactivarPuesto(@PathVariable Integer id) {
        try {
            service.desactivarPuesto(id);
            return ResponseEntity.ok(Map.of("mensaje", "Puesto desactivado."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/empresa/puestos/{id}/habilidades ───────────────────
    //
    // Request body (JSON):
    // { "caracteristicaId": 3, "nivel": 2 }
    //
    // Response 201: { "mensaje": "Habilidad agregada." }
    @PostMapping("/puestos/{id}/habilidades")
    public ResponseEntity<?> agregarHabilidad(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        try {
            Integer caracteristicaId = Integer.valueOf(body.get("caracteristicaId").toString());
            Integer nivel            = Integer.valueOf(body.get("nivel").toString());
            service.agregarHabilidadPuesto(id, caracteristicaId, nivel);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Habilidad agregada."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── DELETE /api/empresa/puestos/habilidades/{habId} ─────────────
    //
    // Response 200: { "mensaje": "Habilidad eliminada." }
    @DeleteMapping("/puestos/habilidades/{habId}")
    public ResponseEntity<?> eliminarHabilidad(@PathVariable Integer habId) {
        service.Puesto_hab_delete(habId);
        return ResponseEntity.ok(Map.of("mensaje", "Habilidad eliminada."));
    }

    // ── GET /api/empresa/candidatos/{puestoId} ───────────────────────
    //
    // Response 200:
    // {
    //   "puesto": { "id":10, "descripcion":"Dev Backend", ... },
    //   "candidatos": [
    //     {
    //       "oferente": { "id":5, "nombre":"Juan", "apellido":"Pérez", ... },
    //       "requisitosTotal": 3,
    //       "requisitosCumplidos": 2,
    //       "porcentaje": 66.67
    //     }, ...
    //   ]
    // }
    @GetMapping("/candidatos/{puestoId}")
    public ResponseEntity<?> candidatos(@PathVariable Integer puestoId) {
        try {
            Puesto puesto = service.PuestoRead(puestoId);
            List<Service.ResultadoCandidato> candidatos = service.calcularCandidatos(puestoId);
            return ResponseEntity.ok(Map.of("puesto", puesto, "candidatos", candidatos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/empresa/candidatos/{puestoId}/oferente/{oferenteId} ─
    //
    // Response 200:
    // {
    //   "oferente": { "id":5, "nombre":"Juan", "apellido":"Pérez", ... },
    //   "habilidades": [ { "id":1, "nivel":3, "caracteristicas":{"id":2,"nombre":"Java"} }, ... ],
    //   "tieneCv": true
    // }
    @GetMapping("/candidatos/{puestoId}/oferente/{oferenteId}")
    public ResponseEntity<?> detalleOferente(
            @PathVariable Integer puestoId,
            @PathVariable Integer oferenteId) {
        try {
            Oferente oferente = service.findAll_Oferentes().stream()
                    .filter(o -> o.getId().equals(oferenteId)).findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Oferente no encontrado"));
            List<OferenteHabilidades> habilidades = service.findAll_Oferente_hab().stream()
                    .filter(h -> h.getOferente().getId().equals(oferenteId)).toList();
            return ResponseEntity.ok(Map.of(
                    "oferente",   oferente,
                    "habilidades", habilidades,
                    "tieneCv",    oferente.getCurriculum() != null
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/empresa/candidatos/cv/{oferenteId} ──────────────────
    //
    // Devuelve el PDF del CV directamente (bytes).
    // React lo abre con: window.open('/api/empresa/candidatos/cv/5')
    @GetMapping("/candidatos/cv/{oferenteId}")
    public ResponseEntity<byte[]> cvOferente(@PathVariable Integer oferenteId) {
        Oferente oferente = service.findAll_Oferentes().stream()
                .filter(o -> o.getId().equals(oferenteId)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Oferente no encontrado"));
        if (oferente.getCurriculum() == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"cv_" + oferente.getNombre() + ".pdf\"")
                .body(oferente.getCurriculum());
    }
}
