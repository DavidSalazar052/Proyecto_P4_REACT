package BolsaEmpleo.security;

import BolsaEmpleo.data.UsuarioRepository;
import BolsaEmpleo.logic.Base.Usuario;
import BolsaEmpleo.security.JwtConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * SecurityConfig adaptada para JWT (stateless).
 *
 * Cambios clave respecto a la versión con sesiones:
 *  - SessionCreationPolicy.STATELESS → no se crean sesiones HTTP.
 *  - oauth2ResourceServer JWT → cada request debe incluir
 *    el header: Authorization: Bearer <token>
 *  - Los roles se mapean como SCOPE_ADM, SCOPE_EMP, SCOPE_OFE
 *    porque Spring Security añade el prefijo "SCOPE_" al claim "scope".
 *  - El login ahora está en AuthController y devuelve el token JWT
 *    en vez de manejarse por Spring Security formLogin.
 *  - CORS ya no requiere allowCredentials(true) porque no hay cookies.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UsuarioRepository usuarioRepository;
    private final JwtConfig jwtConfig;

    public SecurityConfig(UsuarioRepository usuarioRepository, JwtConfig jwtConfig) {
        this.usuarioRepository = usuarioRepository;
        this.jwtConfig = jwtConfig;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            // ── STATELESS: sin sesiones HTTP ──────────────────────────────
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ── Rutas públicas ──────────────────────────────────────
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/registro/empresa",
                                "/api/auth/registro/oferente",
                                "/api/public/**",
                                "/api/root/**"          // ← agregar esta línea
                        ).permitAll()
                        // ── Admin ───────────────────────────────────────────────
                        .requestMatchers("/api/admin/**").hasAuthority("SCOPE_ADM")
                        // ── Empresa ─────────────────────────────────────────────
                        .requestMatchers("/api/empresa/**").hasAuthority("SCOPE_EMP")
                        // ── Oferente ────────────────────────────────────────────
                        .requestMatchers("/api/oferente/**").hasAuthority("SCOPE_OFE")
                        .anyRequest().authenticated()
            )
            // ── JWT Resource Server: valida el Bearer token en cada request ──
            .oauth2ResourceServer(configurer ->
                    configurer.jwt(Customizer.withDefaults()));

        return http.build();
    }

    /**
     * CORS: React puede hacer requests desde localhost:5173.
     * Con JWT no necesitamos allowCredentials(true) ni cookies.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * JwtDecoder: valida la firma del token JWT usando la clave secreta.
     * Spring Security lo usa automáticamente en oauth2ResourceServer.
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(jwtConfig.getSecretKey()).build();
    }

    /**
     * UserDetailsService: carga el usuario de la BD para autenticación
     * en el endpoint de login (AuthenticationManager lo usa).
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            Usuario usuario = usuarioRepository.findByUsernameOnly(username);
            if (usuario == null)
                throw new UsernameNotFoundException("Usuario no encontrado: " + username);
            return User.builder()
                    .username(usuario.getUsername())
                    .password(usuario.getClave())
                    .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getTipo())))
                    .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
