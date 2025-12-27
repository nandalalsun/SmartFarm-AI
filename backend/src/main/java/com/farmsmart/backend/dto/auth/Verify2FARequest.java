package com.farmsmart.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class Verify2FARequest {
    @NotBlank
    private String email;
    private int code;
}
