package com.farmsmart.backend.dto;

import com.farmsmart.backend.entity.PaymentTransaction;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class PaymentHistoryDTO {
    private LocalDateTime paymentDate;
    private BigDecimal amountPaid;
    private String paymentMethod;
    public PaymentHistoryDTO(PaymentTransaction tnx) {
        this.amountPaid = tnx.getAmountPaid();
        this.paymentDate = tnx.getPaymentDate();
        this.paymentMethod = tnx.getPaymentMethod();
    }
}
