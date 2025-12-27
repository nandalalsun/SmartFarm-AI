package com.farmsmart.backend.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Set;
import java.util.UUID;

/**
 * User information response DTO for /me endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;

    @JsonProperty("is2faEnabled")
    private boolean twoFactorEnabled;
}
