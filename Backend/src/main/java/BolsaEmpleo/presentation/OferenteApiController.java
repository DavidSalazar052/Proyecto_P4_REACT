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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/oferente")
public class OferenteApiController {

    @Autowired private Service service;
    @Autowired private UsuarioRepository usuarioRepo;

    private Oferente getOferente(Principal principal) {
        Usuario u = usuarioRepo.findByUsernameOnly(principal.getName());
        return service.oferenteByUsuario(u.getId());
    }

    @GetMapping("/DashboardOferente")
    public ResponseEntity<?> mostrar_DashboardOferente(Principal principal) {
        Oferente oferente = getOferente(principal);
        if (!oferente.isAprobado()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("tipo", "OFE", "estado", "Pendiente de aprobación"));
        }
        return ResponseEntity.ok(Map.of("usuario", usuarioRepo.findByUsernameOnly(principal.getName()), "oferente", oferente));
    }

    @GetMapping("/habilidades")
    public ResponseEntity<?> mostrarHabilidades(Principal principal) {
        Oferente oferente = getOferente(principal);
        List<OferenteHabilidades> habilidades = service.findAll_Oferente_hab().stream()
                .filter(h -> h.getOferente().getId().equals(oferente.getId())).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("usuario", usuarioRepo.findByUsernameOnly(principal.getName()));
        response.put("oferente", oferente);
        response.put("habilidades", habilidades);
        response.put("caracteristicas", service.findAll_Caracteristicas());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/habilidades")
    public ResponseEntity<?> agregarHabilidad(
            @RequestParam Integer caracteristicaId,
            @RequestParam Integer nivel,
            Principal principal) {
        try {
            Oferente oferente = getOferente(principal);
            service.agregarHabilidadOferente(oferente.getId(), caracteristicaId, nivel);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Habilidad agregada"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/habilidades/eliminar")
    public ResponseEntity<?> eliminarHabilidad(@RequestParam Integer habilidadId) {
        service.Oferente_hab_Delete(habilidadId);
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Habilidad eliminada"));
    }

    @GetMapping("/curriculum")
    public ResponseEntity<?> mostrarSubirCV(Principal principal) {
        Oferente oferente = getOferente(principal);
        return ResponseEntity.ok(Map.of(
                "usuario", usuarioRepo.findByUsernameOnly(principal.getName()),
                "tieneCv", oferente.getCurriculum() != null
        ));
    }

    @PostMapping("/curriculum")
    public ResponseEntity<?> subirCV(
            @RequestParam("archivo") MultipartFile archivo,
            Principal principal) {
        if (archivo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "usuario", usuarioRepo.findByUsernameOnly(principal.getName()),
                    "error", "Por favor seleccioná un archivo PDF.",
                    "tieneCv", false
            ));
        }
        try {
            Oferente oferente = getOferente(principal);
            oferente.setCurriculum(archivo.getBytes());
            service.OferentesAdd(oferente);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "CV subido exitosamente"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "usuario", usuarioRepo.findByUsernameOnly(principal.getName()),
                    "error", "Error al leer el archivo: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/curriculum/ver")
    public ResponseEntity<byte[]> verMiCV(Principal principal) {
        Oferente oferente = getOferente(principal);
        if (oferente.getCurriculum() == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"curriculum.pdf\"")
                .body(oferente.getCurriculum());
    }
}