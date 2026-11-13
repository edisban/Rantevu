package com.rendezvous.backend.provider;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {
    @Modifying
    @Query("delete from ProviderProfile p where p.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
