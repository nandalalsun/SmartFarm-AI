package com.farmsmart.backend.dto.auth;

import lombok.Data;

@Data
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
