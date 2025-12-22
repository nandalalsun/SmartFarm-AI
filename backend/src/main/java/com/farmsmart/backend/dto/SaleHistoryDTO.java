package com.farmsmart.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class SaleHistoryDTO {
    private UUID id;
    private LocalDateTime date;
    private String customerName;
    private BigDecimal totalBillAmount;
    private BigDecimal initialPaidAmount; // Amount paid upfront
    private BigDecimal remainingBalance;
    private String paymentStatus;
    
    private List<SaleHistoryItemDTO> items;
    private List<PaymentHistoryDTO> paymentHistory;
}
