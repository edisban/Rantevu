package com.rantevu.backend.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service) { this.service = service; }

    @PostMapping("/register/client")
    public ResponseEntity<AuthResponse> registerClient(@RequestBody ClientRegisterRequest r) {
        return ResponseEntity.ok(service.registerClient(r));
    }
    @PostMapping("/register/provider")
    public ResponseEntity<AuthResponse> registerProvider(@RequestBody ProviderRegisterRequest r) {
        return ResponseEntity.ok(service.registerProvider(r));
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest r) {
        return ResponseEntity.ok(service.login(r));
    }
}
