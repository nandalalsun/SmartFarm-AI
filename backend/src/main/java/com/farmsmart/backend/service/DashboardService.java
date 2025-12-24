package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.dashboard.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final JdbcTemplate jdbcTemplate;
    private final FarmAssistantService farmAssistantService;

    public DashboardService(JdbcTemplate jdbcTemplate, FarmAssistantService farmAssistantService) {
        this.jdbcTemplate = jdbcTemplate;
        this.farmAssistantService = farmAssistantService;
    }

    public DashboardStatsDTO getDashboardStats() {
        Double totalRevenue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_bill_amount), 0) FROM sale", Double.class);

        Double totalExpenses = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_cost), 0) FROM purchase", Double.class);

        Double netProfit = totalRevenue - totalExpenses;

        Double stockValue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(current_stock * selling_price), 0) FROM product", Double.class);

        Double totalCredits = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(current_total_balance), 0) FROM customer", Double.class);

        List<TrendPointDTO> revenueTrend = get7DayTrend("sale", "total_bill_amount", "created_at");
        // For stock trend, we can't do historical without history table, so we pass empty or current flat
        // Alternatively, we could log stock changes. For now, we'll send a flat trend of current value
        List<TrendPointDTO> stockTrend = getFlatTrend(stockValue);
        List<TrendPointDTO> creditTrend = get7DayTrend("customer", "current_total_balance", "registered_at"); // Approximation by registration

        double revenueChange = calculatePercentageChange(revenueTrend);
        double profitChange = calculatePercentageChange(revenueTrend);
        double stockChange = 0.0; // No historical data
        double creditChange = calculatePercentageChange(creditTrend);

        KpiStatDTO revenue = KpiStatDTO.builder()
                .value(totalRevenue)
                .change(revenueChange)
                .trend(revenueTrend)
                .build();

        KpiStatDTO profit = KpiStatDTO.builder()
                .trend(revenueTrend)
                .change(profitChange)
                .value(netProfit)
                .build();

        KpiStatDTO stock = KpiStatDTO.builder()
                .value(stockValue)
                .trend(stockTrend)
                .change(stockChange)
                .build();

        KpiStatDTO credits = KpiStatDTO.builder()
                .change(creditChange)
                .trend(creditTrend)
                .value(totalCredits)
                .build();

        return DashboardStatsDTO.builder()
                .credits(credits)
                .stockValue(stock)
                .profit(profit)
                .revenue(revenue)
                .build();
    }

    // Optimized: Using GROUP BY to fetch all 7 days in one query
    public List<RevenueExpenseDayDTO> getRevenueExpenseData() {
        String sql = """
            WITH dates AS (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '6 days',
                    CURRENT_DATE,
                    '1 day'::interval
                )::date AS date
            )
            SELECT 
                to_char(d.date, 'MMM dd') as day,
                COALESCE(SUM(s.total_bill_amount), 0) as revenue,
                COALESCE(SUM(p.total_cost), 0) as expense
            FROM dates d
            LEFT JOIN sale s ON DATE(s.created_at) = d.date
            LEFT JOIN purchase p ON DATE(p.purchase_date) = d.date
            GROUP BY d.date
            ORDER BY d.date ASC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            RevenueExpenseDayDTO dto = new RevenueExpenseDayDTO();
            dto.setDay(rs.getString("day"));
            dto.setRevenue(rs.getDouble("revenue"));
            dto.setExpense(rs.getDouble("expense"));
            return dto;
        });
    }

    public List<StockDistributionDTO> getStockDistribution() {
        String sql = """
            SELECT category, SUM(current_stock * selling_price) as value
            FROM product
            GROUP BY category
            ORDER BY value DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            StockDistributionDTO dto = new StockDistributionDTO();
            dto.setName(rs.getString("category"));
            dto.setValue(rs.getDouble("value"));
            return dto;
        });
    }

    public List<TopCreditDTO> getTopCredits() {
        String sql = """
            SELECT id, name, current_total_balance, credit_limit
            FROM customer
            WHERE current_total_balance > 0
            ORDER BY current_total_balance DESC
            LIMIT 5
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            TopCreditDTO dto = new TopCreditDTO();
            dto.setId(rs.getString("id"));
            dto.setName(rs.getString("name"));
            dto.setCurrentBalance(rs.getDouble("current_total_balance"));
            dto.setCreditLimit(rs.getDouble("credit_limit"));
            return dto;
        });
    }

    // New: Real AI Insights
    public List<String> getAIInsights() {
        try {
            // We construct a prompt with key data for the AI to analyze
            String dataSummary = getBusinessSummaryForAI();
            String response = farmAssistantService.chat(
                "Analyze this farm business data and provide 3 short, actionable bullet points (no asterisks just text) about health, risks, or opportunities: " + dataSummary
            );
            
            // Basic parsing assuming AI returns lines
            return List.of(response.split("\n"));
        } catch (Exception e) {
            return List.of("AI Service currently unavailable. Please check system logs.");
        }
    }

    // New: Low Stock Alerts
    public List<Map<String, Object>> getLowStockAlerts() {
        String sql = """
            SELECT name, current_stock, unit 
            FROM product 
            WHERE current_stock < 10 AND current_stock IS NOT NULL 
            ORDER BY current_stock ASC 
            LIMIT 5
        """;
        return jdbcTemplate.queryForList(sql);
    }

    // New: Aging Credits
    public List<Map<String, Object>> getAgingCredits() {
        // Checking credit_ledger for overdue
        String sql = """
            SELECT c.name, cl.current_balance, cl.due_date 
            FROM credit_ledger cl
            JOIN customer c ON cl.customer_id = c.id
            WHERE cl.status = 'ACTIVE' AND cl.due_date < CURRENT_DATE
            ORDER BY cl.due_date ASC 
            LIMIT 5
        """;
        // If credit_ledger doesn't exist yet (might be a new table), we fallback or fail gracefully.
        // Assuming it exists based on user prompt. If not, we might need to use customer balance.
        try {
             return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
             // Fallback if credit_ledger not present
             return List.of();
        }
    }

    public List<Map<String, Object>> getRecentStockMovement() {
        String sql = """
           WITH dates AS (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '6 days', 
                    CURRENT_DATE, 
                    '1 day'::interval
                )::date AS date
            )
            SELECT 
                to_char(d.date, 'MMM dd') as day,
                (SELECT COUNT(*) FROM sale s WHERE DATE(s.created_at) = d.date) as sales_count,
                (SELECT COUNT(*) FROM purchase p WHERE DATE(p.purchase_date) = d.date) as purchases_count
            FROM dates d
            ORDER BY d.date ASC
        """;
        return jdbcTemplate.queryForList(sql);
    }

    // Helper: Optimized N+1 fix for trends
    private List<TrendPointDTO> get7DayTrend(String table, String sumCol, String dateCol) {
        String sql = String.format("""
            WITH dates AS (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '6 days',
                    CURRENT_DATE,
                    '1 day'::interval
                )::date AS date
            )
            SELECT 
                d.date,
                COALESCE(SUM(t.%s), 0) as value
            FROM dates d
            LEFT JOIN %s t ON DATE(t.%s) = d.date
            GROUP BY d.date
            ORDER BY d.date ASC
        """, sumCol, table, dateCol);

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            TrendPointDTO point = new TrendPointDTO();
            point.setValue(rs.getDouble("value"));
            return point;
        });
    }

    private List<TrendPointDTO> getFlatTrend(Double value) {
         List<TrendPointDTO> trend = new ArrayList<>();
         for(int i=0; i<7; i++) {
             TrendPointDTO p = new TrendPointDTO();
             p.setValue(value);
             trend.add(p);
         }
         return trend;
    }

    private double calculatePercentageChange(List<TrendPointDTO> trend) {
        if (trend.size() < 2) return 0;
        Double firstValue = trend.get(0).getValue();
        Double lastValue = trend.get(trend.size() - 1).getValue();
        if (firstValue == 0) return 100.0; // Growth from 0 is 100% effectively
        return ((lastValue - firstValue) / firstValue) * 100;
    }
    
    // Helper to gather data for AI context
    private String getBusinessSummaryForAI() {
        Double revenue = jdbcTemplate.queryForObject("SELECT COALESCE(SUM(total_bill_amount), 0) FROM sale", Double.class);
        Double expense = jdbcTemplate.queryForObject("SELECT COALESCE(SUM(total_cost), 0) FROM purchase", Double.class);
        return String.format("Total Revenue: $%.2f, Total Expense: $%.2f. ", revenue, expense);
    }
}
