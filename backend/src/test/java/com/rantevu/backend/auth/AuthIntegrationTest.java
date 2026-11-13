package com.rantevu.backend.auth;

import com.rantevu.backend.IntegrationTest;
import com.rantevu.backend.security.AuthCookies;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthIntegrationTest extends IntegrationTest {

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    StringRedisTemplate redis;

    private String storedHash(Long userId) {
        return jdbc.queryForObject("select password_hash from users where id = ?", String.class, userId);
    }

    @Test
    void newPasswordsAreHashedWithArgon2id() throws Exception {
        var user = client();
        assertThat(storedHash(user.id())).startsWith("{argon2}$argon2id$");
    }

    @Test
    void olderBcryptPasswordsStillWorkAndAreUpgradedAtLogin() throws Exception {
        var user = client();
        // Simulate an account created before the switch: a plain BCrypt hash without a {prefix}
        jdbc.update("update users set password_hash = ? where id = ?", new BCryptPasswordEncoder().encode(PASSWORD), user.id());

        mvc.perform(post("/api/auth/login").with(xsrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"%s\",\"password\":\"%s\"}".formatted(user.username(), PASSWORD)))
            .andExpect(status().isOk());
        assertThat(storedHash(user.id())).startsWith("{argon2}$argon2id$");
    }

    @Test
    void registerSetsHttpOnlyCookieAndKeepsTokenOutOfTheBody() throws Exception {
        var res = mvc.perform(post("/api/auth/register/client").with(xsrf())
                .contentType(MediaType.APPLICATION_JSON).content(registerBody(unique("cookie"), PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("ROLE_CLIENT"))
            .andExpect(jsonPath("$.token").doesNotExist())
            .andReturn().getResponse();

        String setCookie = res.getHeader(HttpHeaders.SET_COOKIE);
        assertThat(setCookie).startsWith(AuthCookies.NAME + "=").contains("HttpOnly", "SameSite=Lax", "Path=/");
    }

    @Test
    void weakPasswordsAreRejected() throws Exception {
        for (String weak : new String[] { "short1", "onlyletters", "12345678" }) {
            mvc.perform(post("/api/auth/register/client").with(xsrf())
                    .contentType(MediaType.APPLICATION_JSON).content(registerBody(unique("weak"), weak)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password must be at least 8 characters and include a letter and a number"));
        }
    }

    @Test
    void cookiesFromOtherLocalAppsDoNotSignTheUserOut() throws Exception {
        // On localhost every port shares cookies: another app's generic "access_token" and
        // "XSRF-TOKEN" arrive here too and must not be mistaken for ours
        var me = client();
        var foreign = new Cookie("access_token", "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl");
        mvc.perform(get("/api/appointments/mine").cookie(foreign, me.cookie(), new Cookie("XSRF-TOKEN", "someone-else")))
            .andExpect(status().isOk());
    }

    @Test
    void signInIgnoresCaseAndSpacesInTheUsername() throws Exception {
        String username = unique("Case");
        mvc.perform(post("/api/auth/register/client").with(xsrf())
                .contentType(MediaType.APPLICATION_JSON).content(registerBody(username.toUpperCase(), PASSWORD)))
            .andExpect(status().isOk());
        // Stored lower-case
        assertThat(jdbc.queryForObject("select username from users where username = ?", String.class, username.toLowerCase()))
            .isEqualTo(username.toLowerCase());
        mvc.perform(post("/api/auth/login").with(xsrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\" %s \",\"password\":\"%s\"}".formatted(username, PASSWORD)))
            .andExpect(status().isOk());
        // The same name in another case is the same account, not a new one
        mvc.perform(post("/api/auth/register/client").with(xsrf())
                .contentType(MediaType.APPLICATION_JSON).content(registerBody(username.toLowerCase(), PASSWORD)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Username already taken"));
    }

    @Test
    void usernameMustBeUnique() throws Exception {
        var existing = client();
        mvc.perform(post("/api/auth/register/client").with(xsrf())
                .contentType(MediaType.APPLICATION_JSON).content(registerBody(existing.username(), PASSWORD)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Username already taken"));
    }

    @Test
    void protectedEndpointsNeedTheLoginCookie() throws Exception {
        mvc.perform(get("/api/profile"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Please sign in"));
    }

    @Test
    void stateChangingRequestsNeedTheCsrfToken() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"x\",\"password\":\"y\"}"))
            .andExpect(status().isForbidden());
    }

    @Test
    void loginIsLockedAfterFiveWrongPasswords() throws Exception {
        var victim = client();
        String wrong = "{\"username\":\"%s\",\"password\":\"wrong-pass-1\"}".formatted(victim.username());
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/login").with(xsrf()).contentType(MediaType.APPLICATION_JSON).content(wrong))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Bad credentials"));
        }
        // Even the right password is refused while locked
        mvc.perform(post("/api/auth/login").with(xsrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"%s\",\"password\":\"%s\"}".formatted(victim.username(), PASSWORD)))
            .andExpect(status().isTooManyRequests());
    }

    @Test
    void failedLoginsAreCountedInRedisAndExpire() throws Exception {
        var user = client();
        mvc.perform(post("/api/auth/login").with(xsrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"%s\",\"password\":\"wrong-pass-1\"}".formatted(user.username())))
            .andExpect(status().isBadRequest());

        String key = "login-failures:user:" + user.username().toLowerCase();
        assertThat(redis.opsForValue().get(key)).isEqualTo("1");
        // The counter removes itself after the 15-minute window
        assertThat(redis.getExpire(key)).isBetween(1L, 15L * 60);
    }

    @Test
    void logoutExpiresTheCookie() throws Exception {
        var user = client();
        mvc.perform(post("/api/auth/logout").cookie(user.cookie()).with(xsrf()))
            .andExpect(status().isNoContent())
            .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")));
    }

    @Test
    void passwordHashesNeverLeaveTheServer() throws Exception {
        var provider = provider();
        getAs(provider, "/api/providers")
            .andExpect(status().isOk())
            .andExpect(content().string(not(containsString("password"))));
        getAs(provider, "/api/profile")
            .andExpect(content().string(not(containsString("password"))));
    }
}
