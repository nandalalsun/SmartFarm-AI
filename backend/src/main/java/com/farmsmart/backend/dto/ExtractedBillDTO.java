package com.farmsmart.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExtractedBillDTO {
    @JsonProperty("customer_name")
    private String customerName;
    
    private String date;
    
    @JsonProperty("total_amount")
    private BigDecimal totalAmount;
    
    private List<ExtractedItemDTO> items;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExtractedItemDTO {
        @JsonProperty("product_name")
        private String productName;
        
        private Integer quantity;
        
        @JsonProperty("unit_price")
        private BigDecimal unitPrice;
        
        @JsonProperty("line_total")
        private BigDecimal lineTotal;
    }
}
