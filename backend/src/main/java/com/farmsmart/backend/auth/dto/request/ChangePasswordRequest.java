package com.farmsmart.backend.auth.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ChangePasswordRequest {
    
    @NotEmpty
    private String currentPassword;
    
    @NotEmpty
    private String newPassword;
}
