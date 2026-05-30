package BolsaEmpleo.presentation;

import BolsaEmpleo.data.EmpresaRepository;
import BolsaEmpleo.data.OferentesRepository;
import BolsaEmpleo.logic.Base.Empresa;
import BolsaEmpleo.logic.Base.Oferente;
import BolsaEmpleo.logic.Base.Usuario;
import BolsaEmpleo.logic.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class LoginApiController {

    @Autowired private Service service;
    @Autowired private EmpresaRepository empresaRepo;
    @Autowired private OferentesRepository oferenteRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping("/login")
    public ResponseEntity<?> mostrarLogin(@RequestParam(required = false) String error) {
        if (error != null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario o contraseña incorrectos."));
        }
        return ResponseEntity.ok(Map.of("mensaje", "Endpoint de autenticación listo (Usar POST para autenticar)"));
    }

    @GetMapping("/login/empresa")
    public ResponseEntity<?> mostrarRegistroEmpresa() {
        return ResponseEntity.ok(Map.of("mensaje", "Formulario de registro de empresa disponible"));
    }

    @GetMapping("/login/oferente")
    public ResponseEntity<?> mostrarRegistroOferente() {
        return ResponseEntity.ok(Map.of("mensaje", "Formulario de registro de oferente disponible"));
    }

    @PostMapping("/registro/empresa")
    public ResponseEntity<?> registrarEmpresa(
            @RequestParam String username,
            @RequestParam String clave,
            @RequestParam String nombre,
            @RequestParam String localizacion,
            @RequestParam String correo,
            @RequestParam String telefono,
            @RequestParam String descripcion) {
        try {
            if (username.trim().isEmpty() || clave.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El usuario y la contraseña no pueden estar en blanco o contener solo espacios."));
            }

            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setUsername(username);
            nuevoUsuario.setClave(passwordEncoder.encode(clave));
            nuevoUsuario.setTipo("EMP");

            Empresa nuevaEmpresa = new Empresa();
            nuevaEmpresa.setUsuario(nuevoUsuario);
            nuevaEmpresa.setNombre(nombre);
            nuevaEmpresa.setLocalizacion(localizacion);
            nuevaEmpresa.setCorreo(correo);
            nuevaEmpresa.setTelefono(telefono);
            nuevaEmpresa.setDescripcion(descripcion);
            nuevaEmpresa.setAprobada(false);

            service.registrarEmpresa(nuevoUsuario, nuevaEmpresa);

            return ResponseEntity.ok(Map.of("tipo", "EMP", "estado", "Pendiente de aprobación"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al registrar: " + e.getMessage()));
        }
    }

    @PostMapping("/registro/oferente")
    public ResponseEntity<?> registrarOferente(
            @RequestParam String username,
            @RequestParam String clave,
            @RequestParam String nombre,
            @RequestParam String apellido,
            @RequestParam String nacionalidad,
            @RequestParam String telefono,
            @RequestParam String correo,
            @RequestParam String residencia) {
        try {
            if (username.trim().isEmpty() || clave.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El usuario y la contraseña no pueden estar en blanco o contener solo espacios."));
            }

            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setUsername(username);
            nuevoUsuario.setClave(passwordEncoder.encode(clave));
            nuevoUsuario.setTipo("OFE");

            Oferente nuevoOferente = new Oferente();
            nuevoOferente.setUsuario(nuevoUsuario);
            nuevoOferente.setNombre(nombre);
            nuevoOferente.setApellido(apellido);
            nuevoOferente.setNacionalidad(nacionalidad);
            nuevoOferente.setTelefono(telefono);
            nuevoOferente.setCorreo(correo);
            nuevoOferente.setResidencia(residencia);
            nuevoOferente.setAprobado(false);

            service.registrarOferente(nuevoUsuario, nuevoOferente);

            return ResponseEntity.ok(Map.of("tipo", "OFE", "estado", "Pendiente de aprobación"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al registrar: " + e.getMessage()));
        }
    }
}