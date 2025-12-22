package com.farmsmart.backend.ai.intent;

/**
 * Enumeration of all supported query intents for the Farm Assistant AI.
 * Each intent maps to a specific SQL template in the SqlTemplateRegistry.
 * 
 * This enum ensures that the LLM can ONLY classify user queries into
 * predefined categories, preventing SQL hallucination.
 */
public enum QueryIntent {
    
    // ========== INVENTORY INTENTS ==========
    
    /** Check stock for a specific product by name */
    INVENTORY_CHECK_PRODUCT,
    
    /** Find all products with stock below a threshold */
    INVENTORY_LOW_STOCK,
    
    /** List all products in a specific category */
    INVENTORY_BY_CATEGORY,
    
    /** List all products with their stock levels */
    INVENTORY_ALL,
    
    // ========== SALES INTENTS ==========
    
    /** Get total sales amount for a specific customer */
    SALES_TOTAL_BY_CUSTOMER,
    
    /** Get total sales within a date range */
    SALES_TOTAL_BY_DATE_RANGE,
    
    /** Get sales history for a specific product */
    SALES_BY_PRODUCT,
    
    /** Get recent sales (last N transactions) */
    SALES_RECENT,
    
    /** Get detailed sale information by sale ID */
    SALES_DETAIL,
    
    // ========== CREDIT INTENTS ==========
    
    /** Get outstanding credit balance for a customer */
    CREDIT_BALANCE_CUSTOMER,
    
    /** List all overdue credit accounts */
    CREDIT_OVERDUE_ALL,
    
    /** Get summary of all active credits */
    CREDIT_SUMMARY,
    
    // ========== PAYMENT INTENTS ==========
    
    /** Get payment history for a specific sale */
    PAYMENT_HISTORY_SALE,
    
    /** Get payment summary grouped by payment method */
    PAYMENT_SUMMARY_BY_METHOD,
    
    /** Get payment history for a customer */
    PAYMENT_HISTORY_CUSTOMER,
    
    // ========== CUSTOMER INTENTS ==========
    
    /** Get detailed information about a customer */
    CUSTOMER_INFO,
    
    /** List customers by type (FARMER/BUTCHER/RETAIL) */
    CUSTOMER_LIST_BY_TYPE,
    
    /** List all customers */
    CUSTOMER_LIST_ALL,
    
    // ========== GENERAL INTENTS ==========
    
    /** User query is unclear or ambiguous */
    CLARIFICATION_NEEDED,
    
    /** Query doesn't match any known pattern */
    UNKNOWN,
    
    /** Knowledge base query (not database) */
    KNOWLEDGE_SEARCH
}
