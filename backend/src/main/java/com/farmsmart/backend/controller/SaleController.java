package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.SaleRequestDTO;
import com.farmsmart.backend.entity.Sale;
import com.farmsmart.backend.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired private FinanceService financeService;

    @PostMapping
    public Sale createSale(@RequestBody SaleRequestDTO request) {
        return financeService.createSale(request);
    }

    @GetMapping("/history")
    public java.util.List<com.farmsmart.backend.dto.SaleHistoryDTO> getHistory() {
        return financeService.getSalesHistory();
    }
}
