package com.farmsmart.backend.entity;

import com.farmsmart.backend.auth.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private Product product;

    @ManyToOne
    private Customer customer;

    private String supplierName;
    private Integer quantity;
    private BigDecimal totalCost;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    private LocalDateTime purchaseDate;

    @PrePersist
    protected void onCreate() {
        purchaseDate = LocalDateTime.now();
    }
}
