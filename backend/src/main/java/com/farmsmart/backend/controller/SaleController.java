package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.SaleRequestDTO;
import com.farmsmart.backend.entity.Sale;
import com.farmsmart.backend.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired private FinanceService financeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'SALES', 'STAFF')")
    public Sale createSale(@RequestBody SaleRequestDTO request) {
        return financeService.createSale(request);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'SALES', 'STAFF', 'ACCOUNTANT', 'VIEW_ONLY')")
    public java.util.List<com.farmsmart.backend.dto.SaleHistoryDTO> getHistory() {
        return financeService.getSalesHistory();
    }
}
