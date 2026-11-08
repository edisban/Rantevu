package com.rantevu.backend.provider;

import com.rantevu.backend.appointment.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {
    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");
    private final ProviderProfileRepository profiles;
    private final AppointmentRepository appointments;

    @GetMapping
    public List<ProviderDto> all() { return profiles.findAll().stream().map(ProviderDto::from).toList(); }

    // Times ("HH:mm") already held by a pending or accepted appointment on the given day
    @GetMapping("/{id}/busy")
    public List<String> busy(@PathVariable Long id, @RequestParam LocalDate date) {
        return appointments.findByProvider_IdAndAppointmentDateBetweenAndStatusIn(id, date.atStartOfDay(), date.plusDays(1).atStartOfDay().minusNanos(1), AppointmentRepository.ACTIVE)
            .stream().map(a -> a.getAppointmentDate().format(HH_MM)).toList();
    }
}
