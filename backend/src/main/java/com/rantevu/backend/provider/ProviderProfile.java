package com.rantevu.backend.provider;

import com.rantevu.backend.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "provider_profiles")
public class ProviderProfile {
    @Id
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

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Double getPricePerVisit() { return pricePerVisit; }
    public void setPricePerVisit(Double pricePerVisit) { this.pricePerVisit = pricePerVisit; }
}
