package com.rantevu.backend.appointment;

import com.rantevu.backend.user.Role;
import com.rantevu.backend.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

import static com.rantevu.backend.appointment.AppointmentRepository.ACTIVE;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentRepository repo;
    private final UserRepository users;
    private final AppointmentNotifier notifier;

    @PostMapping
    public AppointmentDto create(Authentication auth, @Valid @RequestBody AppointmentRequest req) {
        if (!hasRole(auth, Role.ROLE_CLIENT)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only clients can request appointments");
        var provider = users.findById(req.providerId())
            .filter(u -> u.getRole() == Role.ROLE_PROVIDER)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown provider"));
        // Friendly check first; the unique index in V2 migration still guards against concurrent requests
        if (repo.existsByProvider_IdAndAppointmentDateAndStatusIn(provider.getId(), req.appointmentDate(), ACTIVE))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This time slot is already taken");
        var a = new Appointment();
        a.setClient(users.findById((Long) auth.getPrincipal()).orElseThrow());
        a.setProvider(provider);
        a.setAppointmentDate(req.appointmentDate());
        a.setNotes(req.notes());
        a.setStatus(AppointmentStatus.PENDING);
        var saved = AppointmentDto.from(repo.saveAndFlush(a));
        notifier.changed(saved, saved.client().id());
        return saved;
    }

    @GetMapping("/mine")
    public List<AppointmentDto> mine(Authentication auth) {
        Long uid = (Long) auth.getPrincipal();
        return repo.findByClient_IdOrProvider_IdOrderByAppointmentDateDesc(uid, uid).stream().map(AppointmentDto::from).toList();
    }

    @PutMapping("/{id}/status")
    public AppointmentDto status(Authentication auth, @PathVariable Long id, @Valid @RequestBody StatusRequest req) {
        Long uid = (Long) auth.getPrincipal();
        var a = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        boolean isProvider = a.getProvider().getId().equals(uid);
        boolean isClient = a.getClient().getId().equals(uid);
        if (!isProvider && !isClient) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your appointment");

        var next = req.status();
        var current = a.getStatus();
        boolean allowed = switch (next) {
            // Only the provider decides on a pending request
            case ACCEPTED, REJECTED -> isProvider && current == AppointmentStatus.PENDING;
            // Either side can cancel while the appointment is still open
            case CANCELLED -> current == AppointmentStatus.PENDING || current == AppointmentStatus.ACCEPTED;
            case PENDING -> false;
        };
        if (!allowed) throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot change status from " + current + " to " + next);
        a.setStatus(next);
        var saved = AppointmentDto.from(repo.save(a));
        notifier.changed(saved, uid);
        return saved;
    }

    private static boolean hasRole(Authentication auth, Role role) {
        return auth.getAuthorities().stream().anyMatch(g -> role.name().equals(g.getAuthority()));
    }

    public record AppointmentRequest(
        @NotNull(message = "Provider is required") Long providerId,
        @NotNull(message = "Date is required") @Future(message = "Appointment date must be in the future") LocalDateTime appointmentDate,
        @Size(max = 1000, message = "Notes must be at most 1000 characters") String notes) {}

    public record StatusRequest(@NotNull(message = "Status is required") AppointmentStatus status) {}
}
