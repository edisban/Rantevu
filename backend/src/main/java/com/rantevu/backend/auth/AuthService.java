package com.rantevu.backend.auth;

import com.rantevu.backend.provider.ProviderProfile;
import com.rantevu.backend.provider.ProviderProfileRepository;
import com.rantevu.backend.security.JwtService;
import com.rantevu.backend.security.LoginAttemptLimiter;
import com.rantevu.backend.user.Role;
import com.rantevu.backend.user.User;
import com.rantevu.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    // A signed-in result: the JWT (goes into the cookie) and what the frontend may show
    public record Session(String token, AuthResponse user) {}

    private final UserRepository users;
    private final ProviderProfileRepository profiles;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final LoginAttemptLimiter limiter;

    public AuthService(UserRepository users, ProviderProfileRepository profiles, PasswordEncoder encoder, JwtService jwt, LoginAttemptLimiter limiter) {
        this.users = users; this.profiles = profiles; this.encoder = encoder; this.jwt = jwt; this.limiter = limiter;
    }

    public Session registerClient(ClientRegisterRequest r) {
        var u = createUser(r.username(), r.email(), r.password(), r.fullName(), Role.ROLE_CLIENT);
        return session(u);
    }

    @Transactional
    public Session registerProvider(ProviderRegisterRequest r) {
        var u = createUser(r.username(), r.email(), r.password(), r.fullName(), Role.ROLE_PROVIDER);
        // Create the public profile (its id comes from the user via @MapsId) right away so the provider shows up in search
        var p = new ProviderProfile();
        p.setUser(u); p.setSpecialty(blankToNull(r.specialty()));
        profiles.save(p);
        return session(u);
    }

    public Session login(LoginRequest r, String clientIp) {
        limiter.checkAllowed(r.username(), clientIp);
        var user = users.findByUsername(r.username().trim())
            .filter(u -> encoder.matches(r.password(), u.getPassword()));
        if (user.isEmpty()) {
            limiter.recordFailure(r.username(), clientIp);
            // Same message for unknown user and wrong password, so usernames can't be discovered
            throw new IllegalArgumentException("Bad credentials");
        }
        limiter.recordSuccess(r.username());
        // Older accounts still have a BCrypt hash: re-hash with Argon2id now that we know the password
        var u = user.get();
        if (encoder.upgradeEncoding(u.getPassword())) {
            u.setPassword(encoder.encode(r.password()));
            users.save(u);
        }
        return session(u);
    }

    private User createUser(String username, String email, String password, String fullName, Role role) {
        // Field rules are enforced by Bean Validation on the request records
        if (users.existsByUsername(username.trim())) throw new IllegalArgumentException("Username already taken");
        if (users.existsByEmail(email.trim())) throw new IllegalArgumentException("Email already in use");
        var u = new User();
        u.setUsername(username.trim()); u.setEmail(email.trim()); u.setPassword(encoder.encode(password)); u.setFullName(fullName.trim()); u.setRole(role);
        return users.save(u);
    }

    private Session session(User u) {
        return new Session(jwt.generate(u.getId(), u.getRole().name()), new AuthResponse(u.getRole().name(), u.getId(), u.getFullName()));
    }

    private static boolean isBlank(String s) { return s == null || s.isBlank(); }
    private static String blankToNull(String s) { return isBlank(s) ? null : s.trim(); }
}
