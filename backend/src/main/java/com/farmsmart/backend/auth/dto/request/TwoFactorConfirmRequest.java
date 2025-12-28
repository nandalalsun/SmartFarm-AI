package com.farmsmart.backend.auth.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TwoFactorConfirmRequest {
    
    @NotEmpty
    private String secretKey;
    
    @NotEmpty
    private String code;
}
