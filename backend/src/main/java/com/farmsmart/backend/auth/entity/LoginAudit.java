package com.farmsmart.backend.auth.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Login audit entity for tracking login attempts and security events.
 */
@Entity
@Table(name = "login_audit")
@Getter
@Setter
@NoArgsConstructor
public class LoginAudit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoginStatus status;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public LoginAudit(User user, String email, LoginStatus status, String failureReason) {
        this.user = user;
        this.email = email;
        this.status = status;
        this.failureReason = failureReason;
    }

    /**
     * Login status enum.
     */
    public enum LoginStatus {
        SUCCESS,
        FAILURE,
        MFA_REQUIRED
    }
}
