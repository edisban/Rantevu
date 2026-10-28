package com.rantevu.backend.message;

import com.rantevu.backend.appointment.Appointment;
import com.rantevu.backend.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    @ManyToOne @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;
    @ManyToOne @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }
    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
