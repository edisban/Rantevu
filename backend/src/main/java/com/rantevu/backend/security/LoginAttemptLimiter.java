package com.rantevu.backend.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Slows down password guessing. Failed logins are counted over a 15-minute window:
 * 5 for one username stops guessing one account; 30 from one IP address stops trying
 * many accounts from one place, while people sharing an office or campus IP aren't
 * locked out by each other's typos. Over a limit, attempts are refused with 429.
 * In-memory, so it is per backend instance and resets on restart.
 */
@Component
public class LoginAttemptLimiter {
    static final int MAX_PER_USERNAME = 5;
    static final int MAX_PER_IP = 30;
    static final Duration WINDOW = Duration.ofMinutes(15);

    private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

    public void checkAllowed(String username, String ip) {
        if (count(userKey(username)) >= MAX_PER_USERNAME || count(ipKey(ip)) >= MAX_PER_IP)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many failed attempts. Try again in a few minutes");
    }

    public void recordFailure(String username, String ip) {
        Instant now = Instant.now();
        for (String key : new String[] { userKey(username), ipKey(ip) })
            failures.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>()).addLast(now);
    }

    // A successful login clears that username's count; the IP count only ages out
    public void recordSuccess(String username) {
        failures.remove(userKey(username));
    }

    private int count(String key) {
        Deque<Instant> recent = failures.get(key);
        if (recent == null) return 0;
        Instant cutoff = Instant.now().minus(WINDOW);
        while (!recent.isEmpty() && recent.peekFirst().isBefore(cutoff)) recent.pollFirst();
        if (recent.isEmpty()) failures.remove(key);
        return recent.size();
    }

    private static String userKey(String username) { return "user:" + username.trim().toLowerCase(Locale.ROOT); }
    private static String ipKey(String ip) { return "ip:" + ip; }
}
