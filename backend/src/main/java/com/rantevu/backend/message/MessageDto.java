package com.rantevu.backend.message;

import java.time.Instant;

public record MessageDto(Long id, Long senderId, Long receiverId, String content, Instant createdAt, Instant readAt) {
    public static MessageDto from(Message m) {
        return new MessageDto(m.getId(), m.getSender().getId(), m.getReceiver().getId(), m.getContent(), m.getCreatedAt(), m.getReadAt());
    }
}
