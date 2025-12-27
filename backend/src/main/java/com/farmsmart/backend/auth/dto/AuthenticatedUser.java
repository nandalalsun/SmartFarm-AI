package com.farmsmart.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;
import java.util.UUID;

/**
 * Public abstraction for authenticated user information.
 * This is the ONLY way other modules should access user data.
 * Prevents direct access to User entity from other modules.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticatedUser {
    
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;

    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
