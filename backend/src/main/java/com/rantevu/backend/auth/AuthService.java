package com.rantevu.backend.auth;

import com.rantevu.backend.provider.ProviderProfile;
import com.rantevu.backend.provider.ProviderProfileRepository;
import com.rantevu.backend.security.JwtService;
import com.rantevu.backend.user.Role;
import com.rantevu.backend.user.User;
import com.rantevu.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        var u = createUser(r.username(), r.email(), r.password(), r.fullName(), Role.ROLE_CLIENT);
        return response(u);
    }

    @Transactional
    public AuthResponse registerProvider(ProviderRegisterRequest r) {
        var u = createUser(r.username(), r.email(), r.password(), r.fullName(), Role.ROLE_PROVIDER);
        // Create the public profile (its id comes from the user via @MapsId) right away so the provider shows up in search
        var p = new ProviderProfile();
        p.setUser(u); p.setSpecialty(blankToNull(r.specialty()));
        profiles.save(p);
        return response(u);
    }

    public AuthResponse login(LoginRequest r) {
        var u = users.findByUsername(r.username()).orElseThrow(() -> new IllegalArgumentException("Bad credentials"));
        if (!encoder.matches(r.password(), u.getPassword())) throw new IllegalArgumentException("Bad credentials");
        return response(u);
    }

    private User createUser(String username, String email, String password, String fullName, Role role) {
        // Field rules are enforced by Bean Validation on the request records
        if (users.existsByUsername(username.trim())) throw new IllegalArgumentException("Username already taken");
        if (users.existsByEmail(email.trim())) throw new IllegalArgumentException("Email already in use");
        var u = new User();
        u.setUsername(username.trim()); u.setEmail(email.trim()); u.setPassword(encoder.encode(password)); u.setFullName(fullName.trim()); u.setRole(role);
        return users.save(u);
    }

    private AuthResponse response(User u) {
        return new AuthResponse(jwt.generate(u.getId(), u.getRole().name()), u.getRole().name(), u.getId(), u.getFullName());
    }

    private static boolean isBlank(String s) { return s == null || s.isBlank(); }
    private static String blankToNull(String s) { return isBlank(s) ? null : s.trim(); }
}
