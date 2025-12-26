package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.TransactionFilterDTO;
import com.farmsmart.backend.dto.TransactionReportDTO;
import com.farmsmart.backend.service.FinanceService;
import com.farmsmart.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*")
public class FinanceController {

    @Autowired private FinanceService financeService;
    @Autowired private ReportService reportService;

    @GetMapping("/report")
    public Map<String, Object> getReport() {
        return financeService.getProfitReport();
    }

    @GetMapping("/transactions")
    public ResponseEntity<TransactionReportDTO> getTransactionReport(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String paymentStatus) {
        
        TransactionFilterDTO filter = new TransactionFilterDTO();
        filter.setCustomerId(customerId);
        filter.setFromDate(fromDate);
        filter.setToDate(toDate);
        filter.setPaymentStatus(paymentStatus);

        return ResponseEntity.ok(reportService.generateTransactionReport(filter));
    }
}
