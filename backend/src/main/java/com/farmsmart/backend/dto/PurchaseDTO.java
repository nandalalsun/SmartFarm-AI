package com.farmsmart.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PurchaseDTO {
    private UUID productId;
    private String supplierName;
    private Integer quantity;
    private BigDecimal totalCost;
}
