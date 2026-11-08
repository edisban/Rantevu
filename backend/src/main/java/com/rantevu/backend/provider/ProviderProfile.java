package com.rantevu.backend.provider;

import com.rantevu.backend.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.AccessLevel;

@Entity
@Table(name = "provider_profiles")
@Getter
@Setter
public class ProviderProfile {
    @Id
    @Setter(AccessLevel.NONE) // the id comes from the user via @MapsId
    private Long userId;
    @OneToOne @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    private String specialty;
    @Column(columnDefinition = "TEXT")
    private String bio;
    private String address;
    @Column(name = "price_per_visit")
    private Double pricePerVisit;
}
