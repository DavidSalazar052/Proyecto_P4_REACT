package BolsaEmpleo.presentation;

import BolsaEmpleo.data.UsuarioRepository;
import BolsaEmpleo.logic.Base.Oferente;
import BolsaEmpleo.logic.Base.Usuario;
import BolsaEmpleo.logic.OferenteHabilidades;
import BolsaEmpleo.logic.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  OferenteRestController  (antes: OferenteController)           ║
 * ║  Protegido por hasRole("OFE") vía SecurityConfig.               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * RUTAS:
 *  GET  /api/oferente/perfil                   → datos del oferente logueado
 *  GET  /api/oferente/habilidades              → mis habilidades
 *  POST /api/oferente/habilidades              → agregar/actualizar habilidad
 *  DELETE /api/oferente/habilidades/{id}       → eliminar habilidad
 *  GET  /api/oferente/curriculum               → ¿tengo CV subido?
 *  POST /api/oferente/curriculum               → subir CV (multipart)
 *  GET  /api/oferente/curriculum/ver           → descargar CV (PDF bytes)
 */
@RestController
@RequestMapping("/api/oferente")
public class OferenteRestController {

    @Autowired private Service           service;
    @Autowired private UsuarioRepository usuarioRepo;

    // Helper: obtiene el Oferente del usuario autenticado
    private Oferente getOferente(Principal principal) {
        Usuario u = usuarioRepo.findByUsernameOnly(principal.getName());
        return service.oferenteByUsuario(u.getId());
    }

    // ── GET /api/oferente/perfil ─────────────────────────────────────
    //
    // Response 200:
    // {
    //   "id": 5, "nombre": "Juan", "apellido": "Pérez",
    //   "nacionalidad": "CR", "telefono": "88001122",
    //   "correo": "juan@mail.com", "residencia": "Heredia",
    //   "aprobado": true
    // }
    // Response 403: { "error": "Oferente pendiente de aprobación.", "estado": "PENDIENTE" }
    @GetMapping("/perfil")
    public ResponseEntity<?> perfil(Principal principal) {
        Oferente oferente = getOferente(principal);
        if (!oferente.isAprobado()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Oferente pendiente de aprobación.", "estado", "PENDIENTE"));
        }
        return ResponseEntity.ok(oferente);
    }

    // ── GET /api/oferente/habilidades ────────────────────────────────
    //
    // Response 200:
    // {
    //   "habilidades": [
    //     { "id": 1, "nivel": 3, "caracteristicas": { "id": 2, "nombre": "Java" } },
    //     ...
    //   ],
    //   "caracteristicas": [
    //     { "id": 1, "nombre": "Programación", "padre": null },
    //     { "id": 2, "nombre": "Java", "padre": { "id": 1, "nombre": "Programación" } },
    //     ...
    //   ]
    // }
    @GetMapping("/habilidades")
    public ResponseEntity<?> misHabilidades(Principal principal) {
        Oferente oferente = getOferente(principal);
        List<OferenteHabilidades> habilidades = service.findAll_Oferente_hab().stream()
                .filter(h -> h.getOferente().getId().equals(oferente.getId())).toList();
        return ResponseEntity.ok(Map.of(
                "habilidades",    habilidades,
                "caracteristicas", service.findAll_Caracteristicas()
        ));
    }

    // ── POST /api/oferente/habilidades ───────────────────────────────
    //
    // Request body (JSON):
    // { "caracteristicaId": 2, "nivel": 3 }
    //
    // Response 201: { "mensaje": "Habilidad guardada." }
    // Response 400: { "error": "..." }
    @PostMapping("/habilidades")
    public ResponseEntity<?> agregarHabilidad(
            @RequestBody Map<String, Object> body,
            Principal principal) {
        try {
            Oferente oferente        = getOferente(principal);
            Integer  caracteristicaId = Integer.valueOf(body.get("caracteristicaId").toString());
            Integer  nivel            = Integer.valueOf(body.get("nivel").toString());
            service.agregarHabilidadOferente(oferente.getId(), caracteristicaId, nivel);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Habilidad guardada."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── DELETE /api/oferente/habilidades/{id} ────────────────────────
    //
    // Response 200: { "mensaje": "Habilidad eliminada." }
    @DeleteMapping("/habilidades/{id}")
    public ResponseEntity<?> eliminarHabilidad(@PathVariable Integer id) {
        service.Oferente_hab_Delete(id);
        return ResponseEntity.ok(Map.of("mensaje", "Habilidad eliminada."));
    }

    // ── GET /api/oferente/curriculum ─────────────────────────────────
    //
    // Response 200: { "tieneCv": true }
    @GetMapping("/curriculum")
    public ResponseEntity<?> estadoCurriculum(Principal principal) {
        Oferente oferente = getOferente(principal);
        return ResponseEntity.ok(Map.of("tieneCv", oferente.getCurriculum() != null));
    }

    // ── POST /api/oferente/curriculum ────────────────────────────────
    //
    // Request: multipart/form-data con campo "archivo" (PDF)
    //
    // Response 200: { "mensaje": "Currículum subido correctamente." }
    // Response 400: { "error": "Por favor seleccioná un archivo PDF." }
    @PostMapping(value = "/curriculum", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirCurriculum(
            @RequestParam("archivo") MultipartFile archivo,
            Principal principal) {
        if (archivo.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Por favor seleccioná un archivo PDF."));
        }
        try {
            Oferente oferente = getOferente(principal);
            oferente.setCurriculum(archivo.getBytes());
            service.OferentesAdd(oferente);
            return ResponseEntity.ok(Map.of("mensaje", "Currículum subido correctamente."));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al leer el archivo: " + e.getMessage()));
        }
    }

    // ── GET /api/oferente/curriculum/ver ─────────────────────────────
    //
    // Devuelve el PDF del CV directamente (bytes).
    // React lo abre con: window.open('/api/oferente/curriculum/ver')
    @GetMapping("/curriculum/ver")
    public ResponseEntity<byte[]> verCurriculum(Principal principal) {
        Oferente oferente = getOferente(principal);
        if (oferente.getCurriculum() == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"curriculum.pdf\"")
                .body(oferente.getCurriculum());
    }
}
