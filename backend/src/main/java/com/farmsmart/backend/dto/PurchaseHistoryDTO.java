package com.farmsmart.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PurchaseHistoryDTO {
    private UUID id;
    private LocalDateTime date;
    private String supplierName;
    private String productName;
    private Integer quantity;
    private BigDecimal totalCost;
}
