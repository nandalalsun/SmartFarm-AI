package com.farmsmart.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BillAnalysisResponse {
    @JsonProperty("suggested_type")
    private String suggestedType;

    @JsonProperty("confidence_score")
    private Double confidenceScore;

    private ExtractedBillDTO data;
    
    @JsonProperty("review_required_fields")
    private List<String> reviewRequiredFields;
}
