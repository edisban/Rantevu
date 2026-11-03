package com.rantevu.backend.user;

import com.rantevu.backend.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AccountDeletionIntegrationTest extends IntegrationTest {

    @Autowired
    JdbcTemplate jdbc;

    private static String password(String p) { return "{\"password\":\"" + p + "\"}"; }

    private long count(String sql, Long id) {
        return jdbc.queryForObject(sql, Long.class, id, id);
    }

    @Test
    void wrongPasswordKeepsTheAccount() throws Exception {
        var client = client();
        deleteAs(client, "/api/account", password("not-my-password-1"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Incorrect password"));
        getAs(client, "/api/profile").andExpect(status().isOk());
    }

    @Test
    void deletingRemovesTheUserAndEverythingTiedToThem() throws Exception {
        var client = client();
        var provider = provider();
        bookOk(client, provider);
        postAs(client, "/api/messages/" + provider.id(), "{\"content\":\"hello\"}").andExpect(status().isOk());
        postAs(provider, "/api/messages/" + client.id(), "{\"content\":\"hi\"}").andExpect(status().isOk());

        deleteAs(client, "/api/account", password(PASSWORD))
            .andExpect(status().isNoContent())
            .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")));

        assertThat(count("select count(*) from users where id = ? or id = ?", client.id())).isZero();
        assertThat(count("select count(*) from appointments where client_id = ? or provider_id = ?", client.id())).isZero();
        assertThat(count("select count(*) from messages where sender_id = ? or receiver_id = ?", client.id())).isZero();
        // The other party is untouched, but no longer sees the deleted user
        getAs(provider, "/api/appointments/mine").andExpect(jsonPath("$.length()").value(0));
        mvc.perform(post("/api/auth/login").with(xsrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"%s\",\"password\":\"%s\"}".formatted(client.username(), PASSWORD)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void deletingAProviderRemovesTheirPublicProfile() throws Exception {
        var provider = provider();
        assertThat(count("select count(*) from provider_profiles where user_id = ? or user_id = ?", provider.id())).isOne();
        deleteAs(provider, "/api/account", password(PASSWORD)).andExpect(status().isNoContent());
        assertThat(count("select count(*) from provider_profiles where user_id = ? or user_id = ?", provider.id())).isZero();
    }
}
