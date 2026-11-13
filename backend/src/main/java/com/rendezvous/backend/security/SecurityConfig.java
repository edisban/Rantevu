package com.rendezvous.backend.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfException;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Configuration
public class SecurityConfig {
    private final List<String> allowedOrigins;

    // Empty by default: the frontend is served from the same origin through nginx / Vite.
    // Set CORS_ALLOWED_ORIGINS only when the frontend lives on another domain.
    public SecurityConfig(@Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins.stream().map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // New passwords are hashed with Argon2id and stored with an {argon2} prefix. Hashes from before the
        // switch have no prefix and are BCrypt: they still verify, and AuthService upgrades them at the next login.
        var bcrypt = new BCryptPasswordEncoder();
        var encoder = new DelegatingPasswordEncoder("argon2",
            Map.of("argon2", Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8(), "bcrypt", bcrypt));
        encoder.setDefaultPasswordEncoderForMatches(bcrypt);
        return encoder;
    }

    // Cookies on localhost are shared by every port, so other local apps' default "XSRF-TOKEN"
    // would overwrite ours: give it a name of its own (readable by our JS, as the SPA pattern needs)
    private static CookieCsrfTokenRepository csrfCookie() {
        var repo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repo.setCookieName(AuthCookies.CSRF_NAME);
        return repo;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwt) throws Exception {
        // The auth cookie is sent automatically by the browser, so state-changing requests must
        // also carry the CSRF token (rendezvous_xsrf cookie echoed back in the X-XSRF-TOKEN header)
        http.csrf(c -> c.spa().csrfTokenRepository(csrfCookie()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(h -> h
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'"))
                .referrerPolicy(r -> r.policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> json(res, 401, "Please sign in"))
                .accessDeniedHandler((req, res, ex) -> json(res, 403, ex instanceof CsrfException
                    ? "Security token missing or expired. Refresh the page and try again." : "Forbidden")))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/api/auth/**", "/error").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class);

        if (!allowedOrigins.isEmpty()) {
            var cors = new CorsConfiguration();
            cors.setAllowedOrigins(allowedOrigins);
            cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            cors.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN"));
            cors.setAllowCredentials(true);
            var source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", cors);
            http.cors(c -> c.configurationSource(source));
        }
        return http.build();
    }

    private static void json(HttpServletResponse res, int status, String message) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
