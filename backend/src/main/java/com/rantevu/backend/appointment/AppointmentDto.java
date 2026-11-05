package com.rantevu.backend.appointment;

import com.rantevu.backend.user.UserSummary;
import java.time.LocalDateTime;

public record AppointmentDto(Long id, LocalDateTime appointmentDate, AppointmentStatus status, String notes, UserSummary client, UserSummary provider) {
    public static AppointmentDto from(Appointment a) {
        return new AppointmentDto(a.getId(), a.getAppointmentDate(), a.getStatus(), a.getNotes(), UserSummary.from(a.getClient()), UserSummary.from(a.getProvider()));
    }
}
