package com.farmsmart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Data
public class SaleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sale_id")
    private Sale sale;

    @ManyToOne(optional = false)
    private Product product;

    private Integer quantity;
    
    // Price at moment of sale (snapshot)
    private BigDecimal unitPrice;
    
    private BigDecimal lineTotal;
}
