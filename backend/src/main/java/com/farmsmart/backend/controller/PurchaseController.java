package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.PurchaseDTO;
import com.farmsmart.backend.entity.Purchase;
import com.farmsmart.backend.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    @Autowired private FinanceService financeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public Purchase createPurchase(@RequestBody PurchaseDTO request) {
        return financeService.createPurchase(request);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT', 'VIEW_ONLY')")
    public java.util.List<com.farmsmart.backend.dto.PurchaseHistoryDTO> getHistory() {
        return financeService.getPurchaseHistory();
    }
}
