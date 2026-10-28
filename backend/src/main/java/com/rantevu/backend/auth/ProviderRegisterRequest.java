package com.rantevu.backend.auth;

public record ProviderRegisterRequest(String username, String email, String password, String fullName) {}
