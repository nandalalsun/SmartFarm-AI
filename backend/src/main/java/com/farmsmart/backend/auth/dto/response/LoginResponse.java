package com.farmsmart.backend.auth.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Login response DTO containing JWT tokens.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private boolean mfaRequired;

    public LoginResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.mfaRequired = false;
    }

    public LoginResponse(boolean mfaRequired) {
        this.mfaRequired = mfaRequired;
    }
}
