package com.farmsmart.backend.auth.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Invitation response DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {
    
    private UUID id;
    private String email;
    private String code;
    private String role;
    private LocalDateTime expiresAt;
    private String status;
}
