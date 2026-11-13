package com.rendezvous.backend.appointment;

import com.rendezvous.backend.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "client_id", nullable = false)
    private User client;
    @ManyToOne @JoinColumn(name = "provider_id", nullable = false)
    private User provider;
    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;
    @Column(columnDefinition = "TEXT")
    private String notes;
}
