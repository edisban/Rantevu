package com.rantevu.backend.auth;

public record ClientRegisterRequest(String username, String email, String password, String fullName) {}
