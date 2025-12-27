package com.farmsmart.backend.auth.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Two-Factor Authentication entity for storing TOTP secrets.
 */
@Entity
@Table(name = "two_factor_auth")
@Getter
@Setter
@NoArgsConstructor
public class TwoFactorAuth {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "secret_key", nullable = false)
    private String secretKey;

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "enabled_at")
    private LocalDateTime enabledAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public TwoFactorAuth(User user, String secretKey) {
        this.user = user;
        this.secretKey = secretKey;
    }
}
