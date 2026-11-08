package com.rantevu.backend.appointment;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Pushes appointment changes live over the same STOMP connection the chat uses, so both people's
 * dashboards update without a reload. Each user subscribes to /user/queue/appointments.
 */
@Component
public class AppointmentNotifier {
    public static final String USER_QUEUE = "/queue/appointments";

    private final SimpMessagingTemplate broker;
    public AppointmentNotifier(SimpMessagingTemplate broker) { this.broker = broker; }

    /** What changed and who did it, so the other person can be told while the actor isn't. */
    public record AppointmentEvent(AppointmentDto appointment, Long changedBy) {}

    public void changed(AppointmentDto appointment, Long changedBy) {
        var event = new AppointmentEvent(appointment, changedBy);
        broker.convertAndSendToUser(appointment.client().id().toString(), USER_QUEUE, event);
        broker.convertAndSendToUser(appointment.provider().id().toString(), USER_QUEUE, event);
    }
}
