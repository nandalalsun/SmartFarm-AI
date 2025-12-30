package com.farmsmart.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UnpaidSaleDTO {
    private UUID saleId;
    private LocalDateTime createdAt;
    private BigDecimal totalAmount;
    private BigDecimal remainingBalance;
    private String paymentStatus;
    private String itemsSummary; // e.g., "3 items"
}
