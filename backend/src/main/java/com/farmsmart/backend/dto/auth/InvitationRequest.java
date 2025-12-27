package com.farmsmart.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InvitationRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String role; // Role name (e.g. ROLE_MANAGER)
}
