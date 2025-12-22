package com.farmsmart.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ExtractedBillDTO {
    private String customerName;
    private String date;
    private BigDecimal totalAmount;
    private List<ExtractedItemDTO> items;

    @Data
    public static class ExtractedItemDTO {
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
    }
}
