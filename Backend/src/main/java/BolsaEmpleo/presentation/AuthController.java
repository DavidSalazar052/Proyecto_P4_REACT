package BolsaEmpleo.presentation;

import BolsaEmpleo.data.UsuarioRepository;
import BolsaEmpleo.logic.Base.Empresa;
import BolsaEmpleo.logic.Base.Oferente;
import BolsaEmpleo.logic.Base.Usuario;
import BolsaEmpleo.logic.Service;
import BolsaEmpleo.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  AuthController — versión JWT                                    ║
 * ║                                                                  ║
 * ║  RUTAS:                                                          ║
 * ║    POST /api/auth/login              → devuelve JWT              ║
 * ║    POST /api/auth/registro/empresa   → registrar empresa         ║
 * ║    POST /api/auth/registro/oferente  → registrar oferente        ║
 * ║                                                                  ║
 * ║  NOTAS vs versión con sesiones:                                  ║
 * ║  - Ya NO existe /api/auth/logout (el cliente simplemente         ║
 * ║    elimina el token del localStorage).                           ║
 * ║  - Ya NO existe /api/auth/me (el frontend decodifica el JWT).    ║
 * ║  - El login usa AuthenticationManager para validar credenciales  ║
 * ║    y luego TokenService para generar el token.                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private Service          service;
    @Autowired private PasswordEncoder  passwordEncoder;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private TokenService     tokenService;
    @Autowired private AuthenticationManager authenticationManager;

    // ── POST /api/auth/login ─────────────────────────────────────────
    //
    // Request body (JSON):
    // { "username": "empresa1", "clave": "pass123" }
    //
    // Response 200:
    // {
    //   "token":    "eyJhbGciOiJIUzI1NiJ9...",
    //   "rol":      "EMP",
    //   "username": "empresa1"
    // }
    //
    // Response 401:
    // { "error": "Usuario o contraseña incorrectos." }
    //
    // El frontend almacena el token en localStorage y lo envía en
    // cada request con: Authorization: Bearer <token>
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String clave    = body.get("clave");

            // Valida credenciales usando Spring Security
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, clave)
            );

            // Carga el usuario de la BD para generar el token con su rol
            Usuario usuario = usuarioRepo.findByUsernameOnly(username);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Usuario no encontrado."));
            }

            String token = tokenService.generateToken(usuario);

            return ResponseEntity.ok(Map.of(
                    "token",    token,
                    "rol",      usuario.getTipo(),
                    "username", usuario.getUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Usuario o contraseña incorrectos."));
        }
    }

    // ── POST /api/auth/registro/empresa ──────────────────────────────
    //
    // Request body (JSON):
    // {
    //   "username":    "empresa1",
    //   "clave":       "pass123",
    //   "nombre":      "Empresa SA",
    //   "localizacion":"San José",
    //   "correo":      "info@empresa.com",
    //   "telefono":    "88001122",
    //   "descripcion": "Empresa de tecnología"
    // }
    //
    // Response 201: { "mensaje": "Empresa registrada. Pendiente de aprobación." }
    // Response 409: { "error": "El nombre de usuario ya está en uso." }
    @PostMapping("/registro/empresa")
    public ResponseEntity<?> registrarEmpresa(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String clave    = body.get("clave");

            if (username == null || username.isBlank() || clave == null || clave.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El usuario y la contraseña no pueden estar en blanco."));
            }

            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setUsername(username);
            nuevoUsuario.setClave(passwordEncoder.encode(clave));
            nuevoUsuario.setTipo("EMP");

            Empresa nuevaEmpresa = new Empresa();
            nuevaEmpresa.setUsuario(nuevoUsuario);
            nuevaEmpresa.setNombre(body.get("nombre"));
            nuevaEmpresa.setLocalizacion(body.get("localizacion"));
            nuevaEmpresa.setCorreo(body.get("correo"));
            nuevaEmpresa.setTelefono(body.get("telefono"));
            nuevaEmpresa.setDescripcion(body.get("descripcion"));
            nuevaEmpresa.setAprobada(false);

            service.registrarEmpresa(nuevoUsuario, nuevaEmpresa);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Empresa registrada. Pendiente de aprobación."));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al registrar: " + e.getMessage()));
        }
    }

    // ── POST /api/auth/registro/oferente ─────────────────────────────
    //
    // Request body (JSON):
    // {
    //   "username":    "oferente1",
    //   "clave":       "pass123",
    //   "nombre":      "Juan",
    //   "apellido":    "Pérez",
    //   "nacionalidad":"Costarricense",
    //   "telefono":    "88001122",
    //   "correo":      "juan@mail.com",
    //   "residencia":  "San José"
    // }
    //
    // Response 201: { "mensaje": "Oferente registrado. Pendiente de aprobación." }
    // Response 409: { "error": "El nombre de usuario ya está en uso." }
    @PostMapping("/registro/oferente")
    public ResponseEntity<?> registrarOferente(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String clave    = body.get("clave");

            if (username == null || username.isBlank() || clave == null || clave.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El usuario y la contraseña no pueden estar en blanco."));
            }

            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setUsername(username);
            nuevoUsuario.setClave(passwordEncoder.encode(clave));
            nuevoUsuario.setTipo("OFE");

            Oferente nuevoOferente = new Oferente();
            nuevoOferente.setUsuario(nuevoUsuario);
            nuevoOferente.setNombre(body.get("nombre"));
            nuevoOferente.setApellido(body.get("apellido"));
            nuevoOferente.setNacionalidad(body.get("nacionalidad"));
            nuevoOferente.setTelefono(body.get("telefono"));
            nuevoOferente.setCorreo(body.get("correo"));
            nuevoOferente.setResidencia(body.get("residencia"));
            nuevoOferente.setAprobado(false);

            service.registrarOferente(nuevoUsuario, nuevoOferente);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Oferente registrado. Pendiente de aprobación."));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al registrar: " + e.getMessage()));
        }
    }
}
