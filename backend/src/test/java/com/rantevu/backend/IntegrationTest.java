package com.rantevu.backend;

import com.jayway.jsonpath.JsonPath;
import com.rantevu.backend.security.AuthCookies;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base for integration tests: the whole application (security, controllers, JPA, Flyway migrations)
 * against a real PostgreSQL. The Spring context and the container are shared by all test classes.
 * Every test creates its own users with unique names, so tests don't depend on each other.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
public abstract class IntegrationTest {
    protected static final String PASSWORD = "secret123";
    private static final AtomicInteger SEQ = new AtomicInteger();

    @Autowired
    protected MockMvc mvc;

    protected record Account(Long id, String username, Cookie cookie) {}

    protected static String unique(String prefix) {
        return prefix + "_" + SEQ.incrementAndGet() + "_" + (System.nanoTime() % 100_000);
    }

    /** A date safely in the future, different per call so slots never collide between tests. */
    protected static String futureSlot() {
        return LocalDate.now().plusDays(10 + SEQ.incrementAndGet()) + "T10:00";
    }

    /**
     * CSRF exactly as the browser does it: fetch the XSRF-TOKEN cookie from /api/auth/csrf,
     * then send it back both as the cookie and in the X-XSRF-TOKEN header.
     */
    protected RequestPostProcessor xsrf() throws Exception {
        Cookie token = mvc.perform(get("/api/auth/csrf")).andReturn().getResponse().getCookie("XSRF-TOKEN");
        return request -> {
            Cookie[] existing = request.getCookies() == null ? new Cookie[0] : request.getCookies();
            Cookie[] all = Arrays.copyOf(existing, existing.length + 1);
            all[existing.length] = token;
            request.setCookies(all);
            request.addHeader("X-XSRF-TOKEN", token.getValue());
            return request;
        };
    }

    protected static String registerBody(String username, String password) {
        return """
            {"username":"%s","email":"%s@example.com","password":"%s","fullName":"Test %s","specialty":"Dentist"}"""
            .formatted(username, username, password, username);
    }

    protected Account register(String kind) throws Exception {
        String username = unique(kind);
        var res = mvc.perform(post("/api/auth/register/" + kind).with(xsrf())
                .contentType(MediaType.APPLICATION_JSON).content(registerBody(username, PASSWORD)))
            .andExpect(status().isOk())
            .andReturn().getResponse();
        Number id = JsonPath.read(res.getContentAsString(), "$.userId");
        return new Account(id.longValue(), username, res.getCookie(AuthCookies.NAME));
    }

    protected Account client() throws Exception { return register("client"); }

    protected Account provider() throws Exception { return register("provider"); }

    protected ResultActions getAs(Account a, String url) throws Exception {
        return mvc.perform(get(url).cookie(a.cookie()));
    }

    protected ResultActions postAs(Account a, String url, String json) throws Exception {
        return mvc.perform(post(url).cookie(a.cookie()).with(xsrf()).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    protected ResultActions putAs(Account a, String url, String json) throws Exception {
        return mvc.perform(put(url).cookie(a.cookie()).with(xsrf()).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    protected ResultActions deleteAs(Account a, String url, String json) throws Exception {
        return mvc.perform(delete(url).cookie(a.cookie()).with(xsrf()).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    protected ResultActions book(Account client, Account provider, String slot) throws Exception {
        return postAs(client, "/api/appointments", """
            {"providerId":%d,"appointmentDate":"%s","notes":"test"}""".formatted(provider.id(), slot));
    }

    protected Long bookOk(Account client, Account provider) throws Exception {
        String body = book(client, provider, futureSlot()).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        Number id = JsonPath.read(body, "$.id");
        return id.longValue();
    }
}
