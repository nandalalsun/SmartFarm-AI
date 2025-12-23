package com.farmsmart.backend.dto.dashboard;

import lombok.Data;

@Data
public class TopCreditDTO {
    private String id;
    private String name;
    private Double currentBalance;
    private Double creditLimit;
}
