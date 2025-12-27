package com.farmsmart.backend.auth.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

/**
 * 2FA verification request DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Verify2FARequest {
    
    @NotBlank
    private String email;

    @NotBlank
    private String code;
}
