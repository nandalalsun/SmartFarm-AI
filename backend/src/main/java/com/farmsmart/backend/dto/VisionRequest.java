package com.farmsmart.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class VisionRequest {
    private String model;
    private String prompt;
    @Builder.Default
    private boolean stream = false;
    private List<String> images;
}
