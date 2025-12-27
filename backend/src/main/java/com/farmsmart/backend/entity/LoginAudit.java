package com.farmsmart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@Table(name = "login_audit")
public class LoginAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // Can be null if login failed for unknown user

    @Column(nullable = false)
    private String email; // Store email attempted

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoginStatus status;

    private String ipAddress;
    private String failureReason;

    public enum LoginStatus {
        SUCCESS,
        FAILURE,
        MFA_REQUIRED
    }

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
