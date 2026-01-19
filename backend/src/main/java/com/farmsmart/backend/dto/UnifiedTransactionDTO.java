package com.farmsmart.backend.dto;

import com.farmsmart.backend.utils.enums.PaymentStatus;
import com.farmsmart.backend.utils.enums.TransactionType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UnifiedTransactionDTO {
    private UUID id;
    private LocalDateTime date;
    private TransactionType type; // "SALE" or "PURCHASE"
    private String customerName; // For Sales: Customer Name, For Purchases: Supplier/Customer Name
    private String customerPhone;
    private BigDecimal amount; // Sale Total or Purchase Total
    private BigDecimal paidAmount;
    private BigDecimal balance;
    private PaymentStatus status;
    private Integer quantity;
    private BigDecimal weight;
    private String transactionCategory; // For Settlement: RECEIPT/PAYOUT, For Purchase/Sale: null
}
