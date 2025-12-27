package com.farmsmart.backend.auth.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * User entity representing a system user.
 * Supports both local authentication (email/password) and OAuth2 (Google).
 * Users can only be created via invitation.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    /**
     * Password hash for local authentication.
     * Nullable for OAuth-only users.
     */
    @Column(name = "password_hash")
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    /**
     * Authentication provider used for this user.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, columnDefinition = "varchar(255) default 'LOCAL'")
    private AuthProvider authProvider = AuthProvider.LOCAL;

    /**
     * Whether the user account is active.
     */
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled = true;

    /**
     * Whether 2FA is enabled for this user.
     */
    @Column(name = "is_2fa_enabled", nullable = false, columnDefinition = "boolean default false")
    private boolean twoFactorEnabled = false;

    /**
     * Google OAuth2 subject identifier for linking Google accounts.
     */
    @Column(name = "google_sub")
    private String googleSub;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public User(String email, String password, String firstName, String lastName, AuthProvider authProvider) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.authProvider = authProvider;
    }

    /**
     * Authentication provider enum.
     */
    public enum AuthProvider {
        LOCAL,
        GOOGLE
    }
}
