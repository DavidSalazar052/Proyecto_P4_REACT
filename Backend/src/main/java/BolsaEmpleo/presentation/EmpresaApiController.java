package BolsaEmpleo.presentation;

import BolsaEmpleo.data.UsuarioRepository;
import BolsaEmpleo.logic.Base.Empresa;
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

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empresa")
public class EmpresaApiController {

    @Autowired private Service service;
    @Autowired private UsuarioRepository usuarioRepo;

    private Empresa getEmpresa(Principal principal) {
        Usuario u = usuarioRepo.findByUsernameOnly(principal.getName());
        return service.empresaByUsuario(u.getId());
    }

    @GetMapping("/DashboardEmpresa")
    public ResponseEntity<?> mostrar_DashboardEmpresa(Principal principal) {
        Empresa empresa = getEmpresa(principal);
        if (!empresa.isAprobada()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("tipo", "EMP", "estado", "Pendiente de aprobación"));
        }
        return ResponseEntity.ok(Map.of("empresa", empresa));
    }

    @GetMapping("/editar")
    public ResponseEntity<?> mostrar_EditarEmpresa(Principal principal) {
        return ResponseEntity.ok(Map.of("empresa", getEmpresa(principal)));
    }

    @PostMapping("/editar")
    public ResponseEntity<?> guardar_EditarEmpresa(
            @RequestParam String nombre,
            @RequestParam String localizacion,
            @RequestParam String correo,
            @RequestParam String telefono,
            @RequestParam String descripcion,
            Principal principal) {
        try {
            Empresa empresa = getEmpresa(principal);
            empresa.setNombre(nombre); empresa.setLocalizacion(localizacion);
            empresa.setCorreo(correo); empresa.setTelefono(telefono);
            empresa.setDescripcion(descripcion);
            service.empresaUpdate(empresa);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Empresa editada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al guardar: " + e.getMessage(), "empresa", getEmpresa(principal)));
        }
    }

    @GetMapping("/puestos")
    public ResponseEntity<?> mostrar_MisPuestos(Principal principal) {
        Empresa empresa = getEmpresa(principal);
        return ResponseEntity.ok(Map.of("empresa", empresa, "puestos", service.puestosByEmpresa(empresa.getId())));
    }

    @GetMapping("/puestos/nuevo")
    public ResponseEntity<?> mostrar_NuevoPuesto() {
        return ResponseEntity.ok(Map.of("caracteristicas", service.findAll_Caracteristicas()));
    }

    @PostMapping("/puestos/nuevo")
    public ResponseEntity<?> crear_Puesto(
            @RequestParam String descripcion,
            @RequestParam Integer salario,
            @RequestParam String tipo,
            Principal principal) {
        try {
            service.crearPuesto(getEmpresa(principal), descripcion, salario, tipo);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Puesto creado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al crear el puesto: " + e.getMessage(), "caracteristicas", service.findAll_Caracteristicas()));
        }
    }

    @PostMapping("/puestos/habilidad")
    public ResponseEntity<?> agregar_HabilidadPuesto(
            @RequestParam Integer puestoId,
            @RequestParam Integer caracteristicaId,
            @RequestParam Integer nivel) {
        service.agregarHabilidadPuesto(puestoId, caracteristicaId, nivel);
        return ResponseEntity.ok(Map.of("exito", true, "puestoId", puestoId));
    }

    @PostMapping("/puestos/habilidad/eliminar")
    public ResponseEntity<?> eliminar_HabilidadPuesto(
            @RequestParam Integer habilidadId,
            @RequestParam Integer puestoId) {
        service.Puesto_hab_delete(habilidadId);
        return ResponseEntity.ok(Map.of("exito", true, "puestoId", puestoId));
    }

    @GetMapping("/puestos/{id}")
    public ResponseEntity<?> mostrar_DetallePuesto(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        response.put("puesto", service.PuestoRead(id));
        response.put("habilidades", service.habilidadesByPuesto(id));
        response.put("caracteristicas", service.findAll_Caracteristicas());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/puestos/desactivar")
    public ResponseEntity<?> desactivar_Puesto(@RequestParam Integer puestoId) {
        service.desactivarPuesto(puestoId);
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Puesto desactivado"));
    }

    @GetMapping("/candidatos")
    public ResponseEntity<?> mostrar_Candidatos(@RequestParam Integer puestoId) {
        return ResponseEntity.ok(Map.of(
                "puesto", service.PuestoRead(puestoId),
                "candidatos", service.calcularCandidatos(puestoId)
        ));
    }

    @GetMapping("/candidatos/detalle")
    public ResponseEntity<?> mostrar_DetalleOferente(
            @RequestParam Integer oferenteId,
            @RequestParam(required = false) Integer puestoId) {

        Oferente oferente = service.findAll_Oferentes().stream()
                .filter(o -> o.getId().equals(oferenteId)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Oferente no encontrado"));

        List<OferenteHabilidades> habilidades = service.findAll_Oferente_hab().stream()
                .filter(h -> h.getOferente().getId().equals(oferenteId)).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("oferente", oferente);
        response.put("habilidades", habilidades);
        response.put("tieneCv", oferente.getCurriculum() != null);
        response.put("urlVolver", puestoId != null ? "/api/empresa/candidatos?puestoId=" + puestoId : "/api/empresa/puestos");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/candidatos/cv")
    public ResponseEntity<byte[]> verCvOferente(@RequestParam Integer oferenteId) {
        Oferente oferente = service.findAll_Oferentes().stream()
                .filter(o -> o.getId().equals(oferenteId)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Oferente no encontrado"));
        if (oferente.getCurriculum() == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"cv_" + oferente.getNombre() + ".pdf\"")
                .body(oferente.getCurriculum());
    }
}