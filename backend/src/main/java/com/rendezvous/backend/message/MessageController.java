package com.rendezvous.backend.message;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

// Messages are sent over REST (validation, auth and errors come for free) and delivered live over STOMP
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService service;

    @GetMapping("/contacts")
    public List<ContactDto> contacts(Authentication auth) { return service.contacts(me(auth)); }

    @GetMapping("/unread")
    public Map<String, Long> unread(Authentication auth) { return Map.of("count", service.unreadCount(me(auth))); }

    @GetMapping("/{otherId}")
    public List<MessageDto> conversation(Authentication auth, @PathVariable Long otherId) { return service.conversation(me(auth), otherId); }

    @PostMapping("/{otherId}")
    public MessageDto send(Authentication auth, @PathVariable Long otherId, @Valid @RequestBody SendRequest req) {
        return service.send(me(auth), otherId, req.content());
    }

    @PutMapping("/{otherId}/read")
    public ResponseEntity<Void> markRead(Authentication auth, @PathVariable Long otherId) {
        service.markRead(me(auth), otherId);
        return ResponseEntity.noContent().build();
    }

    private static Long me(Authentication auth) { return (Long) auth.getPrincipal(); }

    public record SendRequest(
        @NotBlank(message = "Message cannot be empty") @Size(max = 2000, message = "Message must be at most 2000 characters") String content) {}
}
