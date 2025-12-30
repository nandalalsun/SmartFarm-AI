package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.TransactionFilterDTO;
import com.farmsmart.backend.dto.TransactionReportDTO;
import com.farmsmart.backend.service.FinanceService;
import com.farmsmart.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    @Autowired private FinanceService financeService;
    @Autowired private ReportService reportService;
    @Autowired private com.farmsmart.backend.service.PaymentSettlementService paymentSettlementService;

    @PostMapping("/payments/settle")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<com.farmsmart.backend.dto.SettlePaymentResponse> settlePayment(
            @RequestBody @jakarta.validation.Valid com.farmsmart.backend.dto.SettlePaymentRequest request) {
        return ResponseEntity.ok(paymentSettlementService.settlePayment(request));
    }

    @GetMapping("/customers/{customerId}/unpaid-sales")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT', 'CASHIER')")
    public ResponseEntity<java.util.List<com.farmsmart.backend.dto.UnpaidSaleDTO>> getUnpaidSales(
            @PathVariable UUID customerId) {
        return ResponseEntity.ok(paymentSettlementService.getUnpaidSalesForCustomer(customerId));
    }

    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public Map<String, Object> getReport() {
        return financeService.getProfitReport();
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
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

    @GetMapping("/ledger")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<java.util.List<com.farmsmart.backend.dto.UnifiedTransactionDTO>> getLedger(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String paymentStatus) {
        
        TransactionFilterDTO filter = new TransactionFilterDTO();
        filter.setCustomerId(customerId);
        filter.setFromDate(fromDate);
        filter.setToDate(toDate);
        filter.setPaymentStatus(paymentStatus);

        return ResponseEntity.ok(financeService.getUnifiedTransactions(filter));
    }
}
