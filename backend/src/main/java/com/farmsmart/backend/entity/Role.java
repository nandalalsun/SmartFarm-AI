package com.farmsmart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, unique = true)
    private RoleName name;

    public enum RoleName {
        ROLE_OWNER,
        ROLE_MANAGER,
        ROLE_ACCOUNTANT,
        ROLE_SALES,
        ROLE_VIEW_ONLY
    }
    
    public Role(RoleName name) {
        this.name = name;
    }
}
