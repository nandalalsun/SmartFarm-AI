package com.farmsmart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@Table(name = "two_factor_auth")
public class TwoFactorAuth {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false)
    private String secretKey;

    @Column(columnDefinition = "TEXT")
    private String backupCodes; // Comma separated or JSON

    public TwoFactorAuth(User user, String secretKey) {
        this.user = user;
        this.secretKey = secretKey;
    }
}
