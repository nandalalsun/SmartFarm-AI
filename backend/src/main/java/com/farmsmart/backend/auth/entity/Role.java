package com.farmsmart.backend.auth.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;

/**
 * Role entity representing user roles in the system.
 * Supports both existing roles and new standardized role names.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, unique = true, nullable = false)
    private RoleName name;

    public Role(RoleName name) {
        this.name = name;
    }

    /**
     * Role names enum.
     * Includes both existing roles and new standardized names.
     */
    public enum RoleName {
        // Existing roles
        ROLE_OWNER,
        ROLE_MANAGER,
        ROLE_ACCOUNTANT,
        ROLE_SALES,
        ROLE_VIEW_ONLY,
        
        // New standardized roles
        ROLE_ADMIN,
        ROLE_STAFF
    }
}
