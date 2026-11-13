package com.rendezvous.backend.message;

import com.rendezvous.backend.user.Role;
import java.time.Instant;

// Someone the user can chat with (they share an appointment), with a preview of the latest message
public record ContactDto(Long userId, String fullName, Role role, String specialty,
                         String lastMessage, Instant lastAt, boolean lastFromMe, long unread) {}
