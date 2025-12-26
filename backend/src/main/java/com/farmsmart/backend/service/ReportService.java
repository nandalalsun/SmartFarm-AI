package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.TransactionFilterDTO;
import com.farmsmart.backend.dto.TransactionReportDTO;
import com.farmsmart.backend.entity.Sale;
import com.farmsmart.backend.repository.SaleRepository;
import com.farmsmart.backend.repository.SaleSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private SaleRepository saleRepository;

    public TransactionReportDTO generateTransactionReport(TransactionFilterDTO filter) {
        List<Sale> transactions = saleRepository.findAll(
            SaleSpecification.filterBy(filter)
        );

        BigDecimal totalSales = transactions.stream()
            .map(Sale::getTotalBillAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = transactions.stream()
            .map(Sale::getInitialPaidAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOutstanding = transactions.stream()
            .map(Sale::getRemainingBalance)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        TransactionReportDTO report = new TransactionReportDTO();
        report.setTransactions(transactions);
        report.setTotalSales(totalSales);
        report.setTotalPaid(totalPaid);
        report.setTotalOutstanding(totalOutstanding);

        return report;
    }
}
