package com.rantevu.backend.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
        select m from Message m
        where (m.sender.id = :a and m.receiver.id = :b) or (m.sender.id = :b and m.receiver.id = :a)
        order by m.createdAt asc""")
    List<Message> conversation(@Param("a") Long a, @Param("b") Long b);

    @Modifying
    @Query("update Message m set m.readAt = :now where m.sender.id = :from and m.receiver.id = :to and m.readAt is null")
    int markRead(@Param("from") Long from, @Param("to") Long to, @Param("now") Instant now);

    long countByReceiver_IdAndReadAtIsNull(Long receiverId);

    @Modifying
    @Query("delete from Message m where m.sender.id = :userId or m.receiver.id = :userId")
    int deleteAllForUser(@Param("userId") Long userId);

    // Unread counts per sender for one receiver: rows of [senderId, count]
    @Query("select m.sender.id, count(m) from Message m where m.receiver.id = :me and m.readAt is null group by m.sender.id")
    List<Object[]> unreadBySender(@Param("me") Long me);

    // Ids of the most recent message with each person the user has talked to
    @Query(nativeQuery = true, value = """
        SELECT DISTINCT ON (other_id) id
        FROM (SELECT id, created_at, CASE WHEN sender_id = :me THEN receiver_id ELSE sender_id END AS other_id
              FROM messages WHERE sender_id = :me OR receiver_id = :me) t
        ORDER BY other_id, created_at DESC""")
    List<Long> lastMessageIds(@Param("me") Long me);
}
