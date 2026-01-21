package com.farmsmart.backend.dto;

import com.farmsmart.backend.enums.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ExpenseDTO {
    private UUID id;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
    private PaymentMethod paymentMethod;
    private UUID categoryId;
    private String categoryName;
    private String recordedByUserName;
    private UUID recordedByUserId;
}
