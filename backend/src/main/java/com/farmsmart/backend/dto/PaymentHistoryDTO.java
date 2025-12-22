package com.farmsmart.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentHistoryDTO {
    private LocalDateTime paymentDate;
    private BigDecimal amountPaid;
    private String paymentMethod;
}
