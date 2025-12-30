package com.farmsmart.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SettlePaymentRequest {
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    
    @NotNull(message = "Payment amount is required")
    @Positive(message = "Payment amount must be greater than zero")
    private BigDecimal amount;
    
    @NotNull(message = "Payment method is required")
    private String paymentMethod; // CASH, CHECK, ESEWA, CARD
    
    private String remarks; // Optional notes
    
    private UUID saleId; // Optional - for targeted payment to specific sale
}
