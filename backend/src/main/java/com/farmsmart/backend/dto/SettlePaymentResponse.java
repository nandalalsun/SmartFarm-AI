package com.farmsmart.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class SettlePaymentResponse {
    private UUID transactionId;
    private UUID customerId;
    private BigDecimal amountSettled;
    private BigDecimal remainingCustomerBalance;
    private List<AffectedSaleDTO> affectedSales;
    private int updatedLedgerEntries;
    
    @Data
    public static class AffectedSaleDTO {
        private UUID saleId;
        private BigDecimal previousBalance;
        private BigDecimal newBalance;
        private String paymentStatus;
    }
}
