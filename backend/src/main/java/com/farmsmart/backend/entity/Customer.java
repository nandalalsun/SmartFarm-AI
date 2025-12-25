package com.farmsmart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String phone;
    private String address;
    private String email;
    
    // FARMER / BUTCHER / RETAIL
    private String customerType;

    private BigDecimal creditLimit;
    private BigDecimal currentTotalBalance = BigDecimal.ZERO;

    @Column(updatable = false)
    private LocalDateTime registeredAt;

    @PrePersist
    protected void onCreate() {
        registeredAt = LocalDateTime.now();
    }
}
