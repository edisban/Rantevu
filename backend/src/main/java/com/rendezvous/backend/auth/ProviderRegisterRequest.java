package com.rendezvous.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProviderRegisterRequest(
    @NotBlank(message = "Username is required") @Size(max = 50, message = "Username must be at most 50 characters") String username,
    @NotBlank(message = "Email is required") @Email(message = "Email is not valid") String email,
    @NotBlank(message = "Password is required") @Size(max = 100, message = "Password must be at most 100 characters")
    @Pattern(regexp = "^(?=.*\\p{L})(?=.*\\d).{8,}$", message = "Password must be at least 8 characters and include a letter and a number") String password,
    @NotBlank(message = "Full name is required") @Size(max = 100, message = "Full name must be at most 100 characters") String fullName,
    @Size(max = 100, message = "Specialty must be at most 100 characters") String specialty) {}
