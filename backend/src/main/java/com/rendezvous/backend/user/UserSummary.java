package com.rendezvous.backend.user;

// The other party of an appointment, as shown to clients and providers
public record UserSummary(Long id, String fullName, String email, String phone) {
    public static UserSummary from(User u) {
        return new UserSummary(u.getId(), u.getFullName(), u.getEmail(), u.getPhone());
    }
}
