package com.rendezvous.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import java.time.Duration;

// The JWT travels in an HttpOnly cookie: JavaScript (and so any XSS) cannot read it
@Component
public class AuthCookies {
    // App-specific names: on localhost every port shares cookies, and a generic "access_token"
    // set by another local app would be sent here instead of ours
    public static final String NAME = "rendezvous_session";
    public static final String CSRF_NAME = "rendezvous_xsrf";

    private final boolean secure;
    private final String sameSite;
    private final Duration maxAge;

    public AuthCookies(@Value("${app.cookie.secure}") boolean secure,
                       @Value("${app.cookie.same-site}") String sameSite,
                       @Value("${jwt.expiration}") long expirationMs) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.maxAge = Duration.ofMillis(expirationMs);
    }

    public ResponseCookie issue(String token) { return base(token).maxAge(maxAge).build(); }

    public ResponseCookie clear() { return base("").maxAge(0).build(); }

    private ResponseCookie.ResponseCookieBuilder base(String value) {
        return ResponseCookie.from(NAME, value).httpOnly(true).secure(secure).sameSite(sameSite).path("/");
    }
}
