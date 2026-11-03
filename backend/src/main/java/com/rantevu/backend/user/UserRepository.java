package com.rantevu.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    // A direct DELETE, run in order with the other bulk deletes of an account removal
    @Modifying(clearAutomatically = true)
    @Query("delete from User u where u.id = :id")
    int deleteByIdNow(@Param("id") Long id);
}
