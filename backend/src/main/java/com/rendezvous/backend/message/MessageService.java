package com.rendezvous.backend.message;

import com.rendezvous.backend.appointment.AppointmentRepository;
import com.rendezvous.backend.provider.ProviderProfile;
import com.rendezvous.backend.provider.ProviderProfileRepository;
import com.rendezvous.backend.user.User;
import com.rendezvous.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {
    // STOMP destination each user subscribes to as /user/queue/messages
    static final String USER_QUEUE = "/queue/messages";

    private final MessageRepository messages;
    private final AppointmentRepository appointments;
    private final UserRepository users;
    private final ProviderProfileRepository profiles;
    private final SimpMessagingTemplate broker;

    @Transactional(readOnly = true)
    public List<ContactDto> contacts(Long me) {
        // Everyone the user shares an appointment with, in any status
        Map<Long, User> people = new LinkedHashMap<>();
        for (var a : appointments.findByClient_IdOrProvider_IdOrderByAppointmentDateDesc(me, me)) {
            var other = a.getClient().getId().equals(me) ? a.getProvider() : a.getClient();
            people.putIfAbsent(other.getId(), other);
        }
        Map<Long, Message> last = messages.findAllById(messages.lastMessageIds(me)).stream()
            .collect(Collectors.toMap(m -> otherParty(m, me), Function.identity()));
        Map<Long, Long> unread = messages.unreadBySender(me).stream()
            .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));
        Map<Long, String> specialties = profiles.findAllById(people.keySet()).stream()
            .filter(p -> p.getSpecialty() != null)
            .collect(Collectors.toMap(ProviderProfile::getUserId, ProviderProfile::getSpecialty));

        return people.values().stream()
            .map(u -> {
                var m = last.get(u.getId());
                return new ContactDto(u.getId(), u.getFullName(), u.getRole(), specialties.get(u.getId()),
                    m == null ? null : m.getContent(), m == null ? null : m.getCreatedAt(),
                    m != null && m.getSender().getId().equals(me), unread.getOrDefault(u.getId(), 0L));
            })
            // Latest conversations first, people never messaged after them
            .sorted(Comparator.comparing(ContactDto::lastAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .toList();
    }

    @Transactional
    public List<MessageDto> conversation(Long me, Long other) {
        requireSharedAppointment(me, other);
        messages.markRead(other, me, Instant.now());
        return messages.conversation(me, other).stream().map(MessageDto::from).toList();
    }

    @Transactional
    public MessageDto send(Long me, Long other, String content) {
        requireSharedAppointment(me, other);
        var m = new Message();
        m.setSender(users.getReferenceById(me));
        m.setReceiver(users.getReferenceById(other));
        m.setContent(content.strip());
        var dto = MessageDto.from(messages.save(m));
        // Push live to both sides, so the sender's other tabs/devices update too
        broker.convertAndSendToUser(other.toString(), USER_QUEUE, dto);
        broker.convertAndSendToUser(me.toString(), USER_QUEUE, dto);
        return dto;
    }

    @Transactional
    public void markRead(Long me, Long other) {
        messages.markRead(other, me, Instant.now());
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long me) {
        return messages.countByReceiver_IdAndReadAtIsNull(me);
    }

    private void requireSharedAppointment(Long me, Long other) {
        if (!appointments.existsBetween(me, other))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only message people you have an appointment with");
    }

    private static Long otherParty(Message m, Long me) {
        return m.getSender().getId().equals(me) ? m.getReceiver().getId() : m.getSender().getId();
    }
}
