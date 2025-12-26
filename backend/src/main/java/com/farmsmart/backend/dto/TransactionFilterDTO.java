package com.farmsmart.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TransactionFilterDTO {
    private UUID customerId;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private String paymentStatus;
}
