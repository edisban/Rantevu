package com.rendezvous.backend.auth;

// The token itself is not in the body: it is set as an HttpOnly cookie
public record AuthResponse(String role, Long userId, String fullName) {}
