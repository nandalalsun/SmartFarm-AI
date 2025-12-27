package com.farmsmart.backend.auth.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

/**
 * Token refresh request DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenRefreshRequest {
    
    @NotBlank
    private String refreshToken;
}
