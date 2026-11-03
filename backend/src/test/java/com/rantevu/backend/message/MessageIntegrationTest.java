package com.rantevu.backend.message;

import com.rantevu.backend.IntegrationTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MessageIntegrationTest extends IntegrationTest {

    private static String text(String s) { return "{\"content\":\"" + s + "\"}"; }

    @Test
    void peopleWithoutASharedAppointmentCannotChat() throws Exception {
        var provider = provider();
        var stranger = client();
        postAs(stranger, "/api/messages/" + provider.id(), text("hi"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("You can only message people you have an appointment with"));
        getAs(stranger, "/api/messages/" + provider.id()).andExpect(status().isForbidden());
        getAs(stranger, "/api/messages/contacts").andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void messagesAreDeliveredCountedAndMarkedRead() throws Exception {
        var client = client();
        var provider = provider();
        bookOk(client, provider);

        postAs(client, "/api/messages/" + provider.id(), text("Can I bring my X-rays?"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.senderId").value(client.id()))
            .andExpect(jsonPath("$.readAt").doesNotExist());

        getAs(provider, "/api/messages/unread").andExpect(jsonPath("$.count").value(1));
        getAs(provider, "/api/messages/contacts")
            .andExpect(jsonPath("$[0].userId").value(client.id()))
            .andExpect(jsonPath("$[0].lastMessage").value("Can I bring my X-rays?"))
            .andExpect(jsonPath("$[0].unread").value(1));

        // Opening the conversation marks it read
        getAs(provider, "/api/messages/" + client.id()).andExpect(jsonPath("$.length()").value(1));
        getAs(provider, "/api/messages/unread").andExpect(jsonPath("$.count").value(0));
    }

    @Test
    void emptyMessagesAreRejected() throws Exception {
        var client = client();
        var provider = provider();
        bookOk(client, provider);
        postAs(client, "/api/messages/" + provider.id(), text("   "))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Message cannot be empty"));
    }
}
