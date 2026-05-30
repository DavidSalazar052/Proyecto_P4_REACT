package BolsaEmpleo;

import BolsaEmpleo.data.UsuarioRepository;
import BolsaEmpleo.logic.Base.Usuario;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UsuarioRepository usuarioRepository;

    public SecurityConfig(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/buscaPuesto",
                                "/login",
                                "/login/empresa",
                                "/login/oferente",
                                "/registro/empresa",
                                "/registro/oferente",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/api/**"
                        ).permitAll()
                        .requestMatchers(
                                "/DashboardAdministrador",
                                "/EmpresasPendientes",
                                "/OferentesPendientes",
                                "/AdminCaracteristicas",
                                "/admin/**"
                        ).hasRole("ADM")
                        .requestMatchers(
                                "/DashboardEmpresa",
                                "/empresa/**"
                        ).hasRole("EMP")
                        .requestMatchers(
                                "/DashboardOferente",
                                "/oferente/**"
                        ).hasRole("OFE")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/login")
                        .usernameParameter("username")
                        .passwordParameter("clave")
                        .successHandler((request, response, authentication) -> {
                            String role = authentication.getAuthorities().iterator()
                                    .next().getAuthority();
                            switch (role) {
                                case "ROLE_ADM" -> response.sendRedirect("/DashboardAdministrador");
                                case "ROLE_EMP" -> response.sendRedirect("/DashboardEmpresa");
                                case "ROLE_OFE" -> response.sendRedirect("/DashboardOferente");
                                default         -> response.sendRedirect("/");
                            }
                        })
                        .failureUrl("/login?error=true")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .permitAll()
                )
                .csrf(csrf -> csrf.disable());

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            Usuario usuario = usuarioRepository.findByUsernameOnly(username);
            if (usuario == null) {
                throw new UsernameNotFoundException("Usuario no encontrado: " + username);
            }
            return User.builder()
                    .username(usuario.getUsername())
                    .password(usuario.getClave())
                    .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getTipo())))
                    .build();
        };
    }

    // ← ÚNICO CAMBIO AQUÍ: BCryptPasswordEncoder en lugar de NoOpPasswordEncoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}