package com.farmsmart.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class SaleRequestDTO {
    private UUID customerId;
    private BigDecimal initialPaidAmount;
    private String paymentMethod; // CASH, CHECK, TRANSFER
    private String saleChannel; // POS, WHATSAPP, FIELD
    private List<SaleItemDTO> items;
}
