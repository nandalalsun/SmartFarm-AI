package com.farmsmart.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PurchaseDTO {
    private UUID productId;
    private UUID customerId;
    private String supplierName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal weight;
    private BigDecimal totalCost;
    private BigDecimal initialPaidAmount;
    private String paymentMethod;
}
