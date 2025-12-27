package com.farmsmart.backend.auth.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Invitation entity for invitation-only user registration.
 * Each invitation is tied to an email address and a specific role.
 */
@Entity
@Table(name = "user_invitations")
@Getter
@Setter
@NoArgsConstructor
public class Invitation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String email;

    /**
     * Unique invitation code sent to the user.
     */
    @Column(nullable = false, unique = true)
    private String code;

    @ManyToOne(optional = false)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * Timestamp when the invitation was used.
     */
    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Invitation(String email, String code, Role role, LocalDateTime expiresAt, User createdBy) {
        this.email = email;
        this.code = code;
        this.role = role;
        this.expiresAt = expiresAt;
        this.createdBy = createdBy;
    }

    /**
     * Invitation status enum.
     */
    public enum InvitationStatus {
        PENDING,
        ACCEPTED,
        REVOKED,
        EXPIRED
    }
}
