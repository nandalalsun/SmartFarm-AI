package com.farmsmart.backend.dto.dashboard;

import lombok.Data;

@Data
public class RevenueExpenseDayDTO {
    private String day;
    private Double revenue;
    private Double expense;
}
