package com.farmsmart.backend.controller;

import com.farmsmart.backend.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "http://localhost:5173")
public class FinanceController {

    @Autowired private FinanceService financeService;

    @GetMapping("/report")
    public Map<String, Object> getReport() {
        return financeService.getProfitReport();
    }
}
