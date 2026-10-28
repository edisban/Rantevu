package com.rantevu.backend.appointment;

import com.rantevu.backend.user.User;
import com.rantevu.backend.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentRepository repo;
    private final UserRepository users;
    public AppointmentController(AppointmentRepository repo, UserRepository users) { this.repo = repo; this.users = users; }

    @PostMapping
    public Appointment create(Authentication auth, @RequestBody AppointmentRequest req) {
        Long clientId = (Long) auth.getPrincipal();
        var a = new Appointment();
        a.setClient(users.findById(clientId).orElseThrow());
        a.setProvider(users.findById(req.providerId()).orElseThrow());
        a.setAppointmentDate(LocalDateTime.parse(req.appointmentDate()));
        a.setNotes(req.notes());
        a.setStatus(AppointmentStatus.PENDING);
        return repo.save(a);
    }

    @GetMapping("/mine")
    public List<Appointment> mine(Authentication auth) {
        Long uid = (Long) auth.getPrincipal();
        return repo.findAll().stream().filter(a -> a.getClient().getId().equals(uid) || a.getProvider().getId().equals(uid)).toList();
    }

    @PutMapping("/{id}/status")
    public Appointment status(@PathVariable Long id, @RequestBody StatusRequest req) {
        var a = repo.findById(id).orElseThrow();
        a.setStatus(AppointmentStatus.valueOf(req.status()));
        return repo.save(a);
    }

    public record AppointmentRequest(Long providerId, String appointmentDate, String notes) {}
    public record StatusRequest(String status) {}
}
