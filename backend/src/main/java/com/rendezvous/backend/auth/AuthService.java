package com.rendezvous.backend.auth;

import com.rendezvous.backend.provider.ProviderProfile;
import com.rendezvous.backend.provider.ProviderProfileRepository;
import com.rendezvous.backend.security.JwtService;
import com.rendezvous.backend.security.LoginAttemptLimiter;
import com.rendezvous.backend.user.Role;
import com.rendezvous.backend.user.User;
import com.rendezvous.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {
    // A signed-in result: the JWT (goes into the cookie) and what the frontend may show
    public record Session(String token, AuthResponse user) {}

    private final UserRepository users;
    private final ProviderProfileRepository profiles;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final LoginAttemptLimiter limiter;

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
        // "Edis", "edis" and "edis " are the same account, and share one failed-attempt counter
        String username = normalize(r.username());
        limiter.checkAllowed(username, clientIp);
        var user = users.findByUsername(username)
            .filter(u -> encoder.matches(r.password(), u.getPassword()));
        if (user.isEmpty()) {
            limiter.recordFailure(username, clientIp);
            // Same message for unknown user and wrong password, so usernames can't be discovered
            throw new IllegalArgumentException("Bad credentials");
        }
        limiter.recordSuccess(username);
        // Older accounts still have a BCrypt hash: re-hash with Argon2id now that we know the password
        var u = user.get();
        if (encoder.upgradeEncoding(u.getPassword())) {
            u.setPassword(encoder.encode(r.password()));
            users.save(u);
        }
        return session(u);
    }

    private User createUser(String username, String email, String password, String fullName, Role role) {
        // Field rules are enforced by Bean Validation on the request records.
        // Usernames and emails are stored lower-case, so case can't create a second account.
        username = normalize(username);
        email = normalize(email);
        if (users.existsByUsername(username)) throw new IllegalArgumentException("Username already taken");
        if (users.existsByEmail(email)) throw new IllegalArgumentException("Email already in use");
        var u = new User();
        u.setUsername(username); u.setEmail(email); u.setPassword(encoder.encode(password)); u.setFullName(fullName.trim()); u.setRole(role);
        return users.save(u);
    }

    private Session session(User u) {
        return new Session(jwt.generate(u.getId(), u.getRole().name()), new AuthResponse(u.getRole().name(), u.getId(), u.getFullName()));
    }

    // Locale.ROOT: the same result on every server, whatever its language settings
    private static String normalize(String s) { return s.trim().toLowerCase(Locale.ROOT); }
    private static boolean isBlank(String s) { return s == null || s.isBlank(); }
    private static String blankToNull(String s) { return isBlank(s) ? null : s.trim(); }
}
