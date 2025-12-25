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

    @JsonProperty("customer_type_suggestion")
    private String customerTypeSuggestion;
    
    private String date;
    
    @JsonProperty("total_amount")
    private BigDecimal totalAmount;

    @JsonProperty("tax_amount")
    private BigDecimal taxAmount;

    @JsonProperty("payment_method_hint")
    private String paymentMethodHint;
    
    private List<ExtractedItemDTO> items;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExtractedItemDTO {
        @JsonProperty("product_name")
        private String productName;
        
        private Integer quantity;

        private String unit;
        
        @JsonProperty("unit_price")
        private BigDecimal unitPrice;
        
        @JsonProperty("line_total")
        private BigDecimal lineTotal;
    }
}
