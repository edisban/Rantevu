package com.rantevu.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expiration;

    public JwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration}") long expiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String generate(Long userId, String role) {
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(key)
            .compact();
    }

    /**
     * Verifies the token and returns an authentication whose principal is the user id (its name is the id as text,
     * which is also what STOMP user destinations are keyed by). Throws if the token is invalid or expired.
     */
    public UsernamePasswordAuthenticationToken authenticate(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        Long userId = Long.valueOf(claims.getSubject());
        String role = claims.get("role", String.class);
        return new UsernamePasswordAuthenticationToken(userId, null, List.of(new SimpleGrantedAuthority(role)));
    }
}
