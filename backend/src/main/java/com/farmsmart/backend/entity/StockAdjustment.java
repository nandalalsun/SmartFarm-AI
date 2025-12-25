package com.farmsmart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class StockAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer adjustmentQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdjustmentType adjustmentType;

    private String reason;

    @Column(nullable = false)
    private LocalDateTime adjustedAt;

    private UUID adjustedByUserId;

    @PrePersist
    protected void onCreate() {
        if (adjustedAt == null) {
            adjustedAt = LocalDateTime.now();
        }
    }
}
