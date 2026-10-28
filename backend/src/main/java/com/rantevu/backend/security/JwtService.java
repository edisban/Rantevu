package com.rantevu.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    @Value("${jwt.secret:change-me-secret-key-at-least-32-chars-long!!}")
    private String secret;
    @Value("${jwt.expiration:86400000}")
    private long expiration;

    public String generate(Long userId, String role) {
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
            .compact();
    }

    public Long extractUserId(String token) {
        return Long.valueOf(Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8))).build()
            .parseSignedClaims(token).getPayload().getSubject());
    }

    public String extractRole(String token) {
        return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8))).build()
            .parseSignedClaims(token).getPayload().get("role", String.class);
    }
}
