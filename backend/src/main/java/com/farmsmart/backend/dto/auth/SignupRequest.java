package com.farmsmart.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    private String token; // Invitation token

    @NotBlank
    private String password;

    @NotBlank
    private String firstName;
    
    @NotBlank
    private String lastName;
}
