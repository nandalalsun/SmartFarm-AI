package com.farmsmart.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SaleHistoryItemDTO {
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
