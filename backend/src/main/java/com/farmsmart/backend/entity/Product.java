package com.farmsmart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    // FEED / MEDICINE / LIVE_CHICK / MEAT / EGGS
    private String category;

    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    
    // KG / BAG / PIECE
    private String unit;
    
    private Integer currentStock = 0;
}
