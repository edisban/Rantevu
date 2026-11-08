package com.rantevu.backend.message;

import com.rantevu.backend.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "messages")
@Getter
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "sender_id", nullable = false)
    @Setter
    private User sender;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "receiver_id", nullable = false)
    @Setter
    private User receiver;
    @Column(columnDefinition = "TEXT", nullable = false)
    @Setter
    private String content;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
    @Column(name = "read_at")
    private Instant readAt;
}
