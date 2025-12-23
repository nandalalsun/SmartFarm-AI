package com.farmsmart.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class DashboardStatsDTO {
    private KpiStatDTO revenue;
    private KpiStatDTO profit;
    private KpiStatDTO stockValue;
    private KpiStatDTO credits;
}
