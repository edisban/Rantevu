package com.rendezvous.backend.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;
import java.util.Locale;

/**
 * Slows down password guessing. Failed logins are counted in Redis for 15 minutes:
 * 5 for one username stops guessing one account; 30 from one IP address stops trying
 * many accounts from one place, while people sharing an office or campus IP aren't
 * locked out by each other's typos. Over a limit, attempts are refused with 429.
 *
 * Each counter is a Redis key: INCR on every failure, and EXPIRE on the first one, so
 * the count disappears 15 minutes after the first failure. Because the counts live in
 * Redis, they survive backend restarts and are shared by every backend instance.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class LoginAttemptLimiter {
    static final int MAX_PER_USERNAME = 5;
    static final int MAX_PER_IP = 30;
    static final Duration WINDOW = Duration.ofMinutes(15);

    private final StringRedisTemplate redis;

    public void checkAllowed(String username, String ip) {
        if (count(userKey(username)) >= MAX_PER_USERNAME || count(ipKey(ip)) >= MAX_PER_IP)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many failed attempts. Try again in a few minutes");
    }

    public void recordFailure(String username, String ip) {
        for (String key : new String[] { userKey(username), ipKey(ip) }) {
            try {
                Long failures = redis.opsForValue().increment(key);
                if (failures != null && failures == 1) redis.expire(key, WINDOW);
            } catch (DataAccessException e) {
                log.warn("Login limiter: Redis unavailable, failure not counted", e);
            }
        }
    }

    // A successful login clears that username's count; the IP count only expires
    public void recordSuccess(String username) {
        try {
            redis.delete(userKey(username));
        } catch (DataAccessException e) {
            log.warn("Login limiter: Redis unavailable, count not cleared", e);
        }
    }

    // If Redis is down, logins keep working (fail open) rather than locking everyone out
    private long count(String key) {
        try {
            String value = redis.opsForValue().get(key);
            return value == null ? 0 : Long.parseLong(value);
        } catch (DataAccessException e) {
            log.warn("Login limiter: Redis unavailable, limit not enforced", e);
            return 0;
        }
    }

    static String userKey(String username) { return "login-failures:user:" + username.trim().toLowerCase(Locale.ROOT); }
    static String ipKey(String ip) { return "login-failures:ip:" + ip; }
}
