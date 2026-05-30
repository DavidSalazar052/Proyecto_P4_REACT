package BolsaEmpleo.security;

import BolsaEmpleo.logic.Base.Usuario;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

/**
 * TokenService — genera tokens JWT firmados con HMAC-SHA256.
 *
 * Claims incluidos en el token:
 *   - scope    → rol del usuario (ADM, EMP, OFE)
 *   - id       → ID del usuario en BD
 *   - username → nombre de usuario
 *
 * El frontend extrae estos claims del token para mostrar
 * información al usuario sin hacer un request adicional.
 */
@Service
@AllArgsConstructor
public class TokenService {

    private final JwtConfig jwtConfig;

    public String generateToken(Usuario usuario) {
        var header = new JWSHeader.Builder(jwtConfig.getAlgorithm())
                .type(JOSEObjectType.JWT)
                .build();

        Instant now = Instant.now();
        var claims = new JWTClaimsSet.Builder()
                .issuer("BolsaEmpleo")
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plus(jwtConfig.getJwtExpiration(), ChronoUnit.MILLIS)))
                // scope: requerido por Spring Security para hasAuthority("SCOPE_ADM") etc.
                .claim("scope", List.of(usuario.getTipo()))
                // claims adicionales útiles para el frontend
                .claim("id", usuario.getId())
                .claim("username", usuario.getUsername())
                .claim("rol", usuario.getTipo())
                .build();

        var jwt = new SignedJWT(header, claims);
        try {
            jwt.sign(new MACSigner(jwtConfig.getSecretKey()));
        } catch (JOSEException e) {
            throw new RuntimeException("Error generando JWT", e);
        }
        return jwt.serialize();
    }
}
