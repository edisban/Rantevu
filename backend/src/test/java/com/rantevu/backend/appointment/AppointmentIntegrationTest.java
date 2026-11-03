package com.rantevu.backend.appointment;

import com.rantevu.backend.IntegrationTest;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AppointmentIntegrationTest extends IntegrationTest {

    private static String statusBody(String s) { return "{\"status\":\"" + s + "\"}"; }

    @Test
    void clientBooksAPendingAppointment() throws Exception {
        var client = client();
        var provider = provider();
        book(client, provider, futureSlot())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PENDING"))
            .andExpect(jsonPath("$.client.id").value(client.id()))
            .andExpect(jsonPath("$.provider.id").value(provider.id()));
    }

    @Test
    void onlyClientsCanBookAndOnlyProviders() throws Exception {
        var provider = provider();
        var otherClient = client();
        book(provider, provider, futureSlot()).andExpect(status().isForbidden());
        // A client id is not a provider
        book(client(), otherClient, futureSlot())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Unknown provider"));
    }

    @Test
    void pastDatesAreRejected() throws Exception {
        book(client(), provider(), "2020-01-01T10:00")
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Appointment date must be in the future"));
    }

    @Test
    void aSlotCannotBeBookedTwiceUntilItIsFreed() throws Exception {
        var provider = provider();
        var first = client();
        var second = client();
        String slot = futureSlot();
        String day = slot.substring(0, 10);

        Long id = bookOk(first, provider, slot);
        book(second, provider, slot)
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("This time slot is already taken"));
        getAs(second, "/api/providers/" + provider.id() + "/busy?date=" + day)
            .andExpect(jsonPath("$", contains("10:00")));

        // Cancelling frees the slot again
        putAs(first, "/api/appointments/" + id + "/status", statusBody("CANCELLED")).andExpect(status().isOk());
        getAs(second, "/api/providers/" + provider.id() + "/busy?date=" + day).andExpect(jsonPath("$", empty()));
        book(second, provider, slot).andExpect(status().isOk());
    }

    @Test
    void onlyTheProviderDecidesAndStrangersAreKeptOut() throws Exception {
        var client = client();
        var provider = provider();
        var stranger = client();
        Long id = bookOk(client, provider);
        String url = "/api/appointments/" + id + "/status";

        putAs(client, url, statusBody("ACCEPTED")).andExpect(status().isConflict());
        putAs(stranger, url, statusBody("CANCELLED")).andExpect(status().isForbidden());
        putAs(provider, url, statusBody("ACCEPTED")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACCEPTED"));
        putAs(provider, url, statusBody("REJECTED")).andExpect(status().isConflict());
        putAs(client, url, statusBody("CANCELLED")).andExpect(status().isOk());
    }

    @Test
    void usersOnlySeeTheirOwnAppointments() throws Exception {
        var client = client();
        var provider = provider();
        bookOk(client, provider);
        getAs(client, "/api/appointments/mine").andExpect(jsonPath("$.length()").value(1));
        getAs(provider, "/api/appointments/mine").andExpect(jsonPath("$.length()").value(1));
        getAs(client(), "/api/appointments/mine").andExpect(jsonPath("$", empty()));
    }

    private Long bookOk(Account client, Account provider, String slot) throws Exception {
        String body = book(client, provider, slot).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        Number id = com.jayway.jsonpath.JsonPath.read(body, "$.id");
        return id.longValue();
    }
}
