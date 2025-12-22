package com.farmsmart.backend.ai.query;

import com.farmsmart.backend.ai.intent.QueryIntent;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Central registry of all SQL query templates.
 * 
 * CRITICAL RULES:
 * - All SQL must be SELECT-only (read-only)
 * - Use named parameters with :paramName syntax
 * - All queries must be NULL-safe
 * - No dynamic SQL concatenation
 * - All templates are hardcoded and reviewed
 * 
 * This is the ONLY place where SQL queries are defined for the AI layer.
 */
@Component
public class SqlTemplateRegistry {
    
    private final Map<QueryIntent, QueryTemplate> templates;
    
    public SqlTemplateRegistry() {
        this.templates = new HashMap<>();
        initializeTemplates();
    }
    
    /**
     * Get the SQL template for a given intent
     */
    public QueryTemplate getTemplate(QueryIntent intent) {
        QueryTemplate template = templates.get(intent);
        if (template == null) {
            throw new IllegalArgumentException("No SQL template found for intent: " + intent);
        }
        return template;
    }
    
    /**
     * Check if a template exists for the given intent
     */
    public boolean hasTemplate(QueryIntent intent) {
        return templates.containsKey(intent);
    }
    
    /**
     * Initialize all SQL templates.
     * Each template maps to exactly one QueryIntent.
     */
    private void initializeTemplates() {
        
        // ========== INVENTORY QUERIES ==========
        
        templates.put(QueryIntent.INVENTORY_CHECK_PRODUCT, new QueryTemplate(
            """
            SELECT 
                name,
                current_stock,
                unit,
                category,
                selling_price,
                cost_price
            FROM product
            WHERE LOWER(name) = LOWER(:productName)
            """,
            List.of("productName"),
            "Check stock level for a specific product by name"
        ));
        
        templates.put(QueryIntent.INVENTORY_LOW_STOCK, new QueryTemplate(
            """
            SELECT 
                name,
                current_stock,
                unit,
                category
            FROM product
            WHERE current_stock < :threshold
                AND current_stock IS NOT NULL
            ORDER BY current_stock ASC
            LIMIT :limit
            """,
            List.of("threshold", "limit"),
            "Find products with stock below threshold"
        ));
        
        templates.put(QueryIntent.INVENTORY_BY_CATEGORY, new QueryTemplate(
            """
            SELECT 
                name,
                current_stock,
                unit,
                selling_price
            FROM product
            WHERE LOWER(category) = LOWER(:category)
            ORDER BY name
            """,
            List.of("category"),
            "List all products in a specific category"
        ));
        
        templates.put(QueryIntent.INVENTORY_ALL, new QueryTemplate(
            """
            SELECT 
                name,
                current_stock,
                unit,
                category,
                selling_price,
                cost_price
            FROM product
            ORDER BY category, name
            """,
            List.of(),
            "List all products with stock levels"
        ));
        
        // ========== SALES QUERIES ==========
        
        templates.put(QueryIntent.SALES_TOTAL_BY_CUSTOMER, new QueryTemplate(
            """
            SELECT 
                c.name as customer_name,
                COUNT(s.id) as total_sales,
                SUM(s.total_bill_amount) as total_amount,
                SUM(s.remaining_balance) as outstanding_balance
            FROM sale s
            JOIN customer c ON s.customer_id = c.id
            WHERE LOWER(c.name) = LOWER(:customerName)
            GROUP BY c.name
            """,
            List.of("customerName"),
            "Get total sales for a specific customer"
        ));
        
        templates.put(QueryIntent.SALES_TOTAL_BY_DATE_RANGE, new QueryTemplate(
            """
            SELECT 
                DATE(s.created_at) as sale_date,
                COUNT(s.id) as total_sales,
                SUM(s.total_bill_amount) as total_amount,
                SUM(s.initial_paid_amount) as total_paid,
                SUM(s.remaining_balance) as total_outstanding
            FROM sale s
            WHERE s.created_at >= CAST(:dateFrom AS TIMESTAMP)
                AND s.created_at <= CAST(:dateTo AS TIMESTAMP)
            GROUP BY DATE(s.created_at)
            ORDER BY sale_date DESC
            """,
            List.of("dateFrom", "dateTo"),
            "Get sales totals within a date range"
        ));
        
        templates.put(QueryIntent.SALES_BY_PRODUCT, new QueryTemplate(
            """
            SELECT 
                p.name as product_name,
                SUM(si.quantity) as total_quantity,
                SUM(si.line_total) as total_revenue,
                COUNT(DISTINCT s.id) as number_of_sales
            FROM sale_item si
            JOIN product p ON si.product_id = p.id
            JOIN sale s ON si.sale_id = s.id
            WHERE LOWER(p.name) = LOWER(:productName)
            GROUP BY p.name
            """,
            List.of("productName"),
            "Get sales history for a specific product"
        ));
        
        templates.put(QueryIntent.SALES_RECENT, new QueryTemplate(
            """
            SELECT 
                s.id,
                c.name as customer_name,
                s.total_bill_amount,
                s.payment_status,
                s.sale_channel,
                s.created_at
            FROM sale s
            JOIN customer c ON s.customer_id = c.id
            ORDER BY s.created_at DESC
            LIMIT :limit
            """,
            List.of("limit"),
            "Get recent sales transactions"
        ));
        
        templates.put(QueryIntent.SALES_DETAIL, new QueryTemplate(
            """
            SELECT 
                s.id as sale_id,
                c.name as customer_name,
                s.total_bill_amount,
                s.initial_paid_amount,
                s.remaining_balance,
                s.payment_status,
                s.sale_channel,
                s.created_at,
                p.name as product_name,
                si.quantity,
                si.unit_price,
                si.line_total
            FROM sale s
            JOIN customer c ON s.customer_id = c.id
            LEFT JOIN sale_item si ON si.sale_id = s.id
            LEFT JOIN product p ON si.product_id = p.id
            WHERE s.id = CAST(:saleId AS UUID)
            """,
            List.of("saleId"),
            "Get detailed information about a specific sale"
        ));
        
        // ========== CREDIT QUERIES ==========
        
        templates.put(QueryIntent.CREDIT_BALANCE_CUSTOMER, new QueryTemplate(
            """
            SELECT 
                c.name as customer_name,
                c.current_total_balance,
                c.credit_limit,
                COUNT(cl.id) as active_credits,
                SUM(cl.current_balance) as total_debt
            FROM customer c
            LEFT JOIN credit_ledger cl ON cl.customer_id = c.id AND cl.status = 'ACTIVE'
            WHERE LOWER(c.name) = LOWER(:customerName)
            GROUP BY c.id, c.name, c.current_total_balance, c.credit_limit
            """,
            List.of("customerName"),
            "Get credit balance for a specific customer"
        ));
        
        templates.put(QueryIntent.CREDIT_OVERDUE_ALL, new QueryTemplate(
            """
            SELECT 
                c.name as customer_name,
                cl.current_balance,
                cl.due_date,
                cl.original_debt,
                CURRENT_DATE - cl.due_date as days_overdue
            FROM credit_ledger cl
            JOIN customer c ON cl.customer_id = c.id
            WHERE cl.status = 'ACTIVE'
                AND cl.due_date < CURRENT_DATE
            ORDER BY cl.due_date ASC
            LIMIT :limit
            """,
            List.of("limit"),
            "List overdue credit accounts"
        ));
        
        templates.put(QueryIntent.CREDIT_SUMMARY, new QueryTemplate(
            """
            SELECT 
                COUNT(DISTINCT cl.customer_id) as customers_with_credit,
                COUNT(cl.id) as total_active_credits,
                SUM(cl.current_balance) as total_outstanding,
                SUM(CASE WHEN cl.due_date < CURRENT_DATE THEN cl.current_balance ELSE 0 END) as overdue_amount,
                SUM(CASE WHEN cl.due_date >= CURRENT_DATE THEN cl.current_balance ELSE 0 END) as not_yet_due
            FROM credit_ledger cl
            WHERE cl.status = 'ACTIVE'
            """,
            List.of(),
            "Get summary of all active credits"
        ));
        
        // ========== PAYMENT QUERIES ==========
        
        templates.put(QueryIntent.PAYMENT_HISTORY_SALE, new QueryTemplate(
            """
            SELECT 
                pt.amount_paid,
                pt.payment_method,
                pt.payment_date
            FROM payment_transaction pt
            WHERE pt.sale_id = CAST(:saleId AS UUID)
            ORDER BY pt.payment_date DESC
            """,
            List.of("saleId"),
            "Get payment history for a specific sale"
        ));
        
        templates.put(QueryIntent.PAYMENT_SUMMARY_BY_METHOD, new QueryTemplate(
            """
            SELECT 
                pt.payment_method,
                COUNT(pt.id) as transaction_count,
                SUM(pt.amount_paid) as total_amount
            FROM payment_transaction pt
            WHERE pt.payment_date >= CAST(:dateFrom AS TIMESTAMP)
                AND pt.payment_date <= CAST(:dateTo AS TIMESTAMP)
            GROUP BY pt.payment_method
            ORDER BY total_amount DESC
            """,
            List.of("dateFrom", "dateTo"),
            "Get payment summary grouped by method"
        ));
        
        templates.put(QueryIntent.PAYMENT_HISTORY_CUSTOMER, new QueryTemplate(
            """
            SELECT 
                pt.amount_paid,
                pt.payment_method,
                pt.payment_date,
                s.id as sale_id,
                s.total_bill_amount
            FROM payment_transaction pt
            JOIN customer c ON pt.customer_id = c.id
            JOIN sale s ON pt.sale_id = s.id
            WHERE LOWER(c.name) = LOWER(:customerName)
            ORDER BY pt.payment_date DESC
            LIMIT :limit
            """,
            List.of("customerName", "limit"),
            "Get payment history for a customer"
        ));
        
        // ========== CUSTOMER QUERIES ==========
        
        templates.put(QueryIntent.CUSTOMER_INFO, new QueryTemplate(
            """
            SELECT 
                c.name,
                c.phone,
                c.email,
                c.address,
                c.customer_type,
                c.credit_limit,
                c.current_total_balance,
                c.registered_at
            FROM customer c
            WHERE LOWER(c.name) = LOWER(:customerName)
            """,
            List.of("customerName"),
            "Get detailed information about a customer"
        ));
        
        templates.put(QueryIntent.CUSTOMER_LIST_BY_TYPE, new QueryTemplate(
            """
            SELECT 
                name,
                phone,
                email,
                current_total_balance,
                credit_limit
            FROM customer
            WHERE LOWER(customer_type) = LOWER(:customerType)
            ORDER BY name
            """,
            List.of("customerType"),
            "List customers by type"
        ));
        
        templates.put(QueryIntent.CUSTOMER_LIST_ALL, new QueryTemplate(
            """
            SELECT 
                name,
                customer_type,
                phone,
                current_total_balance,
                credit_limit
            FROM customer
            ORDER BY customer_type, name
            """,
            List.of(),
            "List all customers"
        ));
    }
}
