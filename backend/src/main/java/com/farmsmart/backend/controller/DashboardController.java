package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.dashboard.DashboardStatsDTO;
import com.farmsmart.backend.dto.dashboard.RevenueExpenseDayDTO;
import com.farmsmart.backend.dto.dashboard.StockDistributionDTO;
import com.farmsmart.backend.dto.dashboard.TopCreditDTO;
import com.farmsmart.backend.service.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/dashboard/stats
     * Returns KPI stats with 7-day trends
     */
    @GetMapping("/stats")
    public DashboardStatsDTO getDashboardStats() {
        return dashboardService.getDashboardStats();
    }
    
    /**
     * GET /api/dashboard/revenue-expense
     * Returns last 7 days revenue vs expense data
     */
    @GetMapping("/revenue-expense")
    public List<RevenueExpenseDayDTO> getRevenueExpenseData() {
        return dashboardService.getRevenueExpenseData();
    }
    
    /**
     * GET /api/dashboard/stock-distribution
     * Returns stock value by category
     */
    @GetMapping("/stock-distribution")
    public List<StockDistributionDTO> getStockDistribution() {
        return dashboardService.getStockDistribution();
    }
    
    /**
     * GET /api/dashboard/top-credits
     * Returns top 5 customers by credit balance
     */
    @GetMapping("/top-credits")
    public List<TopCreditDTO> getTopCredits() {
        return dashboardService.getTopCredits();
    }
    
    /**
     * GET /api/dashboard/ai-insights
     * Returns AI-generated insights (rule-based for now)
     */
    @GetMapping("/ai-insights")
    public List<String> getAIInsights() {
        return dashboardService.getAIInsights();
    }
}
