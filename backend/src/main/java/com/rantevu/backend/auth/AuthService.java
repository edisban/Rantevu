package com.rantevu.backend.auth;

import com.rantevu.backend.provider.ProviderProfile;
import com.rantevu.backend.provider.ProviderProfileRepository;
import com.rantevu.backend.security.JwtService;
import com.rantevu.backend.user.Role;
import com.rantevu.backend.user.User;
import com.rantevu.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final ProviderProfileRepository profiles;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, ProviderProfileRepository profiles, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.profiles = profiles; this.encoder = encoder; this.jwt = jwt;
    }

    public AuthResponse registerClient(ClientRegisterRequest r) {
        if (users.existsByEmail(r.email()) || users.existsByUsername(r.username())) throw new IllegalArgumentException("Email in use");
        var u = new User();
        u.setUsername(r.username()); u.setEmail(r.email()); u.setPassword(encoder.encode(r.password())); u.setFullName(r.fullName()); u.setRole(Role.ROLE_CLIENT);
        users.save(u);
        return new AuthResponse(jwt.generate(u.getId(), u.getRole().name()), u.getRole().name(), u.getId(), u.getFullName());
    }

    public AuthResponse registerProvider(ProviderRegisterRequest r) {
        if (users.existsByEmail(r.email()) || users.existsByUsername(r.username())) throw new IllegalArgumentException("Email in use");
        var u = new User();
        u.setUsername(r.username()); u.setEmail(r.email()); u.setPassword(encoder.encode(r.password())); u.setFullName(r.fullName()); u.setRole(Role.ROLE_PROVIDER);
        users.save(u);
        return new AuthResponse(jwt.generate(u.getId(), u.getRole().name()), u.getRole().name(), u.getId(), u.getFullName());
    }

    public AuthResponse login(LoginRequest r) {
        var u = users.findByUsername(r.username()).orElseThrow(() -> new IllegalArgumentException("Bad credentials"));
        if (!encoder.matches(r.password(), u.getPassword())) throw new IllegalArgumentException("Bad credentials");
        return new AuthResponse(jwt.generate(u.getId(), u.getRole().name()), u.getRole().name(), u.getId(), u.getFullName());
    }
}
