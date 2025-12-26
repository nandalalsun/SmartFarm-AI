package com.farmsmart.backend.dto;

import com.farmsmart.backend.entity.Sale;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class TransactionReportDTO {
    private List<Sale> transactions;
    private BigDecimal totalSales;
    private BigDecimal totalPaid;
    private BigDecimal totalOutstanding;
}
