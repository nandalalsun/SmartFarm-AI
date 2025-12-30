package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.dashboard.DashboardStatsDTO;
import com.farmsmart.backend.dto.dashboard.RevenueExpenseDayDTO;
import com.farmsmart.backend.dto.dashboard.StockDistributionDTO;
import com.farmsmart.backend.dto.dashboard.TopCreditDTO;
import com.farmsmart.backend.service.DashboardService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public DashboardStatsDTO getDashboardStats() {
        return dashboardService.getDashboardStats();
    }
    
    /**
     * GET /api/dashboard/revenue-expense
     * Returns last 7 days revenue vs expense data
     */
    @GetMapping("/revenue-expense")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public List<RevenueExpenseDayDTO> getRevenueExpenseData() {
        return dashboardService.getRevenueExpenseData();
    }
    
    /**
     * GET /api/dashboard/stock-distribution
     * Returns stock value by category
     */
    @GetMapping("/stock-distribution")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT', 'SALES', 'STAFF', 'VIEW_ONLY')")
    public List<StockDistributionDTO> getStockDistribution() {
        return dashboardService.getStockDistribution();
    }
    
    /**
     * GET /api/dashboard/top-credits
     * Returns top 5 customers by credit balance
     */
    @GetMapping("/top-credits")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public List<TopCreditDTO> getTopCredits() {
        return dashboardService.getTopCredits();
    }
    
    @GetMapping("/alerts/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT', 'SALES', 'STAFF', 'VIEW_ONLY')")
    public List<Map<String, Object>> getLowStockAlerts() {
        return dashboardService.getLowStockAlerts();
    }

    @GetMapping("/alerts/aging-credit")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public List<Map<String, Object>> getAgingCredits() {
        return dashboardService.getAgingCredits();
    }

    @GetMapping("/stock-movement")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT', 'SALES', 'STAFF', 'VIEW_ONLY')")
    public List<Map<String, Object>> getRecentStockMovement() {
        return dashboardService.getRecentStockMovement();
    }

    /**
     * GET /api/dashboard/ai-insights
     * Returns AI-generated insights
     */
    @GetMapping("/ai-insights")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public List<String> getAIInsights() {
        return dashboardService.getAIInsights();
    }
}
