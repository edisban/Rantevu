package com.rendezvous.backend.auth;

import com.rendezvous.backend.security.AuthCookies;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService service;
    private final AuthCookies cookies;

    @PostMapping("/register/client")
    public ResponseEntity<AuthResponse> registerClient(@Valid @RequestBody ClientRegisterRequest r) {
        return withCookie(service.registerClient(r));
    }

    @PostMapping("/register/provider")
    public ResponseEntity<AuthResponse> registerProvider(@Valid @RequestBody ProviderRegisterRequest r) {
        return withCookie(service.registerProvider(r));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest r, HttpServletRequest request) {
        return withCookie(service.login(r, request.getRemoteAddr()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookies.clear().toString()).build();
    }

    // Reading the token makes Spring Security send the rendezvous_xsrf cookie the frontend echoes back
    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(CsrfToken token) {
        token.getToken();
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<AuthResponse> withCookie(AuthService.Session session) {
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookies.issue(session.token()).toString()).body(session.user());
    }
}
