package com.rantevu.backend.user;

// The signed-in user's own account details
public record MeResponse(Long id, String username, String email, String fullName, String phone, Role role) {
    public static MeResponse from(User u) {
        return new MeResponse(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getPhone(), u.getRole());
    }
}
