package com.rantevu.backend.auth;

public record AuthResponse(String token, String role, Long userId, String fullName) {}
