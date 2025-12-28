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

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (timestamp == null) {
            timestamp = now;
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
