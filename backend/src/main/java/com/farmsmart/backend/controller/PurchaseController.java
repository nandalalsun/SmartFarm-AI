package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.PurchaseDTO;
import com.farmsmart.backend.entity.Purchase;
import com.farmsmart.backend.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "http://localhost:5173")
public class PurchaseController {

    @Autowired private FinanceService financeService;

    @PostMapping
    public Purchase createPurchase(@RequestBody PurchaseDTO request) {
        return financeService.createPurchase(request);
    }

    @GetMapping("/history")
    public java.util.List<com.farmsmart.backend.dto.PurchaseHistoryDTO> getHistory() {
        return financeService.getPurchaseHistory();
    }
}
