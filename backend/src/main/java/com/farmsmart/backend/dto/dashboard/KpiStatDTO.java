package com.farmsmart.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class KpiStatDTO {
    private Double value;
    private List<TrendPointDTO> trend;
    private double change;
}
