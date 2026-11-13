package com.rendezvous.backend.appointment;

import com.rendezvous.backend.user.UserSummary;
import java.time.LocalDateTime;

public record AppointmentDto(Long id, LocalDateTime appointmentDate, AppointmentStatus status, String notes, UserSummary client, UserSummary provider) {
    public static AppointmentDto from(Appointment a) {
        return new AppointmentDto(a.getId(), a.getAppointmentDate(), a.getStatus(), a.getNotes(), UserSummary.from(a.getClient()), UserSummary.from(a.getProvider()));
    }
}
