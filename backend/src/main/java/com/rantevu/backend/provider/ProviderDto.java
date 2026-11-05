package com.rantevu.backend.provider;

// Public provider card shown in search
public record ProviderDto(Long userId, String fullName, String specialty, String bio, String address, Double pricePerVisit) {
    public static ProviderDto from(ProviderProfile p) {
        return new ProviderDto(p.getUserId(), p.getUser().getFullName(), p.getSpecialty(), p.getBio(), p.getAddress(), p.getPricePerVisit());
    }
}
