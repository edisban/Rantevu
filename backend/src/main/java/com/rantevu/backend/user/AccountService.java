package com.rantevu.backend.user;

import com.rantevu.backend.appointment.AppointmentRepository;
import com.rantevu.backend.message.MessageRepository;
import com.rantevu.backend.provider.ProviderProfileRepository;
import com.rantevu.backend.security.LoginAttemptLimiter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {
    private final UserRepository users;
    private final ProviderProfileRepository profiles;
    private final AppointmentRepository appointments;
    private final MessageRepository messages;
    private final PasswordEncoder encoder;
    private final LoginAttemptLimiter limiter;

    public AccountService(UserRepository users, ProviderProfileRepository profiles, AppointmentRepository appointments,
                          MessageRepository messages, PasswordEncoder encoder, LoginAttemptLimiter limiter) {
        this.users = users; this.profiles = profiles; this.appointments = appointments;
        this.messages = messages; this.encoder = encoder; this.limiter = limiter;
    }

    /**
     * Deletes the user and every row that references them, in foreign-key order, in one transaction:
     * either everything is gone or nothing changed. The password is asked again so a forgotten,
     * signed-in browser can't be used to delete the account; wrong guesses count toward the login limit.
     */
    @Transactional
    public void delete(Long userId, String password, String clientIp) {
        User user = users.findById(userId).orElseThrow();
        limiter.checkAllowed(user.getUsername(), clientIp);
        if (!encoder.matches(password, user.getPassword())) {
            limiter.recordFailure(user.getUsername(), clientIp);
            throw new IllegalArgumentException("Incorrect password");
        }
        messages.deleteAllForUser(userId);
        appointments.deleteAllForUser(userId);
        profiles.deleteByUserId(userId);
        users.deleteByIdNow(userId);
    }
}
