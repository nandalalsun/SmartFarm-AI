package com.farmsmart.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SettlementRequestDTO {
    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;
    
    private String notes;
    private LocalDateTime transactionDate;
}
