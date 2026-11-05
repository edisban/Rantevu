package com.rantevu.backend.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Statuses that occupy a provider's time slot
    List<AppointmentStatus> ACTIVE = List.of(AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED);

    List<Appointment> findByClient_IdOrProvider_IdOrderByAppointmentDateDesc(Long clientId, Long providerId);
    boolean existsByProvider_IdAndAppointmentDateAndStatusIn(Long providerId, LocalDateTime date, Collection<AppointmentStatus> statuses);
    @Query("""
        select count(a) > 0 from Appointment a
        where (a.client.id = :x and a.provider.id = :y) or (a.client.id = :y and a.provider.id = :x)""")
    boolean existsBetween(@Param("x") Long x, @Param("y") Long y);

    List<Appointment> findByProvider_IdAndAppointmentDateBetweenAndStatusIn(Long providerId, LocalDateTime from, LocalDateTime to, Collection<AppointmentStatus> statuses);
}
