package com.farmsmart.backend.auth.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

/**
 * Signup request DTO for invitation-based registration.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    
    @NotBlank
    private String code; // Invitation code

    @NotBlank
    private String password;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;
}
