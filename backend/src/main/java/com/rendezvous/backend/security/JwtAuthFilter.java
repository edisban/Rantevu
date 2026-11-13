package com.rendezvous.backend.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;
import java.io.IOException;

// Reads the JWT from the HttpOnly cookie on every request, including the WebSocket handshake
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwt;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        var cookie = WebUtils.getCookie(req, AuthCookies.NAME);
        if (cookie != null && !cookie.getValue().isBlank()) {
            try {
                SecurityContextHolder.getContext().setAuthentication(jwt.authenticate(cookie.getValue()));
            } catch (JwtException | IllegalArgumentException ignored) {
                // Invalid or expired token: continue unauthenticated, protected routes will answer 401
            }
        }
        chain.doFilter(req, res);
    }
}
