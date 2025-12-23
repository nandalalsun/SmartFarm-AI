package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.dashboard.DashboardStatsDTO;
import com.farmsmart.backend.dto.dashboard.KpiStatDTO;
import com.farmsmart.backend.dto.dashboard.RevenueExpenseDayDTO;
import com.farmsmart.backend.dto.dashboard.StockDistributionDTO;
import com.farmsmart.backend.dto.dashboard.TopCreditDTO;
import com.farmsmart.backend.dto.dashboard.TrendPointDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Map;
import java.util.List;

@Service
public class DashboardService {

    private final JdbcTemplate jdbcTemplate;

    public DashboardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
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

        List<TrendPointDTO> revenueTrend = get7DayTrend("sale", "total_bill_amount");
        List<TrendPointDTO> stockTrend = get7DayStockTrend();
        List<TrendPointDTO> creditTrend = get7DayCreditTrend();

        double revenueChange = calculatePercentageChange(revenueTrend);
        double profitChange = calculatePercentageChange(revenueTrend);
        double stockChange = calculatePercentageChange(stockTrend);
        double creditChange = calculatePercentageChange(creditTrend);

        KpiStatDTO revenue = KpiStatDTO.builder()
                .value(totalRevenue)
                .change( revenueChange)
                .trend( revenueTrend)
                .build();

        KpiStatDTO profit = KpiStatDTO.builder()
                .trend( revenueTrend )
                .change( profitChange)
                .value( netProfit)
                .build();

        KpiStatDTO stock =  KpiStatDTO.builder()
                .value(stockValue)
                .trend(stockTrend)
                .change(stockChange)
                .build();

        KpiStatDTO credits = KpiStatDTO.builder()
                .change( creditChange)
                .trend( creditTrend)
                .value(totalCredits)
                .build();

        return DashboardStatsDTO.builder()
                .credits( credits )
                .stockValue( stock )
                .profit( profit )
                .revenue( revenue )
                .build();
    }

    public List<RevenueExpenseDayDTO> getRevenueExpenseData() {
        List<RevenueExpenseDayDTO> data = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dateStr = date.toString();

            Double revenue = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(SUM(total_bill_amount), 0) FROM sale WHERE DATE(created_at) = ?",
                    Double.class, dateStr);

            Double expense = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(SUM(total_cost), 0) FROM purchase WHERE DATE(purchase_date) = ?",
                    Double.class, dateStr);

            RevenueExpenseDayDTO dayData = new RevenueExpenseDayDTO();
            dayData.setDay(date.format(formatter));
            dayData.setRevenue(revenue);
            dayData.setExpense(expense);

            data.add(dayData);
        }

        return data;
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

    public List<String> getAIInsights() {
        List<String> insights = new ArrayList<>();

        Double totalRevenue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_bill_amount), 0) FROM sale", Double.class);
        Double totalExpenses = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_cost), 0) FROM purchase", Double.class);
        Double profitMargin = ((totalRevenue - totalExpenses) / totalRevenue) * 100;

        if (profitMargin > 20) {
            insights.add("Excellent profit margin of " + String.format("%.1f", profitMargin) + "% indicates healthy business operations");
        } else if (profitMargin > 10) {
            insights.add("Profit margin at " + String.format("%.1f", profitMargin) + "% is stable, consider optimizing costs for growth");
        } else {
            insights.add("Profit margin of " + String.format("%.1f", profitMargin) + "% suggests need for cost reduction or price adjustment");
        }

        Map<String, Object> topCategory = jdbcTemplate.queryForMap(
                "SELECT category, SUM(current_stock * selling_price) as value FROM product GROUP BY category ORDER BY value DESC LIMIT 1");
        insights.add(topCategory.get("category") + " category holds the highest stock value, contributing $" +
                String.format("%.0f", ((Number) topCategory.get("value")).doubleValue()) + " to inventory");

        Long highCreditCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM customer WHERE current_total_balance > (credit_limit * 0.8) AND current_total_balance > 0",
                Long.class);

        if (highCreditCount > 0) {
            insights.add(highCreditCount + " customer" + (highCreditCount > 1 ? "s are" : " is") +
                    " approaching credit limit - consider follow-up for collections");
        } else {
            insights.add("All customer credit balances are within healthy limits, no immediate collection concerns");
        }

        return insights;
    }

    private List<TrendPointDTO> get7DayTrend(String table, String column) {
        List<TrendPointDTO> trend = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dateStr = date.toString();

            Double value = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(SUM(" + column + "), 0) FROM " + table +
                            " WHERE DATE(created_at) = ?", Double.class, dateStr);

            TrendPointDTO point = new TrendPointDTO();
            point.setValue(value);
            trend.add(point);
        }

        return trend;
    }

    private List<TrendPointDTO> get7DayStockTrend() {
        List<TrendPointDTO> trend = new ArrayList<>();
        Double stockValue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(current_stock * selling_price), 0) FROM product", Double.class);

        for (int i = 0; i < 7; i++) {
            TrendPointDTO point = new TrendPointDTO();
            point.setValue(stockValue * (0.95 + (Math.random() * 0.1)));
            trend.add(point);
        }

        return trend;
    }

    private List<TrendPointDTO> get7DayCreditTrend() {
        List<TrendPointDTO> trend = new ArrayList<>();
        Double totalCredits = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(current_total_balance), 0) FROM customer", Double.class);

        for (int i = 0; i < 7; i++) {
            TrendPointDTO point = new TrendPointDTO();
            point.setValue(totalCredits * (0.9 + (Math.random() * 0.2)));
            trend.add(point);
        }

        return trend;
    }

    private double calculatePercentageChange(List<TrendPointDTO> trend) {
        if (trend.size() < 2) return 0;

        Double firstValue = trend.get(0).getValue();
        Double lastValue = trend.get(trend.size() - 1).getValue();

        if (firstValue == 0) return 0;

        return ((lastValue - firstValue) / firstValue) * 100;
    }
}
