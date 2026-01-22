package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.*;
import com.farmsmart.backend.entity.PaymentTransaction;
import com.farmsmart.backend.service.FinanceService;
import com.farmsmart.backend.service.PaymentSettlementService;
import com.farmsmart.backend.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    @Autowired private FinanceService financeService;
    @Autowired private ReportService reportService;
    @Autowired private PaymentSettlementService paymentSettlementService;

    @PostMapping("/settlements")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<PaymentTransaction> createSettlement(
            @RequestBody @Valid SettlementRequestDTO request) {
        return ResponseEntity.ok(paymentSettlementService.processSettlement(request));
    }

    @GetMapping("/customers/{customerId}/unpaid-sales")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT', 'CASHIER')")
    public ResponseEntity<List<UnpaidSaleDTO>> getUnpaidSales(
            @PathVariable UUID customerId) {
        return ResponseEntity.ok(paymentSettlementService.getUnpaidSalesForCustomer(customerId));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<TransactionReportDTO> getTransactionReport(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String paymentStatus) {
        return ResponseEntity.ok(reportService.generateTransactionReport(
                TransactionFilterDTO.builder()
                        .customerId(customerId)
                        .fromDate(fromDate)
                        .toDate(toDate)
                        .paymentStatus(paymentStatus)
                        .build()
                )
        );

    }

    @GetMapping("/ledger")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<List<UnifiedTransactionDTO>> getLedger(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String paymentStatus) {

        return ResponseEntity.ok(financeService.getUnifiedTransactions(
                TransactionFilterDTO.builder()
                .customerId(customerId)
                .fromDate(fromDate)
                .toDate(toDate)
                .paymentStatus(paymentStatus)
                .build())
        );
    }
}
